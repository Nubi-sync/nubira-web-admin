'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OfflineBanner() {
  const router = useRouter()
  const [isOffline, setIsOffline] = useState(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setJustReconnected(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setJustReconnected(true)
      
      // Auto-resync latest server components on reconnection
      try {
        router.refresh()
      } catch (_) {}

      const timer = setTimeout(() => {
        setJustReconnected(false)
      }, 3000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [router])

  if (!isOffline && !justReconnected) {
    return null
  }

  if (isOffline) {
    return (
      <aside 
        role="alert" 
        aria-live="assertive" 
        className="fixed top-0 inset-x-0 z-100 bg-cyan-50 text-cyan-900 border-b border-cyan-200 px-4 py-1.5 text-xs font-medium shadow-xs flex items-center justify-center text-center"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-cyan-800">
            Network Disconnected:
          </span>
          <span className="text-cyan-900 text-[11.5px]">
            Factory internet is offline. Realtime floor sync paused. Changes will sync automatically when reconnected.
          </span>
        </div>
      </aside>
    )
  }

  // Reconnected State (Clean Cyan Notification)
  return (
    <aside 
      role="status" 
      aria-live="polite" 
      className="fixed top-0 inset-x-0 z-100 bg-cyan-600 text-white px-4 py-1.5 text-xs font-medium shadow-xs flex items-center justify-center text-center transition-opacity duration-300"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-cyan-100">
          Connected:
        </span>
        <span className="text-white text-[11.5px]">
          Factory connection restored. Realtime floor sync active.
        </span>
      </div>
    </aside>
  )
}
