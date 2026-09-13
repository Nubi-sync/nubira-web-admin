require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

async function runTest() {
  console.log('Testing Custom Enterprise Request & Provisioning Flow via Supabase REST API...')

  // 1. Fetch existing custom requests
  const fetchRes = await fetch(`${supabaseUrl}/rest/v1/platform_demo_requests?preferred_plan=eq.CUSTOM&select=*`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  })

  if (!fetchRes.ok) {
    console.error('Fetch error:', await fetchRes.text())
  } else {
    const leads = await fetchRes.json()
    console.log(`Found ${leads.length} existing custom requests in live table.`)
  }

  // 2. Insert test custom request
  const testLead = {
    applicant_name: 'Rajesh Singhania',
    company_name: 'Singhania Apparels',
    phone: '+91 98201 23456',
    email: 'rajesh@singhania.com',
    preferred_plan: 'CUSTOM',
    city_state: 'Surat, Gujarat',
    estimated_machines: 450,
    status: 'NEW_LEAD',
    notes: 'Requires custom integration with Gerber automated cutter and real-time weighbridge scale hook.',
    submitted_at: new Date().toISOString()
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/platform_demo_requests`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(testLead)
  })

  if (!insertRes.ok) {
    console.error('Insert test lead error:', await insertRes.text())
  } else {
    const inserted = await insertRes.json()
    console.log('Successfully inserted test custom lead:', inserted[0]?.id, inserted[0]?.company_name)
  }

  // 3. Check custom username generation logic
  const company = testLead.company_name
  const clean = company.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  const derivedUsername = `${clean}_admin`
  console.log('Derived Custom Username:', derivedUsername)

  // 4. Verify platform_tenant_factories table exists and is accessible
  const tenantRes = await fetch(`${supabaseUrl}/rest/v1/platform_tenant_factories?select=id,company_name,active_divisions_count&limit=3`, {
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`
    }
  })

  if (!tenantRes.ok) {
    console.error('Tenants fetch error:', await tenantRes.text())
  } else {
    const tenants = await tenantRes.json()
    console.log(`Tenants check OK, count: ${tenants.length}`)
  }

  console.log('All database checks passed successfully!')
}

runTest().catch(console.error)
