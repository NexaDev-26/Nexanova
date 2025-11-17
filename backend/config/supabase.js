require('dotenv').config();

// Dynamic import for Supabase (ES module)
let createClient;
let supabase = null;
const supabaseUrl = 'https://njomwijgeccbzjgbtmfe.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client
(async () => {
  try {
    if (!supabaseKey || supabaseKey === 'your-supabase-anon-key-here') {
      console.warn('⚠️  WARNING: SUPABASE_KEY not set in .env file');
      console.warn('   Supabase client will not be initialized');
      console.warn('   Add your Supabase anon key to .env: SUPABASE_KEY=your-key-here');
      return;
    }

    // Import Supabase client (handles both CommonJS and ES modules)
    const supabaseModule = await import('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
    
    supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Supabase client initialized');
    console.log('   URL:', supabaseUrl);
    
    // Test connection (optional - can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Simple connection test
        const { error } = await supabase.from('users').select('count').limit(1);
        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected)
          console.warn('⚠️  Supabase connection test:', error.message);
        } else {
          console.log('✅ Supabase connection test successful');
        }
      } catch (testError) {
        console.warn('⚠️  Supabase connection test failed:', testError.message);
        console.warn('   This is normal if tables don\'t exist yet');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error.message);
    console.warn('   Server will continue with SQLite database');
  }
})();

module.exports = {
  get supabase() {
    return supabase;
  },
  supabaseUrl,
  // Helper function to wait for Supabase to be ready
  async waitForSupabase() {
    let attempts = 0;
    while (!supabase && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    return supabase;
  }
};

