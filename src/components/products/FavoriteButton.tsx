"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth-store"

export function FavoriteButton({ productId }: { productId: string }) {
  const { user } = useAuthStore()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFavorited(data.some((f: any) => f.product_id === productId))
        }
      })
      .catch(() => {})
  }, [user, productId])

  const toggle = async () => {
    if (!user) {
      toast.error("Trebuie să fii autentificat")
      return
    }
    setLoading(true)
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    })
    const data = await res.json()
    if (res.ok) {
      setFavorited(data.favorited)
      toast.success(data.favorited ? "Adăugat la favorite" : "Eliminat din favorite")
    } else {
      toast.error(data.error || "Eroare")
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-lg p-2 transition-colors ${
        favorited
          ? "text-red-500 hover:bg-red-50"
          : "text-text/70 hover:text-red-400 hover:bg-red-50"
      }`}
      aria-label={favorited ? "Elimină din favorite" : "Adaugă la favorite"}
    >
      <Heart className={`h-5 w-5 ${favorited ? "fill-current" : ""}`} />
    </button>
  )
}
