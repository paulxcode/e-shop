import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Star } from "lucide-react"
import { createServerSupabase } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { ImageGallery } from "@/components/products/ImageGallery"
import { AddToCartButton } from "@/components/products/AddToCartButton"
import { ProductGrid } from "@/components/products/ProductGrid"
import { ReviewList } from "@/components/reviews/ReviewList"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { RecentlyViewedTracker } from "@/components/products/RecentlyViewedTracker"
import { RecentlyViewed } from "@/components/products/RecentlyViewed"

interface Props {
  params: Promise<{ slug: string }>
}

async function getProductBySlug(slug: string) {
  const supabase = await createServerSupabase()
  const decodedSlug = decodeURIComponent(slug).trim()

  const { data: exactProduct } = await supabase
    .from("products")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle()

  if (exactProduct) return exactProduct

  const { data: fallbackProduct } = await supabase
    .from("products")
    .select("*")
    .ilike("slug", decodedSlug)
    .maybeSingle()

  return fallbackProduct
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: "Produs negăsit - eShop" }

  return {
    title: `${product.name} - eShop`,
    description: product.description?.slice(0, 160) || `Cumpără ${product.name} la prețul cel mai bun`,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: similar } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Produse", href: "/produse" },
          { label: product.name },
        ]}
      />
      <div className="grid gap-8 md:grid-cols-2">
        <ImageGallery images={product.images} />

        <div>
          <h1 className="mb-2 text-2xl font-bold text-text">{product.name}</h1>

          <div className="mb-4 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-text/70">{product.rating}</span>
          </div>

          <div className="mb-6">
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            {product.compare_price && (
              <p className="text-sm text-text/70 line-through">
                {formatPrice(product.compare_price)}
              </p>
            )}
          </div>

          {product.description && (
            <div className="mb-6 border-l-4 border-primary bg-surface/50 pl-4 py-3 rounded-r-xl">
              <p className="text-sm text-text/80 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="mb-1 text-sm text-text/70">
              Stoc:{" "}
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {product.stock > 0 ? "În stoc" : "Stoc epuizat"}
              </span>
            </p>
          </div>

          {product.stock > 0 && <AddToCartButton product={product} />}

          {Object.keys(product.specifications).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-text">
                Specificații
              </h2>
              <div className="rounded-xl bg-white dark:bg-surface p-4">
                {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-border py-2 last:border-0"
                  >
                    <span className="text-sm text-text/70">{key}</span>
                    <span className="text-sm font-medium text-text">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar && similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-text">
            Produse similare
          </h2>
          <ProductGrid products={similar} />
        </section>
      )}

      <RecentlyViewedTracker product={product} />

      <RecentlyViewed />

      <ReviewList productId={product.id} userId={user?.id} />
    </div>
  )
}
