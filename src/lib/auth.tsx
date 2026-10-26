import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { UserRole } from '@/types/supabase'

// Profile shape as we read it from public.profiles.
export interface Profile {
  id: string
  role: UserRole
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
}

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean                         // true while restoring session + first profile fetch
  isAuthenticated: boolean
  isStaff: boolean                          // owner | admin | reception | viewer
  isAdmin: boolean                          // owner | admin
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STAFF_ROLES: UserRole[] = ['owner', 'admin', 'reception', 'viewer']
const ADMIN_ROLES: UserRole[] = ['owner', 'admin']

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, name, email, phone, avatar_url')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] fetchProfile failed', error.message)
    return null
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const profileId = useRef<string | null>(null)
  useEffect(() => { profileId.current = profile?.id ?? null }, [profile])

  useEffect(() => {
    let cancelled = false

    // Restore session on mount, then subscribe to changes.
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return
      setSession(data.session)
      if (data.session?.user) {
        const p = await fetchProfile(data.session.user.id)
        if (!cancelled) setProfile(p)
      }
      if (!cancelled) setLoading(false)
    })

    // Keep the callback synchronous (supabase-js can deadlock if it awaits client calls here);
    // load the profile in a deferred task and hold `loading` until it arrives so guards don't misroute.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next?.user) { setProfile(null); setLoading(false); return }
      if (profileId.current === next.user.id) return
      setLoading(true)
      const uid = next.user.id
      setTimeout(async () => {
        const p = await fetchProfile(uid)
        if (!cancelled) { setProfile(p); setLoading(false) }
      }, 0)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    profile,
    loading,
    isAuthenticated: !!session,
    isStaff: !!profile && STAFF_ROLES.includes(profile.role),
    isAdmin: !!profile && ADMIN_ROLES.includes(profile.role),
    signOut: async () => { await supabase.auth.signOut() },
    refreshProfile: async () => {
      if (session?.user) setProfile(await fetchProfile(session.user.id))
    },
  }), [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() called outside <AuthProvider>')
  return ctx
}
