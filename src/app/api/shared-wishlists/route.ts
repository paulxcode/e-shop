import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const my = searchParams.get("my")
  const supabase = await createServerSupabase()

  if (my !== "true") return NextResponse.json({ error: "Parametru lipsă" }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
  const { data } = await supabase
    .from("shared_wishlists")
    .select("token")
    .eq("user_id", user.id)
    .maybeSingle()
  return NextResponse.json(data || null)
}

export async function POST() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 })

  const { data: existing } = await supabase
    .from("shared_wishlists")
    .select("token")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ token: existing.token })

  const { data, error } = await supabase
    .from("shared_wishlists")
    .insert({ user_id: user.id })
    .select("token")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ token: data!.token })
}
