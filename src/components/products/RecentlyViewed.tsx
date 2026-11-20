"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed"
import { formatPrice } from "@/lib/utils"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

export function RecentlyViewed() {
  const { items } = useRecentlyViewed()

  if (items.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
        <Clock className="h-5 w-5 text-primary" />
        Văzute recent
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/produse/${product.slug}`}
            className="group rounded-xl bg-white dark:bg-surface p-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface">
              <Image
                src={product.images[0] || placeholder.src}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-xs font-medium text-text line-clamp-2">{product.name}</p>
            <p className="mt-1 text-xs font-bold text-primary">{formatPrice(product.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
