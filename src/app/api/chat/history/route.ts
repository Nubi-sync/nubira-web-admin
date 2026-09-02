import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const BUCKET_NAME = 'ai_chat_history'

function getHeaders() {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`
  }
}

function getEmailStorageKey(email: string): string {
  const sanitized = email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '_')
  return `${sanitized}.json`
}

// GET: Retrieve saved chat history based on EMAIL (from auth session or query param)
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

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      headers: getHeaders(),
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

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
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
