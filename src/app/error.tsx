"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-2 text-6xl font-bold text-primary">500</h1>
      <h2 className="mb-2 text-xl font-semibold text-text">
        Ceva nu a funcționat
      </h2>
      <p className="mb-6 text-sm text-text/70">
        A apărut o eroare neașteptată. Încearcă din nou.
      </p>
      <Button onClick={reset}>Încearcă din nou</Button>
    </div>
  )
}
