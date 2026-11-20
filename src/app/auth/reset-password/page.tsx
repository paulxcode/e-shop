"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Parola trebuie să aibă cel puțin 6 caractere")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Parola a fost actualizată")
    router.push("/cont")
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Resetează parola</h1>
          <p className="mt-1 text-sm text-text/70">
            Introdu o parolă nouă pentru contul tău
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-white p-6"
        >
          <label htmlFor="password" className="sr-only">Parolă nouă</label>
          <input
            id="password"
            type="password"
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text/70"
            placeholder="Parolă nouă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <Button type="submit" className="mt-4 w-full" loading={loading} disabled={!password.trim()}>
            Actualizează parola
          </Button>
        </form>
      </div>
    </div>
  )
}
