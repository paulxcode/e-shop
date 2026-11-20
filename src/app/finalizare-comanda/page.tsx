"use client"

import { useState, useEffect } from "react"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import { useCartStore } from "@/lib/stores/cart-store"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function CheckoutPage() {
  const { items } = useCartStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    document.title = "Finalizare comandă | eShop"
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

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-text/20" />
        <p className="mt-4 text-lg text-text/70">Coșul tău este gol</p>
        <Link href="/produse">
          <Button variant="secondary" className="mt-4">
            Continuă cumpărăturile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Finalizare comandă
      </h1>
      <CheckoutForm />
    </div>
  )
}
