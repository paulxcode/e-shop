"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "eshop-recently-viewed"
const MAX_ITEMS = 10

export interface RecentlyViewedItem {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const addItem = (product: RecentlyViewedItem) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== product.id)
      const next = [product, ...filtered].slice(0, MAX_ITEMS)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { items, addItem }
}
