require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const c = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
});

async function test() {
  // Check what columns exist
  const { data, error } = await c.from('exhibitions').select('*').limit(1);
  if (error) {
    console.log('Error:', error.message);

    // Maybe table doesn't exist - check via RPC
    const { data: tables, error: tErr } = await c.rpc('exec_sql', {
      query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exhibitions' ORDER BY ordinal_position"
    });
    if (tErr) {
      console.log('RPC error:', tErr.message);
      // Try another approach
      const { data: raw } = await c.from('exhibitions').select();
      console.log('Raw select error:', raw);
    } else {
      console.log('Columns:', tables);
    }
  } else {
    if (data && data.length > 0) {
      console.log('Columns:', Object.keys(data[0]).join(', '));
      console.log('Sample:', JSON.stringify(data[0], null, 2));
    } else {
      console.log('Table exists but is empty');
      // Try to get column info by inserting empty
      const { error: insErr } = await c.from('exhibitions').insert({});
      console.log('Empty insert error (shows required columns):', insErr?.message);
    }
  }
}

test();
