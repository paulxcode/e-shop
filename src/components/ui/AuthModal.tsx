"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "./Button"
import { X, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const { signIn, signUp } = useAuthStore()

  const overlayRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      const overlay = overlayRef.current
      if (!overlay) return
      const focusable = overlay.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => {
      overlayRef.current?.querySelector<HTMLElement>("input:not([disabled])")?.focus()
    })
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("keydown", handleEscape)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "register" && !consent) {
      setError("Trebuie sa accepți politica de confidențialitate si termenii")
      return
    }
    setLoading(true)
    setError(null)
    const err =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName, phone)
    if (err) {
      setError(err)
      toast.error(err)
    } else {
      toast.success(mode === "login" ? "Autentificare reușită!" : "Cont creat cu succes! Verifică email-ul pentru confirmare.")
      onClose()
    }
    setLoading(false)
  }

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode)
    setError(null)
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Introdu email-ul pentru resetare")
      return
    }
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim())
    if (resetError) {
      setError(resetError.message)
      toast.error(resetError.message)
      return
    }
    toast.success("Verifică email-ul pentru resetarea parolei")
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onKeyDown={handleKeyDown}>
      <div className="w-full max-w-md rounded-xl bg-bg p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">
            {mode === "login" ? "Autentificare" : "Înregistrare"}
          </h2>
          <button onClick={onClose} aria-label="Închide fereastra de autentificare">
            <X className="h-5 w-5 text-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label htmlFor="auth-email" className="sr-only">Email</label>
          <input
            id="auth-email"
            className="rounded-lg border border-border bg-white dark:bg-surface px-3 py-2 text-sm text-text"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode === "register" && (
            <>
              <label htmlFor="auth-full-name" className="sr-only">Nume complet</label>
              <input
                id="auth-full-name"
                className="rounded-lg border border-border bg-white dark:bg-surface px-3 py-2 text-sm text-text"
                type="text"
                placeholder="Nume complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label htmlFor="auth-phone" className="sr-only">Telefon</label>
              <input
                id="auth-phone"
                className="rounded-lg border border-border bg-white dark:bg-surface px-3 py-2 text-sm text-text"
                type="tel"
                placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </>
          )}
          <div className="relative">
            <label htmlFor="auth-password" className="sr-only">Parolă</label>
            <input
              id="auth-password"
              className="w-full rounded-lg border border-border bg-white dark:bg-surface px-3 py-2 pr-10 text-sm text-text"
              type={showPassword ? "text" : "password"}
              placeholder="Parolă"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/70 hover:text-text/70"
              aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mode === "login" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-left text-xs text-primary underline"
            >
              Am uitat parola
            </button>
          )}
          {mode === "register" && (
            <label className="flex items-start gap-2 text-xs text-text/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-0.5 accent-primary"
              />
              <span>
                Accept{" "}
                <Link href="/confidentialitate" target="_blank" className="text-primary underline">
                  politica de confidențialitate
                </Link>{" "}
                și{" "}
                <Link href="/termeni" target="_blank" className="text-primary underline">
                  termenii și condițiile
                </Link>
                .
              </span>
            </label>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading}>
            {mode === "login" ? "Autentificare" : "Înregistrare"}
          </Button>
        </form>

        <p className="mt-3 text-center text-sm text-text">
          {mode === "login" ? (
            <>
              Nu ai cont?{" "}
              <button
                className="text-primary underline"
                onClick={() => switchMode("register")}
              >
                Înregistrează-te
              </button>
            </>
          ) : (
            <>
              Ai deja cont?{" "}
              <button
                className="text-primary underline"
                onClick={() => switchMode("login")}
              >
                Autentifică-te
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
