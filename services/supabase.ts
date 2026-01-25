
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    return import.meta.env[key] || (window as any).process?.env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = 'https://pnqsiejxuwfgbzyeglhd.supabase.co';
const envKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
const supabaseAnonKey = envKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'; // Fallback to prevent crash

export const isSupabaseConfigured =
  !!envKey &&
  envKey !== 'placeholder-anon-key' &&
  envKey.length > 20;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * --- UPDATED DATABASE SETUP INSTRUCTIONS ---
 * Run the following SQL in your Supabase SQL Editor:
 * 
 * -- 1. Update Documents Table to support Public Library
 * ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
 * 
 * -- 2. Refined RLS (Security) for Public/Private Access
 * DROP POLICY IF EXISTS "Individual user access" ON public.documents;
 * 
 * -- Students can see their own docs OR any doc marked public
 * CREATE POLICY "General Access Policy" ON public.documents 
 * FOR SELECT USING (auth.uid() = user_id OR is_public = true);
 * 
 * -- Students can only insert their own
 * CREATE POLICY "Individual Insert" ON public.documents 
 * FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * -- Admins or Owners can update/delete
 * CREATE POLICY "Admin/Owner Update" ON public.documents 
 * FOR UPDATE USING (
 *   auth.uid() = user_id OR 
 *   (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
 * );
 * 
 * CREATE POLICY "Admin/Owner Delete" ON public.documents 
 * FOR DELETE USING (
 *   auth.uid() = user_id OR 
 *   (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
 * );
 */
