'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Info
} from 'lucide-react'
import { IndianStateVectorMap } from './IndianStateVectorMap'
import { recordLoginLocationAction } from '../actions'

interface LiveGeo {
  state: string
  city: string
  latitude?: number
  longitude?: number
}

const GEO_SESSION_KEY = 'zigza:live-geo:v1'

function parseUserAgent(ua: string) {
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  const os = /Windows/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux' : 'OS'
  const deviceType: 'desktop' | 'mobile' | 'tablet' = /iPad|Tablet/.test(ua) ? 'tablet'
    : /Mobi|Android|iPhone/.test(ua) ? 'mobile' : 'desktop'
  return { browser, os, deviceType }
}

export interface LoginHourSlot {
  hour: number // 0-23
  label: string // '12-01 AM', '01-02 AM', ..., '11-12 PM'
  count: number
  isActive: boolean
  lastActiveAt?: string
  deviceInfo?: string
  ipAddress?: string
  city?: string
  state?: string
}

export interface LoginDayActivity {
  date: string // 'YYYY-MM-DD'
  dayName: string // 'Mon', 'Tue', ...
  formattedDate: string // '06'
  fullDateLabel: string // 'Oct 06, 2026'
  isToday: boolean
  totalLogins: number
  hourlySlots: LoginHourSlot[]
}

export interface OwnerGeoLocation {
  state: string
  stateCode: string
  city: string
  ipAddress: string
  isp?: string
  country: string
  lastLoginAt: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  isCurrentlyActive: boolean
}

export interface OwnerLoginActivityData {
  days: LoginDayActivity[]
  currentLocation: OwnerGeoLocation
  totalSessionsPast7Days: number
  peakHour: string
  activeDaysCount: number
}

interface OwnerLoginActivitySectionProps {
  activityData: OwnerLoginActivityData
}

