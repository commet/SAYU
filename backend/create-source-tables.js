/**
 * Create source tables for new API integrations
 * Uses Supabase PostgREST workaround: creates tables by attempting insert + checking error
 * For tables that need DDL, prints SQL for manual execution
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TABLES_SQL = `
-- Source tables for international exhibition data pipeline
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS source_cleveland (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  organizer TEXT,
  venue_name TEXT,
  venue_city TEXT,
  venue_country TEXT DEFAULT 'US',
  start_date DATE,
  end_date DATE,
  venues JSONB DEFAULT '[]',
  gallery_views_urls TEXT[] DEFAULT '{}',
  is_venue_cma BOOLEAN DEFAULT false,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_cleveland_dates ON source_cleveland(start_date, end_date);

CREATE TABLE IF NOT EXISTS source_whitney (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  date_override TEXT,
  url_slug TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_whitney_dates ON source_whitney(start_date, end_date);

CREATE TABLE IF NOT EXISTS source_paris (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  image_url TEXT,
  lat FLOAT,
  lng FLOAT,
  price_type TEXT,
  price_detail TEXT,
  tags TEXT,
  source_url TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_paris_dates ON source_paris(start_date, end_date);

CREATE TABLE IF NOT EXISTS source_berlin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  venue_name TEXT,
  start_date DATE,
  end_date DATE,
  admission_type TEXT,
  event_type TEXT,
  status TEXT,
  is_exhibition BOOLEAN DEFAULT false,
  raw_data JSONB NOT NULL DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_source_berlin_dates ON source_berlin(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_source_berlin_exhibition ON source_berlin(is_exhibition);

-- Add new columns to exhibitions table for enrichment
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_lat FLOAT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS venue_lng FLOAT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS exhibition_type TEXT;
ALTER TABLE exhibitions ADD COLUMN IF NOT EXISTS artists_text TEXT;
`;

async function checkTables() {
  const tables = ['source_cleveland', 'source_whitney', 'source_paris', 'source_berlin'];
  const missing = [];

  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      missing.push(t);
      console.log(`  ${t}: MISSING`);
    } else {
      console.log(`  ${t}: EXISTS`);
    }
  }

  if (missing.length > 0) {
    console.log('\n=== MISSING TABLES ===');
    console.log('Please run the following SQL in Supabase SQL Editor:\n');
    console.log(TABLES_SQL);
  } else {
    console.log('\nAll tables exist!');
  }
}

checkTables().catch(console.error);
