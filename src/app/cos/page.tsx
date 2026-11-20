"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItem } from "@/components/cart/CartItem"
import { CartSummary } from "@/components/cart/CartSummary"
import { Button } from "@/components/ui/Button"

export default function CosPage() {
  const { items, clearCart } = useCartStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    document.title = "Coș de cumpărături | eShop"
  }, [])

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Coșul tău</h1>

      {items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-surface p-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-text/20" />
          <p className="mt-4 text-lg text-text/70">Coșul tău este gol</p>
          <Link href="/produse">
            <Button variant="secondary" className="mt-4">
              <ArrowLeft className="h-4 w-4" />
              Continuă cumpărăturile
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm("Ești sigur că vrei să golești coșul?")) {
                  clearCart()
                }
              }}
              className="text-sm text-red-500 hover:underline"
            >
              Golește coșul
            </button>
            <div className="w-72">
              <CartSummary />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
