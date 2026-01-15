
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Helper to determine if we have real credentials
export const isSupabaseConfigured = 
  process.env.SUPABASE_URL && 
  process.env.SUPABASE_ANON_KEY && 
  !process.env.SUPABASE_URL.includes('placeholder');

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
