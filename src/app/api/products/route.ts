import { createServerSupabase } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { SortOption } from "@/lib/types"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createServerSupabase()

  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")
  const categorie = searchParams.get("categorie")
  const pretMin = searchParams.get("pret_min")
  const pretMax = searchParams.get("pret_max")
  const sort = searchParams.get("sort")
  const search = searchParams.get("search")

  const from = (page - 1) * limit
  const to = from + limit - 1

  const query = supabase.from("products").select("*", { count: "exact" })

  if (search) {
    query.ilike("name", `%${search}%`)
  }

  if (categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorie)
      .single()
    if (cat) query.eq("category_id", cat.id)
  }

  if (pretMin) query.gte("price", parseFloat(pretMin))
  if (pretMax) query.lte("price", parseFloat(pretMax))

  switch (sort as SortOption) {
    case "pret-asc":
      query.order("price", { ascending: true })
      break
    case "pret-desc":
      query.order("price", { ascending: false })
      break
    case "rating-desc":
      query.order("rating", { ascending: false })
      break
    default:
      query.order("created_at", { ascending: false })
  }

  const { data, count } = await query.range(from, to)

  return NextResponse.json({
    products: data || [],
    total: count || 0,
    page,
    hasMore: (count || 0) > to + 1,
  })
}
