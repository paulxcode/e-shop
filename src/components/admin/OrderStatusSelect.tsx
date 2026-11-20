"use client"

const statuses = [
  { value: "pending", label: "În așteptare" },
  { value: "processing", label: "În procesare" },
  { value: "shipped", label: "Expediat" },
  { value: "delivered", label: "Livrat" },
  { value: "cancelled", label: "Anulat" },
]

interface Props {
  current: string
  onChange: (status: string) => void
}

export function OrderStatusSelect({ current, onChange }: Props) {
  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border px-3 py-1.5 text-sm text-text"
      aria-label="Status comandă"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
