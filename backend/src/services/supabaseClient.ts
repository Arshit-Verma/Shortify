import { createClient } from '@supabase/supabase-js';
import env from '../utils/config.js';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabase;

// Type definitions for database tables
export interface Link {
  id: string;
  short_code: string;
  target_url: string;
  owner_token: string | null;
  click_count: number;
  created_at: string;
  last_click_at: string | null;
}

export interface Click {
  id: number;
  link_id: string;
  occurred_at: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
}
