import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const fallbackSupabaseUrl = "https://preview-placeholder.supabase.co"
const fallbackSupabaseAnonKey =
  "preview-placeholder-anon-key-for-ui-mode"

export const supabase = createClient(
  supabaseUrl ?? fallbackSupabaseUrl,
  supabaseAnonKey ?? fallbackSupabaseAnonKey,
  {
    auth: {
      persistSession: isConfigured,
      autoRefreshToken: isConfigured,
    },
  }
)
