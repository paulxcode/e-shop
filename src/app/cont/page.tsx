"use client"

import { useEffect, useState, useCallback, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Package,
  Star, ShieldAlert, LogOut, ChevronRight, Pencil, Heart,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import type { Address } from "@/lib/types"

interface Profile {
  full_name: string
  phone: string
  address: Address
}

const emptyAddress: Address = { street: "", city: "", county: "", zip: "" }
const emptyProfile: Profile = { full_name: "", phone: "", address: emptyAddress }

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?"
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("ro-RO", { month: "long", year: "numeric" })
}

const strengthConfig = [
  { label: "Slabă", color: "bg-red-500", bars: 1, min: 0 },
  { label: "Medie", color: "bg-amber-500", bars: 2, min: 6 },
  { label: "Puternică", color: "bg-green-500", bars: 3, min: 8 },
] as const

function passwordStrength(pw: string) {
  if (pw.length === 0) return null
  return strengthConfig.reduce(
    (best, s) => (pw.length >= s.min ? s : best),
    strengthConfig[0]
  )
}

function SectionHeader({ icon: Icon, title }: { icon: ComponentType<{ className?: string }>; title: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text">
      <Icon className="h-5 w-5 text-primary" />
      {title}
    </h2>
  )
}

function InputField({
  id, label, value, onChange, placeholder, type, className,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        type={type || "text"}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text placeholder:text-text/70 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default function ContPage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const [initialProfile, setInitialProfile] = useState<Profile>(emptyProfile)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    document.title = "Contul meu | eShop"
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from("users")
      .select("full_name, phone, address")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const p: Profile = {
          full_name: data?.full_name || "",
          phone: data?.phone || "",
          address: data?.address || emptyAddress,
        }
        setProfile(p)
        setInitialProfile(p)
        setLoadingProfile(false)
      })
  }, [user, supabase])

  const profileDirty =
    profile.full_name !== initialProfile.full_name ||
    profile.phone !== initialProfile.phone

  const addressDirty =
    profile.address.street !== initialProfile.address.street ||
    profile.address.city !== initialProfile.address.city ||
    profile.address.county !== initialProfile.address.county ||
    profile.address.zip !== initialProfile.address.zip

  const handleSaveProfile = useCallback(async () => {
    if (!user) return
    setSavingProfile(true)
    const { error } = await supabase
      .from("users")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id)
    setSavingProfile(false)
    if (error) { toast.error(error.message); return }
    setInitialProfile((prev) => ({ ...prev, full_name: profile.full_name, phone: profile.phone }))
    toast.success("Profil salvat!")
  }, [user, supabase, profile.full_name, profile.phone])

  const handleSaveAddress = useCallback(async () => {
    if (!user) return
    setSavingAddress(true)
    const { error } = await supabase
      .from("users")
      .update({ address: profile.address })
      .eq("id", user.id)
    setSavingAddress(false)
    if (error) { toast.error(error.message); return }
    setInitialProfile((prev) => ({ ...prev, address: profile.address }))
    toast.success("Adresă salvată!")
  }, [user, supabase, profile.address])

  const handlePasswordChange = useCallback(async () => {
    if (!password.trim() || password.length < 6) {
      toast.error("Parola trebuie să aibă cel puțin 6 caractere")
      return
    }
    if (password !== passwordConfirm) {
      toast.error("Parolele nu coincid")
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSavingPassword(false)
    if (error) { toast.error(error.message); return }
    setPassword("")
    setPasswordConfirm("")
    toast.success("Parola a fost actualizată")
  }, [password, passwordConfirm, supabase])

  const handleDeleteAccount = useCallback(async () => {
    if (!user) return
    setDeletingAccount(true)
    const res = await fetch("/api/account/delete", { method: "POST" })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      toast.error(data?.error || "Ștergerea contului a eșuat")
      setDeletingAccount(false)
      return
    }
    await signOut()
    setDeletingAccount(false)
    toast.success("Contul a fost șters")
    router.push("/")
  }, [user, signOut, router])

  useEffect(() => {
    if (!showDeleteModal) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDeleteModal(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [showDeleteModal])

  if (loadingProfile) return null // loading.tsx handles this

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Account Header */}
      <div className="rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
            {getInitials(profile.full_name || user?.email || "")}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-text">
              {profile.full_name || "Utilizator"}
            </h1>
            <p className="truncate text-sm text-text/70">{user?.email}</p>
            {user?.created_at && (
              <p className="mt-0.5 text-xs text-text/70">
                Membru din {formatDate(user.created_at)}
              </p>
            )}
          </div>
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              onClick={() =>
                document.getElementById("section-profil")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Pencil className="h-4 w-4" />
              Editează
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href="/comenzi"
          className="flex items-center gap-3 rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-transform hover:scale-[1.02]"
        >
          <Package className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-text">Comenzile mele</p>
            <p className="text-xs text-text/70">Vezi istoricul comenzilor</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text/20" />
        </Link>
        <Link
          href="/produse-favorite"
          className="flex items-center gap-3 rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-transform hover:scale-[1.02]"
        >
          <Heart className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-text">Favorite</p>
            <p className="text-xs text-text/70">Produsele tale favorite</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text/20" />
        </Link>
        <Link
          href="/cont/review-uri"
          className="flex items-center gap-3 rounded-xl bg-white dark:bg-surface p-4 shadow-sm transition-transform hover:scale-[1.02]"
        >
          <Star className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-text">Recenziile mele</p>
            <p className="text-xs text-text/70">Vezi produsele evaluate</p>
          </div>
          <ChevronRight className="h-5 w-5 text-text/20" />
        </Link>
      </div>

      {/* Profile Section */}
      <div id="section-profil" className="mt-6 rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
        <SectionHeader icon={User} title="Profil" />
        <div className="flex flex-col gap-3">
          <InputField
            id="profile-name"
            label="Nume complet"
            value={profile.full_name}
            onChange={(v) => setProfile({ ...profile, full_name: v })}
            placeholder="Numele tău"
          />
          <InputField
            id="profile-phone"
            label="Telefon"
            value={profile.phone}
            onChange={(v) => setProfile({ ...profile, phone: v })}
            placeholder="07xx xxx xxx"
          />
        </div>
        {profileDirty && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              Salvează
            </Button>
            <Button
              variant="secondary"
              onClick={() => setProfile((prev) => ({ ...prev, full_name: initialProfile.full_name, phone: initialProfile.phone }))}
            >
              Anulează
            </Button>
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="mt-6 rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
        <SectionHeader icon={Mail} title="Email" />
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="text-sm text-text">{user?.email}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user?.email_confirmed_at
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {user?.email_confirmed_at ? "Confirmat" : "Neverificat"}
          </span>
        </div>
      </div>

      {/* Address Section */}
      <div className="mt-6 rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
        <SectionHeader icon={MapPin} title="Adresă" />
        <div className="flex flex-col gap-3">
          <InputField
            id="addr-street"
            label="Stradă"
            value={profile.address.street}
            onChange={(v) => setProfile({ ...profile, address: { ...profile.address, street: v } })}
            placeholder="Stradă, număr"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              id="addr-city"
              label="Oraș"
              value={profile.address.city}
              onChange={(v) => setProfile({ ...profile, address: { ...profile.address, city: v } })}
              placeholder="Oraș"
            />
            <InputField
              id="addr-county"
              label="Județ"
              value={profile.address.county}
              onChange={(v) => setProfile({ ...profile, address: { ...profile.address, county: v } })}
              placeholder="Județ"
            />
          </div>
          <InputField
            id="addr-zip"
            label="Cod poștal"
            value={profile.address.zip}
            onChange={(v) => setProfile({ ...profile, address: { ...profile.address, zip: v } })}
            placeholder="Cod poștal"
          />
        </div>
        {addressDirty && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSaveAddress} loading={savingAddress}>
              Salvează
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  address: initialProfile.address,
                }))
              }
            >
              Anulează
            </Button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="mt-6 rounded-xl bg-white dark:bg-surface p-6 shadow-sm">
        <SectionHeader icon={Lock} title="Securitate" />
        <div className="flex flex-col gap-3">
          <div className="relative">
            <InputField
              id="pw-new"
              label="Parolă nouă"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              placeholder="Minimum 6 caractere"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-text/70 hover:text-text/70"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (() => {
            const s = passwordStrength(password)
            if (!s) return null
            return (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= s.bars ? s.color : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${s.color.replace("bg-", "text-")}`}>{s.label}</p>
              </div>
            )
          })()}

          <InputField
            id="pw-confirm"
            label="Confirmă parola"
            type={showPassword ? "text" : "password"}
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            placeholder="Reintroduceți parola"
          />
          {passwordConfirm && password !== passwordConfirm && (
            <p className="text-xs text-red-500">Parolele nu coincid</p>
          )}
        </div>
        <div className="mt-4">
          <Button
            onClick={handlePasswordChange}
            loading={savingPassword}
            disabled={!password.trim() || password.length < 6 || password !== passwordConfirm}
          >
            Actualizează parola
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
        <SectionHeader icon={ShieldAlert} title="Zonă periculoasă" />
        <p className="mb-4 text-sm text-red-600/70 dark:text-red-400/70">
          Ștergerea contului este ireversibilă. Toate datele tale vor fi eliminate.
        </p>
        <Button
          variant="secondary"
          className="border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
          onClick={() => setShowDeleteModal(true)}
        >
          <LogOut className="h-4 w-4" />
          Șterge contul
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-surface"
          >
            <h3 id="delete-account-title" className="text-lg font-semibold text-text">Șterge contul</h3>
            <p className="mt-2 text-sm text-text/70">
              Ești sigur? Această acțiune este ireversibilă. Toate datele tale vor fi șterse permanent.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)} autoFocus>
                Anulează
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteAccount}
                loading={deletingAccount}
              >
                Șterge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
