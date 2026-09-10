import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Enforce Rate Limiting on direct API Login & Auth POST requests (exempting internal Next.js Server Actions & sign-out)
  const isServerAction = request.headers.has('next-action')
  if (
    request.method === 'POST' &&
    !isServerAction &&
    pathname !== '/auth/signout' &&
    (pathname === '/login' || pathname.startsWith('/auth') || pathname.startsWith('/api/auth'))
  ) {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1')
    
    // 20 requests per minute at edge layer to accommodate shared factory floor IP gateways
    const rateCheck = checkRateLimit(`mw_login_${clientIp}`, 20, 60 * 1000)
    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: `Too many attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
          retryAfter: rateCheck.resetInSeconds,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.resetInSeconds),
          },
        }
      )
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              maxAge: typeof options?.maxAge === 'number' ? options.maxAge : 60 * 60 * 24, // preserve 0 on deletion, fallback to 24h
              sameSite: 'lax',
              path: '/',
            })
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect logic
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login')
  
  // Explicit protected dashboard & module pages that require login
  const PROTECTED_DASHBOARD_ROUTES = [
    '/modules',
    '/stitching-sewing',
    '/factory',
    '/brands',
    '/washing',
    '/printing',
    '/embroidery',
    '/dashboard',
    '/allotments',
    '/articles',
    '/dispatch',
    '/employees',
    '/inventory',
    '/production-orders',
    '/reports',
    '/reset-password',
    '/zigza-ai',
    '/store',
    '/vendors',
    '/profile',
  ]
  const isProtectedRoute = PROTECTED_DASHBOARD_ROUTES.some(route => pathname.startsWith(route))

  // Only perform page navigation redirects on standard page requests (NOT on Server Actions)
  if (!isServerAction) {
    if (!user && isProtectedRoute) {
      // If not logged in and accessing protected internal pages, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user && isLoginPage) {
      // If already logged in and visiting /login in another tab, redirect to /modules
      const url = request.nextUrl.clone()
      url.pathname = '/modules'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
