"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, Trash2, ArrowLeft, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

interface ReviewWithProduct {
  id: string
  rating: number
  comment: string | null
  created_at: string
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  } | null
}

export default function ReviewUriPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const load = () => {
    if (!user) return
    setAuthChecked(true)
    const supabase = createClient()
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, product:products!inner(id, name, slug, images)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setReviews((data as unknown as ReviewWithProduct[]) || [])
        setLoading(false)
      })
  }

  useEffect(() => {
    if (!user) {
      router.replace("/?login=true")
      return
    }
    load()
  }, [user, router])

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Sigur dorești să ștergi această recenzie?")) return
    const supabase = createClient()
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Recenzie ștearsă")
    load()
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-text hover:bg-surface"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-text">Recenziile mele</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-surface"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-surface p-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text/20" />
          <p className="text-text/70">Nu ai scris nicio recenzie încă</p>
          <Link
            href="/produse"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Explorează produse
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl bg-white dark:bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Link
                  href={`/produse/${review.product?.slug}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface"
                >
                  <Image
                    src={review.product?.images?.[0] || placeholder.src}
                    alt={review.product?.name || ""}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/produse/${review.product?.slug}`}
                    className="text-sm font-medium text-text hover:text-primary"
                  >
                    {review.product?.name || "Produs șters"}
                  </Link>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-text/70">
                      {new Date(review.created_at).toLocaleDateString("ro-RO")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-text/70">{review.comment}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="shrink-0 rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
