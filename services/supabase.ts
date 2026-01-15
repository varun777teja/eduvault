
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
 * -- Note: Roll Number and Branch are currently stored in auth.users user_metadata.
 * -- For a more robust solution, you can create a profiles table:
 * 
 * CREATE TABLE public.profiles (
 *    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *    full_name TEXT,
 *    roll_number TEXT UNIQUE,
 *    branch TEXT,
 *    updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
 * CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
 */
