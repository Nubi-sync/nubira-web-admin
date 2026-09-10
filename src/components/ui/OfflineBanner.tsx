'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WifiOff, Wifi, RotateCcw } from 'lucide-react'

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
      }, 3500)
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
        className="fixed top-0 inset-x-0 z-100 bg-[#FFFBEB] text-[#92400E] border-b border-[#FDE68A] px-4 py-2 text-xs font-semibold shadow-xs flex items-center justify-between"
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <WifiOff className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span className="font-mono uppercase tracking-wider text-[10.5px] font-bold text-[#B45309]">
            Network Disconnected
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="font-medium text-[#78350F] truncate">
            Factory internet is offline. Realtime floor sync paused. Changes will sync automatically when reconnected.
          </span>
        </div>
      </aside>
    )
  }

  // Reconnected State (Temporary 3.5s toast/banner)
  return (
    <aside 
      role="status" 
      aria-live="polite" 
      className="fixed top-0 inset-x-0 z-100 bg-[#F0FDF4] text-[#166534] border-b border-[#BBF7D0] px-4 py-2 text-xs font-semibold shadow-xs flex items-center justify-between animate-fade-in"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <Wifi className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
        <span className="font-mono uppercase tracking-wider text-[10.5px] font-bold text-[#15803D]">
          Online
        </span>
        <span className="hidden sm:inline text-slate-300">|</span>
        <span className="font-medium text-[#14532D]">
          Factory connection restored. Synchronizing latest floor data...
        </span>
        <RotateCcw className="w-3 h-3 text-[#16A34A] animate-spin ml-auto" />
      </div>
    </aside>
  )
}
