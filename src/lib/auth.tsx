import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
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

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next)
      if (next?.user) {
        const p = await fetchProfile(next.user.id)
        setProfile(p)
      } else {
        setProfile(null)
      }
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
