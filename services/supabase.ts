
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    return (window as any).process?.env?.[key] || (process?.env?.[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = 'https://pnqsiejxuwfgbzyeglhd.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_KZbgCq0pW84Jov0XRUTt6A_yAABNhBh';

export const isSupabaseConfigured = 
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseAnonKey !== '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * --- UPDATED DATABASE SETUP INSTRUCTIONS ---
 * Run the following SQL in your Supabase SQL Editor:
 * 
 * -- 1. Update Documents Table to support Public Library
 * ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
 * 
 * -- 2. Create Study Sessions Table for Academic Performance Tracking
 * CREATE TABLE IF NOT EXISTS public.study_sessions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   date DATE DEFAULT CURRENT_DATE,
 *   minutes INTEGER DEFAULT 0,
 *   UNIQUE(user_id, date)
 * );
 * 
 * -- 3. Refined RLS (Security) for Documents
 * DROP POLICY IF EXISTS "General Access Policy" ON public.documents;
 * CREATE POLICY "General Access Policy" ON public.documents 
 * FOR SELECT USING (auth.uid() = user_id OR is_public = true);
 * 
 * CREATE POLICY "Individual Insert" ON public.documents 
 * FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * CREATE POLICY "Admin/Owner Update" ON public.documents 
 * FOR UPDATE USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
 * 
 * CREATE POLICY "Admin/Owner Delete" ON public.documents 
 * FOR DELETE USING (auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true);
 * 
 * -- 4. RLS for Study Sessions
 * ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can manage own sessions" ON public.study_sessions
 * FOR ALL USING (auth.uid() = user_id);
 */
