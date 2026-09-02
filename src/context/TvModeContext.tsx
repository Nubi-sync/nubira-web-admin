'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TvModeContextType {
  isTvMode: boolean
  toggleTvMode: () => void
  enterTvMode: () => void
  exitTvMode: () => void
  currentTime: string
  currentDate: string
  refreshCountdown: number
  triggerManualRefresh: () => void
}

const TvModeContext = createContext<TvModeContextType>({
  isTvMode: false,
  toggleTvMode: () => {},
  enterTvMode: () => {},
  exitTvMode: () => {},
  currentTime: '',
  currentDate: '',
  refreshCountdown: 45,
  triggerManualRefresh: () => {},
})

export function useTvMode() {
  return useContext(TvModeContext)
}

const REFRESH_INTERVAL_SECONDS = 45

export function TvModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isTvMode, setIsTvMode] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL_SECONDS)

  // Initialize from URL parameter ?tv=true if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('tv') === 'true' || params.get('kiosk') === 'true') {
        setIsTvMode(true)
      }
    }
  }, [])

  // Live Digital Clock (HH:MM:SS AM/PM)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-refresh countdown in TV mode
  useEffect(() => {
    if (!isTvMode) return

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          router.refresh()
          return REFRESH_INTERVAL_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTvMode, router])

  const triggerManualRefresh = useCallback(() => {
    setRefreshCountdown(REFRESH_INTERVAL_SECONDS)
    router.refresh()
  }, [router])

  const enterTvMode = useCallback(() => {
    setIsTvMode(true)
    setRefreshCountdown(REFRESH_INTERVAL_SECONDS)
    if (typeof document !== 'undefined' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen request might be blocked if not initiated by direct user gesture
      })
    }
  }, [])

  const exitTvMode = useCallback(() => {
    setIsTvMode(false)
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const toggleTvMode = useCallback(() => {
    if (isTvMode) {
      exitTvMode()
    } else {
      enterTvMode()
    }
  }, [isTvMode, enterTvMode, exitTvMode])

  // Handle Escape key to exit TV mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTvMode) {
        exitTvMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTvMode, exitTvMode])

  // Sync with browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isTvMode) {
        // Browser exited native fullscreen
        setIsTvMode(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [isTvMode])

  return (
    <TvModeContext.Provider
      value={{
        isTvMode,
        toggleTvMode,
        enterTvMode,
        exitTvMode,
        currentTime,
        currentDate,
        refreshCountdown,
        triggerManualRefresh,
      }}
    >
      {children}
    </TvModeContext.Provider>
  )
}
