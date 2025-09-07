const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExhibitionsVenueRefs() {
  console.log('🔄 Updating exhibitions_master venue references to venues table...\n');

  try {
    // Get all exhibitions with venue_id (from venues_simple)
    const { data: exhibitions, error: exError } = await supabase
      .from('exhibitions_master')
      .select('id, venue_id')
      .not('venue_id', 'is', null);

    if (!exhibitions || exhibitions.length === 0) {
      console.log('No exhibitions with venue_id found.');
      return;
    }

    console.log(`Found ${exhibitions.length} exhibitions with venue_id\n`);

    // Process each exhibition
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const exhibition of exhibitions) {
      // Get venue info from venues_simple
      const { data: venueSimple } = await supabase
        .from('venues_simple')
        .select('name_ko, name_en')
        .eq('id', exhibition.venue_id)
        .single();

      if (!venueSimple) {
        notFoundCount++;
        continue;
      }

      // Find corresponding venue in venues table
      const { data: venue } = await supabase
        .from('venues')
        .select('id, name')
        .or(`name.eq.${venueSimple.name_ko},name.eq.${venueSimple.name_en}`)
        .single();

      if (venue) {
        // Update exhibition with new venue_id
        const { error: updateError } = await supabase
          .from('exhibitions_master')
          .update({ venue_id: venue.id })
          .eq('id', exhibition.id);

        if (!updateError) {
          updatedCount++;
          console.log(`✓ Updated: ${venueSimple.name_ko} → venues.id: ${venue.id}`);
        }
      } else {
        console.log(`✗ Not found in venues: ${venueSimple.name_ko}`);
        
        // Create in venues table if not exists
        const { data: newVenue, error: insertError } = await supabase
          .from('venues')
          .insert({
            name: venueSimple.name_ko,
            name_en: venueSimple.name_en,
            type: 'gallery', // default
            city: '서울',
            country: '한국',
            is_active: true
          })
          .select('id')
          .single();

        if (newVenue && !insertError) {
          // Update exhibition with new venue_id
          await supabase
            .from('exhibitions_master')
            .update({ venue_id: newVenue.id })
            .eq('id', exhibition.id);
          
          updatedCount++;
          console.log(`✓ Created & Updated: ${venueSimple.name_ko} → venues.id: ${newVenue.id}`);
        }
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`  Updated: ${updatedCount} exhibitions`);
    console.log(`  Not found: ${notFoundCount} venues`);
    
    console.log('\n✅ Exhibition venue references updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the update
updateExhibitionsVenueRefs();