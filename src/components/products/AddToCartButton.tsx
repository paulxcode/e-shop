"use client"

import { useState } from "react"
import { ShoppingCart, Minus, Plus } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/Button"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCartStore()

  const handleAdd = () => {
    if (product.stock <= 0) {
      toast.error("Produs indisponibil în stoc")
      return
    }
    addItem(product, quantity)
    setQuantity(1)
    openCart()
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 text-text hover:bg-surface"
          aria-label="Scade cantitatea"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm text-text">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="p-2 text-text hover:bg-surface"
          aria-label="Crește cantitatea"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button onClick={handleAdd} className="flex-1" disabled={product.stock <= 0}>
        <ShoppingCart className="h-4 w-4" />
        {product.stock <= 0 ? "Stoc epuizat" : "Adaugă în coș"}
      </Button>
    </div>
  )
}
