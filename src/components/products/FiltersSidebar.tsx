"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Category, CategoryGroup } from "@/lib/types"

interface FiltersSidebarProps {
  categories: Category[]
  groups: CategoryGroup[]
}

export function FiltersSidebar({ categories, groups }: FiltersSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceMin, setPriceMin] = useState(searchParams.get("pret_min") || "")
  const [priceMax, setPriceMax] = useState(searchParams.get("pret_max") || "")
  const activeCat = searchParams.get("categorie") || ""
  const sort = searchParams.get("sort") || "noutate"

  const activeCatGroupId = categories.find((c) => c.slug === activeCat)?.group_id

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    return new Set(activeCatGroupId ? [activeCatGroupId] : [])
  })

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/produse?${params.toString()}`)
  }

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (priceMin) params.set("pret_min", priceMin)
    else params.delete("pret_min")
    if (priceMax) params.set("pret_max", priceMax)
    else params.delete("pret_max")
    router.push(`/produse?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    router.push(`/produse${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const grouped: { group: CategoryGroup; cats: Category[] }[] = groups
    .map((g) => ({
      group: g,
      cats: categories.filter((c) => c.group_id === g.id),
    }))
    .filter((g) => g.cats.length > 0)

  return (
    <div className="rounded-xl bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-text">Categorii</h3>
      <div className="mb-4 flex flex-col gap-1">
        <button
          onClick={() => updateParam("categorie", "")}
          className={`rounded-lg px-3 py-1.5 text-left text-sm ${
            !activeCat ? "bg-primary text-white" : "text-text hover:bg-surface"
          }`}
        >
          Toate
        </button>
        {grouped.map(({ group, cats }) => {
          const isExpanded = expandedGroups.has(group.id)
          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm font-medium text-text hover:bg-surface"
              >
                {group.name}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                />
              </button>
              {isExpanded && (
                <div className="ml-3 flex flex-col border-l border-border pl-2">
                  {cats.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam("categorie", cat.slug)}
                      className={`rounded-lg px-3 py-1 text-left text-sm ${
                        activeCat === cat.slug
                          ? "bg-primary text-white"
                          : "text-text/70 hover:text-text"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <h3 className="mb-2 text-sm font-semibold text-text">Preț</h3>
      <div className="mb-4 flex gap-2">
        <label htmlFor="filter-price-min" className="sr-only">Preț minim</label>
          <input
            id="filter-price-min"
            type="number"
            min="0"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm text-text"
          />
        <label htmlFor="filter-price-max" className="sr-only">Preț maxim</label>
          <input
            id="filter-price-max"
            type="number"
            min="0"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full rounded-lg border border-border px-2 py-1.5 text-sm text-text"
          />
      </div>
      <button
        onClick={applyPrice}
        className="mb-4 w-full rounded-lg bg-primary py-1.5 text-sm text-white"
      >
        Aplică
      </button>

      <h3 className="mb-2 text-sm font-semibold text-text">Sortare</h3>
      <label htmlFor="filter-sort" className="sr-only">Sortare produse</label>
      <select
        id="filter-sort"
        value={sort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="mb-4 w-full rounded-lg border border-border px-2 py-1.5 text-sm text-text"
      >
        <option value="noutate">Cele mai noi</option>
        <option value="pret-asc">Preț: crescător</option>
        <option value="pret-desc">Preț: descrescător</option>
        <option value="rating-desc">Rating</option>
      </select>

      <button
        onClick={clearFilters}
        className="w-full rounded-lg border border-border py-1.5 text-sm text-text hover:bg-surface"
      >
        Resetează filtrele
      </button>
    </div>
  )
}
