"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Pencil, Trash2, Star, Loader2, X, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { ProductForm } from "@/components/admin/ProductForm"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import type { Product, Category } from "@/lib/types"

const PAGE_SIZE = 20

export default function AdminProdusePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Map<string, string>>(new Map())
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("categories").select("id, name").then(({ data }) => {
      if (data) setCategories(new Map(data.map((c: any) => [c.id, c.name])))
    })
  }, [])

  const load = useCallback(async (query = "", append = false) => {
    const supabase = createClient()
    const q = query.trim()
    let request = supabase.from("products").select("*", { count: "exact" })

    if (q) request = request.ilike("name", `%${q}%`)

    request = request.order("created_at", { ascending: false })

    if (append) {
      request = request.range(products.length, products.length + PAGE_SIZE - 1)
    } else {
      request = request.range(0, PAGE_SIZE - 1)
    }

    if (append) setLoadingMore(true)
    else setLoading(true)

    const { data, error, count } = await request

    if (error) {
      toast.error(error.message)
      setLoading(false)
      setLoadingMore(false)
      return
    }

    setProducts(append ? (prev) => [...prev, ...((data as Product[]) || [])] : ((data as Product[]) || []))
    setTotal(count ?? 0)
    setHasMore((count ?? 0) > (append ? products.length + ((data as Product[]) || []).length : ((data as Product[]) || []).length))
    setLoading(false)
    setLoadingMore(false)
  }, [products.length])

  useEffect(() => {
    setProducts([])
    setHasMore(true)
    load(search, false)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi acest produs?")) return
    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Produs șters")
    load(search, false)
  }

  const toggleFeatured = async (product: Product) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .update({ featured: !product.featured })
      .eq("id", product.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(
      !product.featured
        ? "Produs adăugat la recomandate"
        : "Produs eliminat din recomandate"
    )
    load(search, false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Produse</h1>
          {!loading && (
            <p className="text-sm text-text/70">{total} produse în total</p>
          )}
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus className="h-4 w-4" /> Adaugă produs
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/70" />
        <label htmlFor="admin-products-search" className="sr-only">Caută produse</label>
        <input
          id="admin-products-search"
          className="w-full rounded-lg border border-border py-2 pl-9 pr-9 text-sm text-text"
          placeholder="Caută produse după nume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text/70 hover:text-text"
            aria-label="Curăță căutarea"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ProductForm
            product={editing}
            onSave={() => { setShowForm(false); setEditing(null); load(search, false) }}
            onCancel={() => { setShowForm(false); setEditing(null) }}
          />
        </div>
      )}

      <div className="rounded-xl bg-white dark:bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-text/70" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-text/70">
              {search ? "Niciun produs găsit pentru această căutare" : "Nu există produse"}
            </p>
            {!search && (
              <Button
                variant="secondary"
                onClick={() => { setEditing(null); setShowForm(true) }}
                className="mt-3"
              >
                <Plus className="h-4 w-4" /> Adaugă primul produs
              </Button>
            )}
          </div>
        ) : (
          <>
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text/30">
                      -
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{product.name}</p>
                  <p className="text-xs text-text/70">
                    {formatPrice(product.price)}
                    {categories.get(product.category_id ?? "") && (
                      <> &middot; {categories.get(product.category_id ?? "")}</>
                    )}
                    &nbsp;&middot; Stoc: {product.stock}
                  </p>
                  {product.featured && (
                    <p className="text-xs font-medium text-primary">Recomandat homepage</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`rounded-lg p-2 ${
                      product.featured ? "text-primary hover:bg-primary/10" : "text-text/70 hover:bg-surface"
                    }`}
                    aria-label={`${product.featured ? "Elimină" : "Adaugă"} produsul ${product.name} din recomandate`}
                  >
                    <Star className={`h-4 w-4 ${product.featured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => { setEditing(product); setShowForm(true) }}
                    className="rounded-lg p-2 text-text/70 hover:bg-surface"
                    aria-label={`Editează produsul ${product.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                    aria-label={`Șterge produsul ${product.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {hasMore && (
              <div className="border-t border-border px-4 py-3 text-center">
                <Button
                  variant="secondary"
                  loading={loadingMore}
                  onClick={() => load(search, true)}
                >
                  {loadingMore ? "Se încarcă..." : `Încarcă mai multe (${total - products.length} rămase)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
