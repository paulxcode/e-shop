import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product } from "@/lib/types"

const trackEvent = (type: string, data?: Record<string, unknown>) => {
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: type,
        event_data: data || {},
        page_url: window.location.pathname,
      }),
    })
  } catch {}
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          const maxStock = Math.max(0, product.stock)
          if (maxStock === 0) return { items: state.items }
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + quantity, maxStock)
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: nextQuantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantity: Math.min(quantity, maxStock) }] }
        })
        trackEvent("add_to_cart", { product_id: product.id, name: product.name, price: product.price })
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }))
        trackEvent("remove_from_cart", { product_id: productId })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items
            .map((i) =>
              i.product.id === productId
                ? { ...i, quantity: Math.min(quantity, Math.max(0, i.product.stock)) }
                : i
            )
            .filter((i) => i.quantity > 0 && i.product.stock > 0),
        }))
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
    }),
    {
      name: "eshop-cart",
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const sanitized = state.items
          .map((item) => ({
            ...item,
            quantity: Math.min(item.quantity, Math.max(0, item.product.stock)),
          }))
          .filter((item) => item.quantity > 0 && item.product.stock > 0)
        if (sanitized.length !== state.items.length) {
          state.items = sanitized
        }
      },
    }
  )
)
