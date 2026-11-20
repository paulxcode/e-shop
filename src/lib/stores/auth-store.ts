import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  loading: boolean
  _unsubscribe?: () => void
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialize: async () => {
    if (!get().loading && get().user !== null) return
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    set({ user: data.user, loading: false })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
    get()._unsubscribe?.()
    set({ _unsubscribe: () => subscription.unsubscribe() })
  },
  signIn: async (email, password) => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  },
  signUp: async (email, password, fullName, phone) => {
    const supabase = createClient()
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) return error.message
    if (data.user) {
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        role: "customer",
        terms_accepted_at: new Date().toISOString(),
      })
      if (insertError) return insertError.message
    }
    return null
  },
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
