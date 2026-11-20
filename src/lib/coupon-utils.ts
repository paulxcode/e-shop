import { createServerSupabase } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"

interface CartItemForCoupon {
  product_id: string
  price: number
  quantity: number
}

interface AppliedCoupon {
  coupon_id: string
  discount: number
  discount_type: "percentage" | "fixed"
  discount_value: number
}

export async function validateAndApplyCoupon(
  code: string,
  items: CartItemForCoupon[],
  subtotal: number,
  userId?: string
): Promise<{ valid: false; error: string } | { valid: true } & AppliedCoupon> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .rpc("get_coupon", { p_code: code })
    .maybeSingle()
  const coupon = data as any

  if (error || !coupon) return { valid: false, error: "Codul nu există" }
  if (!coupon.active) return { valid: false, error: "Acest cupon nu mai este activ" }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return { valid: false, error: "Acest cupon a expirat" }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses)
    return { valid: false, error: "Acest cupon a fost deja folosit de prea multe ori" }
  if (subtotal < coupon.min_order_value)
    return { valid: false, error: `Comanda minimă este de ${coupon.min_order_value} lei` }

  if (userId && coupon.single_use_per_user) {
    const { data: existing } = await supabase
      .from("coupon_usage")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId)
      .maybeSingle()
    if (existing) return { valid: false, error: "Ai folosit deja acest cupon" }
  }

  let applicableSubtotal = 0
  if (coupon.applies_to === "all") {
    applicableSubtotal = subtotal
  } else if (coupon.applies_to === "category") {
    const productIds = items.map((i) => i.product_id)
    const { data: products } = await supabase
      .from("products")
      .select("id, category_id")
      .in("id", productIds)
    const catMap = new Map((products || []).map((p) => [p.id, p.category_id]))
    for (const item of items) {
      if (catMap.get(item.product_id) === coupon.applies_to_id)
        applicableSubtotal += item.price * item.quantity
    }
  } else if (coupon.applies_to === "product") {
    for (const item of items) {
      if (item.product_id === coupon.applies_to_id)
        applicableSubtotal += item.price * item.quantity
    }
  }

  if (applicableSubtotal <= 0)
    return { valid: false, error: "Cuponul nu se aplică produselor din coș" }

  const discount = coupon.discount_type === "percentage"
    ? Math.round(applicableSubtotal * (coupon.discount_value / 100) * 100) / 100
    : Math.min(coupon.discount_value, applicableSubtotal)

  return {
    valid: true,
    coupon_id: coupon.id,
    discount,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
  }
}
