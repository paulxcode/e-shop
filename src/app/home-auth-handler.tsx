"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthModal } from "@/components/ui/AuthModal"

function AuthHandlerInner() {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setOpen(true)
      const url = new URL(window.location.href)
      url.searchParams.delete("login")
      window.history.replaceState({}, "", url)
    }
  }, [searchParams])

  return <AuthModal isOpen={open} onClose={() => setOpen(false)} />
}

export function HomeAuthHandler() {
  return (
    <Suspense fallback={null}>
      <AuthHandlerInner />
    </Suspense>
  )
}
