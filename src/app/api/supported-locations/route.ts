import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("supported_locations")
    .select("id, county, city")
    .eq("active", true)
    .order("county", { ascending: true })
    .order("city", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
