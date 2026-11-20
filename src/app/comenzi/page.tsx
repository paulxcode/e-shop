"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { OrderCard } from "@/components/orders/OrderCard"
import type { Order } from "@/lib/types"

export default function ComenziPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace("/?login=true")
      return
    }
    setAuthChecked(true)
    const supabase = createClient()
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) || [])
        setLoading(false)
      })
  }, [user, router])

  if (!authChecked) return null

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-center text-text/70">Se încarcă...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Comenzile mele</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-surface p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-text/20" />
          <p className="mt-4 text-lg text-text/70">Nu ai nicio comandă</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
