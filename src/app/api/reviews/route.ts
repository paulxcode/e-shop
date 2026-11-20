import { createServerSupabase } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { product_id, rating, comment } = body ?? {}

  const numericRating = Number(rating)
  if (
    typeof product_id !== "string" ||
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5 ||
    (comment != null && (typeof comment !== "string" || comment.length > 2000))
  ) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: "Ai deja o recenzie pentru acest produs" }, { status: 409 })
  }

  const { error } = await supabase.from("reviews").insert({
    product_id,
    user_id: user.id,
    rating: numericRating,
    comment: comment || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.rpc("recalc_product_rating", { p_product_id: product_id })

  return NextResponse.json({ success: true })
}
