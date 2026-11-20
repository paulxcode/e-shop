import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { items, shippingAddress, shipping_method_id, coupon_id } = body ?? {}

  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    return NextResponse.json({ error: "Coșul este gol" }, { status: 400 })
  }
  const addressFields = ["street", "city", "county", "zip", "phone"]
  const validAddress =
    shippingAddress &&
    addressFields.every(
      (f) => typeof shippingAddress[f] === "string" && shippingAddress[f].length <= 200
    ) &&
    shippingAddress.street.trim() &&
    shippingAddress.city.trim() &&
    shippingAddress.county.trim() &&
    /^\d{6}$/.test(shippingAddress.zip) &&
    /^\d{10,15}$/.test(shippingAddress.phone)
  if (!validAddress) {
    return NextResponse.json({ error: "Adresa de livrare este incompletă" }, { status: 400 })
  }
  if (shipping_method_id != null && typeof shipping_method_id !== "string") {
    return NextResponse.json({ error: "Metoda de livrare este invalidă" }, { status: 400 })
  }
  if (coupon_id != null && typeof coupon_id !== "string") {
    return NextResponse.json({ error: "Cuponul este invalid" }, { status: 400 })
  }

  const normalizedItems = items
    .map((item: { product_id: string; quantity: number }) => ({
      product_id: item.product_id,
      quantity: Number(item.quantity),
    }))
    .filter((item: { product_id: string; quantity: number }) => item.product_id && Number.isInteger(item.quantity) && item.quantity > 0)

  if (normalizedItems.length !== items.length) {
    return NextResponse.json({ error: "Datele produselor din coș sunt invalide" }, { status: 400 })
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, price, name, stock")
    .in(
      "id",
      normalizedItems.map((i: { product_id: string }) => i.product_id)
    )

  if (!products || products.length !== normalizedItems.length) {
    return NextResponse.json({ error: "Unele produse nu mai sunt disponibile" }, { status: 400 })
  }

  const productMap = new Map(products?.map((p) => [p.id, p]))
  const subtotal = normalizedItems.reduce(
    (sum: number, item: { product_id: string; quantity: number }) => {
      const product = productMap.get(item.product_id)
      return sum + (product?.price || 0) * item.quantity
    },
    0
  )

  const outOfStock = normalizedItems.find((item: { product_id: string; quantity: number }) => {
    const product = productMap.get(item.product_id)
    return !product || item.quantity > product.stock
  })
  if (outOfStock) {
    return NextResponse.json({ error: "Stoc insuficient pentru unul sau mai multe produse" }, { status: 400 })
  }

  let shippingPrice = 0
  let estimatedDaysMin = 2
  let estimatedDaysMax = 5
  if (shipping_method_id) {
    const { data: method } = await supabase
      .from("shipping_methods")
      .select("price, estimated_days_min, estimated_days_max")
      .eq("id", shipping_method_id)
      .eq("active", true)
      .single()
    if (!method) {
      return NextResponse.json({ error: "Metoda de livrare este invalidă" }, { status: 400 })
    }
    shippingPrice = Number(method.price)
    estimatedDaysMin = method.estimated_days_min
    estimatedDaysMax = method.estimated_days_max
  }

  let discount = 0
  let finalCouponId = null
  if (coupon_id) {
    const { data } = await supabase
      .rpc("get_coupon", { p_id: coupon_id })
      .maybeSingle()
    const coupon = data as any
    const notExpired = !coupon?.expires_at || new Date(coupon.expires_at) > new Date()
    if (coupon && coupon.active && notExpired) {
      let applicableSubtotal = 0
      const productIds = normalizedItems.map((i: { product_id: string }) => i.product_id)
      const catMap = new Map<string, string | null>()
      if (coupon.applies_to === "category") {
        const { data: products } = await supabase
          .from("products")
          .select("id, category_id")
          .in("id", productIds)
        for (const p of products || []) catMap.set(p.id, p.category_id)
      }
      for (const item of normalizedItems) {
        const product = productMap.get(item.product_id)
        if (!product) continue
        if (coupon.applies_to === "all") {
          applicableSubtotal += product.price * item.quantity
        } else if (coupon.applies_to === "category" && catMap.get(item.product_id) === coupon.applies_to_id) {
          applicableSubtotal += product.price * item.quantity
        } else if (coupon.applies_to === "product" && item.product_id === coupon.applies_to_id) {
          applicableSubtotal += product.price * item.quantity
        }
      }
      if (applicableSubtotal > 0) {
        discount = coupon.discount_type === "percentage"
          ? Math.round(applicableSubtotal * (coupon.discount_value / 100) * 100) / 100
          : Math.min(coupon.discount_value, applicableSubtotal)
        finalCouponId = coupon_id
      }
    }
  }

  const total = Math.max(0, subtotal + shippingPrice - discount)

  const deliveryDate = new Date()
  const dayRange = estimatedDaysMax - estimatedDaysMin
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDaysMin + Math.floor(Math.random() * (dayRange + 1)))

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total,
      shipping_address: shippingAddress,
      estimated_delivery: deliveryDate.toISOString(),
      status: "pending",
      shipping_method_id: shipping_method_id || null,
      shipping_price: shippingPrice,
      coupon_id: finalCouponId,
      discount,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const orderItems = normalizedItems.map(
    (item: { product_id: string; quantity: number }) => {
      const product = productMap.get(item.product_id)
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product?.price || 0,
      }
    }
  )

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  if (finalCouponId) {
    await supabase.rpc("use_coupon", { p_coupon_id: finalCouponId })
    await supabase.from("coupon_usage").insert({
      coupon_id: finalCouponId,
      user_id: user.id,
      order_id: order.id,
    })
  }

  const decrementErrors: { product_id: string; error: string }[] = []
  for (const item of normalizedItems) {
    const product = productMap.get(item.product_id)
    if (!product) continue
    const newStock = Math.max(0, product.stock - item.quantity)
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.product_id)
      .eq("stock", product.stock)
    if (updateError) {
      decrementErrors.push({ product_id: item.product_id, error: updateError.message })
    }
  }

  if (decrementErrors.length > 0) {
    console.error("Stock decrement errors:", decrementErrors)
  }

  return NextResponse.json({
    order,
    estimated_delivery: deliveryDate.toISOString(),
    shipping_price: shippingPrice,
    discount,
  })
}
