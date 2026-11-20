"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

interface Location {
  id: string
  county: string
  city: string
}

export default function AdminLocalitatiPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [county, setCounty] = useState("")
  const [city, setCity] = useState("")
  const [editing, setEditing] = useState<Location | null>(null)

  const load = () => {
    const supabase = createClient()
    supabase
      .from("supported_locations")
      .select("*")
      .order("county")
      .order("city")
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setLocations((data as Location[]) || [])
      })
  }

  const handleSave = async () => {
    const supabase = createClient()
    const trimmedCounty = county.trim()
    const trimmedCity = city.trim()
    if (!trimmedCounty || !trimmedCity) return
    if (editing) {
      const { error } = await supabase
        .from("supported_locations")
        .update({ county: trimmedCounty, city: trimmedCity })
        .eq("id", editing.id)
      if (error) {
        toast.error(error.message)
        return
      }
    } else {
      const { error } = await supabase.from("supported_locations").insert({ county: trimmedCounty, city: trimmedCity })
      if (error) {
        toast.error(error.message)
        return
      }
    }
    setCounty("")
    setCity("")
    setEditing(null)
    load()
    toast.success("Localitatea a fost salvată")
  }

  const handleEdit = (loc: Location) => {
    setEditing(loc)
    setCounty(loc.county)
    setCity(loc.city)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi această localitate?")) return
    const supabase = createClient()
    const { error } = await supabase.from("supported_locations").delete().eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    load()
    toast.success("Localitatea a fost ștearsă")
  }

  useEffect(load, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Localități</h1>

      <div className="mb-6 flex gap-3">
        <label className="sr-only" htmlFor="location-county">Județ</label>
        <input
          id="location-county"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Județ"
          value={county}
          onChange={(e) => setCounty(e.target.value)}
        />
        <label className="sr-only" htmlFor="location-city">Localitate</label>
        <input
          id="location-city"
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="Localitate"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Button onClick={handleSave} disabled={!county.trim() || !city.trim()}>
          {editing ? "Salvează" : <><Plus className="h-4 w-4" /> Adaugă</>}
        </Button>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="flex items-center justify-between border-b border-border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-text">{loc.city}</p>
              <p className="text-xs text-text/70">{loc.county}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(loc)}
                className="rounded-lg p-2 text-text hover:bg-surface"
                aria-label={`Editează localitatea ${loc.city}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(loc.id)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                aria-label={`Șterge localitatea ${loc.city}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="p-4 text-center text-sm text-text/70">
            Nu există localități
          </p>
        )}
      </div>
    </div>
  )
}
