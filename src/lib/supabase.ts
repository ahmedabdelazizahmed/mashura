import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !key) {
  throw new Error(
    'Supabase env vars missing. Copy mashura-react/.env.local.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

// Single typed client for the whole app. Uses browser localStorage for
// session persistence (default), and refreshes tokens automatically.
export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,   // handles OAuth + magic-link callbacks
    storageKey: 'mashura-auth',
  },
})

export const isSupabaseConfigured = () => Boolean(url && key)
