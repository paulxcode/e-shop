import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://eshop.ro"
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cont", "/api", "/cos", "/finalizare-comanda", "/lista"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
