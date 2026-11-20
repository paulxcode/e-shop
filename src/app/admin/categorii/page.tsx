"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import type { Category } from "@/lib/types"

export default function AdminCategoriiPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [editing, setEditing] = useState<Category | null>(null)

  const load = () => {
    const supabase = createClient()
    supabase
      .from("categories")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setCategories((data as Category[]) || [])
      })
  }

  const handleSave = async () => {
    const supabase = createClient()
    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()
    if (!trimmedName || !trimmedSlug) return
    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update({ name: trimmedName, slug: trimmedSlug })
        .eq("id", editing.id)
      if (error) {
        toast.error(error.message)
        return
      }
    } else {
      const { error } = await supabase.from("categories").insert({ name: trimmedName, slug: trimmedSlug })
      if (error) {
        toast.error(error.message)
        return
      }
    }
    setName("")
    setSlug("")
    setEditing(null)
    load()
    toast.success(editing ? "Categorie salvată" : "Categorie adăugată")
  }

  const handleEdit = (cat: Category) => {
    setEditing(cat)
    setName(cat.name)
    setSlug(cat.slug)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi această categorie?")) return
    const supabase = createClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    load()
    toast.success("Categorie ștearsă")
  }

  const toggleFeaturedHome = async (cat: Category) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("categories")
      .update({ featured_home: !cat.featured_home })
      .eq("id", cat.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(
      !cat.featured_home
        ? "Categorie adăugată la recomandate"
        : "Categorie eliminată din recomandate"
    )
    load()
  }

  useEffect(load, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Categorii</h1>

      <div className="mb-6 flex gap-3">
        <label className="sr-only" htmlFor="category-name">Nume categorie</label>
        <input
          id="category-name"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Nume categorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="sr-only" htmlFor="category-slug">Slug categorie</label>
        <input
          id="category-slug"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Button onClick={handleSave} disabled={!name.trim() || !slug.trim()}>
          {editing ? "Salvează" : <><Plus className="h-4 w-4" /> Adaugă</>}
        </Button>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between border-b border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-text">{cat.name}</p>
              <p className="text-xs text-text/70">{cat.slug}</p>
              {cat.featured_home && (
                <p className="text-xs font-medium text-primary">Recomandată homepage</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleFeaturedHome(cat)}
                className={`rounded-lg p-2 ${cat.featured_home ? "text-primary hover:bg-primary/10" : "text-text hover:bg-surface"}`}
                aria-label={`${cat.featured_home ? "Elimină" : "Adaugă"} categoria ${cat.name} din recomandate`}
              >
                <Star className={`h-4 w-4 ${cat.featured_home ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => handleEdit(cat)}
                className="rounded-lg p-2 text-text hover:bg-surface"
                aria-label={`Editează categoria ${cat.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`Șterge categoria ${cat.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-4 text-center text-sm text-text/70">
            Nu există categorii
          </p>
        )}
      </div>
    </div>
  )
}
