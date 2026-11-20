import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 })

  const { vote } = await request.json()
  const { id: review_id } = params

  const { data: existing } = await supabase
    .from("review_votes")
    .select("id, vote")
    .eq("review_id", review_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (vote === null || vote === undefined) {
    if (existing) await supabase.from("review_votes").delete().eq("id", existing.id)
    return NextResponse.json({ vote: null })
  }

  if (existing) {
    await supabase.from("review_votes").update({ vote }).eq("id", existing.id)
  } else {
    await supabase.from("review_votes").insert({ review_id, user_id: user.id, vote })
  }

  return NextResponse.json({ vote })
}
