// Lightweight data-fetching hooks. Not React Query — just enough for the
// current app. Every hook returns { data, loading, error, refetch }.

import { useEffect, useState, useCallback } from 'react'
import * as api from './api'
import type { BookingStatus, LeadStatus } from '@/types/supabase'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [bump, setBump] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fn()
      .then((v) => { if (!cancelled) setData(v) })
      .catch((e) => { if (!cancelled) setError(e as Error) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, bump])

  const refetch = useCallback(() => setBump((x) => x + 1), [])
  return { data, loading, error, refetch }
}

// ── public data ────────────────────────────────────────────────────────────
export const useTypes = () => useAsync(() => api.getTypes(), [])
export const useTypeBySlug = (slug: string | null) =>
  useAsync(async () => (slug ? api.getTypeBySlug(slug) : null), [slug])
export const useExpert = () => useAsync(() => api.getExpert(), [])

// Open availability slots for the next `days` days (client booking picker).
export const useOpenSlots = (days = 21) =>
  useAsync(() => {
    const from = new Date()
    const to = new Date()
    to.setDate(to.getDate() + days)
    return api.getOpenSlots(from, to)
  }, [days])

// ── client-owned data ──────────────────────────────────────────────────────
export const useMyBookings = () => useAsync(() => api.getMyBookings(), [])
export const useMyNotifications = () => useAsync(() => api.getMyNotifications(), [])

// ── admin data ─────────────────────────────────────────────────────────────
export const useAllBookings = (status?: BookingStatus) =>
  useAsync(() => api.getAllBookings(status), [status])

export const useClients = () => useAsync(() => api.getClients(), [])
export const useLeads = (status?: LeadStatus) => useAsync(() => api.getLeads(status), [status])
