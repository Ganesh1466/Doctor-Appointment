
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // anon key or service_role key

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️  Supabase credentials missing in .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
