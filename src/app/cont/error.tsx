"use client"

import { Button } from "@/components/ui/Button"

export default function ContError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-2 text-6xl font-bold text-primary">500</h1>
      <h2 className="mb-2 text-xl font-semibold text-text">
        Profilul nu poate fi încărcat
      </h2>
      <p className="mb-6 text-sm text-text/70">
        Încearcă din nou sau revino mai târziu.
      </p>
      <Button onClick={reset}>Încearcă din nou</Button>
    </div>
  )
}
