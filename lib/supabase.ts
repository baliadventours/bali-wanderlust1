
import { createClient } from '@supabase/supabase-js';

/**
 * ARCHITECTURAL NOTE:
 * In a Vite environment, variables are prefixed with VITE_.
 * We check both import.meta.env and process.env for maximum compatibility.
 */
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (import.meta.env && import.meta.env[key]) || (process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || 'placeholder-key';

// Check if we are using actual placeholder strings
export const isConfigured = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key';

if (!isConfigured) {
  console.warn(
    "Supabase configuration is missing. " +
    "The app is running in 'Preview Mode' with dummy data. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to your database."
  );
}

// We always create the client to avoid "undefined" errors in hooks, 
// even if it points to a placeholder.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
