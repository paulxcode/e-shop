"use client"

import { useState } from "react"
import Image from "next/image"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

export function ImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState(0)
  const allImages = images.length > 0 ? images : [placeholder.src]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
        <Image
          src={allImages[selected]}
          alt="Product image"
          fill
          className="object-cover"
        />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              aria-label={`Selectează imaginea ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                i === selected ? "border-primary" : "border-border"
              }`}
            >
              <Image
                src={img}
                alt={`Miniatură produs ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
