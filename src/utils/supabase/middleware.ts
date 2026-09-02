import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
              maxAge: options?.maxAge || 60 * 60 * 24, // 1 day (24 hours) rolling session
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
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login' || pathname.startsWith('/login')
  
  // Explicit protected dashboard pages that require login
  const PROTECTED_DASHBOARD_ROUTES = [
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
  ]
  const isProtectedRoute = PROTECTED_DASHBOARD_ROUTES.some(route => pathname.startsWith(route))

  if (!user && isProtectedRoute) {
    // If not logged in and accessing protected internal pages, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    // If already logged in and visiting /login in another tab, redirect to /dashboard
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
