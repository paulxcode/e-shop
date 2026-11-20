import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 })

  const { product_id } = await request.json()
  if (!product_id) return NextResponse.json({ error: "ID-ul produsului este necesar" }, { status: 400 })

  const { data: existing } = await supabase
    .from("user_favorites")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle()

  if (existing) {
    await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("product_id", product_id)
    return NextResponse.json({ favorited: false })
  }

  await supabase.from("user_favorites").insert({ user_id: user.id, product_id })
  return NextResponse.json({ favorited: true })
}

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 })

  const { data } = await supabase
    .from("user_favorites")
    .select("product_id, products!inner(id, name, slug, price, compare_price, images, rating, stock)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return NextResponse.json(data || [])
}
