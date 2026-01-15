
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
 * -- 1. Create Tables
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
 * CREATE TABLE public.tasks (
 *    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *    user_id UUID REFERENCES auth.users NOT NULL,
 *    title TEXT NOT NULL,
 *    date TEXT NOT NULL,
 *    time TEXT NOT NULL,
 *    duration INTEGER DEFAULT 30,
 *    completed BOOLEAN DEFAULT FALSE,
 *    priority TEXT DEFAULT 'medium',
 *    created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- 2. Enable Realtime Replication
 * -- Go to Database > Replication > Source: public and Toggle: documents, tasks
 * -- OR run this SQL:
 * alter publication supabase_realtime add table documents;
 * alter publication supabase_realtime add table tasks;
 * 
 * -- 3. Enable RLS (Security)
 * ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Individual user access" ON public.documents 
 * FOR ALL USING (auth.uid() = user_id);
 * 
 * CREATE POLICY "Individual task access" ON public.tasks 
 * FOR ALL USING (auth.uid() = user_id);
 */
