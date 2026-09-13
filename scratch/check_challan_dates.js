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

async function check() {
  const { data, error } = await supabase.from('challans').select('id, challan_no, challan_date, delivery_date, created_at, notes, brand').order('created_at', { ascending: false });
  if (error) { 
    console.error('Error:', error); 
    return; 
  }
  console.log('Total Challans:', data.length);
  data.forEach(c => {
    let rawDateInNotes = null;
    let articleLinesCount = 0;
    try {
      const p = JSON.parse(c.notes);
      rawDateInNotes = p.raw_date || p.challan_date || p.date || (p.article_lines ? p.article_lines.length + ' lines' : null);
      if (Array.isArray(p.article_lines)) articleLinesCount = p.article_lines.length;
    } catch (_) {}
    console.log(`Challan #${c.challan_no}: date=${c.challan_date} | deliv=${c.delivery_date} | brand=${c.brand} | created=${c.created_at} | lines=${articleLinesCount}`);
  });
}
check();
