"use client"

import Link from "next/link"
import { ShoppingCart, User, Package, LogOut, Menu, Sun, Moon, ChevronDown, Heart } from "lucide-react"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useState, useEffect, useRef } from "react"
import { AuthModal } from "./AuthModal"
import { SearchBar } from "./SearchBar"
import { createClient } from "@/lib/supabase/client"

interface NavCategory {
  id: string
  name: string
  slug: string
  group_id?: string | null
}

type CategoryGroup = {
  id: string | null
  label: string
  slug: string
  keywords: string[]
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: null, slug: "laptop-tablete-telefoane", label: "Laptop, Tablete & Telefoane", keywords: ["laptop", "tableta", "tablete", "telefon", "telefoane", "smartphone", "apple", "iphone", "samsung"] },
  { id: null, slug: "pc-periferice-software", label: "PC, Periferice & Software", keywords: ["pc", "periferice", "software", "monitor", "mouse", "tastatura", "ssd", "ram", "placa video"] },
  { id: null, slug: "tv-audio-video-foto", label: "TV, Audio-Video & Foto", keywords: ["tv", "audio", "video", "foto", "camera", "televizor", "soundbar"] },
  { id: null, slug: "electrocasnice-climatizare", label: "Electrocasnice & Climatizare", keywords: ["electrocasnice", "climatizare", "frigider", "masina spalat", "aspirator", "cuptor", "aer conditionat"] },
  { id: null, slug: "gaming-carti-birotica", label: "Gaming, Cărți & Birotică", keywords: ["gaming", "carti", "birotica", "consola", "joc", "xbox", "playstation"] },
  { id: null, slug: "bacanie", label: "Bacanie", keywords: ["bacanie", "alimente", "food", "gourmet"] },
  { id: null, slug: "fashion", label: "Fashion", keywords: ["fashion", "haine", "incaltaminte", "geaca", "rochie"] },
  { id: null, slug: "ingrijire-cosmetice", label: "Îngrijire personală & Cosmetice", keywords: ["ingrijire", "cosmetice", "parfum", "machiaj", "skin"] },
  { id: null, slug: "casa-gradina-bricolaj", label: "Casă, Grădină & Bricolaj", keywords: ["casa", "gradina", "bricolaj", "mobilier", "decoratiuni", "unelte"] },
  { id: null, slug: "sport-travel", label: "Sport & Travel", keywords: ["sport", "travel", "camping", "fitness", "drumetie", "valiza"] },
  { id: null, slug: "auto-moto-rca", label: "Auto, Moto & RCA", keywords: ["auto", "moto", "rca", "anvelope", "baterie", "casca moto"] },
  { id: null, slug: "jucarii-copii-bebe", label: "Jucării, Copii & Bebe", keywords: ["jucarii", "copii", "bebe", "lego", "barbie", "carucior"] },
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getGroupedCategories(categories: NavCategory[], groups: CategoryGroup[]) {
  const grouped: Record<string, NavCategory[]> = Object.fromEntries(
    groups.map((group) => [group.slug, [] as NavCategory[]])
  )

  for (const category of categories) {
    if (category.group_id) {
      const dbGroup = groups.find((group) => group.id === category.group_id)
      if (dbGroup) {
        grouped[dbGroup.slug].push(category)
        continue
      }
    }
    const normalizedName = normalizeText(category.name)
    const normalizedSlug = normalizeText(category.slug)
    const directGroup = groups.find((group) => group.slug === category.slug)
    if (directGroup) {
      grouped[directGroup.slug].push(category)
      continue
    }
    const foundGroup = groups.find((group) =>
      group.keywords.some(
        (keyword) => normalizedName.includes(keyword) || normalizedSlug.includes(keyword)
      )
    )
    if (foundGroup) {
      grouped[foundGroup.slug].push(category)
    }
  }

  return grouped
}