export function OwnerLoginActivitySection({ activityData }: OwnerLoginActivitySectionProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{
    day: LoginDayActivity
    slot: LoginHourSlot
  } | null>(null)

  const { days: serverDays, currentLocation, totalSessionsPast7Days, peakHour, activeDaysCount } = activityData

  // Live location of the person viewing the dashboard (from their own IP)
  const [liveGeo, setLiveGeo] = useState<LiveGeo | null>(null)
  const [isDetecting, setIsDetecting] = useState(true)
  const [recordedNow, setRecordedNow] = useState(false)

  useEffect(() => {
    let cancelled = false

    const finish = (g: LiveGeo | null) => {
      if (cancelled) return
      setLiveGeo(g)
      setIsDetecting(false)
    }

    try {
      const cached = sessionStorage.getItem(GEO_SESSION_KEY)
      if (cached) {
        const g = JSON.parse(cached) as LiveGeo & { ip?: string; country?: string }
        finish(g)
        const ua = parseUserAgent(navigator.userAgent)
        recordLoginLocationAction({ ...g, ...ua }).then(r => { if (!cancelled && r.success) setRecordedNow(true) })
        return () => { cancelled = true }
      }
    } catch (_) {}

    fetch('https://get.geojs.io/v1/ip/geo.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        const g = {
          state: String(j.region || ''),
          city: String(j.city || ''),
          latitude: j.latitude ? Number(j.latitude) : undefined,
          longitude: j.longitude ? Number(j.longitude) : undefined,
          ip: String(j.ip || ''),
          country: String(j.country || '')
        }
        if (!g.state) { finish(null); return }
        try { sessionStorage.setItem(GEO_SESSION_KEY, JSON.stringify(g)) } catch (_) {}
        finish(g)
        const ua = parseUserAgent(navigator.userAgent)
        recordLoginLocationAction({ ...g, ...ua }).then(r => { if (!cancelled && r.success) setRecordedNow(true) })
      })
      .catch(() => finish(null))

    return () => { cancelled = true }
  }, [])

  // Reflect the just-recorded session in today's current hour without waiting for cache refresh
  const days = useMemo(() => {
    if (!recordedNow) return serverDays
    const h = new Date().getHours()
    return serverDays.map(d => {
      if (!d.isToday || d.hourlySlots[h]?.isActive) return d
      const slots = d.hourlySlots.map(s => s.hour === h ? { ...s, isActive: true, count: Math.max(1, s.count) } : s)
      return { ...d, totalLogins: d.totalLogins + 1, hourlySlots: slots }
    })
  }, [serverDays, recordedNow])

  const mapState = liveGeo?.state || (!isDetecting ? currentLocation.state : '')
  const mapCity = liveGeo?.city || (!isDetecting ? currentLocation.city : '')

  // 24 Hour Labels (Rows) with unique labels across all 24 slots
  const hourLabels = [
    '12-01 AM', '01-02 AM', '02-03 AM', '03-04 AM', '04-05 AM', '05-06 AM',
    '06-07 AM', '07-08 AM', '08-09 AM', '09-10 AM', '10-11 AM', '11-12 AM',
    '12-01 PM', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM', '05-06 PM',
    '06-07 PM', '07-08 PM', '08-09 PM', '09-10 PM', '10-11 PM', '11-12 PM'
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-5 transition-all">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Clock className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0B1220] tracking-tight font-[family-name:var(--font-heading)]">
                Portal Usage &amp; <span className="text-[#1D4ED8]">Login Location</span>
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/10 shadow-2xs">
                Past 7 Days
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Weekly login hours and where you are signed in from right now.
            </p>
          </div>
        </div>

        {/* Simple Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Heatmap (Left / 7 cols) + State Map (Right / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT: 24x7 HOURLY LOGIN MATRIX */}
        <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 overflow-x-auto">
          
          <div className="min-w-[340px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 gap-1.5 pb-2 text-center border-b border-slate-200 mb-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 text-left pl-1">
                TIME
              </div>
              {days.map((d) => (
                <div key={d.date} className="flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                    {d.dayName}
                  </span>
                  <span className={`text-xs font-mono font-black ${
                    d.isToday ? 'text-cyan-800 bg-cyan-50 px-1.5 py-0.5 rounded-md border border-cyan-200' : 'text-slate-700'
                  }`}>
                    {d.formattedDate}
                  </span>
                </div>
              ))}
            </div>

            {/* 24 Hourly Rows */}
            <div className="space-y-1">
              {hourLabels.map((hourLabel, hourIdx) => (
                <div key={`hour-row-${hourIdx}`} className="grid grid-cols-8 gap-1.5 items-center">
                  
                  {/* Row Time Label */}
                  <div className="text-[9px] sm:text-[10px] font-mono font-medium text-slate-500 text-left pl-0.5 truncate select-none">
                    {hourLabel}
                  </div>

                  {/* 7 Day Slots */}
                  {days.map((day) => {
                    const slot = day.hourlySlots[hourIdx] || {
                      hour: hourIdx,
                      label: hourLabel,
                      count: 0,
                      isActive: false
                    }

                    return (
                      <div
                        key={`slot-${day.date}-${hourIdx}`}
                        onMouseEnter={() => setHoveredSlot({ day, slot })}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`h-3.5 sm:h-4 w-full rounded-md transition-all duration-150 cursor-pointer ${
                          slot.isActive
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-2xs scale-[1.02]'
                            : 'bg-slate-200/70 hover:bg-slate-300 border border-slate-200/60'
                        }`}
                        title={`${day.fullDateLabel} (${hourLabel}): ${slot.isActive ? `${slot.count} Active Session(s)` : 'No Logins'}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Simple Tooltip Bar */}
            <div className="mt-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between text-slate-700 shadow-2xs min-h-[42px]">
              {hoveredSlot ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">
                    {hoveredSlot.day.fullDateLabel} ({hoveredSlot.slot.label}):
                  </span>
                  {hoveredSlot.slot.isActive ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active ({hoveredSlot.slot.count} {hoveredSlot.slot.count === 1 ? 'login' : 'logins'})
                    </span>
                  ) : (
                    <span className="text-slate-400">No login during this hour</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hover over any hour slot to check login time.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: STATE VECTOR MAP & STATS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Specific Indian State Vector Component */}
          <IndianStateVectorMap
            stateName={mapState}
            cityName={mapCity}
            latitude={liveGeo?.latitude}
            longitude={liveGeo?.longitude}
            isDetecting={isDetecting}
            className="w-full"
          />

          {/* 2 Simple Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Stat 1: Total Logins */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Past 7 Days
              </span>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {totalSessionsPast7Days} Logins
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                Active on {activeDaysCount} {activeDaysCount === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* Stat 2: Peak Time */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Most Active Time
              </span>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5 truncate">
                {peakHour || '07:00 PM - 08:00 PM'}
              </div>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block truncate">
                Shift usage window
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
