"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

interface Coupon {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_value: number
  max_uses: number | null
  used_count: number
  applies_to: "all" | "category" | "product"
  applies_to_id: string | null
  single_use_per_user: boolean
  expires_at: string | null
  active: boolean
  created_at: string
}

const initialForm = {
  code: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: "",
  min_order_value: "",
  max_uses: "",
  applies_to: "all" as "all" | "category" | "product",
  applies_to_id: "",
  single_use_per_user: false,
  active: true,
  expires_at: "",
}

export default function AdminCupoanePage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<Coupon | null>(null)

  const load = () => {
    const supabase = createClient()
    supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message)
          return
        }
        setCoupons((data as Coupon[]) || [])
      })
  }

  const handleSave = async () => {
    const supabase = createClient()
    const payload = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_value: parseFloat(form.min_order_value) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
      applies_to: form.applies_to,
      applies_to_id:
        form.applies_to !== "all" && form.applies_to_id.trim()
          ? form.applies_to_id.trim()
          : null,
      single_use_per_user: form.single_use_per_user,
      active: form.active,
      expires_at: form.expires_at || null,
    }
    if (!payload.code || isNaN(payload.discount_value)) return
    if (editing) {
      const { error } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", editing.id)
      if (error) {
        toast.error(error.message)
        return
      }
    } else {
      const { error } = await supabase.from("coupons").insert(payload)
      if (error) {
        toast.error(error.message)
        return
      }
    }
    setForm(initialForm)
    setEditing(null)
    load()
    toast.success("Cuponul a fost salvat")
  }

  const handleEdit = (coupon: Coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_value: String(coupon.min_order_value),
      max_uses: coupon.max_uses !== null ? String(coupon.max_uses) : "",
      applies_to: coupon.applies_to,
      applies_to_id: coupon.applies_to_id ?? "",
      single_use_per_user: coupon.single_use_per_user,
      active: coupon.active,
      expires_at:
        coupon.expires_at
          ? coupon.expires_at.slice(0, 10)
          : "",
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Sigur dorești să ștergi acest cupon?")) return
    const supabase = createClient()
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    load()
    toast.success("Cuponul a fost șters")
  }

  const set = (key: keyof typeof initialForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  useEffect(load, [])

  const canSave =
    form.code.trim() && form.discount_value && !isNaN(parseFloat(form.discount_value))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Cupoane</h1>

      <div className="mb-8 rounded-xl border border-border bg-white p-5 dark:bg-surface">
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[180px] flex-1 flex-col gap-1">
            <label htmlFor="code" className="text-xs font-medium text-text/70">
              Cod
            </label>
            <input
              id="code"
              className="rounded-lg border border-border px-3 py-2 text-sm uppercase"
              placeholder="EXEMPLU"
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex min-w-[160px] flex-1 flex-col gap-1">
            <label htmlFor="discount_type" className="text-xs font-medium text-text/70">
              Tip reducere
            </label>
            <select
              id="discount_type"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={form.discount_type}
              onChange={(e) => set("discount_type", e.target.value)}
            >
              <option value="percentage">Procentual</option>
              <option value="fixed">Fix</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex min-w-[140px] flex-1 flex-col gap-1">
            <label htmlFor="discount_value" className="text-xs font-medium text-text/70">
              Valoare reducere
            </label>
            <input
              id="discount_value"
              type="number"
              step="0.01"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="0.00"
              value={form.discount_value}
              onChange={(e) => set("discount_value", e.target.value)}
            />
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-1">
            <label htmlFor="min_order_value" className="text-xs font-medium text-text/70">
              Valoare minimă comandă
            </label>
            <input
              id="min_order_value"
              type="number"
              step="0.01"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="0.00"
              value={form.min_order_value}
              onChange={(e) => set("min_order_value", e.target.value)}
            />
          </div>
          <div className="flex min-w-[140px] flex-1 flex-col gap-1">
            <label htmlFor="max_uses" className="text-xs font-medium text-text/70">
              Utilizări maxime
            </label>
            <input
              id="max_uses"
              type="number"
              min="0"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="Fără limită"
              value={form.max_uses}
              onChange={(e) => set("max_uses", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex min-w-[160px] flex-1 flex-col gap-1">
            <label htmlFor="applies_to" className="text-xs font-medium text-text/70">
              Se aplică la
            </label>
            <select
              id="applies_to"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={form.applies_to}
              onChange={(e) => set("applies_to", e.target.value)}
            >
              <option value="all">Toate produsele</option>
              <option value="category">Categorie</option>
              <option value="product">Produs</option>
            </select>
          </div>
          {(form.applies_to === "category" || form.applies_to === "product") && (
            <div className="flex min-w-[200px] flex-[2] flex-col gap-1">
              <label htmlFor="applies_to_id" className="text-xs font-medium text-text/70">
                ID {form.applies_to === "category" ? "categorie" : "produs"}
              </label>
              <input
                id="applies_to_id"
                className="rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="ID categorie/produs"
                value={form.applies_to_id}
                onChange={(e) => set("applies_to_id", e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
              checked={form.single_use_per_user}
              onChange={(e) => set("single_use_per_user", e.target.checked)}
            />
            Unică per utilizator
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Activ
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="flex min-w-[180px] flex-col gap-1">
            <label htmlFor="expires_at" className="text-xs font-medium text-text/70">
              Expiră la
            </label>
            <input
              id="expires_at"
              type="date"
              className="rounded-lg border border-border px-3 py-2 text-sm"
              value={form.expires_at}
              onChange={(e) => set("expires_at", e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={!canSave}>
            {editing ? "Salvează" : <><Plus className="h-4 w-4" /> Adaugă</>}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white dark:bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text/70">
              <th className="px-4 py-3 font-medium">Cod</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Valoare</th>
              <th className="px-4 py-3 font-medium">Min. comandă</th>
              <th className="px-4 py-3 font-medium">Utilizări</th>
              <th className="px-4 py-3 font-medium">Se aplică la</th>
              <th className="px-4 py-3 font-medium">Unică</th>
              <th className="px-4 py-3 font-medium">Expiră</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-text">{coupon.code}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      coupon.discount_type === "percentage"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {coupon.discount_type === "percentage" ? "Procentual" : "Fix"}
                  </span>
                </td>
                <td className="px-4 py-3 text-text">
                  {coupon.discount_type === "percentage"
                    ? `${coupon.discount_value}%`
                    : `${coupon.discount_value.toFixed(2)} lei`}
                </td>
                <td className="px-4 py-3 text-text">
                  {coupon.min_order_value > 0
                    ? `${coupon.min_order_value.toFixed(2)} lei`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-text">
                  {coupon.used_count}
                  {" / "}
                  {coupon.max_uses ?? "∞"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text">
                    {coupon.applies_to === "all"
                      ? "Toate"
                      : coupon.applies_to === "category"
                        ? "Categorie"
                        : "Produs"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-text">
                  {coupon.single_use_per_user ? "Unică per utilizator" : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-text">
                  {coupon.expires_at
                    ? new Date(coupon.expires_at).toLocaleDateString("ro-RO")
                    : "Fără expirare"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      coupon.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {coupon.active ? "Activ" : "Inactiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="rounded-lg p-2 text-text hover:bg-surface"
                      aria-label={`Editează cuponul ${coupon.code}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      aria-label={`Șterge cuponul ${coupon.code}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="p-6 text-center text-sm text-text/70">Nu există cupoane</p>
        )}
      </div>
    </div>
  )
}
