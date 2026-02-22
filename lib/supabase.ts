import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const fallbackSupabaseUrl = "https://example.supabase.co"
const fallbackSupabaseAnonKey = "public-anon-key-placeholder"

export const supabase = createClient(
  isConfigured ? supabaseUrl : fallbackSupabaseUrl,
  isConfigured ? supabaseAnonKey : fallbackSupabaseAnonKey
)
