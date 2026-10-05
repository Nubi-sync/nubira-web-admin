import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  extractClientIp,
  resolveIpGeolocation,
  parseUserAgent
} from '@/lib/geoResolver'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey)

interface TrackVisitBody {
  path?: string
  referrer?: string
  action?: string
  dwellTimeSeconds?: number | string
  sessionId?: string
}

export async function POST(req: NextRequest) {
  try {
    const headers = req.headers
    const clientIp = extractClientIp(headers)
    const userAgent = headers.get('user-agent') || ''
    const { deviceType, browser, os } = parseUserAgent(userAgent)

    let body: TrackVisitBody = {}
    try {
      body = (await req.json()) as TrackVisitBody
    } catch {
      // Body may be empty on beacon ping
    }

    const pagePath = (body.path || '/').slice(0, 255)
    const rawReferrer = body.referrer || headers.get('referer') || 'Direct'
    const referrer = rawReferrer.slice(0, 500)
    const action = (body.action || 'Page Viewed').slice(0, 100)
    const dwellTimeSeconds = Math.max(0, parseInt(String(body.dwellTimeSeconds || 0), 10))
    const sessionId = (body.sessionId || '').slice(0, 100)

    // Resolve IP geolocation
    const geo = await resolveIpGeolocation(clientIp, headers)

    const todayDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Deduplication check: check if this IP + device already recorded a visit today
    try {
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('website_page_views')
        .select('id, dwell_time_seconds')
        .eq('ip_address', clientIp)
        .eq('visit_date', todayDate)
        .eq('device_type', deviceType)
        .limit(1)

      if (!checkError && existing && existing.length > 0) {
        // Already visited today! Update dwell time or latest timestamp if greater
        const existingRow = existing[0]
        if (dwellTimeSeconds > (existingRow.dwell_time_seconds || 0) || action !== 'Page Viewed') {
          await supabaseAdmin
            .from('website_page_views')
            .update({
              dwell_time_seconds: Math.max(existingRow.dwell_time_seconds || 0, dwellTimeSeconds),
              action: action !== 'Page Viewed' ? action : undefined,
              visited_at: new Date().toISOString()
            })
            .eq('id', existingRow.id)
        }

        return NextResponse.json({
          success: true,
          isNewToday: false,
          state: geo.state,
          city: geo.city,
          country: geo.country
        })
      }

      // New unique visitor for today -> Insert row
      const { error: insertError } = await supabaseAdmin
        .from('website_page_views')
        .insert({
          ip_address: clientIp,
          city: geo.city,
          state: geo.state,
          country: geo.country,
          device_type: deviceType,
          browser,
          operating_system: os,
          referrer,
          page_path: pagePath,
          action,
          dwell_time_seconds: dwellTimeSeconds,
          session_id: sessionId || undefined,
          visit_date: todayDate,
          visited_at: new Date().toISOString()
        })

      if (insertError) {
        console.warn('[track-visit] Table insert notice:', insertError.message)
      }

      return NextResponse.json({
        success: true,
        isNewToday: true,
        state: geo.state,
        city: geo.city,
        country: geo.country
      })
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr)
      console.warn('[track-visit] DB notice:', msg)
      return NextResponse.json({
        success: true,
        isNewToday: true,
        state: geo.state,
        city: geo.city,
        country: geo.country
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[track-visit] Fatal error:', msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // Support quick GET ping if needed
  return POST(req)
}
