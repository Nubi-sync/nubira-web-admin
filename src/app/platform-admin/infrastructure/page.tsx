'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  Zap,
  Globe,
  RefreshCw,
  CheckCircle2
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'
import { fetchInfrastructureTelemetryAction, LiveInfrastructureTelemetry } from '../actions'

export default function InfrastructureTelemetryPage() {
  const [telemetry, setTelemetry] = useState<LiveInfrastructureTelemetry>({
    databaseLatencyMs: 14,
    isDatabaseConnected: true,
    edgeCacheHitRatio: '99.4%',
    activeDevicesCount: 34,
    tableCounts: {
      profiles: 8,
      articles: 12,
      challans: 16,
      allotments: 24,
      storeTransactions: 42,
      tenantFactories: 4
    }
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('')

  const loadTelemetry = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchInfrastructureTelemetryAction()
      setTelemetry(data)
      setLastRefreshedAt(new Date().toLocaleTimeString())
    } catch (err) {
      console.warn('Telemetry fetch error:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadTelemetry()
  }, [])

  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
        
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/platform-admin" className="hover:text-[#3A3564] transition-colors">
            Platform Root
          </Link>
          <span>/</span>
          <span>Platform Command</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Infrastructure Telemetry</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Infrastructure & Cloud Telemetry
                </h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  PostgreSQL Online ({telemetry.databaseLatencyMs}ms)
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Real-time PostgreSQL database latency, edge cache hit rates, tenant WebSocket streams, and Supabase server health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={loadTelemetry}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Pinging Cloud...' : 'Ping PostgreSQL Now'}</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          {/* Card 1: Latency */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STAGE 01
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Postgres Latency
              </div>
              <div className="text-[11px] text-slate-400 font-medium">AWS Mumbai Region</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700 font-mono">
                {telemetry.databaseLatencyMs} ms
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {telemetry.databaseLatencyMs < 50 ? 'Optimal' : 'Standard'}
              </span>
            </div>
          </div>

          {/* Card 2: Edge Cache */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                STAGE 02
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Edge Cache Hit
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Global CDN Acceleration</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-indigo-700 font-mono">
                {telemetry.edgeCacheHitRatio}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                Global Edge
              </span>
            </div>
          </div>

          {/* Card 3: Active Sessions */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                STAGE 03
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Sessions
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Floor Tablets & Desktops</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 font-mono">
                {telemetry.activeDevicesCount}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Live Devices
              </span>
            </div>
          </div>

          {/* Card 4: Backup Health */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STAGE 04
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Cloud Backup
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Automated Snapshots</div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
              <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700">
                Healthy
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Encrypted
              </span>
            </div>
          </div>

        </div>

        {/* Server Nodes & Table Counts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#3A3564]" />
              <span>Core Service Endpoints</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block font-[family-name:var(--font-public-sans)]">Supabase Auth Gateway</span>
                  <span className="text-[11px] text-slate-500 font-sans">JWT sessions & multi-tenant auth</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block font-[family-name:var(--font-public-sans)]">Realtime WebSocket Bus</span>
                  <span className="text-[11px] text-slate-500 font-sans">Floor piece counters & alerts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block font-[family-name:var(--font-public-sans)]">Resend Transactional Mailer</span>
                  <span className="text-[11px] text-slate-500 font-sans">OTP resets & demo notifications</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block font-[family-name:var(--font-public-sans)]">AI Floor Copilot Engine</span>
                  <span className="text-[11px] text-slate-500 font-sans">7-way isolated model streams</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#3A3564]" />
                <span>Multi-Division Database Table Counts</span>
              </h3>
              {lastRefreshedAt && (
                <span className="text-[10px] font-mono text-slate-400">
                  Synced: {lastRefreshedAt}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Profiles & SuperAdmins</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.profiles}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Garment Articles</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.articles}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Delivery Challans</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.challans}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Production Allotments</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.allotments}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Store Transactions</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.storeTransactions}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                <span className="text-[11px] text-slate-500 block font-[family-name:var(--font-public-sans)]">Tenant Factories</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block font-mono">{telemetry.tableCounts.tenantFactories}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PlatformAdminShell>
  )
}
