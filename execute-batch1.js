const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeBatch1() {
  try {
    console.log('🚀 Starting Batch 1 SQL execution...');
    console.log('📄 Reading exhibitions-sept-batch1.sql...');
    
    // Read SQL file
    const sqlContent = fs.readFileSync('exhibitions-sept-batch1.sql', 'utf8');
    
    // Parse SQL statements more carefully
    const statements = [];
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    
    for (const line of lines) {
      // Skip comment-only lines
      if (line.trim().startsWith('--') && !currentStatement.trim()) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if statement is complete (ends with semicolon)
      if (line.trim().endsWith(';')) {
        const trimmed = currentStatement.trim();
        if (trimmed && !trimmed.startsWith('--')) {
          statements.push(trimmed);
        }
        currentStatement = '';
      }
    }
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // For ALTER TABLE
        if (statement.includes('ALTER TABLE')) {
          console.log('  → ALTER TABLE for instagram_url column');
        }
        // For INSERT INTO exhibitions_master
        else if (statement.includes('INSERT INTO exhibitions_master')) {
          console.log('  → INSERT INTO exhibitions_master');
        }
        // For INSERT INTO exhibitions_translations
        else if (statement.includes('INSERT INTO exhibitions_translations')) {
          console.log('  → INSERT INTO exhibitions_translations');
        }
        
        // Try to execute directly - Supabase doesn't have exec_sql by default
        // We'll need to execute these manually or via a different approach
        console.log('  ⚠️  Note: Direct SQL execution not available via RPC');
        console.log('  → Will need to execute manually in Supabase Dashboard');
        
      } catch (err) {
        console.error(`  ❌ Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Execution Summary:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    
    // Verify the insertions
    console.log('\n🔍 Verifying recent exhibitions...');
    const { data: exhibitions, error: fetchError } = await supabase
      .from('exhibitions_master')
      .select('id, start_date, source_url, instagram_url')
      .gte('start_date', '2025-08-29')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (fetchError) {
      console.error('Error fetching exhibitions:', fetchError);
    } else {
      console.log(`\n📅 Found ${exhibitions.length} exhibitions starting from Aug 29:`);
      exhibitions.forEach(ex => {
        const url = ex.source_url || 'No URL';
        const insta = ex.instagram_url ? '✓' : '✗';
        console.log(`  - ${ex.start_date}: [IG:${insta}] ${url.substring(0, 50)}...`);
      });
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

executeBatch1();