export function Navbar() {
  const { itemCount, openCart } = useCartStore()
  const { user, loading: authLoading, initialize } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [groups, setGroups] = useState<CategoryGroup[]>(CATEGORY_GROUPS)
  const [activeGroup, setActiveGroup] = useState(CATEGORY_GROUPS[0].slug)
  const [hoverOpen, setHoverOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileExpandedGroups, setMobileExpandedGroups] = useState<Set<string>>(new Set())
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) {
      createClient()
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setIsAdmin(data?.role === "admin"))
    }
  }, [user])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("category_groups")
      .select("id, name, slug")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Eroare la încărcarea grupurilor:", error.message)
          return
        }
        if (data && data.length > 0) {
          const dbGroups = data.map((group) => ({
            id: group.id,
            label: group.name,
            slug: group.slug,
            keywords: CATEGORY_GROUPS.find((fallback) => fallback.slug === group.slug)?.keywords || [],
          }))
          setGroups(dbGroups)
          setActiveGroup(dbGroups[0].slug)
        }
      })
    supabase
      .from("categories")
      .select("id, name, slug, group_id")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Eroare la încărcarea categoriilor:", error.message)
          return
        }
        setCategories((data as NavCategory[]) || [])
      })
  }, [])

  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem("eshop-dark") === "true"
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("eshop-dark", String(next))
  }

  const { signOut } = useAuthStore()
  const groupedCategories = getGroupedCategories(categories, groups)
  const activeCategories = groupedCategories[activeGroup] || []

  const openHoverMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setHoverOpen(true)
  }

  const closeHoverMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setHoverOpen(false)
    }, 180)
  }

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-bg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold text-primary">
            eShop
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <div
              className="relative"
              onMouseEnter={openHoverMenu}
              onMouseLeave={closeHoverMenu}
            >
              <Link href="/produse" className="text-sm text-text hover:text-primary">
                Produse
              </Link>
              {hoverOpen && (
                <div className="absolute left-0 top-full z-50 w-[720px] pt-2">
                  <div className="rounded-xl border border-border bg-bg p-3 shadow-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-surface/40 p-2">
                      {groups.map((group) => (
                        <button
                          key={group.slug}
                          onMouseEnter={() => setActiveGroup(group.slug)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                            activeGroup === group.slug
                              ? "bg-primary text-white"
                              : "text-text hover:bg-surface"
                          }`}
                        >
                          {group.label}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <p className="mb-2 px-2 text-xs font-semibold uppercase text-text/70">
                        Categorii
                      </p>
                      <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                        {activeCategories.length > 0 ? (
                          activeCategories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/produse?categorie=${category.slug}`}
                              className="rounded-lg px-2 py-1.5 text-sm text-text hover:bg-surface hover:text-primary"
                            >
                              {category.name}
                            </Link>
                          ))
                        ) : (
                          <p className="px-2 py-2 text-sm text-text/70">
                            Nu există subcategorii încă pentru acest grup.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative rounded-lg p-2 text-text hover:bg-surface"
              aria-label="Deschide coșul"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount() > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {itemCount()}
                </span>
              )}
            </button>

            <button
              onClick={toggleDark}
              className="rounded-lg p-2 text-text hover:bg-surface"
              title={dark ? "Mod luminos" : "Mod întunecat"}
              aria-label={dark ? "Activează modul luminos" : "Activează modul întunecat"}
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {authLoading ? (
              <div className="hidden md:block text-sm text-text/70">...</div>
            ) : user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-lg p-2 text-text hover:bg-surface"
                >
                  <User className="h-5 w-5" />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-bg p-1.5 shadow-xl">
                      <Link
                        href="/comenzi"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                      >
                        <Package className="h-4 w-4" />
                        Comenzile mele
                      </Link>
                      <Link
                        href="/produse-favorite"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                      >
                        <Heart className="h-4 w-4" />
                        Favorite
                      </Link>
                      <Link
                        href="/cont"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                      >
                        <User className="h-4 w-4" />
                        Contul meu
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                        >
                          Admin
                        </Link>
                      )}
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => { toggleDark(); setUserMenuOpen(false) }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                      >
                        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {dark ? "Mod luminos" : "Mod întunecat"}
                      </button>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface"
                      >
                        <LogOut className="h-4 w-4" />
                        Deconectare
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white md:block"
              >
                Autentificare
              </button>
            )}

            <button
              className="rounded-lg p-2 text-text md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Deschide meniul"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-bg px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <SearchBar />
              <Link
                href="/produse"
                className="py-1 text-sm text-text"
                onClick={() => setMenuOpen(false)}
              >
                Produse
              </Link>

              <div className="border-t border-border pt-2 mt-1">
                <p className="text-xs font-semibold uppercase text-text/70 px-1 mb-1">
                  Categorii
                </p>
                {groups.map((group) => {
                  const isExpanded = mobileExpandedGroups.has(group.slug)
                  const catCount = groupedCategories[group.slug]?.length || 0
                  return (
                    <div key={group.slug}>
                      <button
                        onClick={() => {
                          const next = new Set(mobileExpandedGroups)
                          if (isExpanded) {
                            next.delete(group.slug)
                          } else {
                            next.add(group.slug)
                          }
                          setMobileExpandedGroups(next)
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-1 py-1.5 text-sm text-text hover:bg-surface"
                      >
                        <span>{group.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-2 flex flex-col gap-0.5 pl-2 border-l border-border">
                          {catCount > 0 ? (
                            groupedCategories[group.slug].map((category) => (
                              <Link
                                key={category.id}
                                href={`/produse?categorie=${category.slug}`}
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg px-2 py-1 text-sm text-text/70 hover:text-primary hover:bg-surface"
                              >
                                {category.name}
                              </Link>
                            ))
                          ) : (
                            <p className="px-2 py-1 text-sm text-text/70">
                              Nu există subcategorii încă pentru acest grup.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {user ? (
                <>
                  <Link
                    href="/comenzi"
                    className="py-1 text-sm text-text"
                    onClick={() => setMenuOpen(false)}
                  >
                    Comenzile mele
                  </Link>
                  <Link
                    href="/produse-favorite"
                    className="py-1 text-sm text-text"
                    onClick={() => setMenuOpen(false)}
                  >
                    Favorite
                  </Link>
                  <Link
                    href="/cont"
                    className="py-1 text-sm text-text"
                    onClick={() => setMenuOpen(false)}
                  >
                    Contul meu
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="py-1 text-sm text-primary"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setMenuOpen(false)
                    }}
                    className="py-1 text-left text-sm text-text"
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthOpen(true)
                    setMenuOpen(false)
                  }}
                  className="py-1 text-left text-sm text-primary"
                >
                  Autentificare
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
