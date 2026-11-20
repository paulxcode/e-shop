"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import type { Product } from "@/lib/types"
import { toast } from "sonner"
import { Plus, X, GripVertical } from "lucide-react"

interface Props {
  product?: Product | null
  onSave: () => void
  onCancel: () => void
}

interface CategoryOption {
  id: string
  name: string
  group_name: string
}

interface SpecEntry {
  key: string
  value: string
}

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_price: "",
  images: [""],
  category_id: "",
  stock: "0",
  featured: false,
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[șş]/g, "s")
    .replace(/[țţ]/g, "t")
    .replace(/[ăâ]/g, "a")
    .replace(/[î]/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function specsToEntries(specs: Record<string, string>): SpecEntry[] {
  const entries = Object.entries(specs)
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }]
}

function entriesToSpecs(entries: SpecEntry[]): Record<string, string> {
  return Object.fromEntries(entries.filter((e) => e.key.trim()).map((e) => [e.key.trim(), e.value.trim()]))
}

export function ProductForm({ product, onSave, onCancel }: Props) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [slugTouched, setSlugTouched] = useState(false)
  const [slugExists, setSlugExists] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: String(product.price),
          compare_price: product.compare_price ? String(product.compare_price) : "",
          images: product.images.length > 0 ? product.images : [""],
          category_id: product.category_id || "",
          stock: String(product.stock),
          featured: product.featured,
        }
      : defaultForm
  )
  const [specs, setSpecs] = useState<SpecEntry[]>(
    product ? specsToEntries(product.specifications) : [{ key: "", value: "" }]
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("categories")
      .select("id, name, category_groups(name)")
      .order("name")
      .then(({ data }) => {
        if (!data) return
        setCategories(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            group_name: c.category_groups?.name || "Fără grup",
          }))
        )
      })
  }, [])

  const checkSlug = useCallback(
    async (slug: string) => {
      if (!slug.trim()) {
        setSlugExists(false)
        return
      }
      setCheckingSlug(true)
      const supabase = createClient()
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug)
        .neq("id", product?.id ?? "00000000-0000-0000-0000-000000000000")
      setSlugExists((count ?? 0) > 0)
      setCheckingSlug(false)
    },
    [product?.id]
  )

  useEffect(() => {
    if (!slugTouched && form.name && !product) {
      const generated = slugify(form.name)
      setForm((prev) => ({ ...prev, slug: generated }))
      checkSlug(generated)
    }
  }, [form.name, slugTouched, product, checkSlug])

  useEffect(() => {
    if (slugTouched && form.slug) {
      const timer = setTimeout(() => checkSlug(form.slug), 400)
      return () => clearTimeout(timer)
    }
  }, [form.slug, slugTouched, checkSlug])

  const addSpec = () => setSpecs((prev) => [...prev, { key: "", value: "" }])
  const removeSpec = (index: number) => setSpecs((prev) => prev.filter((_, i) => i !== index))
  const updateSpec = (index: number, field: "key" | "value", val: string) =>
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)))

  const addImage = () => setForm((prev) => ({ ...prev, images: [...prev.images, ""] }))
  const removeImage = (index: number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  const updateImage = (index: number, val: string) =>
    setForm((prev) => ({ ...prev, images: prev.images.map((img, i) => (i === index ? val : img)) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    if (slugExists) {
      toast.error("Slug-ul există deja. Alege alt slug.")
      setLoading(false)
      return
    }

    if (form.compare_price && parseFloat(form.compare_price) <= parseFloat(form.price)) {
      toast.error("Prețul vechi trebuie să fie mai mare decât prețul actual")
      setLoading(false)
      return
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      images: form.images.map((img) => img.trim()).filter(Boolean),
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      specifications: entriesToSpecs(specs),
    }

    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id)
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success("Produs actualizat")
    } else {
      const { error } = await supabase.from("products").insert(payload)
      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }
      toast.success("Produs adăugat")
    }

    setLoading(false)
    onSave()
  }

  const grouped = categories.reduce<Record<string, CategoryOption[]>>((acc, cat) => {
    ;(acc[cat.group_name] ??= []).push(cat)
    return acc
  }, {})

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text">
        {product ? "Editează produsul" : "Produs nou"}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="pf-name" className="sr-only">Nume produs</label>
        <input
          id="pf-name"
          className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Nume produs"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <label htmlFor="pf-slug" className="sr-only">Slug produs</label>
        <div className="relative col-span-2">
          <input
            id="pf-slug"
            className={`w-full rounded-lg border px-3 py-2 text-sm ${
              slugExists ? "border-red-400" : "border-border"
            }`}
            placeholder="Slug (ex: laptop-gaming)"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setForm({ ...form, slug: slugify(e.target.value) })
            }}
            required
          />
          {slugExists && (
            <p className="mt-1 text-xs text-red-500">Slug-ul există deja</p>
          )}
          {checkingSlug && (
            <p className="mt-1 text-xs text-text/70">Verificare slug...</p>
          )}
        </div>
        <label htmlFor="pf-description" className="sr-only">Descriere produs</label>
        <textarea
          id="pf-description"
          className="col-span-2 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Descriere"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
        <label htmlFor="pf-price" className="sr-only">Preț</label>
        <input
          id="pf-price"
          className="rounded-lg border border-border px-3 py-2 text-sm"
          type="number"
          step="0.01"
          min="0"
          placeholder="Preț (RON)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <label htmlFor="pf-compare-price" className="sr-only">Preț vechi</label>
        <input
          id="pf-compare-price"
          className="rounded-lg border border-border px-3 py-2 text-sm"
          type="number"
          step="0.01"
          min="0"
          placeholder="Preț vechi (fără TVA)"
          value={form.compare_price}
          onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
        />
        <label htmlFor="pf-category" className="sr-only">Categorie</label>
        <select
          id="pf-category"
          className="rounded-lg border border-border px-3 py-2 text-sm"
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          <option value="">Fără categorie</option>
          {Object.entries(grouped).map(([groupName, cats]) => (
            <optgroup key={groupName} label={groupName}>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <label htmlFor="pf-stock" className="sr-only">Stoc</label>
        <input
          id="pf-stock"
          className="rounded-lg border border-border px-3 py-2 text-sm"
          type="number"
          min="0"
          placeholder="Stoc"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <label className="col-span-2 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Produs recomandat pe homepage
        </label>

        <div className="col-span-2">
          <p className="mb-1 text-sm font-medium text-text">Imagini</p>
          <div className="space-y-2">
            {form.images.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  aria-label={`Imagine URL ${index + 1}`}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder={`URL imagine ${index + 1}`}
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                />
                {image && (
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-border bg-surface">
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "0.3"
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.opacity = "1"
                      }}
                    />
                  </div>
                )}
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                    aria-label={`Șterge imaginea ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addImage} className="mt-2">
            <Plus className="h-4 w-4" /> Adaugă imagine
          </Button>
        </div>

        <div className="col-span-2">
          <p className="mb-1 text-sm font-medium text-text">Specificații</p>
          <div className="space-y-2">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 flex-shrink-0 text-text/30" />
                <input
                  aria-label={`Specificație cheie ${index + 1}`}
                  className="w-2/5 rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="Cheie (ex: Brand)"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                />
                <input
                  aria-label={`Specificație valoare ${index + 1}`}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                  placeholder="Valoare (ex: Samsung)"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                />
                {specs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                    aria-label={`Șterge specificația ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="secondary" onClick={addSpec} className="mt-2">
            <Plus className="h-4 w-4" /> Adaugă specificație
          </Button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button type="submit" loading={loading}>
          {product ? "Salvează modificările" : "Adaugă produs"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anulează
        </Button>
      </div>
    </form>
  )
}
