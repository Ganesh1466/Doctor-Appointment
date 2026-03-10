
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer the service role key for backend operations since it bypasses RLS policies.
// Fall back to the public (anon) key if the service role key is not available.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️  Supabase credentials missing in .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
