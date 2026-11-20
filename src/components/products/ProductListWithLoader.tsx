"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/lib/types"

interface Props {
  initialProducts: Product[]
  initialHasMore: boolean
}

export function ProductListWithLoader({ initialProducts, initialHasMore }: Props) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  const currentFilters = searchParams.toString()

  useEffect(() => {
    setProducts(initialProducts)
    setHasMore(initialHasMore)
    setPage(1)
  }, [currentFilters, initialProducts, initialHasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [hasMore, loading, page, currentFilters])

  const loadMore = async () => {
    setLoading(true)
    const nextPage = page + 1
    const res = await fetch(`/api/products?page=${nextPage}&limit=20${currentFilters ? `&${currentFilters}` : ""}`)
    const data = await res.json()

    setProducts((prev) => [...prev, ...data.products])
    setHasMore(data.hasMore)
    setPage(nextPage)
    setLoading(false)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div ref={loaderRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-text/70">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Se încarcă...
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-sm text-text/70">Toate produsele au fost încărcate</p>
        )}
      </div>

      {products.length === 0 && !loading && (
        <p className="py-12 text-center text-sm text-text/70">
          Nu s-au găsit produse
        </p>
      )}
    </>
  )
}
