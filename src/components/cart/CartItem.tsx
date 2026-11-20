"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { formatPrice } from "@/lib/utils"
import type { CartItem as CartItemType } from "@/lib/types"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3 rounded-lg bg-white dark:bg-surface p-3">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
        <Image
          src={item.product.images[0] || placeholder.src}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <p className="text-sm font-medium text-text line-clamp-2">
          {item.product.name}
        </p>
        <p className="text-sm font-bold text-primary">
          {formatPrice(item.product.price)}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="rounded-lg p-1 text-text hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Scade cantitatea"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm text-text">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
            disabled={item.quantity >= item.product.stock}
            className="rounded-lg p-1 text-text hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Crește cantitatea"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => removeItem(item.product.id)}
            className="ml-auto rounded-lg p-1 text-red-500 hover:bg-red-50"
            aria-label="Șterge produsul din coș"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
