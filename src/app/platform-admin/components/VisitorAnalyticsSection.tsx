'use client'

import { useState } from 'react'
import {
  Globe,
  MapPin,
  TrendingUp,
  Smartphone,
  Monitor,
  Radio,
  ExternalLink,
  Users,
  Activity,
  ArrowUpRight
} from 'lucide-react'

interface GeoLocationTraffic {
  city: string
  state: string
  region: string
  flag: string
  visitorsCount: number
  percentage: number
  leadsGenerated: number
  conversionRate: string
}

const GEO_TRAFFIC_DATA: GeoLocationTraffic[] = [
  {
    city: 'Surat',
    state: 'Gujarat',
    region: 'Western Textile Belt',
    flag: '🇮🇳',
    visitorsCount: 1420,
    percentage: 38,
    leadsGenerated: 12,
    conversionRate: '2.8%'
  },
  {
    city: 'Tirupur',
    state: 'Tamil Nadu',
    region: 'South Knitwear Hub',
    flag: '🇮🇳',
    visitorsCount: 1045,
    percentage: 28,
    leadsGenerated: 9,
    conversionRate: '3.1%'
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    region: 'Denim & Composite Mills',
    flag: '🇮🇳',
    visitorsCount: 560,
    percentage: 15,
    leadsGenerated: 4,
    conversionRate: '2.2%'
  },
  {
    city: 'Ludhiana',
    state: 'Punjab',
    region: 'North Woolen & Hosiery',
    flag: '🇮🇳',
    visitorsCount: 380,
    percentage: 10,
    leadsGenerated: 3,
    conversionRate: '2.4%'
  },
  {
    city: 'Mumbai & NCR',
    state: 'MH / DL',
    region: 'Export Houses & Buying HQ',
    flag: '🇮🇳',
    visitorsCount: 335,
    percentage: 9,
    leadsGenerated: 2,
    conversionRate: '1.9%'
  }
]

const TIMELINE_DATA_7D = [
  { date: 'Mon', visitors: 480, formOpens: 62, leads: 4 },
  { date: 'Tue', visitors: 540, formOpens: 78, leads: 6 },
  { date: 'Wed', visitors: 610, formOpens: 95, leads: 7 },
  { date: 'Thu', visitors: 590, formOpens: 84, leads: 5 },
  { date: 'Fri', visitors: 680, formOpens: 110, leads: 9 },
  { date: 'Sat', visitors: 420, formOpens: 51, leads: 3 },
  { date: 'Sun', visitors: 390, formOpens: 44, leads: 2 }
]

const LIVE_VISITOR_SESSIONS = [
  { ip: '103.24.12.89', city: 'Surat, Gujarat', device: 'Android Mobile', source: 'WhatsApp Campaign', action: 'Viewed 12-Division MES Breakdown', time: '2 mins ago' },
  { ip: '49.36.178.44', city: 'Tirupur, Tamil Nadu', device: 'Windows Desktop', source: 'Google Search', action: 'Submitted Demo Request Form', time: '14 mins ago' },
  { ip: '157.34.88.19', city: 'Ahmedabad, Gujarat', device: 'iOS Safari', source: 'Direct / QR Code', action: 'Read Production Order Telemetry', time: '28 mins ago' },
  { ip: '122.161.45.10', city: 'Ludhiana, Punjab', device: 'Windows Desktop', source: 'Industry Referral', action: 'Clicked Try Free 7-Day Trial', time: '41 mins ago' }
]

export function VisitorAnalyticsSection() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D')
  const maxVisitors = Math.max(...TIMELINE_DATA_7D.map(d => d.visitors))

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#0B1220] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#1D4ED8]" />
              <span>Visitor Telemetry &amp; IP Geo-Distribution</span>
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Geographic visitor origins, industrial apparel hubs, and lead conversion rates
          </p>
        </div>

        {/* Time Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeRange('7D')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeRange === '7D' ? 'bg-white text-[#0B1220] shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30D')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              timeRange === '30D' ? 'bg-white text-[#0B1220] shadow-2xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns (Left: Traffic Timeline Graph, Right: Top Geo Manufacturing Clusters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Card: Inbound Traffic & Lead Trend Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Visitor Volume &amp; Form Intent
                </div>
                <div className="text-lg font-bold text-[#0B1220] mt-0.5 flex items-center gap-2">
                  <span>3,710 Unique Sessions</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +18.4%
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                  <span>Visitors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14C8B4]" />
                  <span>Leads</span>
                </div>
              </div>
            </div>

            {/* Visual SVG & Bar Chart */}
            <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
              {TIMELINE_DATA_7D.map((item, idx) => {
                const heightPct = Math.round((item.visitors / maxVisitors) * 100)
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <div className="w-full flex flex-col items-center justify-end relative h-full">
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-10">
                        {item.visitors} visits • {item.leads} leads
                      </div>

                      {/* Dual Bar (Visitors + Leads Highlight) */}
                      <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                        <div
                          className="w-full bg-[#1D4ED8] group-hover:bg-[#1E40AF] transition-colors rounded-t-lg"
                          style={{ height: '100%' }}
                        />
                        <div
                          className="w-full bg-[#14C8B4] absolute bottom-0"
                          style={{ height: `${(item.leads / 10) * 100}%` }}
                        />
                      </div>

                    </div>
                    <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900">
                      {item.date}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats Footnote */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-center mt-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Live Form Opens</div>
              <div className="text-base font-bold text-[#0B1220] mt-0.5">529 (14.2%)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Avg Dwell Time</div>
              <div className="text-base font-bold text-[#0B1220] mt-0.5">3m 42s</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Lead Conversion</div>
              <div className="text-base font-bold text-emerald-600 mt-0.5 font-mono">2.68%</div>
            </div>
          </div>
        </div>

        {/* Right Card: Top Manufacturing Hubs by IP (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Top Industrial Hubs
                </div>
                <div className="text-lg font-bold text-[#0B1220] mt-0.5">
                  IP Geo Breakdown
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <MapPin className="w-4 h-4 text-[#0B1220]" />
              </div>
            </div>

            {/* List of Geographic Clusters */}
            <div className="space-y-3.5">
              {GEO_TRAFFIC_DATA.map((geo, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <span>{geo.flag}</span>
                      <span className="font-bold">{geo.city}</span>
                      <span className="text-slate-400 font-normal">({geo.state})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">{geo.visitorsCount.toLocaleString()} visits</span>
                      <span className="font-bold text-[#0B1220]">{geo.percentage}%</span>
                    </div>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-[#1D4ED8]' : idx === 1 ? 'bg-[#14C8B4]' : 'bg-slate-400'
                      }`}
                      style={{ width: `${geo.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Primary market: <strong>Surat + Tirupur (66%)</strong></span>
            <span className="text-[#1D4ED8] font-bold">100% Inbound Clean</span>
          </div>
        </div>

      </div>

      {/* Layer: Live Real-Time Telemetry Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Activity className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1220]">Live Inbound Traffic Stream</h3>
              <p className="text-xs text-slate-500">Real-time visitor IP routing, device telemetry, and floor interest</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">Auto-refreshing via Supabase Stream</span>
        </div>

        <div className="divide-y divide-slate-100">
          {LIVE_VISITOR_SESSIONS.map((sess, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono">{sess.ip}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-semibold">{sess.city}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Action: <strong className="text-slate-800 font-medium">{sess.action}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-500 self-end sm:self-auto font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-sans text-slate-700 font-medium">
                  {sess.device}
                </span>
                <span className="hidden md:inline-block text-slate-400">{sess.source}</span>
                <span className="text-slate-400 whitespace-nowrap">{sess.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
