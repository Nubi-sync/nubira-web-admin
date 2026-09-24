'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
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
  Briefcase,
  Search,
  ChevronLeft,
  RefreshCw,
  Boxes,
  Wrench,
  Tag
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
import { toast } from 'sonner'

interface ModuleNotificationPageClientProps {
  currentModule: FloorModule
  moduleName: string
  moduleHref: string
  companyName?: string
}

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  design: Palette,
  merchandising: Briefcase,
  cutting: Scissors,
  printing: Printer,
  embroidery: Sparkles,
  stitching: Scissors,
  washing: Waves,
  iron: Wind,
  'ready-goods': Boxes,
  alter: Wrench
}

export function ModuleNotificationPageClient({
  currentModule,
  moduleName,
  moduleHref,
  companyName
}: ModuleNotificationPageClientProps) {
  const [activeTab, setActiveTab] = useState<'MODULE' | 'ALL' | 'UNREAD'>('MODULE')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<FloorRealtimeEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('offline')

  const refreshList = () => {
    const list = getFloorNotifications(companyName, 'all')
    setNotifications(list)
  }

  useEffect(() => {
    refreshList()

    const handleStorageUpdate = () => {
      refreshList()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleStorageUpdate)
      window.addEventListener('storage', handleStorageUpdate)
    }

    const unsub = floorRealtime.subscribe({
      onStatus: (status) => setConnectionStatus(status),
      onEvent: () => {
        refreshList()
      }
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleStorageUpdate)
        window.removeEventListener('storage', handleStorageUpdate)
      }
      unsub()
    }
  }, [currentModule, companyName])

  // Counts
  const moduleEvents = useMemo(() => {
    return notifications.filter(
      n => n.sourceModule === currentModule || n.targetModule === currentModule
    )
  }, [notifications, currentModule])

  const unreadEvents = useMemo(() => {
    return notifications.filter(n => !n.read)
  }, [notifications])

  const filteredNotifications = useMemo(() => {
    let baseList = notifications

    if (activeTab === 'MODULE') {
      baseList = moduleEvents
    } else if (activeTab === 'UNREAD') {
      baseList = unreadEvents
    }

    if (!searchQuery.trim()) return baseList

    const q = searchQuery.toLowerCase().trim()
    return baseList.filter(n =>
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.message && n.message.toLowerCase().includes(q)) ||
      (n.articleNumber && n.articleNumber.toLowerCase().includes(q)) ||
      (n.workerName && n.workerName.toLowerCase().includes(q)) ||
      (n.sourceModule && n.sourceModule.toLowerCase().includes(q)) ||
      (n.targetModule && n.targetModule.toLowerCase().includes(q)) ||
      (n.taskRef && n.taskRef.toLowerCase().includes(q))
    )
  }, [notifications, activeTab, moduleEvents, unreadEvents, searchQuery])

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(companyName)
    refreshList()
    toast.success('All notifications marked as read')
  }

  const handleClear = () => {
    clearFloorNotifications(companyName)
    refreshList()
    toast.info('Notification history cleared')
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
      if (isToday) return `Today at ${timeStr}`

      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${dateStr}, ${timeStr}`
    } catch {
      return 'Just now'
    }
  }

  const CurrentModuleIcon = MODULE_ICONS[currentModule] || Bell

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Link
            href="/modules"
            className="hover:text-[#3A3564] transition-colors"
          >
            Workspace Hub
          </Link>
          <span>/</span>
          <Link
            href={moduleHref}
            className="hover:text-[#3A3564] transition-colors"
          >
            {moduleName}
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Notification</span>
        </div>

        {/* WebSocket Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white shadow-2xs text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`}
          />
          <span className="font-semibold text-slate-700">
            {connectionStatus === 'connected' ? 'Live WebSocket Active' : 'Connecting WebSocket...'}
          </span>
        </div>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {moduleName} Notifications
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                {moduleEvents.length} Events Logged
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Live floor audit trail, operator handovers, and department milestones for {companyName || 'your factory'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadEvents.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4 text-[#3A3564]" />
            <span>Mark All as Read</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-white hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-600 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Clear all stored event logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-black/5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('MODULE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'MODULE'
                ? 'bg-white text-[#3A3564] shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{moduleName} Events</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeTab === 'MODULE' ? 'bg-[#FAF7F0] text-[#3A3564]' : 'bg-slate-200 text-slate-700'
            }`}>
              {moduleEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ALL'
                ? 'bg-white text-[#3A3564] shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Floor Activity</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              activeTab === 'ALL' ? 'bg-[#FAF7F0] text-[#3A3564]' : 'bg-slate-200 text-slate-700'
            }`}>
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('UNREAD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'UNREAD'
                ? 'bg-white text-[#3A3564] shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Unread</span>
            {unreadEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-[#3A3564] text-white text-[10px] font-mono font-bold">
                {unreadEvents.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px] md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by article, worker, task..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:border-[#3A3564] transition-all"
          />
        </div>
      </div>

      {/* 4. Notification List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-black/10 shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mx-auto shadow-2xs">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery ? 'No matching notifications found' : 'No notifications yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-medium">
                {searchQuery
                  ? 'Try adjusting your search query or clear the filter.'
                  : `Floor events, operator allotments, and department completions for ${moduleName} will be recorded here in real time.`}
              </p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const SourceIcon = MODULE_ICONS[notif.sourceModule] || Layers
            const isUnread = !notif.read

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'bg-white border-[#3A3564]/30 shadow-xs hover:border-[#3A3564]'
                    : 'bg-white/80 hover:bg-white border-black/10 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Module Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/10 shadow-2xs ${
                  isUnread ? 'bg-[#3A3564] text-white' : 'bg-[#FAF7F0] text-[#3A3564]'
                }`}>
                  <SourceIcon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">
                        {notif.title}
                      </span>
                      {notif.articleNumber && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          Article: {notif.articleNumber}
                        </span>
                      )}
                      {notif.taskRef && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-black/5">
                          Task #{notif.taskRef}
                        </span>
                      )}
                      {notif.pieces && notif.pieces > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {notif.pieces.toLocaleString('en-IN')} pcs
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(notif.timestamp)}</span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#3A3564]" title="Unread" />
                      )}
                    </div>
                  </div>

                  {/* Message body */}
                  <p className="text-xs font-medium text-slate-600 mt-1.5">
                    {notif.message}
                  </p>

                  {/* Flow Route & Worker Badges */}
                  <div className="flex items-center gap-3 mt-2.5 flex-wrap text-[11px] font-mono text-slate-500">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 uppercase">
                      <span>{notif.sourceModule}</span>
                      {notif.targetModule && notif.targetModule !== notif.sourceModule && (
                        <>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{notif.targetModule}</span>
                        </>
                      )}
                    </span>

                    {notif.workerName && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <User className="w-3 h-3 text-[#3A3564]" />
                        <span>{notif.workerName}</span>
                      </span>
                    )}

                    {notif.status && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-black/5">
                        {notif.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
