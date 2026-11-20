"use client"

import { useEffect, useRef } from "react"
import { X, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { CartItem } from "./CartItem"
import { CartSummary } from "./CartSummary"

export function CartDrawer() {
  const { items, isOpen, closeCart } = useCartStore()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, closeCart])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={closeCart}
        />
      )}
      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label="Coșul tău"
        aria-hidden={!isOpen}
        {...(!isOpen ? ({ inert: "" } as any) : {})}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-bg shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text">
              <ShoppingBag className="h-5 w-5" />
              Coșul tău
            </h2>
            <button
              ref={closeRef}
              onClick={closeCart}
              className="rounded-lg p-2 text-text hover:bg-surface"
              aria-label="Închide coșul"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-center">
              <div>
                <ShoppingBag className="mx-auto h-12 w-12 text-text/30" />
                <p className="mt-2 text-sm text-text/70">Coșul tău este gol</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4">
                <CartSummary />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
