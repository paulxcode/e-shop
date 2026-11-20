import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Order } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (typeof price !== "number" || isNaN(price)) return "0,00 Lei"
  return price.toLocaleString("ro-RO", {
    style: "currency",
    currency: "RON",
  })
}

export function simulateDeliveryDate(): Date {
  const days = Math.floor(Math.random() * 4) + 2 // 2-5 zile
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export function getStatusLabel(status: Order["status"]): string {
  const labels: Record<Order["status"], string> = {
    pending: "În așteptare",
    processing: "În procesare",
    shipped: "Expediat",
    delivered: "Livrat",
    cancelled: "Anulat",
  }
  return labels[status] || status
}

export function getStatusColor(status: Order["status"]): string {
  const colors: Record<Order["status"], string> = {
    pending: "text-yellow-600",
    processing: "text-blue-600",
    shipped: "text-purple-600",
    delivered: "text-green-600",
    cancelled: "text-red-600",
  }
  return colors[status] || "text-gray-600"
}
