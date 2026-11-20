import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("shipping_methods")
    .select("id, name, description, price, estimated_days_min, estimated_days_max")
    .eq("active", true)
    .order("price", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
