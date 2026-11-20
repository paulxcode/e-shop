import type { Metadata } from "next"
import { Suspense } from "react"
import { createServerSupabase } from "@/lib/supabase/server"
import { ProductListWithLoader } from "@/components/products/ProductListWithLoader"
import { FiltersSidebar } from "@/components/products/FiltersSidebar"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import type { SortOption } from "@/lib/types"

export const metadata: Metadata = {
  title: "Produse - eShop",
  description: "Vezi toate produsele din magazinul nostru online. Produse electronice, fashion, casă și multe altele.",
}

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function ProdusePage({ searchParams }: Props) {
  const sp = await searchParams
  const supabase = await createServerSupabase()

  const { data: categories } = await supabase.from("categories").select("*")
  const { data: groups } = await supabase.from("category_groups").select("id, name, slug").order("name")

  const query = supabase.from("products").select("*", { count: "exact" })

  if (sp.search) {
    query.ilike("name", `%${sp.search}%`)
  }

  if (sp.categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sp.categorie)
      .single()
    if (cat) query.eq("category_id", cat.id)
  }

  if (sp.pret_min) query.gte("price", parseFloat(sp.pret_min))
  if (sp.pret_max) query.lte("price", parseFloat(sp.pret_max))

  switch (sp.sort as SortOption) {
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

  const { data: products, count } = await query.range(0, 19)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ label: "Produse" }]} />
      <h1 className="mb-2 text-2xl font-bold text-text">
        {sp.categorie
          ? categories?.find((c) => c.slug === sp.categorie)?.name
          : "Toate produsele"}
      </h1>
      <p className="mb-6 text-sm text-text/70">
        {count || 0} produse
      </p>

      <div className="flex gap-6">
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <div className="border-r border-border pr-6">
            <Suspense fallback={null}>
              <FiltersSidebar categories={categories || []} groups={groups || []} />
            </Suspense>
          </div>
        </aside>
        <div className="flex-1">
          <Suspense fallback={null}>
            <ProductListWithLoader
              initialProducts={products || []}
              initialHasMore={(count || 0) > 20}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
