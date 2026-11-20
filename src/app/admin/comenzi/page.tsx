"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatPrice, getStatusLabel } from "@/lib/utils"
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect"
import type { Order } from "@/lib/types"
import { toast } from "sonner"

export default function AdminComenziPage() {
  const [orders, setOrders] = useState<Order[]>([])

  const load = () => {
    const supabase = createClient()
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setOrders((data as Order[]) || []))
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const payload: Record<string, string | null> = { status }
    if (status === "delivered") {
      payload.delivered_at = new Date().toISOString()
    }
    const { error } = await supabase.from("orders").update(payload).eq("id", id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Status comandă actualizat")
    load()
  }

  useEffect(load, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Comenzi</h1>

      <div className="rounded-xl bg-white dark:bg-surface">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b border-border px-4 py-3"
          >
            <div>
              <p className="text-xs text-text/70">#{order.id.slice(0, 8)}</p>
              <p className="text-sm text-text">
                {new Date(order.created_at).toLocaleDateString("ro-RO")}
              </p>
              <p className="text-sm font-bold text-primary">
                {formatPrice(order.total)}
              </p>
            </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text/70">{getStatusLabel(order.status)}</span>
                <OrderStatusSelect
                  current={order.status}
                  onChange={(s) => updateStatus(order.id, s)}
                />
              </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="p-4 text-center text-sm text-text/70">
            Nu există comenzi
          </p>
        )}
      </div>
    </div>
  )
}
