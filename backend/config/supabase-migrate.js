/**
 * Supabase Migration Script (Corrected)
 * -------------------------------------
 * Supabase DOES NOT allow running raw SQL through the JS client.
 *
 * You MUST run:
 *   backend/config/supabase-schema.sql
 * manually inside Supabase → SQL Editor.
 *
 * This file now only warns the developer.
 */

console.log(`
=====================================================
⚠️  Supabase Migration Notice
=====================================================

Supabase does NOT allow running:
  CREATE TABLE, CREATE INDEX, ALTER TABLE
from the JavaScript client.

➡️ GO TO:
   Supabase Dashboard → SQL Editor

➡️ COPY AND PASTE:
   backend/config/supabase-schema.sql

➡️ CLICK RUN

Tables will be created instantly.

=====================================================
`);
