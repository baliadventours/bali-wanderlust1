
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (import.meta.env && import.meta.env[key]) || (process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || '';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

// Robust configuration check
export const isConfigured = 
  supabaseUrl !== '' && 
  supabaseUrl !== PLACEHOLDER_URL && 
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== PLACEHOLDER_KEY;

if (!isConfigured) {
  console.warn(
    "Supabase configuration is missing or incomplete. " +
    "The app is running in 'Preview Mode' with demo credentials: admin@admin.com / password"
  );
}

// Ensure valid URL for createClient even in preview mode
const finalUrl = isConfigured ? supabaseUrl : PLACEHOLDER_URL;
const finalKey = isConfigured ? supabaseAnonKey : PLACEHOLDER_KEY;

export const supabase = createClient(finalUrl, finalKey);
