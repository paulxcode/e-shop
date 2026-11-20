import { createServerSupabase } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"
import { notFound } from "next/navigation"

interface Props {
  params: { token: string }
}

export default async function SharedListaPage({ params }: Props) {
  const supabase = await createServerSupabase()

  const { data } = await supabase.rpc("get_shared_wishlist", {
    p_token: params.token,
  })
  const rows = (data as any[] | null) || []

  if (rows.length === 0) notFound()

  const fullName = rows[0].user_name || "Utilizator"
  const items = rows.filter((r) => r.product_id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <Heart className="mx-auto mb-2 h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-text">
          Lista de favorite {fullName}
        </h1>
        <p className="text-sm text-text/70">
          Produse favorite partajate de {fullName}
        </p>
      </div>

      {!items || items.length === 0 ? (
        <div className="rounded-xl bg-white dark:bg-surface p-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-text/20" />
          <p className="mt-4 text-lg text-text/70">Lista este goală</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.product_id}
              href={`/produse/${item.slug}`}
              className="group rounded-xl bg-white dark:bg-surface p-3 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-surface">
                <Image
                  src={item.images?.[0] || placeholder.src}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="text-sm font-medium text-text line-clamp-2">{item.name}</p>
              <p className="mt-1 text-sm font-bold text-primary">{formatPrice(item.price)}</p>
              {item.compare_price && (
                <p className="text-xs text-text/70 line-through">{formatPrice(item.compare_price)}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
