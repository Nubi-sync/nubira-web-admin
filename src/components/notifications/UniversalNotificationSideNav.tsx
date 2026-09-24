'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Sparkles, Radio } from 'lucide-react'
import { FloorNotificationDrawer } from './FloorNotificationDrawer'
import { FloorModule, getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'
import { subscribeToFloorEvents } from '@/utils/floorRealtime'
import { toast } from 'sonner'

interface UniversalNotificationSideNavProps {
  companyName?: string
  defaultModule?: FloorModule
}

function resolveModuleFromPathname(pathname: string): FloorModule {
  if (!pathname) return 'all'
  if (pathname.startsWith('/design')) return 'design'
  if (pathname.startsWith('/merchandising')) return 'merchandising'
  if (pathname.startsWith('/cutting')) return 'cutting'
  if (pathname.startsWith('/printing')) return 'printing'
  if (pathname.startsWith('/embroidery')) return 'embroidery'
  if (pathname.startsWith('/stitching-sewing')) return 'stitching'
  if (pathname.startsWith('/washing')) return 'washing'
  if (pathname.startsWith('/iron')) return 'iron'
  return 'all'
}

export function UniversalNotificationSideNav({
  companyName,
  defaultModule
}: UniversalNotificationSideNavProps) {
  const pathname = usePathname()
  const currentModule = defaultModule || resolveModuleFromPathname(pathname)

  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'offline'>('offline')
  const [hasNewPulse, setHasNewPulse] = useState(false)

  const [effectiveCompany, setEffectiveCompany] = useState<string | undefined>(companyName)

  // Sync and persist company name
  useEffect(() => {
    if (companyName) {
      setEffectiveCompany(companyName)
      try {
        localStorage.setItem('floor_company_filter', companyName)
      } catch (_) {}
    } else {
      try {
        const stored = localStorage.getItem('floor_company_filter')
        if (stored) setEffectiveCompany(stored)
      } catch (_) {}
    }
  }, [companyName])

  // Listen to open events from anywhere in the app (e.g. left sidebar or top bar buttons)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    const handleToggle = () => setIsOpen(prev => !prev)

    if (typeof window !== 'undefined') {
      window.addEventListener('open-floor-notifications', handleOpen)
      window.addEventListener('toggle-floor-notifications', handleToggle)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-floor-notifications', handleOpen)
        window.removeEventListener('toggle-floor-notifications', handleToggle)
      }
    }
  }, [])

  // Sync unread count and subscribe to live WebSocket stream
  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadNotificationCount(effectiveCompany, currentModule === 'all' ? undefined : currentModule))
    }

    updateCount()

    if (typeof window !== 'undefined') {
      window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, updateCount)
      window.addEventListener('storage', updateCount)
    }

    const unsub = subscribeToFloorEvents({
      companyName: effectiveCompany,
      onStatusChange: (status) => setWsStatus(status),
      onRefresh: () => updateCount(),
      onEvent: (event) => {
        updateCount()
        // Flash pulse animation on new incoming event
        setHasNewPulse(true)
        setTimeout(() => setHasNewPulse(false), 3500)
      }
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, updateCount)
        window.removeEventListener('storage', updateCount)
      }
      unsub()
    }
  }, [effectiveCompany, currentModule])

  return (
    <>
      {/* ======================================================== */}
      {/* DOCKED RIGHT-SIDE NOTIFICATION SIDE NAV TAB              */}
      {/* Fixed to the right edge of viewport, visible on every screen */}
      {/* ======================================================== */}
      <aside
        aria-label="Notification Side Navigation"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 select-none"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`group relative flex flex-col items-center gap-2.5 py-4 px-2.5 rounded-l-2xl border-l-2 border-y shadow-2xl transition-all duration-200 cursor-pointer ${
            hasNewPulse
              ? 'border-rose-400 bg-rose-950 text-white shadow-rose-500/40 translate-x-0 ring-2 ring-rose-500/50'
              : 'bg-[#1E1B4B] text-white border-white/20 hover:border-amber-400 hover:bg-[#2B2668] hover:-translate-x-1.5'
          }`}
          title="Open Live Department Feed & Audit Notifications"
        >
          {/* Bell Icon with Badge */}
          <div className="relative">
            <Bell className={`w-5 h-5 text-amber-300 transition-transform group-hover:scale-110 ${
              hasNewPulse ? 'animate-bounce text-rose-300' : ''
            }`} />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-3 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-[#1E1B4B] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          {/* Vertical Text Label */}
          <div className="flex flex-col items-center gap-1 my-1">
            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-mono font-black uppercase tracking-[2.5px] text-white/90 group-hover:text-amber-300 transition-colors">
              Live Feed
            </span>
          </div>

          {/* Live WebSocket Status Dot */}
          <div className="flex items-center justify-center pt-2 border-t border-white/15 w-full">
            <span
              className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/30 ${
                wsStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80'
                  : wsStatus === 'connecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-400'
              }`}
              title={`WebSocket Live Sync: ${wsStatus.toUpperCase()}`}
            />
          </div>

          {/* Hover Tooltip Ribbon */}
          <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden group-hover:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-mono font-bold whitespace-nowrap shadow-2xl border border-white/10">
            <span className="text-amber-300 font-extrabold uppercase tracking-wider">Live Audit Feed</span>
            <span className="text-slate-500">•</span>
            <span className={`flex items-center gap-1.5 text-[11px] ${wsStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {wsStatus === 'connected' ? 'Live Sync Active' : wsStatus}
            </span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
        </button>
      </aside>

      {/* ======================================================== */}
      {/* SLIDE-OUT NOTIFICATION SIDE NAV DRAWER                   */}
      {/* ======================================================== */}
      <FloorNotificationDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentModule={currentModule}
        companyName={effectiveCompany}
      />
    </>
  )
}
