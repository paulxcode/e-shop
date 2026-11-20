import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase/server"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ChevronRight } from "lucide-react"
import { HomeAuthHandler } from "./home-auth-handler"
import { RecentlyViewed } from "@/components/products/RecentlyViewed"
import { HeroCarousel } from "@/components/home/HeroCarousel"

export const revalidate = 300

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const { data: featuredCategories } = await supabase
    .from("categories")
    .select("*")
    .eq("featured_home", true)
    .limit(5)

  const { data: fallbackCategories } = await supabase
    .from("categories")
    .select("*")
    .limit(5)

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .limit(8)

  const { data: fallbackProducts } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8)

  const { data: carouselSlides } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  const categories = (featuredCategories && featuredCategories.length > 0)
    ? featuredCategories
    : fallbackCategories
  const featured = (featuredProducts && featuredProducts.length > 0)
    ? featuredProducts
    : fallbackProducts

  return (
    <div>
      <HomeAuthHandler />
      <HeroCarousel slides={carouselSlides || []} />

      {/* Categorii recomandate */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-semibold text-text">
          Categorii recomandate
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/produse?categorie=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-sm font-medium text-text group-hover:text-primary">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Produse featured */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text">
            Produse recomandate
          </h2>
          <Link
            href="/produse"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Vezi toate <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={featured || []} />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8">
        <RecentlyViewed />
      </section>
    </div>
  )
}
