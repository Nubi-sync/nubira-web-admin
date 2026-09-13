const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf8');
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) process.env[k.trim()] = v.join('=').trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const corrections = [
  { challan_no: '476', old_date: '2026-04-08', new_date: '2026-08-04' },
  { challan_no: '473', old_date: '2026-03-08', new_date: '2026-08-03' },
  { challan_no: '477', old_date: '2026-03-08', new_date: '2026-08-03' },
  { challan_no: '472', old_date: '2026-03-08', new_date: '2026-08-03' },
  { challan_no: '406', old_date: '2026-11-07', new_date: '2026-07-11' },
  { challan_no: '416', old_date: '2026-12-07', new_date: '2026-07-12' },
  { challan_no: '449', old_date: '2026-11-07', new_date: '2026-07-11' },
];

async function updateDates() {
  console.log('Starting date corrections for swapped month/day challans...');
  for (const item of corrections) {
    const { data, error } = await supabase
      .from('challans')
      .update({ challan_date: item.new_date })
      .eq('challan_no', item.challan_no)
      .select('id, challan_no, challan_date');
      
    if (error) {
      console.error(`Failed to update Challan #${item.challan_no}:`, error.message);
    } else {
      console.log(`Updated Challan #${item.challan_no}: ${item.old_date} -> ${item.new_date} (Records affected: ${data.length})`);
    }
  }

  // Also check if any other challans have invalid dates
  const { data: all } = await supabase.from('challans').select('challan_no, challan_date').order('created_at', { ascending: false });
  console.log('\nAll Challans Current Dates:');
  all.forEach(c => console.log(`Challan #${c.challan_no}: ${c.challan_date}`));
}

updateDates();
