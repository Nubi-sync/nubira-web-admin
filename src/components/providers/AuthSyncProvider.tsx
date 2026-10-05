'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const AUTH_CHANNEL_NAME = 'zigza_auth_sync'
const STORAGE_SYNC_KEY = 'zigza_auth_event'

const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/register',
  '/try-free',
  '/terms',
  '/privacy',
  '/security',
  '/reset-password',
  '/auth',
  '/not-found',
]

function isPublicRoute(pathname: string | null): boolean {
  if (!pathname || pathname === '/') return true
  return PUBLIC_PREFIXES.some((prefix) => {
    if (prefix === '/') return pathname === '/'
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const isHandlingLogoutRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const isPublicPage = isPublicRoute(pathname)

    // 1. Setup BroadcastChannel for Instant Cross-Tab Sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME)
        channelRef.current = channel

        channel.onmessage = (event) => {
          if (!event?.data) return
          if (event.data.type === 'LOGOUT') {
            if (!isPublicPage && !isHandlingLogoutRef.current) {
              isHandlingLogoutRef.current = true
              window.location.href = '/login'
            }
          } else if (event.data.type === 'LOGIN') {
            if (isPublicPage && pathname === '/login') {
              router.refresh()
            }
          }
        }
      } catch (err) {
        console.warn('BroadcastChannel initialization error:', err)
      }
    }

    // Fallback localStorage listener for cross-tab sync across legacy browsers
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_SYNC_KEY && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.type === 'LOGOUT' && !isPublicPage && !isHandlingLogoutRef.current) {
            isHandlingLogoutRef.current = true
            window.location.href = '/login'
          } else if (data.type === 'LOGIN' && isPublicPage && pathname === '/login') {
            router.refresh()
          }
        } catch (_) {}
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const broadcastAuthEvent = (type: 'LOGIN' | 'LOGOUT') => {
      try {
        channelRef.current?.postMessage({ type, timestamp: Date.now() })
        localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify({ type, timestamp: Date.now() }))
      } catch (_) {}
    }

    // 2. Supabase Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        broadcastAuthEvent('LOGOUT')
        if (!isPublicPage && !isHandlingLogoutRef.current) {
          isHandlingLogoutRef.current = true
          window.location.href = '/login'
        }
      } else if (event === 'SIGNED_IN') {
        broadcastAuthEvent('LOGIN')
      } else if (event === 'TOKEN_REFRESHED') {
        // Token refreshed successfully in background
      }
    })

    // 3. Proactive Sliding Session Token Refresh (Every 4 minutes for authenticated sessions)
    const checkAndRefreshToken = async () => {
      if (isPublicPage) return

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          if (!isPublicPage && !isHandlingLogoutRef.current) {
            isHandlingLogoutRef.current = true
            window.location.href = '/login'
          }
          return
        }

        if (session.expires_at) {
          const expiresAtMs = session.expires_at * 1000
          const nowMs = Date.now()
          const minutesRemaining = (expiresAtMs - nowMs) / (60 * 1000)

          // If session expires within 10 minutes, proactively refresh sliding token
          if (minutesRemaining > 0 && minutesRemaining < 10) {
            await supabase.auth.refreshSession()
          }
        }
      } catch (err) {
        console.warn('Session verification warning:', err)
      }
    }

    let refreshInterval: NodeJS.Timeout | null = null
    if (!isPublicPage) {
      refreshInterval = setInterval(checkAndRefreshToken, 4 * 60 * 1000)
    }

    // 4. Visibility Change Listener: Verify auth state when user returns to an inactive tab
    const handleVisibilityChange = () => {
      if (!document.hidden && !isPublicPage) {
        checkAndRefreshToken()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      if (refreshInterval) clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      try {
        channelRef.current?.close()
      } catch (_) {}
    }
  }, [pathname, router])

  return <>{children}</>
}
