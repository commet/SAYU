const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeBatch5() {
  try {
    console.log('Starting batch5.sql execution...\n');
    
    // Read and parse SQL file
    const sqlContent = fs.readFileSync('exhibitions-sept-batch5.sql', 'utf8');
    
    // Extract individual INSERT statements (more careful parsing)
    const insertStatements = sqlContent.match(/INSERT INTO[\s\S]*?(?=\n\n|$)/g) || [];
    
    console.log(`Found ${insertStatements.length} INSERT statements\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const exhibitionIds = [];
    
    for (let i = 0; i < insertStatements.length; i++) {
      const statement = insertStatements[i].trim();
      
      // Skip empty statements
      if (!statement) continue;
      
      // Determine table name
      const tableMatch = statement.match(/INSERT INTO (\w+)/);
      if (!tableMatch) continue;
      
      const tableName = tableMatch[1];
      console.log(`[${i + 1}/${insertStatements.length}] Inserting into ${tableName}...`);
      
      try {
        // Parse the VALUES section
        const valuesMatch = statement.match(/VALUES\s*\(([\s\S]*?)\)(?:\s*RETURNING\s+id)?/);
        if (!valuesMatch) {
          console.log('  ⚠️  Could not parse VALUES clause');
          continue;
        }
        
        // For exhibitions_master table
        if (tableName === 'exhibitions_master') {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });
          
          if (error) {
            console.error(`  ❌ Error: ${error.message}`);
            errorCount++;
          } else {
            console.log('  ✅ Successfully inserted exhibition');
            successCount++;
            if (data && data[0]) {
              exhibitionIds.push(data[0].id);
            }
          }
        } 
        // For exhibitions_translations table
        else if (tableName === 'exhibitions_translations') {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: statement + ';'
          });
          
          if (error) {
            console.error(`  ❌ Error: ${error.message}`);
            errorCount++;
          } else {
            console.log('  ✅ Successfully inserted translation');
            successCount++;
          }
        }
        
      } catch (err) {
        console.error(`  ❌ Unexpected error: ${err.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n========================================');
    console.log('EXECUTION SUMMARY');
    console.log('========================================');
    console.log(`✅ Successful inserts: ${successCount}`);
    console.log(`❌ Failed inserts: ${errorCount}`);
    console.log(`📊 Total statements: ${insertStatements.length}`);
    
    // Verify exhibitions were added
    console.log('\n========================================');
    console.log('VERIFYING EXHIBITIONS');
    console.log('========================================');
    
    const { data: exhibitions, error: verifyError } = await supabase
      .from('exhibitions_master')
      .select(`
        id,
        start_date,
        end_date,
        genre,
        exhibition_type,
        source_url
      `)
      .or('source_url.eq.https://storage.hyundaicard.com/,source_url.eq.https://www.museum.go.kr/,source_url.eq.https://www.thehyundai.com/,source_url.eq.https://www.pacegallery.com/exhibitions/james-turrell-the-return/,source_url.eq.http://museumhead.com/타면-나타나는-굴-pit-calls-wall/')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (verifyError) {
      console.error('Error verifying exhibitions:', verifyError);
    } else if (exhibitions && exhibitions.length > 0) {
      console.log(`\nFound ${exhibitions.length} exhibitions from batch5:`);
      exhibitions.forEach((ex, idx) => {
        console.log(`${idx + 1}. ID: ${ex.id}`);
        console.log(`   Period: ${ex.start_date} ~ ${ex.end_date}`);
        console.log(`   Type: ${ex.genre} / ${ex.exhibition_type}`);
        console.log(`   URL: ${ex.source_url}\n`);
      });
    } else {
      console.log('No exhibitions found - might need to check the queries');
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

executeBatch5();