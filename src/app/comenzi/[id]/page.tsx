"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { formatPrice, getStatusLabel } from "@/lib/utils"
import { OrderTimeline } from "@/components/orders/OrderTimeline"
import { Button } from "@/components/ui/Button"
import type { Order, OrderItem, Product } from "@/lib/types"

export default function ComandaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<(OrderItem & { product?: Product })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "Detalii comandă | eShop"
  }, [])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("orders").select("*").eq("id", id).single(),
      supabase
        .from("order_items")
        .select("*, product:product_id(*)")
        .eq("order_id", id),
    ]).then(([orderRes, itemsRes]) => {
      if (orderRes.error) {
        console.error("Eroare la încărcarea comenzii:", orderRes.error)
      }
      if (itemsRes.error) {
        console.error("Eroare la încărcarea produselor:", itemsRes.error)
      }
      setOrder(orderRes.data as Order)
      setItems((itemsRes.data || []) as (OrderItem & { product?: Product })[])
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-center text-text/70">Se încarcă...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-lg text-text/70">Comanda nu a fost găsită</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/comenzi"
        className="mb-4 flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Înapoi la comenzi
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">
          Comandă #{order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-text/70">
          Plasată pe {new Date(order.created_at).toLocaleDateString("ro-RO")}
        </p>
        <p className={`text-sm font-medium ${order.status === "cancelled" ? "text-red-600" : "text-green-600"}`}>
          {getStatusLabel(order.status)}
        </p>
      </div>

      <div className="mb-6">
        <OrderTimeline order={order} />
      </div>

      <div className="mb-6 rounded-xl bg-white dark:bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold text-text">Produse</h2>
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-border py-2"
          >
            <div>
              <p className="text-sm text-text">
                {item.product?.name || "Produs șters"}
              </p>
              <p className="text-xs text-text/70">x{item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-text">
              {formatPrice(item.unit_price * item.quantity)}
            </p>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-text">Total</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold text-text">
          Adresă de livrare
        </h2>
        <p className="text-sm text-text/70">
          {order.shipping_address.street}, {order.shipping_address.city},{" "}
          {order.shipping_address.county}
        </p>
      </div>
    </div>
  )
}
