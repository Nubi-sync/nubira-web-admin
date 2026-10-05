'use client'

import { useState, useMemo } from 'react'
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
  Building2,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'

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

interface TimelineDataPoint {
  date: string
  dayFull: string
  visitors: number
  formOpens: number
  leads: number
}

interface LiveSessionLog {
  id: string
  ip: string
  city: string
  state: string
  device: string
  deviceType: 'mobile' | 'desktop'
  source: string
  action: string
  path: string
  dwellTime: string
  timeAgo: string
  status: 'lead' | 'exploring' | 'pricing' | 'trial'
}

const GEO_TRAFFIC_DATA_7D: GeoLocationTraffic[] = [
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

const GEO_TRAFFIC_DATA_30D: GeoLocationTraffic[] = [
  {
    city: 'Surat',
    state: 'Gujarat',
    region: 'Western Textile Belt',
    flag: '🇮🇳',
    visitorsCount: 5840,
    percentage: 39,
    leadsGenerated: 48,
    conversionRate: '2.9%'
  },
  {
    city: 'Tirupur',
    state: 'Tamil Nadu',
    region: 'South Knitwear Hub',
    flag: '🇮🇳',
    visitorsCount: 4120,
    percentage: 27,
    leadsGenerated: 38,
    conversionRate: '3.2%'
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    region: 'Denim & Composite Mills',
    flag: '🇮🇳',
    visitorsCount: 2280,
    percentage: 15,
    leadsGenerated: 18,
    conversionRate: '2.3%'
  },
  {
    city: 'Ludhiana',
    state: 'Punjab',
    region: 'North Woolen & Hosiery',
    flag: '🇮🇳',
    visitorsCount: 1510,
    percentage: 10,
    leadsGenerated: 12,
    conversionRate: '2.5%'
  },
  {
    city: 'Mumbai & NCR',
    state: 'MH / DL',
    region: 'Export Houses & Buying HQ',
    flag: '🇮🇳',
    visitorsCount: 1350,
    percentage: 9,
    leadsGenerated: 10,
    conversionRate: '2.0%'
  }
]

const TIMELINE_DATA_7D: TimelineDataPoint[] = [
  { date: 'Mon', dayFull: 'Monday', visitors: 480, formOpens: 62, leads: 4 },
  { date: 'Tue', dayFull: 'Tuesday', visitors: 540, formOpens: 78, leads: 6 },
  { date: 'Wed', dayFull: 'Wednesday', visitors: 610, formOpens: 95, leads: 7 },
  { date: 'Thu', dayFull: 'Thursday', visitors: 590, formOpens: 84, leads: 5 },
  { date: 'Fri', dayFull: 'Friday', visitors: 680, formOpens: 110, leads: 9 },
  { date: 'Sat', dayFull: 'Saturday', visitors: 420, formOpens: 51, leads: 3 },
  { date: 'Sun', dayFull: 'Sunday', visitors: 390, formOpens: 44, leads: 2 }
]

const TIMELINE_DATA_30D: TimelineDataPoint[] = [
  { date: 'Week 1', dayFull: 'Days 1-7', visitors: 3420, formOpens: 440, leads: 28 },
  { date: 'Week 2', dayFull: 'Days 8-14', visitors: 3790, formOpens: 495, leads: 34 },
  { date: 'Week 3', dayFull: 'Days 15-21', visitors: 3940, formOpens: 520, leads: 36 },
  { date: 'Week 4', dayFull: 'Days 22-30', visitors: 3950, formOpens: 535, leads: 28 }
]

const LIVE_SESSION_LOGS: LiveSessionLog[] = [
  {
    id: 'SES-9821',
    ip: '103.24.12.89',
    city: 'Surat',
    state: 'Gujarat',
    device: 'Android Mobile (Chrome 128)',
    deviceType: 'mobile',
    source: 'WhatsApp Campaign Link',
    action: 'Explored 12-Division MES Matrix',
    path: '/#features',
    dwellTime: '4m 18s',
    timeAgo: '2 mins ago',
    status: 'exploring'
  },
  {
    id: 'SES-9820',
    ip: '49.36.178.44',
    city: 'Tirupur',
    state: 'Tamil Nadu',
    device: 'Windows 11 (Edge 126)',
    deviceType: 'desktop',
    source: 'Google Organic Search ("garment mes india")',
    action: 'Submitted Demo Request Form',
    path: '/#request-demo',
    dwellTime: '6m 45s',
    timeAgo: '14 mins ago',
    status: 'lead'
  },
  {
    id: 'SES-9819',
    ip: '157.34.88.19',
    city: 'Ahmedabad',
    state: 'Gujarat',
    device: 'iPhone 15 Pro (Safari 17)',
    deviceType: 'mobile',
    source: 'Direct URL / QR Pamphlet',
    action: 'Reviewed Enterprise Pricing & Add-ons',
    path: '/#pricing',
    dwellTime: '3m 12s',
    timeAgo: '28 mins ago',
    status: 'pricing'
  },
  {
    id: 'SES-9818',
    ip: '122.161.45.10',
    city: 'Ludhiana',
    state: 'Punjab',
    device: 'Windows 10 (Chrome 127)',
    deviceType: 'desktop',
    source: 'Industry Referral Link',
    action: 'Triggered 7-Day Free Trial Flow',
    path: '/register',
    dwellTime: '5m 02s',
    timeAgo: '41 mins ago',
    status: 'trial'
  },
  {
    id: 'SES-9817',
    ip: '103.88.232.14',
    city: 'Surat',
    state: 'Gujarat',
    device: 'Android Mobile (Samsung Internet)',
    deviceType: 'mobile',
    source: 'WhatsApp Catalog Share',
    action: 'Inspected Cutting & Sewing Floor Telemetry',
    path: '/#divisions',
    dwellTime: '2m 54s',
    timeAgo: '53 mins ago',
    status: 'exploring'
  },
  {
    id: 'SES-9816',
    ip: '182.73.19.62',
    city: 'Mumbai & NCR',
    state: 'Maharashtra',
    device: 'macOS Sonoma (Chrome 128)',
    deviceType: 'desktop',
    source: 'LinkedIn Sourcing Post',
    action: 'Reviewed Multi-Tenant Security & Supabase Specs',
    path: '/#security',
    dwellTime: '7m 10s',
    timeAgo: '1h 12m ago',
    status: 'exploring'
  }
]

export default function VisitorTelemetryPage() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('ALL')

  const activeGeoData = timeRange === '7D' ? GEO_TRAFFIC_DATA_7D : GEO_TRAFFIC_DATA_30D
  const activeTimelineData = timeRange === '7D' ? TIMELINE_DATA_7D : TIMELINE_DATA_30D
  
  const totalVisitors = useMemo(() => {
    return activeGeoData.reduce((acc, g) => acc + g.visitorsCount, 0)
  }, [activeGeoData])

  const totalLeads = useMemo(() => {
    return activeGeoData.reduce((acc, g) => acc + g.leadsGenerated, 0)
  }, [activeGeoData])

  const maxTimelineVisitors = Math.max(...activeTimelineData.map(d => d.visitors))

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  const filteredLogs = LIVE_SESSION_LOGS.filter(log => {
    const matchesSearch =
      log.ip.includes(searchQuery) ||
      log.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCity = cityFilter === 'ALL' || log.city === cityFilter
    return matchesSearch && matchesCity
  })

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
          <span className="font-bold text-[#0B1220]">Visitor Telemetry &amp; Geo</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              <Globe className="w-6 h-6 text-[#0B1220]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1220]">
                  Visitor Telemetry &amp; <span className="text-[#1D4ED8]">Geo Distribution</span>
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
                  Realtime Edge Telemetry
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-normal">
                Geographic visitor origins, industrial apparel clusters, dwell sessions, and lead conversion rates
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
              <span className="text-xs text-slate-500 font-medium">Unique Traffic</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Inbound Visits
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {totalVisitors.toLocaleString()}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>+18.4% WoW growth</span>
            </div>
          </div>

          {/* Card 2: Form Intent Open Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Sparkles className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Demo Intent</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Form Opens
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {timeRange === '7D' ? '529' : '2,090'}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              14.2% interactive rate
            </div>
          </div>

          {/* Card 3: Inbound Lead Conversion */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <Zap className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Conversion</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Inbound Conversion
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 font-mono">
                {totalLeads} Leads ({timeRange === '7D' ? '2.68%' : '2.74%'})
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Prospective plant inquiries
            </div>
          </div>

          {/* Card 4: Top Industrial Hub */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                <MapPin className="w-5 h-5 text-[#0B1220]" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Cluster Leader</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Top Manufacturing Hub
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0B1220] mt-1 truncate">
                Surat &amp; Tirupur
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              66% of all garment inquiries
            </div>
          </div>

        </div>

        {/* Layer 4: Analytics Graphs & Regional Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          
          {/* Left: Traffic Timeline & Lead Conversion Trend (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Visitor Volume &amp; Form Intent Timeline
                  </div>
                  <div className="text-lg font-bold text-[#0B1220] mt-0.5 flex items-center gap-2">
                    <span>{totalVisitors.toLocaleString()} Total Sessions</span>
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

              {/* Visual Bar Chart */}
              <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
                {activeTimelineData.map((item, idx) => {
                  const heightPct = Math.round((item.visitors / maxTimelineVisitors) * 100)
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <div className="w-full flex flex-col items-center justify-end relative h-full">
                        
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-10">
                          <div className="font-bold">{item.dayFull}</div>
                          <div className="text-slate-300 font-normal">
                            {item.visitors.toLocaleString()} visits • {item.leads} leads
                          </div>
                        </div>

                        {/* Dual Bar (Visitors + Leads Sub-bar) */}
                        <div
                          className="w-full max-w-[32px] bg-slate-100 rounded-t-lg relative overflow-hidden flex flex-col justify-end transition-all"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div
                            className="w-full bg-[#1D4ED8] group-hover:bg-[#1E40AF] transition-colors rounded-t-lg"
                            style={{ height: '100%' }}
                          />
                          <div
                            className="w-full bg-[#14C8B4] absolute bottom-0 transition-all"
                            style={{ height: `${Math.min(100, (item.leads / (timeRange === '7D' ? 10 : 40)) * 100)}%` }}
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

            {/* Performance Footnote Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 text-center mt-2">
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Live Form Opens</div>
                <div className="text-base font-bold text-[#0B1220] mt-0.5">
                  {timeRange === '7D' ? '529 (14.2%)' : '2,090 (13.8%)'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Avg Dwell Time</div>
                <div className="text-base font-bold text-[#0B1220] mt-0.5">3m 42s</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30">
                <div className="text-[11px] font-medium text-slate-500">Lead Conversion</div>
                <div className="text-base font-bold text-[#1D4ED8] mt-0.5 font-mono">
                  {timeRange === '7D' ? '2.68%' : '2.74%'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: IP Geo Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Industrial Apparel Hubs
                  </div>
                  <div className="text-lg font-bold text-[#0B1220] mt-0.5">
                    IP Geo-Distribution
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220]">
                  <MapPin className="w-5 h-5 text-[#0B1220]" />
                </div>
              </div>

              {/* Geographic Cluster Bars */}
              <div className="space-y-4">
                {activeGeoData.map((geo, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-900">
                        <span>{geo.flag}</span>
                        <span className="font-bold text-[#0B1220]">{geo.city}</span>
                        <span className="text-slate-400 font-normal">({geo.state})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">
                          {geo.visitorsCount.toLocaleString()} visits
                        </span>
                        <span className="font-bold text-[#0B1220] font-mono">{geo.percentage}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
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
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{geo.region}</span>
                      <span className="text-slate-600 font-medium">
                        {geo.leadsGenerated} leads • {geo.conversionRate} conv
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Primary market: <strong className="text-[#0B1220]">Surat + Tirupur (66%)</strong></span>
              <span className="text-[#1D4ED8] font-bold">100% Inbound Clean</span>
            </div>
          </div>

        </div>

        {/* Layer 5: Real-Time Inbound Routing & Edge Telemetry Log */}
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
                    {filteredLogs.length} Live Sessions
                  </span>
                </div>
                <p className="text-xs text-slate-500">Edge-routed visitor sessions, garment hub identification, and action trails</p>
              </div>
            </div>

            {/* Search & City Filter */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter IP, City, action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 outline-none transition-all"
                />
              </div>

              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer outline-none focus:border-[#0B1220]"
              >
                <option value="ALL">All Hubs</option>
                <option value="Surat">Surat</option>
                <option value="Tirupur">Tirupur</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Ludhiana">Ludhiana</option>
                <option value="Mumbai & NCR">Mumbai &amp; NCR</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Visitor Node (IP)</th>
                  <th className="py-3 px-4">Garment Hub</th>
                  <th className="py-3 px-4">Device &amp; Entry Source</th>
                  <th className="py-3 px-4">Action &amp; Section Visited</th>
                  <th className="py-3 px-4">Dwell Time</th>
                  <th className="py-3 px-4 text-right">Session Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching visitor sessions found for the given search criteria.
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
                        <span className="text-[10px] text-slate-400 block ml-4">{log.id}</span>
                      </td>

                      {/* Hub & State */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0B1220] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.city}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block ml-5">{log.state}</span>
                      </td>

                      {/* Device & Source */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          {log.deviceType === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
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
                            Trial Started
                          </span>
                        ) : log.status === 'pricing' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                            Pricing Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 text-xs font-semibold">
                            Active Exploring
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
            <span>Showing live edge session telemetry</span>
            <span className="text-[11px] font-mono text-slate-400">Zero 3rd-party tracking scripts • Privacy Compliant</span>
          </div>

        </div>

      </div>
    </PlatformAdminShell>
  )
}
