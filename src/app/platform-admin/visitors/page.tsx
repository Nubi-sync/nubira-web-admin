'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Globe,
  MapPin,
  TrendingUp,
  Users,
  Zap,
  Activity,
  Search,
  RefreshCw,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import {
  fetchVisitorTelemetryAction,
  VisitorTelemetryResult,
  StateTrafficData,
  VisitorTimelinePoint,
  LiveVisitorLog
} from '../actions'

const SQL_MIGRATION_SNIPPET = `-- Run this in your Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.website_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Unknown',
  state TEXT NOT NULL DEFAULT 'Unknown',
  country TEXT NOT NULL DEFAULT 'India',
  device_type TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT NOT NULL DEFAULT 'Unknown',
  operating_system TEXT NOT NULL DEFAULT 'Unknown',
  referrer TEXT NOT NULL DEFAULT 'Direct',
  page_path TEXT NOT NULL DEFAULT '/',
  action TEXT NOT NULL DEFAULT 'Page Viewed',
  dwell_time_seconds INTEGER NOT NULL DEFAULT 0,
  session_id TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_website_page_views_date ON public.website_page_views(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_website_page_views_dedup ON public.website_page_views(ip_address, visit_date, device_type);
CREATE INDEX IF NOT EXISTS idx_website_page_views_state ON public.website_page_views(state);
CREATE INDEX IF NOT EXISTS idx_website_page_views_visited_at ON public.website_page_views(visited_at DESC);

ALTER TABLE public.website_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert of page views" ON public.website_page_views
  FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);

CREATE POLICY "Allow admin full access to website page views" ON public.website_page_views
  FOR ALL TO authenticated, service_role USING (true) WITH CHECK (true);`

