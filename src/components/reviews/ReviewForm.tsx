"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StarRating } from "./StarRating"
import { Button } from "@/components/ui/Button"

interface Props {
  productId: string
}

export function ReviewForm({ productId }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Selectează un rating")
      return
    }
    setSubmitting(true)
    setError("")

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, comment }),
    })

    if (res.ok) {
      setRating(0)
      setComment("")
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || "Eroare la trimitere")
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-white dark:bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">Lasă o recenzie</h3>

      <div className="mb-3">
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={24}
        />
      </div>

      <label htmlFor="review-comment" className="sr-only">Comentariu</label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Spune-ți părerea despre produs (opțional)"
        rows={3}
        className="mb-3 w-full rounded-lg border border-border bg-white dark:bg-surface p-2 text-sm text-text outline-none focus:border-primary"
      />

      {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={submitting}>
        {submitting ? "Se trimite..." : "Trimite recenzia"}
      </Button>
    </form>
  )
}
