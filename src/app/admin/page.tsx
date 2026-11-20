import Link from "next/link"
import { Package, ShoppingBag, FolderOpen, TrendingUp, Truck, MapPin, Ticket, Image } from "lucide-react"
import { createServerSupabase } from "@/lib/supabase/server"

export default async function AdminPage() {
  const supabase = await createServerSupabase()

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-text">Panou Administrare</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
          <ShoppingBag className="mb-2 h-8 w-8 text-primary" />
          <p className="text-2xl font-bold text-text">{productCount ?? 0}</p>
          <p className="text-sm text-text/70">Produse</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
          <Package className="mb-2 h-8 w-8 text-primary" />
          <p className="text-2xl font-bold text-text">{orderCount ?? 0}</p>
          <p className="text-sm text-text/70">Comenzi</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
          <FolderOpen className="mb-2 h-8 w-8 text-primary" />
          <p className="text-2xl font-bold text-text">{categoryCount ?? 0}</p>
          <p className="text-sm text-text/70">Categorii</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text">
          <TrendingUp className="h-5 w-5" /> Comenzi recente
        </h2>
        <div className="rounded-xl bg-white dark:bg-surface p-4">
          {recentOrders && recentOrders.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border py-2 last:border-0"
                >
                  <span className="text-xs text-text/70">#{order.id.slice(0, 8)}</span>
                  <span className="text-sm text-text">{order.status}</span>
                  <span className="text-sm font-medium text-primary">
                    {order.total.toLocaleString("ro-RO", { style: "currency", currency: "RON" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text/70">Nu există comenzi recente</p>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-text">Gestionare</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/produse"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <ShoppingBag className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Produse</h2>
          <p className="text-sm text-text/70">Adaugă, editează și șterge produse</p>
        </Link>
        <Link
          href="/admin/comenzi"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <Package className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Comenzi</h2>
          <p className="text-sm text-text/70">Gestionează comenzile clienților</p>
        </Link>
        <Link
          href="/admin/categorii"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <FolderOpen className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Categorii</h2>
          <p className="text-sm text-text/70">Administrează categoriile</p>
        </Link>
        <Link
          href="/admin/metode-livrare"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <Truck className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Metode de livrare</h2>
          <p className="text-sm text-text/70">Configurează metodele de livrare</p>
        </Link>
        <Link
          href="/admin/localitati"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <MapPin className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Localități</h2>
          <p className="text-sm text-text/70">Administrează localitățile suportate</p>
        </Link>
        <Link
          href="/admin/cupoane"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <Ticket className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Cupoane</h2>
          <p className="text-sm text-text/70">Gestionează cupoanele de reducere</p>
        </Link>
        <Link
          href="/admin/carosel"
          className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <Image className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-lg font-semibold text-text">Carusel</h2>
          <p className="text-sm text-text/70">Gestionează slide-urile din carusel</p>
        </Link>
      </div>
    </div>
  )
}
