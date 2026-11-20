import { Check } from "lucide-react"
import { getStatusLabel } from "@/lib/utils"
import type { Order } from "@/lib/types"

const statusOrder = ["pending", "processing", "shipped", "delivered"] as const

export function OrderTimeline({ order }: { order: Order }) {
  const activeIdx = Math.max(0, statusOrder.indexOf(order.status as (typeof statusOrder)[number]))

  if (order.status === "cancelled") {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
        Comanda a fost anulată
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white dark:bg-surface p-4">
      <div className="flex items-center justify-between">
        {statusOrder.map((s, i) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                i <= activeIdx
                  ? "bg-primary text-white"
                  : "bg-surface text-text/70"
              }`}
            >
              {i < activeIdx || (i === activeIdx && s === "delivered") ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs">{i + 1}</span>
              )}
            </div>
            <span
              className={`mt-1 text-xs ${
                i <= activeIdx ? "text-primary" : "text-text/70"
              }`}
            >
              {getStatusLabel(s)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
