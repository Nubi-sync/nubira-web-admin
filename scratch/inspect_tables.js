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

async function queryTable(table) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=5`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'count=exact'
      }
    });
    const countHeader = res.headers.get('content-range');
    const data = await res.json();
    console.log(`Table ${table}: Status ${res.status}, Range: ${countHeader}, Rows: ${Array.isArray(data) ? data.length : 0}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`  Sample:`, JSON.stringify(data[0]).slice(0, 150));
    }
  } catch (e) {
    console.log(`Table ${table} Error:`, e.message);
  }
}

async function main() {
  const tables = [
    'platform_tenant_factories',
    'profiles',
    'brands',
    'vendors',
    'challans',
    'allotments',
    'articles',
    'daily_product',
    'qc_logs',
    'store_transactions',
    'delivery_challans',
    'production_orders'
  ];

  for (const t of tables) {
    await queryTable(t);
  }
}

main();
