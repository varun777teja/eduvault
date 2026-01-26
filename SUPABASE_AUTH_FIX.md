# Supabase Authentication Setup

Your application is currently running in **Local/Offline Mode** because the Supabase configuration is incomplete.

To enable full Authentication and Cloud Sync, you need to add your **Supabase Anon Key**.

## Steps to Fix:

1.  **Log in to Supabase**: Go to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2.  **Select your Project**: "eduvault".
3.  **Go to Settings**: Click on the **Settings** (gear icon) > **API**.
4.  **Copy the Anon Key**: Look for the `anon` / `public` key and copy it.
5.  **Update `.env.local`**:
    Open the `.env.local` file in your project root and paste the key:

    ```env
    GEMINI_API_KEY=AIzaSyChqdqjx2dytEfjqCiGO3JB83ew0BmbTlE
    VITE_SUPABASE_URL=https://pnqsiejxuwfgbzyeglhd.supabase.co
    VITE_SUPABASE_ANON_KEY=your_copied_key_here
    ```

6.  **Restart the Server**:
    Stop the current server (Ctrl+C) and run `npm run dev` again.

Once this is done, the "Cloud services not connected" error will disappear, and you will be able to log in with Google.
