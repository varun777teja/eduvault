
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    // Check multiple possible locations for environment variables
    const val = (window as any).process?.env?.[key] || (process?.env?.[key]) || '';
    return val;
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'placeholder-anon-key';

// Helper to determine if we have real credentials
export const isSupabaseConfigured = 
  !!getEnv('SUPABASE_URL') && 
  !!getEnv('SUPABASE_ANON_KEY') && 
  !getEnv('SUPABASE_URL').includes('placeholder') &&
  getEnv('SUPABASE_URL') !== '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * DATABASE SCHEMA REQUIREMENTS:
 * 
 * 1. Table: documents
 *    - id: uuid (primary key)
 *    - user_id: uuid (references auth.users)
 *    - title: text
 *    - author: text
 *    - category: text
 *    - content: text
 *    - cover_url: text
 *    - created_at: timestamptz
 * 
 * 2. Table: tasks
 *    - id: uuid (primary key)
 *    - user_id: uuid (references auth.users)
 *    - title: text
 *    - date: date
 *    - time: time
 *    - duration: integer
 *    - completed: boolean
 *    - priority: text
 */
