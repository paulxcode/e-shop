import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const { event_type, event_data, page_url } = body ?? {}

  if (typeof event_type !== "string" || event_type.length === 0 || event_type.length > 50) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })
  }
  if (page_url != null && (typeof page_url !== "string" || page_url.length > 500)) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })
  }
  if (event_data != null && (typeof event_data !== "object" || Array.isArray(event_data))) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const session_id = (request.headers.get("x-session-id") || crypto.randomUUID()).slice(0, 64)

  await supabase.from("analytics_events").insert({
    user_id: user?.id || null,
    session_id,
    event_type,
    event_data: event_data || {},
    page_url: page_url || null,
  })

  return NextResponse.json({ success: true })
}
