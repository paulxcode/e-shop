"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCartStore } from "@/lib/stores/cart-store"
import { formatPrice } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/Button"
import placeholder from "@/assets/imgs/product_placeholders/27002.jpg"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimated_days_min: number
  estimated_days_max: number
}

interface Location {
  id: string
  county: string
  city: string
}

interface CouponResult {
  coupon_id: string
  discount: number
  discount_type: string
  discount_value: number
}

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedMethod, setSelectedMethod] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")
  const [address, setAddress] = useState({
    street: "",
    city: "",
    county: "",
    zip: "",
    phone: "",
  })
  const [zipError, setZipError] = useState("")

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cos")
      return
    }

    const fetchData = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("address, phone")
          .eq("id", user.id)
          .single()
        if (data?.address) {
          const addr = data.address as { street?: string; city?: string; county?: string; zip?: string }
          setAddress((prev) => ({
            ...prev,
            street: addr.street || "",
            city: addr.city || "",
            county: addr.county || "",
            zip: addr.zip || "",
            phone: data.phone || "",
          }))
        }
      }

      const [methodsRes, locationsRes] = await Promise.all([
        fetch("/api/shipping-methods"),
        fetch("/api/supported-locations"),
      ])
      if (methodsRes.ok) {
        const methods: ShippingMethod[] = await methodsRes.json()
        setShippingMethods(methods)
        if (methods.length > 0) setSelectedMethod(methods[0].id)
      } else {
        toast.error("Nu s-au putut încărca metodele de livrare")
      }
      if (locationsRes.ok) {
        const locs: Location[] = await locationsRes.json()
        setLocations(locs)
      } else {
        toast.error("Nu s-au putut încărca localitățile")
      }

      setInitialLoading(false)
    }
    fetchData()
  }, [items.length, router])

  function handleCityChange(city: string) {
    const loc = locations.find((l) => l.city === city)
    setAddress({
      ...address,
      city,
      county: loc?.county || "",
    })
  }

  function handleZipChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6)
    setAddress({ ...address, zip: digitsOnly })
    if (digitsOnly.length > 0 && digitsOnly.length !== 6) {
      setZipError("Codul poștal trebuie să aibă 6 cifre")
    } else {
      setZipError("")
    }
  }

  async function handleValidateCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError("")
    setCouponResult(null)

    const payloadItems = items.map((i) => ({
      product_id: i.product.id,
      category_id: i.product.category_id,
      price: i.product.price,
      quantity: i.quantity,
    }))

    const res = await fetch("/api/validate-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: couponCode.trim(),
        items: payloadItems,
        subtotal: subtotal(),
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.valid) {
      setCouponError(data.error || "Cupon invalid")
      setCouponLoading(false)
      return
    }
    setCouponResult(data)
    setCouponLoading(false)
  }

  const selectedMethodData = shippingMethods.find((m) => m.id === selectedMethod)
  const shippingPrice = selectedMethodData?.price || 0
  const discount = couponResult?.discount || 0
  const total = Math.max(0, subtotal() + shippingPrice - discount)

  const estimatedDate = useMemo(() => {
    const days = Math.floor(Math.random() * (selectedMethodData ? selectedMethodData.estimated_days_max - selectedMethodData.estimated_days_min + 1 : 4)) + (selectedMethodData?.estimated_days_min || 2)
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date
  }, [selectedMethodData])

  const canProceedToReview =
    address.street.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.county.trim().length > 0 &&
    address.zip.length === 6 &&
    address.phone.trim().length >= 10 &&
    selectedMethod.length > 0

  if (initialLoading) return null

  if (items.length === 0) return null

  const handlePlaceOrder = async () => {
    setLoading(true)
    const payloadItems = items.map((i) => ({
      product_id: i.product.id,
      quantity: i.quantity,
    }))
    const shippingAddress = {
      street: address.street,
      city: address.city,
      county: address.county,
      zip: address.zip,
      phone: address.phone,
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: payloadItems,
        shippingAddress,
        shipping_method_id: selectedMethod,
        coupon_id: couponResult?.coupon_id || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error || "Eroare la plasarea comenzii")
      setLoading(false)
      return
    }

    clearCart()
    toast.success("Comanda a fost plasată cu succes!")
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "place_order",
        event_data: { order_id: data.order.id, total: data.order.total },
        page_url: window.location.pathname,
      }),
    }).catch(() => {})
    setLoading(false)
    router.push(`/comenzi/${data.order.id}`)
  }

  if (step === 1) {
    return (
      <div className="rounded-xl bg-white dark:bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text">
          Adresa de livrare
        </h2>
        <div className="flex flex-col gap-3">
          <label htmlFor="checkout-street" className="sr-only">Stradă</label>
          <input
            id="checkout-street"
            className="rounded-lg border border-border px-3 py-2 text-sm text-text"
            placeholder="Stradă, număr"
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="checkout-city" className="sr-only">Oraș</label>
              <select
                id="checkout-city"
                className="rounded-lg border border-border px-3 py-2 text-sm text-text bg-white dark:bg-surface"
                value={address.city}
                onChange={(e) => handleCityChange(e.target.value)}
                required
              >
                <option value="">Selectează orașul</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.city}>
                    {loc.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="checkout-county" className="sr-only">Județ</label>
              <input
                id="checkout-county"
                className="rounded-lg border border-border px-3 py-2 text-sm text-text bg-gray-100 dark:bg-gray-800"
                placeholder="Județ"
                value={address.county}
                readOnly
              />
            </div>
          </div>
          <label htmlFor="checkout-zip" className="sr-only">Cod poștal</label>
          <div>
            <input
              id="checkout-zip"
              className={`rounded-lg border px-3 py-2 text-sm text-text w-full ${
                zipError ? "border-red-500" : "border-border"
              }`}
              placeholder="Cod poștal (6 cifre)"
              value={address.zip}
              onChange={(e) => handleZipChange(e.target.value)}
              inputMode="numeric"
              required
            />
            {zipError && (
              <p className="mt-1 text-xs text-red-500">{zipError}</p>
            )}
          </div>
          <label htmlFor="checkout-phone" className="sr-only">Telefon</label>
          <input
            id="checkout-phone"
            type="tel"
            className="rounded-lg border border-border px-3 py-2 text-sm text-text"
            placeholder="Telefon (ex: 0712345678)"
            value={address.phone}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 15)
              setAddress({ ...address, phone: digitsOnly })
            }}
            required
          />
        </div>

        <h2 className="mb-4 mt-6 text-lg font-semibold text-text">
          Metoda de livrare
        </h2>
        <div className="flex flex-col gap-2">
          {shippingMethods.map((method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                className="accent-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{method.name}</p>
                <p className="text-xs text-text/70">{method.description}</p>
              </div>
              <span className="text-sm font-semibold text-text">
                {method.price === 0 ? "Gratis" : formatPrice(method.price)}
              </span>
            </label>
          ))}
        </div>

        <h2 className="mb-4 mt-6 text-lg font-semibold text-text">
          Cupon de reducere
        </h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text"
            placeholder="Introdu codul cuponului"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value)
              setCouponError("")
            }}
            disabled={!!couponResult}
          />
          {couponResult ? (
            <Button
              variant="secondary"
              onClick={() => {
                setCouponResult(null)
                setCouponCode("")
                setCouponError("")
              }}
            >
              Șterge
            </Button>
          ) : (
            <Button
              onClick={handleValidateCoupon}
              loading={couponLoading}
              disabled={!couponCode.trim()}
            >
              Aplică
            </Button>
          )}
        </div>
        {couponError && (
          <p className="mt-1 text-xs text-red-500">{couponError}</p>
        )}
        {couponResult && (
          <p className="mt-1 text-xs text-green-600">
            Reducere: {couponResult.discount_type === "percentage"
              ? `${couponResult.discount_value}%`
              : formatPrice(couponResult.discount_value)}
          </p>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm text-text/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          {shippingPrice > 0 && (
            <div className="flex items-center justify-between text-sm text-text/70 mt-1">
              <span>Livrare</span>
              <span>{formatPrice(shippingPrice)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm text-green-600 mt-1">
              <span>Reducere</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-semibold text-text mt-2 pt-2 border-t border-border">
            <span>Total estimat</span>
            <span className="text-lg text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          className="mt-4 w-full"
          onClick={() => setStep(2)}
          disabled={!canProceedToReview}
        >
          Continuă
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-white dark:bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-text">
          Review comandă
        </h2>
        {items.map((item) => {
          const hasDiscount = item.product.compare_price && item.product.compare_price > item.product.price
          const savings = hasDiscount ? (item.product.compare_price! - item.product.price) * item.quantity : 0
          return (
            <div
              key={item.product.id}
              className="flex items-center gap-3 border-b border-border py-2"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={item.product.images[0] || placeholder.src}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text">{item.product.name}</p>
                <p className="text-xs text-text/70">x{item.quantity}</p>
                {hasDiscount && (
                  <p className="text-xs text-green-600">
                    Economisești {formatPrice(savings)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                {hasDiscount && (
                  <p className="text-xs text-text/70 line-through">
                    {formatPrice(item.product.compare_price! * item.quantity)}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-sm text-text/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-text/70">
            <span>Livrare ({selectedMethodData?.name})</span>
            <span>{shippingPrice === 0 ? "Gratis" : formatPrice(shippingPrice)}</span>
          </div>
          {discount > 0 && (
            <div className="flex items-center justify-between text-sm text-green-600">
              <span>Reducere ({couponCode.toUpperCase()})</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-semibold text-text">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-surface p-6">
        <h2 className="mb-2 text-lg font-semibold text-text">Livrare</h2>
        <p className="text-sm text-text/70">
          {address.street}, {address.city}, {address.county}
        </p>
        <p className="text-sm text-text/70">{address.zip}</p>
        <p className="text-sm text-text/70">Tel: {address.phone}</p>
        {selectedMethodData && (
          <p className="mt-2 text-sm text-text">
            Metoda: <span className="font-medium">{selectedMethodData.name}</span> — {selectedMethodData.description}
          </p>
        )}
        <p className="text-sm text-text">
          Livrare estimată:{" "}
          <span className="font-medium">
            {estimatedDate.toLocaleDateString("ro-RO")}
          </span>
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setStep(1)}>
          Înapoi
        </Button>
        <Button onClick={handlePlaceOrder} loading={loading} className="flex-1">
          Plasează comanda
        </Button>
      </div>
    </div>
  )
}
