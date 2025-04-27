// config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { config } from './index.js';

// Public client (using Anon key) - for operations allowed by RLS for anonymous users
// or for specific RPC calls that don't require user context directly.
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// Factory function to create a Supabase client scoped to a specific user's JWT.
// This is essential for interacting with tables protected by RLS policies.
export function createSupabaseUserClient(token) {
  if (!token) {
    console.error('Attempted to create user-scoped Supabase client without a token.');
    throw new Error('Cannot create user-scoped client: Authentication token is missing.');
  }
  return createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  );
}
