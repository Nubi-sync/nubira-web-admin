import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) env[k.trim()] = v.join('=').trim()
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']

async function run() {
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  const buckets = await res.json()
  console.log('Existing Buckets:', buckets)

  let landingBucket = buckets.find(b => b.id === 'landing-assets' || b.name === 'landing-assets')
  if (!landingBucket) {
    console.log('Creating landing-assets public bucket...')
    const createRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'landing-assets',
        name: 'landing-assets',
        public: true,
        file_size_limit: 20971520 // 20MB
      })
    })
    const createData = await createRes.json()
    console.log('Created bucket result:', createData)
  }
}

run()
