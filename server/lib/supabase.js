import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'your-service-role-key') {
  throw new Error('Set the real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
}

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
