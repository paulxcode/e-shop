"use client"

import { useState, useEffect } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { StarRating } from "./StarRating"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"
import type { Review } from "@/lib/types"

interface Props {
  review: Review
}

export function ReviewCard({ review }: Props) {
  const { user } = useAuthStore()
  const [helpfulCount, setHelpfulCount] = useState(0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(0)
  const [userVote, setUserVote] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("review_votes")
      .select("vote, user_id")
      .eq("review_id", review.id)
      .then(({ data }) => {
        if (!data) return
        setHelpfulCount(data.filter((v) => v.vote === true).length)
        setNotHelpfulCount(data.filter((v) => v.vote === false).length)
        if (user) {
          const myVote = data.find((v) => v.user_id === user.id)
          setUserVote(myVote ? myVote.vote : null)
        }
      })
  }, [review.id, user])

  const handleVote = async (vote: boolean) => {
    if (!user) {
      toast.error("Trebuie să fii autentificat")
      return
    }
    const newVote = userVote === vote ? null : vote
    const res = await fetch(`/api/reviews/${review.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: newVote }),
    })
    if (res.ok) {
      setUserVote(newVote)
      if (newVote === true) {
        setHelpfulCount((c) => c + (userVote === false ? 2 : userVote === null ? 1 : 0))
        if (userVote === false) setNotHelpfulCount((c) => c - 1)
      } else if (newVote === false) {
        setNotHelpfulCount((c) => c + (userVote === true ? 2 : userVote === null ? 1 : 0))
        if (userVote === true) setHelpfulCount((c) => c - 1)
      } else {
        if (userVote === true) setHelpfulCount((c) => c - 1)
        if (userVote === false) setNotHelpfulCount((c) => c - 1)
      }
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text">
            {review.user?.full_name ?? "Anonim"}
          </span>
          {review.is_verified_purchase && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Cumpărare verificată
            </span>
          )}
        </div>
        <span className="text-xs text-text/70">
          {new Date(review.created_at).toLocaleDateString("ro-RO")}
        </span>
      </div>

      <StarRating rating={review.rating} />

      {review.comment && (
        <p className="mt-2 text-sm text-text/70">{review.comment}</p>
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-text/70">
        <button
          onClick={() => handleVote(true)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
            userVote === true ? "bg-green-100 text-green-700" : "hover:bg-surface hover:text-text"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>{helpfulCount}</span>
        </button>
        <button
          onClick={() => handleVote(false)}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${
            userVote === false ? "bg-red-100 text-red-600" : "hover:bg-surface hover:text-text"
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          <span>{notHelpfulCount}</span>
        </button>
      </div>
    </div>
  )
}
