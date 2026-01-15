
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    // Check window.process (polyfilled in index.html) or direct process.env
    return (window as any).process?.env?.[key] || (process?.env?.[key]) || '';
  } catch {
    return '';
  }
};

// Your specific Supabase Project URL
const supabaseUrl = 'https://pnqsiejxuwfgbzyeglhd.supabase.co';

// Your provided Public (Anon) Key
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_KZbgCq0pW84Jov0XRUTt6A_yAABNhBh';

// Check if we have a real configuration
export const isSupabaseConfigured = 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseAnonKey !== '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * --- DATABASE SETUP INSTRUCTIONS ---
 * Run the following SQL in your Supabase SQL Editor:
 * 
 * CREATE TABLE public.documents (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users NOT NULL,
 *    title TEXT NOT NULL,
 *    author TEXT,
 *    category TEXT,
 *    content TEXT,
 *    cover_url TEXT,
 *    created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * --- GOOGLE AUTH: FIXING ERROR 400 REDIRECT_URI_MISMATCH ---
 * 
 * 1. GOOGLE CLOUD CONSOLE (https://console.cloud.google.com/):
 *    - Go to APIs & Services -> Credentials.
 *    - Edit your "OAuth 2.0 Client ID".
 *    - Add to "Authorized redirect URIs":
 *      https://pnqsiejxuwfgbzyeglhd.supabase.co/auth/v1/callback
 * 
 * 2. SUPABASE DASHBOARD (https://supabase.com/dashboard):
 *    - Go to Authentication -> URL Configuration.
 *    - Ensure your App URL (e.g., http://localhost:5173) is in "Redirect URLs".
 *    - Go to Authentication -> Providers -> Google.
 *    - Ensure Client ID and Secret are correct.
 */
