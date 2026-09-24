'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  ArrowRight,
  Sparkles,
  Scissors,
  Printer,
  Waves,
  Wind,
  Layers,
  Radio,
  User,
  ShieldCheck,
  FileCheck2,
  Palette,
  Briefcase
} from 'lucide-react'
import {
  FloorRealtimeEvent,
  FloorModule,
  getFloorNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearFloorNotifications,
  FLOOR_NOTIFICATIONS_UPDATE_EVENT
} from '@/utils/floorNotificationsStorage'
import { floorRealtime } from '@/utils/floorRealtime'

interface FloorNotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentModule: FloorModule
  companyName?: string
}

export function FloorNotificationDrawer({
  isOpen,
  onClose,
  currentModule,
  companyName
}: FloorNotificationDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CURRENT'>('ALL')
  const [notifications, setNotifications] = useState<FloorRealtimeEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('offline')

  const refreshList = () => {
    const list = getFloorNotifications(
      companyName,
      activeFilter === 'CURRENT' ? currentModule : 'all'
    )
    setNotifications(list)
  }

  useEffect(() => {
    refreshList()

    // Listen to real-time notifications updates
    const handleStorageUpdate = () => {
      refreshList()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleStorageUpdate)
      window.addEventListener('storage', handleStorageUpdate)
    }

    // Subscribe to status changes
    const unsub = floorRealtime.subscribe({
      onStatus: (status) => setConnectionStatus(status)
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleStorageUpdate)
        window.removeEventListener('storage', handleStorageUpdate)
      }
      unsub()
    }
  }, [isOpen, activeFilter, currentModule, companyName])

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(companyName)
    refreshList()
  }

  const handleClear = () => {
    clearFloorNotifications(companyName)
    refreshList()
  }

  const handleItemClick = (id: string) => {
    markNotificationAsRead(id, companyName)
    refreshList()
  }

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMins = Math.floor(diffMs / 60000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`

      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
      const isToday = d.toDateString() === now.toDateString()
      if (isToday) return `Today, ${timeStr}`

      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${dateStr}, ${timeStr}`
    } catch {
      return 'Just now'
    }
  }

  const getModuleBadge = (mod?: FloorModule) => {
    switch (mod) {
      case 'design':
        return { label: 'DESIGN STUDIO', bg: 'bg-teal-50 text-teal-700 border-teal-200' }
      case 'merchandising':
        return { label: 'MERCHANDISING', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'cutting':
        return { label: 'CUTTING', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'printing':
        return { label: 'PRINTING', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'embroidery':
        return { label: 'EMBROIDERY', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'stitching':
        return { label: 'SEWING', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'washing':
        return { label: 'WASHING', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
      case 'iron':
        return { label: 'IRONING', bg: 'bg-rose-50 text-rose-700 border-rose-200' }
      default:
        return { label: 'FLOOR', bg: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  const getModuleIcon = (mod?: FloorModule) => {
    switch (mod) {
      case 'design':
        return <Palette className="w-3.5 h-3.5" />
      case 'merchandising':
        return <Briefcase className="w-3.5 h-3.5" />
      case 'cutting':
        return <Scissors className="w-3.5 h-3.5" />
      case 'printing':
        return <Printer className="w-3.5 h-3.5" />
      case 'embroidery':
        return <Sparkles className="w-3.5 h-3.5" />
      case 'stitching':
        return <Layers className="w-3.5 h-3.5" />
      case 'washing':
        return <Waves className="w-3.5 h-3.5" />
      case 'iron':
        return <Wind className="w-3.5 h-3.5" />
      default:
        return <Bell className="w-3.5 h-3.5" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-out Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[430px] bg-white shadow-2xl z-50 flex flex-col border-l border-black/10 animate-in slide-in-from-right duration-250 select-none">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 flex items-center justify-between gap-3 bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                  Live Floor Activity
                </h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3A3564] text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              {/* WebSocket Status Indicator */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[11px] font-mono font-semibold text-slate-500">
                  {connectionStatus === 'connected'
                    ? 'WebSocket Live Sync Active'
                    : connectionStatus === 'connecting'
                    ? 'Connecting to Floor...'
                    : 'Local Bus Active'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Quick Controls */}
        <div className="px-4 py-2.5 border-b border-black/5 bg-slate-50/60 flex items-center justify-between gap-2 text-xs">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-200/60 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Floors
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('CURRENT')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer capitalize ${
                activeFilter === 'CURRENT'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentModule} Floor
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:text-[#3A3564] hover:bg-black/5 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Read all</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Clear activity log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Notification Activity Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-700">No recent floor activity</div>
              <p className="text-xs text-slate-400 max-w-[240px] mx-auto">
                Worker submissions, stage handovers, and department sign-offs will stream here live via WebSockets.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const badge = getModuleBadge(item.sourceModule)
              const icon = getModuleIcon(item.sourceModule)

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`pt-2.5 pb-2 px-3 rounded-xl transition-all cursor-pointer border ${
                    item.isRead
                      ? 'bg-white border-transparent hover:bg-slate-50'
                      : 'bg-indigo-50/40 border-indigo-100/70 hover:bg-indigo-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Module & Event Pill */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${badge.bg}`}
                      >
                        {icon}
                        <span>{badge.label}</span>
                      </span>

                      {item.taskRef && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          #{item.taskRef}
                        </span>
                      )}

                      {item.articleNumber && (
                        <span className="text-[10px] font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-black/5">
                          {item.articleNumber}
                        </span>
                      )}
                    </div>

                    {/* Timestamp & Unread Dot */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimestamp(item.timestamp)}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#3A3564] shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Single-line Reminder / Summary of work done */}
                  <div className="mt-1.5 text-xs text-slate-800 font-medium leading-relaxed">
                    {item.message}
                  </div>

                  {/* Secondary piece or worker pill if present */}
                  {(item.workerName || item.pieces) && (
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      {item.workerName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.workerName}</span>
                        </span>
                      )}
                      {item.pieces && (
                        <span className="font-bold text-slate-700">
                          {item.pieces.toLocaleString('en-IN')} pcs logged
                        </span>
                      )}
                      {item.status && (
                        <span className="text-slate-400 uppercase">
                          • {item.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Connected via Supabase WebSockets</span>
          <span className="font-bold text-[#3A3564]">Zigza Floor Sync</span>
        </div>
      </div>
    </>
  )
}
