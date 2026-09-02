import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const BUCKET_NAME = 'ai_chat_history'

function getEmailStorageKey(email: string): string {
  const sanitized = email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_')
  return `${sanitized}.json`
}

// GET: Retrieve saved chat history based on EMAIL
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const queryEmail = req.nextUrl.searchParams.get('email')
    const email = (user?.email || queryEmail || '').trim()

    if (!email) {
      return NextResponse.json({ sessions: [], error: 'No email provided' }, { status: 400 })
    }

    const filePath = getEmailStorageKey(email)

    // 1. First attempt: Direct public storage fetch (Bucket is public, zero auth failure risk)
    try {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
      const publicRes = await fetch(publicUrl, { cache: 'no-store' })
      if (publicRes.ok) {
        const publicSessions = await publicRes.json()
        if (Array.isArray(publicSessions)) {
          return NextResponse.json({ 
            sessions: publicSessions,
            email,
            syncedKey: filePath,
            source: 'public_bucket'
          })
        }
      }
    } catch (publicErr) {
      console.warn('Public bucket fetch error, falling back to authenticated storage fetch:', publicErr)
    }

    // 2. Fallback: Authenticated fetch using Service Role Key
    const keyToUse = SERVICE_KEY || ANON_KEY
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      headers: {
        apikey: keyToUse,
        Authorization: `Bearer ${keyToUse}`
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ sessions: [], email, syncedKey: filePath })
    }

    const sessions = await res.json()
    return NextResponse.json({ 
      sessions: Array.isArray(sessions) ? sessions : [],
      email,
      syncedKey: filePath
    })
  } catch (error: any) {
    console.error('Error fetching chat history by email:', error)
    return NextResponse.json({ sessions: [] })
  }
}

// POST: Save updated chat history based on EMAIL
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await req.json()
    const { sessions, email: bodyEmail } = body

    const email = (user?.email || bodyEmail || '').trim()

    if (!email) {
      return NextResponse.json({ error: 'No email provided' }, { status: 400 })
    }

    if (!Array.isArray(sessions)) {
      return NextResponse.json({ error: 'Invalid sessions array' }, { status: 400 })
    }

    const filePath = getEmailStorageKey(email)
    const sanitizedSessions = sessions.slice(0, 50)

    const keyToUse = SERVICE_KEY || ANON_KEY

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      method: 'POST',
      headers: {
        apikey: keyToUse,
        Authorization: `Bearer ${keyToUse}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true'
      },
      body: JSON.stringify(sanitizedSessions)
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Failed to sync chat history to Supabase:', errText)
      return NextResponse.json({ error: 'Failed to persist history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, email, syncedKey: filePath })
  } catch (error: any) {
    console.error('Error saving chat history by email:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
