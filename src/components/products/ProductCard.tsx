"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { FavoriteButton } from "./FavoriteButton"
import { useCartStore } from "@/lib/stores/cart-store"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore()

  return (
    <div className="group rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/produse/${product.slug}`}>
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface">
          <Image
            src={product.images[0] || placeholder.src}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.compare_price && product.compare_price > product.price && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              -{Math.min(99, Math.round((1 - product.price / product.compare_price) * 100))}%
            </span>
          )}
          <span className="absolute right-2 top-2">
            <FavoriteButton productId={product.id} />
          </span>
        </div>
      </Link>

      <Link href={`/produse/${product.slug}`}>
        <h3 className="mb-1 text-sm font-medium text-text line-clamp-2 hover:text-primary">
          {product.name}
        </h3>
      </Link>

      {product.rating > 0 && (
        <div className="mb-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-text/70">{product.rating}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          {product.compare_price && (
            <p className="text-xs text-text/70 line-through">
              {formatPrice(product.compare_price)}
            </p>
          )}
        </div>
        {product.stock === 0 ? (
          <span className="rounded-lg bg-gray-200 p-2 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            Stoc epuizat
          </span>
        ) : (
          <button
            onClick={() => { addItem(product); toast.success(`${product.name} adăugat în coș`) }}
            className="rounded-lg bg-primary p-2 text-white transition-opacity hover:opacity-90"
            aria-label="Adaugă produsul în coș"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
