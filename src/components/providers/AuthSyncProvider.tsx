'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const AUTH_CHANNEL_NAME = 'zigza_auth_sync'
const STORAGE_SYNC_KEY = 'zigza_auth_event'

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const isHandlingLogoutRef = useRef(false)

  useEffect(() => {
    const supabase = createClient()
    const isPublicPage = pathname === '/login' || pathname.startsWith('/login') || pathname === '/'

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
            if (isPublicPage) {
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
          } else if (data.type === 'LOGIN' && isPublicPage) {
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

    // 3. Proactive Sliding Session Token Refresh (Every 4 minutes)
    // Refreshes token if it's within 10 minutes of expiry to guarantee zero session drops during shifts
    const checkAndRefreshToken = async () => {
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

    const refreshInterval = setInterval(checkAndRefreshToken, 4 * 60 * 1000)

    // 4. Visibility Change Listener: Verify auth state when user returns to an inactive tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAndRefreshToken()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      try {
        channelRef.current?.close()
      } catch (_) {}
    }
  }, [pathname, router])

  return <>{children}</>
}