export default function VisitorTelemetryPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('ALL')
  const [copiedSql, setCopiedSql] = useState(false)
  const [showSqlModal, setShowSqlModal] = useState(false)

  const [telemetry, setTelemetry] = useState<VisitorTelemetryResult>({
    isLiveDatabase: true,
    tableExists: true,
    totalUniqueVisitors: 0,
    totalLeads: 0,
    conversionRate: '0.00%',
    topState: 'Awaiting Traffic',
    topHub: 'All India',
    stateTraffic: [],
    timelineData: [],
    sessionLogs: []
  })

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const res = await fetchVisitorTelemetryAction(timeRange)
      setTelemetry(res)
    } catch (err) {
      console.error('[VisitorTelemetryPage] Fetch error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [timeRange])

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData(true)
  }

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_SNIPPET)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2500)
  }

  // Filter logs by search and state
  const filteredLogs = useMemo(() => {
    return telemetry.sessionLogs.filter(log => {
      const matchesSearch =
        log.ip.includes(searchQuery) ||
        log.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.path.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesState = stateFilter === 'ALL' || log.state === stateFilter
      return matchesSearch && matchesState
    })
  }, [telemetry.sessionLogs, searchQuery, stateFilter])

  // Unique list of states present in current data for the filter dropdown
  const availableStates = useMemo(() => {
    const states = new Set<string>()
    telemetry.stateTraffic.forEach(s => {
      if (s.state && s.state !== 'Unknown') states.add(s.state)
    })
    telemetry.sessionLogs.forEach(l => {
      if (l.state && l.state !== 'Unknown') states.add(l.state)
    })
    return Array.from(states).sort()
  }, [telemetry.stateTraffic, telemetry.sessionLogs])

  const maxTimelineVisitors = useMemo(() => {
    const vals = telemetry.timelineData.map(d => d.visitors)
    const max = Math.max(0, ...vals)
    return max > 0 ? max : 1
  }, [telemetry.timelineData])

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-slate-900 font-sans">
        
        {/* Layer 1: Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/platform-admin" className="hover:text-[#0B1220] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span>Platform Command</span>
          <span>/</span>
          <span className="font-bold text-[#0B1220]">Visitor Telemetry &amp; State Distribution</span>
        </div>

        {/* Database Notice if table is not created yet */}
        {!telemetry.tableExists && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Supabase Telemetry Table Pending</h4>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  The <code className="font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">website_page_views</code> table is not yet created in your Supabase database. Click to view or copy the 1-click SQL migration.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100/50 transition-all shadow-xs cursor-pointer shrink-0"
            >
              View SQL Migration
            </button>
          </div>
        )}

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              <Globe className="w-6 h-6 text-[#0B1220]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1220]">
                  Visitor Telemetry &amp; <span className="text-[#1D4ED8]">State Distribution</span>
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                  Daily Unique Deduplication
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal">
                Real-time geographic state traffic, daily unique device deduplication, and inbound lead conversion
              </p>
            </div>
          </div>

          {/* Controls: Time Switcher + Refresh Button */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setTimeRange('7D')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === '7D'
                    ? 'bg-white text-[#0B1220] shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30D')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === '30D'
                    ? 'bg-white text-[#0B1220] shadow-2xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Last 30 Days
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0B1220] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Unique Inbound Visitors */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Users className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Unique Visitors</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Daily Unique Visitors
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {isLoading ? '...' : telemetry.totalUniqueVisitors.toLocaleString()}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center">
              <span>Same IP &amp; device counted once per day</span>
            </div>
          </div>

          {/* Card 2: Demo Inquiries */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Sparkles className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Inbound Leads</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Demo Inquiries
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {isLoading ? '...' : telemetry.totalLeads}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Verified plant demo submissions
            </div>
          </div>

          {/* Card 3: Inbound Lead Conversion */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Zap className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Conversion</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lead Conversion Rate
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {isLoading ? '...' : telemetry.conversionRate}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Leads / Unique Inbound Visitors
            </div>
          </div>

          {/* Card 4: Top State Hub */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <MapPin className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">State Leader</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Top Viewing State
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 truncate">
                {isLoading ? '...' : telemetry.topState}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 truncate">
              {telemetry.topHub && telemetry.topHub !== 'All India' ? `Top City: ${telemetry.topHub}` : 'Live state routing active'}
            </div>
          </div>

        </div>

        {/* Layer 4: Analytics Graphs & Regional Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Left: Traffic Timeline (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Visitor Volume Timeline
                  </div>
                  <div className="text-lg font-bold text-[#0B1220] mt-0.5 flex items-center gap-2">
                    <span>{telemetry.totalUniqueVisitors.toLocaleString()} Unique Visitors</span>
                    <span className="text-xs text-slate-400 font-normal">
                      ({timeRange === '7D' ? 'Last 7 Days' : 'Last 30 Days'})
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
                    <span>Unique Visitors</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14C8B4]" />
                    <span>Leads</span>
                  </div>
                </div>
              </div>

              {/* Visual Bar Chart */}
              <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-100">
                {telemetry.timelineData.map((item, idx) => {
                  const heightPct = telemetry.totalUniqueVisitors > 0
                    ? Math.max(6, Math.round((item.visitors / maxTimelineVisitors) * 100))
                    : 4

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <div className="w-full flex flex-col items-center justify-end relative h-full">
                        
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                          <div className="font-bold">{item.dayFull}</div>
                          <div className="text-slate-300 font-normal">
                            {item.visitors.toLocaleString()} unique visits • {item.leads} leads
                          </div>
                        </div>

                        {/* Dual Bar (Visitors + Leads Sub-bar) */}
                        <div
                          className="w-full max-w-[32px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end transition-all"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div
                            className={`w-full transition-colors rounded-t-lg ${
                              item.visitors > 0 ? 'bg-[#1D4ED8] group-hover:bg-[#1E40AF]' : 'bg-slate-200'
                            }`}
                            style={{ height: '100%' }}
                          />
                          {item.leads > 0 && (
                            <div
                              className="w-full bg-[#14C8B4] absolute bottom-0 transition-all"
                              style={{ height: `${Math.min(100, (item.leads / Math.max(1, item.visitors)) * 100)}%` }}
                            />
                          )}
                        </div>

                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 group-hover:text-slate-900 truncate">
                        {item.date}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footnote Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center mt-2">
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Total Leads</div>
                <div className="text-base font-bold text-[#0B1220] mt-0.5">
                  {telemetry.totalLeads}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Live Database</div>
                <div className="text-base font-bold text-[#0B1220] mt-0.5">
                  {telemetry.tableExists ? 'Connected' : 'Table Pending'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Inbound Conversion</div>
                <div className="text-base font-bold text-[#1D4ED8] mt-0.5 font-mono">
                  {telemetry.conversionRate}
                </div>
              </div>
            </div>
          </div>

          {/* Right: State-Level IP Geo Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Indian States &amp; Clusters
                  </div>
                  <div className="text-lg font-bold text-[#0B1220] mt-0.5">
                    State-Wise Unique Visitors
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                  <MapPin className="w-5 h-5 text-[#0B1220]" />
                </div>
              </div>

              {/* Geographic State List */}
              {telemetry.stateTraffic.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-100 my-4">
                  <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-700">No State Traffic Recorded Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                    When visitors open your website, their state (e.g. Gujarat, Tamil Nadu, Maharashtra) will appear here ranked by unique visitor count.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                  {telemetry.stateTraffic.map((geo, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-slate-900">
                          <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                          <span className="font-bold text-[#0B1220]">{geo.state}</span>
                          {geo.cities.length > 0 && (
                            <span className="text-slate-400 font-normal">
                              ({geo.cities.join(', ')})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[11px]">
                            {geo.uniqueVisitors.toLocaleString()} unique
                          </span>
                          <span className="font-bold text-[#0B1220] font-mono">{geo.percentage}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-[#1D4ED8]'
                              : idx === 1
                              ? 'bg-[#14C8B4]'
                              : idx === 2
                              ? 'bg-slate-700'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.max(4, geo.percentage)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{geo.cities.length > 0 ? `${geo.cities.length} city nodes` : 'State-level origin'}</span>
                        <span className="text-slate-600 font-medium">
                          {geo.leadsGenerated} leads • {geo.conversionRate} conv
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Top state: <strong className="text-[#0B1220]">{telemetry.topState}</strong></span>
              <span className="text-[#1D4ED8] font-bold">100% Real Edge Telemetry</span>
            </div>
          </div>

        </div>

        {/* Layer 5: Real-Time Inbound Routing Log */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Table Header & Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Activity className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0B1220]">Real-Time Inbound Routing Log</h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                    {filteredLogs.length} Sessions Logged
                  </span>
                </div>
                <p className="text-xs text-slate-500">Live incoming visits, resolved state and city, device footprint, and page paths</p>
              </div>
            </div>

            {/* Search & State Filter */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter IP, State, Path..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                />
              </div>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer outline-none focus:border-[#0B1220]"
              >
                <option value="ALL">All States</option>
                {availableStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Visitor Node (IP)</th>
                  <th className="py-3 px-4">State &amp; City</th>
                  <th className="py-3 px-4">Device &amp; Source</th>
                  <th className="py-3 px-4">Action &amp; Page</th>
                  <th className="py-3 px-4">Dwell Time</th>
                  <th className="py-3 px-4 text-right">Session Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                      Loading live visitor telemetry...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No Live Visitor Sessions Recorded Yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Zero visits in this window. Once visitors browse your site, their sessions and state origins will stream here live.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* IP Node */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0B1220]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>{log.ip}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-4">{log.id.slice(0, 13)}...</span>
                      </td>

                      {/* State & City */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0B1220] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.state}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-5">
                          {log.city && log.city !== 'Unknown' ? log.city : 'General State Node'}
                        </span>
                      </td>

                      {/* Device & Source */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          {log.deviceType === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          ) : log.deviceType === 'tablet' ? (
                            <Tablet className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{log.device}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-5 truncate max-w-[200px]">
                          {log.source}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{log.action}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.path}</div>
                      </td>

                      {/* Dwell Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.dwellTime}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.timeAgo}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right">
                        {log.status === 'lead' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lead Converted
                          </span>
                        ) : log.status === 'trial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#1D4ED8] border border-blue-200 text-xs font-bold">
                            <Zap className="w-3 h-3 text-[#1D4ED8]" />
                            Trial Flow
                          </span>
                        ) : log.status === 'pricing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                            Pricing Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 text-xs font-semibold">
                            Browsing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing live edge session telemetry • Zero mock data</span>
            <span className="text-[11px] font-mono text-slate-400">Zero 3rd-party scripts • No cookie popups needed</span>
          </div>

        </div>

      </div>

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="font-bold text-[#0B1220] text-base">Supabase SQL Table Definition</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Run this script once in the <strong>Supabase Dashboard → SQL Editor</strong> to create the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[#0B1220]">website_page_views</code> table with RLS and state indexing.
            </p>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono max-h-60 overflow-y-auto leading-relaxed">
                {SQL_MIGRATION_SNIPPET}
              </pre>
              <button
                type="button"
                onClick={copySqlToClipboard}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformAdminShell>
  )
}
