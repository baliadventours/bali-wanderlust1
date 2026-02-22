import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const fallbackUrl = "https://placeholder.supabase.co"
const fallbackAnonKey = "placeholder-anon-key"

export const supabase = createClient(
  isConfigured ? supabaseUrl : fallbackUrl,
  isConfigured ? supabaseAnonKey : fallbackAnonKey
)
