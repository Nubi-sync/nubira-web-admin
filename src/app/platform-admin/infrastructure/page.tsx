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
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Infrastructure & Cloud Telemetry
                </h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10">
                  Database Active ({telemetry.databaseLatencyMs}ms)
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
                Database latency, edge cache hit rates, tenant WebSocket streams, and Supabase server health
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={loadTelemetry}
              disabled={isRefreshing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-[#3A3564] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Pinging Cloud...' : 'Ping Database Now'}</span>
            </button>
          </div>
        </div>

        {/* Layer 3: Executive KPI Metric Cards (Grid of 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Latency */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Network</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Postgres Latency
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
                {telemetry.databaseLatencyMs} ms
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              AWS Mumbai region
            </div>
          </div>

          {/* Card 2: Edge Cache */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Cache</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Edge Cache Hit
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
                {telemetry.edgeCacheHitRatio}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Global CDN acceleration
            </div>
          </div>

          {/* Card 3: Active Sessions */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Devices</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Sessions
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
                {telemetry.activeDevicesCount}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Floor tablets & workstations
            </div>
          </div>

          {/* Card 4: Backup Health */}
          <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Backups</span>
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cloud Backup
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1">
                Healthy
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
              Automated encrypted snapshots
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

            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block font-[family-name:var(--font-public-sans)]">Supabase Auth Gateway</span>
                  <span className="text-xs text-slate-500">JWT sessions & multi-tenant auth</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">Operational</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block font-[family-name:var(--font-public-sans)]">Realtime WebSocket Bus</span>
                  <span className="text-xs text-slate-500">Floor piece counters & alerts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">Operational</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block font-[family-name:var(--font-public-sans)]">Resend Transactional Mailer</span>
                  <span className="text-xs text-slate-500">OTP resets & demo notifications</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">Operational</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 block font-[family-name:var(--font-public-sans)]">AI Floor Copilot Engine</span>
                  <span className="text-xs text-slate-500">Isolated model streams</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">Operational</span>
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
