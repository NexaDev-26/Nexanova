/**
 * Supabase Client Export
 * 
 * This file provides a clean export of the Supabase client
 * for use throughout the application.
 * 
 * Usage:
 *   const { supabase, waitForSupabase } = require('./config/supabaseClient');
 *   
 *   // Wait for Supabase to be ready (if needed)
 *   const client = await waitForSupabase();
 *   
 *   // Example query
 *   const { data, error } = await client
 *     .from('users')
 *     .select('*')
 *     .eq('email', 'user@example.com');
 */

const supabaseConfig = require('./supabase');

module.exports = {
  get supabase() {
    return supabaseConfig.supabase;
  },
  supabaseUrl: supabaseConfig.supabaseUrl,
  waitForSupabase: supabaseConfig.waitForSupabase
};

