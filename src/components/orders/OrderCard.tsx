import Link from "next/link"
import { formatPrice, getStatusLabel, getStatusColor } from "@/lib/utils"
import type { Order } from "@/lib/types"

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/comenzi/${order.id}`}
      className="block rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text/70">
            Comandă #{order.id.slice(0, 8)}
          </p>
          <p className="text-sm text-text">
            {new Date(order.created_at).toLocaleDateString("ro-RO")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">
            {formatPrice(order.total)}
          </p>
          <p className={`text-xs ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </p>
        </div>
      </div>
    </Link>
  )
}
