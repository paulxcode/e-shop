"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import type { ShippingMethod } from "@/lib/types"

export default function AdminMetodeLivrarePage() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [estimatedDaysMin, setEstimatedDaysMin] = useState("")
  const [estimatedDaysMax, setEstimatedDaysMax] = useState("")
  const [editing, setEditing] = useState<ShippingMethod | null>(null)

  const load = () => {
    const supabase = createClient()
    supabase
      .from("shipping_methods")
      .select("*")
      .order("price")
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setMethods((data as ShippingMethod[]) || [])
      })
  }

  const handleSave = async () => {
    const supabase = createClient()
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const parsedPrice = parseFloat(price)
    const parsedMin = parseInt(estimatedDaysMin, 10)
    const parsedMax = parseInt(estimatedDaysMax, 10)
    if (!trimmedName || isNaN(parsedPrice) || isNaN(parsedMin) || isNaN(parsedMax)) return
    if (editing) {
      const { error } = await supabase
        .from("shipping_methods")
        .update({
          name: trimmedName,
          description: trimmedDescription || null,
          price: parsedPrice,
          estimated_days_min: parsedMin,
          estimated_days_max: parsedMax,
        })
        .eq("id", editing.id)
      if (error) {
        toast.error(error.message)
        return
      }
    } else {
      const { error } = await supabase.from("shipping_methods").insert({
        name: trimmedName,
        description: trimmedDescription || null,
        price: parsedPrice,
        estimated_days_min: parsedMin,
        estimated_days_max: parsedMax,
      })
      if (error) {
        toast.error(error.message)
        return
      }
    }
    setName("")
    setDescription("")
    setPrice("")
    setEstimatedDaysMin("")
    setEstimatedDaysMax("")
    setEditing(null)
    load()
    toast.success(editing ? "Metoda de livrare a fost salvată" : "Metoda de livrare a fost salvată")
  }

  const handleEdit = (method: ShippingMethod) => {
    setEditing(method)
    setName(method.name)
    setDescription(method.description ?? "")
    setPrice(method.price.toString())
    setEstimatedDaysMin(method.estimated_days_min.toString())
    setEstimatedDaysMax(method.estimated_days_max.toString())
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi această metodă de livrare?")) return
    const supabase = createClient()
    const { error } = await supabase.from("shipping_methods").delete().eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    load()
    toast.success("Metoda de livrare a fost ștearsă")
  }

  useEffect(load, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Metode de livrare</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="method-name">Nume</label>
        <input
          id="method-name"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Nume"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="sr-only" htmlFor="method-description">Descriere</label>
        <input
          id="method-description"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Descriere"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label className="sr-only" htmlFor="method-price">Preț</label>
        <input
          id="method-price"
          type="number"
          step="0.01"
          min="0"
          className="w-28 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Preț"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label className="sr-only" htmlFor="method-days-min">Zile min</label>
        <input
          id="method-days-min"
          type="number"
          min="0"
          className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Zile min"
          value={estimatedDaysMin}
          onChange={(e) => setEstimatedDaysMin(e.target.value)}
        />
        <label className="sr-only" htmlFor="method-days-max">Zile max</label>
        <input
          id="method-days-max"
          type="number"
          min="0"
          className="w-24 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Zile max"
          value={estimatedDaysMax}
          onChange={(e) => setEstimatedDaysMax(e.target.value)}
        />
        <Button onClick={handleSave} disabled={!name.trim() || !price || !estimatedDaysMin || !estimatedDaysMax}>
          {editing ? "Salvează" : <><Plus className="h-4 w-4" /> Adaugă</>}
        </Button>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between border-b border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-text">{method.name}</p>
              <p className="text-xs text-text/70">{method.price.toFixed(2)} Lei</p>
              {method.description && (
                <p className="text-xs text-text/70">{method.description}</p>
              )}
              <p className="text-xs text-text/70">
                {method.estimated_days_min}-{method.estimated_days_max} zile lucrătoare
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(method)}
                className="rounded-lg p-2 text-text hover:bg-surface"
                aria-label={`Editează metoda ${method.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(method.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`Șterge metoda ${method.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <p className="p-4 text-center text-sm text-text/70">
            Nu există metode de livrare
          </p>
        )}
      </div>
    </div>
  )
}
