"use client"

import { Star } from "lucide-react"

interface Props {
  rating: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        const filled = star <= rating

        return (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            aria-label={interactive ? `Selectează ${star} stele` : `${rating} din ${max} stele`}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              size={size}
              className={
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        )
      })}
    </div>
  )
}
