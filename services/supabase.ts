
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
 * -- 1. Create Documents Table
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
 * -- 2. Create Tasks Table
 * CREATE TABLE public.tasks (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users NOT NULL,
 *    title TEXT NOT NULL,
 *    date DATE NOT NULL,
 *    time TIME NOT NULL,
 *    duration INTEGER DEFAULT 30,
 *    completed BOOLEAN DEFAULT FALSE,
 *    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
 *    created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 3. Enable RLS
 * ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
 * 
 * -- 4. Policies
 * CREATE POLICY "Users can manage own docs" ON public.documents FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
 * 
 * --- GOOGLE AUTH TROUBLESHOOTING (FIXING 403 ERRORS) ---
 * If you see "403: Access Denied" or "User not allowed" during Google login:
 * 
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/).
 * 2. Select your project.
 * 3. Go to "APIs & Services" -> "OAuth consent screen".
 * 4. Look for the "Test users" section at the bottom.
 * 5. Add your email address (and any others you use to test) to the 'Test users' list.
 * 6. Ensure the 'Publishing status' is set to 'Testing' (unless you've officially verified with Google).
 * 
 * --- GOOGLE AUTH REDIRECT CONFIG ---
 * 1. In Supabase Dashboard -> Authentication -> Providers -> Google.
 * 2. Ensure "Enable Google" is ON.
 * 3. Copy the 'Redirect URI' from Supabase.
 * 4. Paste it into 'Authorized redirect URIs' in your GCP Client ID settings.
 *    Example: https://pnqsiejxuwfgbzyeglhd.supabase.co/auth/v1/callback
 */
