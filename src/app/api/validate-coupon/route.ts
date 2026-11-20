import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { validateAndApplyCoupon } from "@/lib/coupon-utils"

export async function POST(request: Request) {
  const { code, items, subtotal } = await request.json()

  if (!code || typeof code !== "string" || code.length > 50) {
    return NextResponse.json({ valid: false, error: "Codul este necesar" })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ valid: false, error: "Coșul este gol" })
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const cartItems = items.map((i: any) => ({
    product_id: i.product_id,
    price: Number(i.price),
    quantity: Number(i.quantity),
  }))

  const result = await validateAndApplyCoupon(
    code,
    cartItems,
    Number(subtotal),
    user?.id
  )

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error })
  }

  return NextResponse.json({
    valid: true,
    coupon_id: result.coupon_id,
    discount: result.discount,
    discount_type: result.discount_type,
    discount_value: result.discount_value,
  })
}
