"use client"

import { useEffect } from "react"
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed"

export function RecentlyViewedTracker({ product }: { product: { id: string; name: string; slug: string; price: number; images: string[] } }) {
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
    })
  }, [product.id])

  return null
}
