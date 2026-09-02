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

// Convert user's email into safe Supabase storage filename
function getEmailStorageKey(user: { id?: string; email?: string }): string {
  const identifier = (user.email || user.id || 'default_user').toLowerCase().trim()
  const sanitized = identifier.replace(/[^a-z0-9@._-]/g, '_')
  return `${sanitized}.json`
}

// GET: Retrieve saved chat history for the authenticated user based on EMAIL
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = getEmailStorageKey(user)

    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`, {
      headers: getHeaders(),
      cache: 'no-store'
    })

    if (!res.ok) {
      // If user has no saved history yet, return empty list
      return NextResponse.json({ sessions: [], email: user.email })
    }

    const sessions = await res.json()
    return NextResponse.json({ 
      sessions: Array.isArray(sessions) ? sessions : [],
      email: user.email,
      syncedKey: filePath
    })
  } catch (error: any) {
    console.error('Error fetching chat history by email:', error)
    return NextResponse.json({ sessions: [] })
  }
}

// POST: Save updated chat history for the authenticated user based on EMAIL
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = getEmailStorageKey(user)
    const { sessions } = await req.json()

    if (!Array.isArray(sessions)) {
      return NextResponse.json({ error: 'Invalid sessions payload' }, { status: 400 })
    }

    // Keep up to 50 most recent sessions to keep storage fast and light
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
      console.error('Failed to sync email chat sessions to Supabase storage:', errText)
      return NextResponse.json({ error: 'Failed to persist history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, email: user.email, syncedKey: filePath })
  } catch (error: any) {
    console.error('Error saving chat history by email:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
