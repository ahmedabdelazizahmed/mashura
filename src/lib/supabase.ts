import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False when the .env values are missing — the public landing page still renders
 *  (with built-in sample content); booking and login show a clear message instead. */
export const isSupabaseConfigured = () => Boolean(url && key)

// Only the public anon key is ever used in the browser. Security comes from
// Row Level Security + the RPC functions in supabase/migrations.
export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  key ?? 'public-anon-key-not-configured',
  {
    auth: {
      persistSession: isSupabaseConfigured(),
      autoRefreshToken: isSupabaseConfigured(),
      detectSessionInUrl: isSupabaseConfigured(),
      storageKey: 'mashura-auth',
    },
  }
)
