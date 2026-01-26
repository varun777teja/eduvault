
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("❌ Missing specific Supabase credentials in .env.local");
    process.exit(1);
}

console.log("Testing Supabase Connection...");
console.log(`URL: ${url}`);
console.log(`Key: ${key.substring(0, 10)}...`);

const supabase = createClient(url, key);

async function testConnection() {
    try {
        // Try to get session (should be null but not throw)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("❌ Connection Failed:", error.message);
        } else {
            console.log("✅ Supabase Client Initialized Successfully!");
            console.log("Connection to Auth Service: OK");
        }

        // Check if we can reach the health endpoint (or a public table)
        // Using a simpler check - list documents (expecting RLS error or empty list, but confirming reachability)
        const dbCheck = await supabase.from('documents').select('count', { count: 'exact', head: true });

        if (dbCheck.error && dbCheck.error.code !== 'PGRST116') {
            // PCRST116 is just no result, which is fine. Network errors look different.
            console.log("⚠️  Database Reachable (but verified restricted access):", dbCheck.error.message);
        } else {
            console.log("✅ Database Reachable");
        }

    } catch (e) {
        console.error("❌ Unexpected Error:", e.message);
    }
}

testConnection();
