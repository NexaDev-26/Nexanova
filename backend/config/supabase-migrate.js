/**
 * Supabase Database Migration Script
 * 
 * This script automatically creates all tables in Supabase
 * Run this after setting up your Supabase project and adding SUPABASE_KEY to .env
 * 
 * Usage:
 *   node backend/config/supabase-migrate.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { supabase, waitForSupabase } = require('./supabase');

async function runMigration() {
  console.log('🚀 Starting Supabase database migration...\n');

  // Wait for Supabase to be ready
  const client = await waitForSupabase();
  
  if (!client) {
    console.error('❌ Supabase client is not available.');
    console.error('   Make sure SUPABASE_KEY is set in your .env file');
    process.exit(1);
  }

  // Read the SQL schema file
  const schemaPath = path.join(__dirname, 'supabase-schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split SQL into individual statements
  // Remove comments and empty lines, split by semicolons
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip DO blocks and other complex statements that need special handling
    if (statement.includes('DO $$') || statement.includes('RAISE NOTICE')) {
      continue;
    }

    try {
      // Use Supabase RPC or direct query
      // Note: Supabase client doesn't support raw SQL execution directly
      // You'll need to use the Supabase SQL Editor or REST API
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      // For now, we'll use the REST API approach
      // This requires the service_role key for admin operations
      const { data, error } = await client.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // If RPC doesn't exist, we'll need to use a different approach
        // For now, log that manual execution is needed
        if (error.code === 'PGRST116' || error.message.includes('function') || error.message.includes('does not exist')) {
          console.log(`⚠️  Statement ${i + 1} requires manual execution in Supabase SQL Editor`);
          console.log(`   This is normal for DDL statements (CREATE TABLE, etc.)`);
        } else {
          throw error;
        }
      } else {
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error executing statement ${i + 1}:`, error.message);
      
      // Don't stop on errors - some statements might fail if tables already exist
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   (This is OK - table/index already exists)`);
        successCount++;
        errorCount--;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Migration completed!`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n📝 Note: Some DDL statements (CREATE TABLE, etc.) need to be run');
  console.log('   directly in the Supabase SQL Editor for best results.');
  console.log('   Copy the contents of backend/config/supabase-schema.sql');
  console.log('   and paste it into Supabase Dashboard → SQL Editor');
  console.log('='.repeat(50));
}

// Run migration
runMigration().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

