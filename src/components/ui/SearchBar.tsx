"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import type { Product } from "@/lib/types"

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`)
        const data = await res.json()
        setSuggestions(data.products || [])
        setOpen(true)
      } catch {
        setSuggestions([])
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/produse?search=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      setQuery("")
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          aria-label="Caută produse"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          placeholder="Caută produse..."
          className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-8 text-sm text-text placeholder:text-text/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/70" />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/70 hover:text-text"
            aria-label="Șterge căutarea"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </form>

      {open && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border bg-bg p-2 shadow-lg"
        >
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/produse/${product.slug}`}
              onClick={() => { setOpen(false); setQuery("") }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0 text-text/70" />
              <span className="line-clamp-1">{product.name}</span>
              <span className="ml-auto text-xs text-text/70">
                {product.price.toLocaleString("ro-RO", { style: "currency", currency: "RON" })}
              </span>
            </Link>
          ))}
          <Link
            href={`/produse?search=${encodeURIComponent(query)}`}
            onClick={() => { setOpen(false); setQuery("") }}
            className="mt-1 block rounded-lg px-3 py-2 text-center text-xs text-primary hover:bg-surface"
          >
            Vezi toate rezultatele
          </Link>
        </div>
      )}
    </div>
  )
}
