"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/stores/cart-store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

export function CartSummary() {
  const { items, subtotal, itemCount } = useCartStore()

  if (items.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text">Subtotal ({itemCount()} produse)</span>
        <span className="text-lg font-bold text-primary">{formatPrice(subtotal())}</span>
      </div>
      <Link href="/finalizare-comanda">
        <Button className="mt-3 w-full">Finalizează comanda</Button>
      </Link>
    </div>
  )
}
