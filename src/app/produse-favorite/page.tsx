"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, ArrowLeft, ShoppingCart, Trash2, Share2 } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

interface FavoriteItem {
  product_id: string
  products: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
    rating: number
    stock: number
  }
}

export default function ProduseFavoritePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const load = async () => {
    const res = await fetch("/api/favorites")
    if (res.ok) {
      const data = await res.json()
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user) { router.replace("/?login=true"); return }
    load()
  }, [user, router])

  const remove = async (productId: string) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    })
    const data = await res.json()
    if (res.ok && !data.favorited) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId))
      toast.success("Eliminat din favorite")
    }
  }

  const handleShare = async () => {
    setSharing(true)
    if (shareToken) {
      await navigator.clipboard.writeText(`${window.location.origin}/lista/${shareToken}`)
      toast.success("Link copiat în clipboard")
      setSharing(false)
      return
    }
    const res = await fetch("/api/shared-wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      const data = await res.json()
      setShareToken(data.token)
      await navigator.clipboard.writeText(`${window.location.origin}/lista/${data.token}`)
      toast.success("Link copiat în clipboard")
    } else {
      const { data: existing } = await (await fetch("/api/shared-wishlists?my=true")).json()
      if (existing?.token) {
        setShareToken(existing.token)
        await navigator.clipboard.writeText(`${window.location.origin}/lista/${existing.token}`)
        toast.success("Link copiat în clipboard")
      }
    }
    setSharing(false)
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-text hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-2xl font-bold text-text">Produse favorite</h1>
        <Button variant="secondary" onClick={handleShare} loading={sharing}>
          <Share2 className="h-4 w-4" />
          {shareToken ? "Copiază link" : "Distribuie"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-surface p-12 text-center">
          <Heart className="mx-auto h-16 w-16 text-text/20" />
          <p className="mt-4 text-lg text-text/70">Nu ai produse favorite</p>
          <Link href="/produse" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Explorează produse
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.product_id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-surface p-3">
              <Link href={`/produse/${item.products.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image src={item.products.images[0] || placeholder.src} alt={item.products.name} fill className="object-cover" />
              </Link>
              <Link href={`/produse/${item.products.slug}`} className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text hover:text-primary line-clamp-1">{item.products.name}</p>
                <p className="text-sm font-bold text-primary">{formatPrice(item.products.price)}</p>
                {item.products.compare_price && (
                  <p className="text-xs text-text/70 line-through">{formatPrice(item.products.compare_price)}</p>
                )}
              </Link>
              <button onClick={() => remove(item.product_id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
