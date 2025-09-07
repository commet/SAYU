const { createClient } = require('@supabase/supabase-js');

// Service role key로 RLS 우회
const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtal';

// Service role client - RLS 우회
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSAndMigrate() {
  console.log('🔧 Fixing RLS and migrating venues with service role...\n');
  
  try {
    // 1. Get all venues_simple
    const { data: venuesSimple, error: fetchError } = await supabase
      .from('venues_simple')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching venues_simple:', fetchError);
      return;
    }
    
    console.log(`Processing ${venuesSimple.length} venues from venues_simple...\n`);
    
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const venueMapping = [];
    
    for (const vs of venuesSimple) {
      // Check if already exists in venues
      const { data: existing } = await supabase
        .from('venues')
        .select('id, name')
        .eq('name', vs.name_ko)
        .single();
      
      if (existing) {
        // Update existing venue
        const { error: updateError } = await supabase
          .from('venues')
          .update({
            name_en: vs.name_en || existing.name_en,
            type: mapVenueType(vs.venue_type),
            tier: vs.is_major ? 1 : 2,
            city: vs.city || '서울',
            district: vs.district,
            address: vs.address_ko,
            phone: vs.phone,
            website: vs.website,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (!updateError) {
          updatedCount++;
          venueMapping.push({ old_id: vs.id, new_id: existing.id });
          console.log(`✓ Updated: ${vs.name_ko}`);
        } else {
          errorCount++;
          console.log(`✗ Error updating ${vs.name_ko}:`, updateError.message);
        }
      } else {
        // Insert new venue
        const { data: newVenue, error: insertError } = await supabase
          .from('venues')
          .insert({
            name: vs.name_ko,
            name_en: vs.name_en,
            type: mapVenueType(vs.venue_type),
            tier: vs.is_major ? 1 : 2,
            city: vs.city || '서울',
            country: '한국',
            district: vs.district,
            address: vs.address_ko,
            phone: vs.phone,
            website: vs.website,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (newVenue && !insertError) {
          addedCount++;
          venueMapping.push({ old_id: vs.id, new_id: newVenue.id });
          console.log(`✓ Added: ${vs.name_ko}`);
        } else {
          errorCount++;
          console.log(`✗ Error adding ${vs.name_ko}:`, insertError?.message);
        }
      }
    }
    
    console.log(`\n📊 Venue Migration Results:`);
    console.log(`  Added: ${addedCount} new venues`);
    console.log(`  Updated: ${updatedCount} existing venues`);
    console.log(`  Errors: ${errorCount}`);
    
    // 2. Update exhibitions_master venue_id references
    console.log(`\n🔄 Updating exhibitions_master venue references...`);
    let exhibitionUpdateCount = 0;
    
    for (const mapping of venueMapping) {
      const { error } = await supabase
        .from('exhibitions_master')
        .update({ venue_id: mapping.new_id })
        .eq('venue_id', mapping.old_id);
      
      if (!error) {
        exhibitionUpdateCount++;
      }
    }
    
    console.log(`  Updated ${exhibitionUpdateCount} exhibition venue references`);
    
    // 3. Final statistics
    const { count: venuesCount } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true });
    
    const { count: exhibitionsWithVenue } = await supabase
      .from('exhibitions_master')
      .select('*', { count: 'exact', head: true })
      .not('venue_id', 'is', null);
    
    console.log(`\n📊 Final Statistics:`);
    console.log(`  Total venues: ${venuesCount}`);
    console.log(`  Exhibitions with venue: ${exhibitionsWithVenue}`);
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

function mapVenueType(venueType) {
  const typeMap = {
    'museum': 'museum',
    'gallery': 'gallery',
    'art_center': 'art_center',
    'alternative': 'alternative',
    'auction': 'auction'
  };
  return typeMap[venueType] || 'gallery';
}

// Run the migration with service role
fixRLSAndMigrate();