"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, GripVertical, EyeOff, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import type { CarouselSlide } from "@/lib/types"

export default function AdminCaroselPage() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [buttonText, setButtonText] = useState("")
  const [linkType, setLinkType] = useState<CarouselSlide["link_type"]>("custom")
  const [linkValue, setLinkValue] = useState("")
  const [editing, setEditing] = useState<CarouselSlide | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const supabase = createClient()

  const load = async () => {
    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .order("sort_order")
    if (error) {
      toast.error(error.message)
      return
    }
    setSlides((data as CarouselSlide[]) || [])
  }

  const resetForm = () => {
    setImageUrl("")
    setTitle("")
    setSubtitle("")
    setButtonText("")
    setLinkType("custom")
    setLinkValue("")
    setEditing(null)
  }

  const handleSave = async () => {
    if (!imageUrl.trim() || !title.trim() || !linkValue.trim()) {
      toast.error("Completează câmpurile obligatorii")
      return
    }
    const payload = {
      image_url: imageUrl.trim(),
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      button_text: buttonText.trim() || null,
      link_type: linkType,
      link_value: linkValue.trim(),
    }
    if (editing) {
      const { error } = await supabase
        .from("carousel_slides")
        .update(payload)
        .eq("id", editing.id)
      if (error) { toast.error(error.message); return }
    } else {
      const maxOrder = slides.reduce((m, s) => Math.max(m, s.sort_order), -1)
      const { error } = await supabase
        .from("carousel_slides")
        .insert({ ...payload, sort_order: maxOrder + 1 })
      if (error) { toast.error(error.message); return }
    }
    resetForm()
    load()
    toast.success(editing ? "Slide salvat" : "Slide adăugat")
  }

  const handleEdit = (slide: CarouselSlide) => {
    setEditing(slide)
    setImageUrl(slide.image_url)
    setTitle(slide.title)
    setSubtitle(slide.subtitle ?? "")
    setButtonText(slide.button_text ?? "")
    setLinkType(slide.link_type)
    setLinkValue(slide.link_value)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi acest slide?")) return
    const { error } = await supabase.from("carousel_slides").delete().eq("id", id)
    if (error) { toast.error(error.message); return }
    load()
    toast.success("Slide șters")
  }

  const handleToggleActive = async (slide: CarouselSlide) => {
    const { error } = await supabase
      .from("carousel_slides")
      .update({ is_active: !slide.is_active })
      .eq("id", slide.id)
    if (error) { toast.error(error.message); return }
    load()
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const reordered = [...slides]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)
    setSlides(reordered)
    setDragIndex(index)
  }

  const handleDragEnd = async () => {
    setDragIndex(null)
    const updated = slides.map((s, i) => ({
      id: s.id,
      sort_order: i,
    }))
    const { error } = await supabase.from("carousel_slides").upsert(updated)
    if (error) {
      toast.error("Eroare la salvare ordine")
      load()
    }
  }

  const linkTypeLabel = (t: string) => {
    if (t === "category") return "Categorie"
    if (t === "product") return "Produs"
    return "URL"
  }

  useEffect(() => { load() }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Carusel Homepage</h1>

      {/* Form */}
      <div className="mb-6 space-y-3 rounded-xl bg-white dark:bg-surface p-4 shadow-sm">
        <input
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="URL imagine *"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Titlu *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Subtitlu"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <input
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Text buton"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
          />
          <select
            className="rounded-lg border border-border px-3 py-2 text-sm"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as CarouselSlide["link_type"])}
          >
            <option value="category">Categorie</option>
            <option value="product">Produs</option>
            <option value="custom">URL</option>
          </select>
          <input
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="Valoare link (slug sau URL) *"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!imageUrl.trim() || !title.trim() || !linkValue.trim()}>
            {editing ? "Salvează" : <><Plus className="h-4 w-4" /> Adaugă</>}
          </Button>
          {editing && (
            <Button variant="ghost" onClick={resetForm}>Anulează</Button>
          )}
        </div>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Previzualizare"
            className="mt-2 h-32 w-full rounded-lg object-cover"
          />
        )}
      </div>

      {/* List */}
      <div className="rounded-xl bg-white dark:bg-surface">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 border-b border-border px-4 py-3 ${
              dragIndex === i ? "opacity-50" : ""
            }`}
          >
            <GripVertical className="h-5 w-5 cursor-grab text-text/30" />
            <img
              src={slide.image_url}
              alt=""
              className="h-12 w-20 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-text">{slide.title}</p>
              <p className="text-xs text-text/70">{linkTypeLabel(slide.link_type)}: {slide.link_value}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {slide.is_active ? "Activ" : "Inactiv"}
            </span>
            <button
              onClick={() => handleToggleActive(slide)}
              className="rounded-lg p-2 text-text hover:bg-surface"
              aria-label={slide.is_active ? "Dezactivează" : "Activează"}
            >
              {slide.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => handleEdit(slide)}
              className="rounded-lg p-2 text-text hover:bg-surface"
              aria-label={`Editează slide ${slide.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(slide.id)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              aria-label={`Șterge slide ${slide.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {slides.length === 0 && (
          <p className="p-4 text-center text-sm text-text/70">
            Nu există slide-uri
          </p>
        )}
      </div>
    </div>
  )
}
