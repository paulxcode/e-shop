import type { MetadataRoute } from "next"
import { createServerSupabase } from "@/lib/supabase/server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createServerSupabase()
  const { data: products } = await supabase.from("products").select("slug, updated_at")
  const { data: categories } = await supabase.from("categories").select("slug")
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eshop.ro"

  const productUrls = (products || []).map((p) => ({
    url: `${baseUrl}/produse/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryUrls = (categories || []).map((c) => ({
    url: `${baseUrl}/produse?categorie=${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/produse`, changeFrequency: "daily", priority: 0.9 },
    ...productUrls,
    ...categoryUrls,
  ]
}
