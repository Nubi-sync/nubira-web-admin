const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function purgeTable(table, queryParam = 'id=neq.00000000-0000-0000-0000-000000000000') {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryParam}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=representation'
      }
    });
    const data = await res.json();
    console.log(`Purged ${table}: Status ${res.status}, Deleted ${Array.isArray(data) ? data.length : JSON.stringify(data)}`);
  } catch (e) {
    console.error(`Error purging ${table}:`, e.message);
  }
}

async function main() {
  console.log('--- PURGING LEGACY STITCHING & MES ROWS ---');
  // Order matters for FK constraints:
  // 1. Worker assignments & allotment materials & variants
  await purgeTable('worker_assignments');
  await purgeTable('allotment_materials');
  await purgeTable('allotment_variants');
  await purgeTable('daily_product');
  await purgeTable('qc_logs');
  await purgeTable('store_transactions');
  await purgeTable('delivery_challan_items');
  await purgeTable('delivery_challans');
  
  // 2. Allotments
  await purgeTable('allotments');

  // 3. Challans
  await purgeTable('challan_items');
  await purgeTable('challans');

  // 4. Articles
  await purgeTable('articles');

  console.log('--- PURGE COMPLETE ---');
}

main();
