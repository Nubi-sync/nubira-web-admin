'use client'

import Link from 'next/link'
import {
  Activity,
  ChevronLeft,
  Server,
  Database,
  ShieldCheck,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { PlatformAdminShell } from '../components/PlatformAdminShell'

export default function InfrastructureTelemetryPage() {
  return (
    <PlatformAdminShell userEmail="admin@zigza.in">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/platform-admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Platform Command</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Cloud Infrastructure & Database Telemetry
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Infrastructure & Cloud Telemetry
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                  All Systems Operational • 99.98% Uptime
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                Real-time PostgreSQL database latency, edge cache hit rates, tenant WebSocket streams, and Supabase server health
              </p>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                PostgreSQL Latency
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
              14 ms
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              AWS Mumbai (ap-south-1) Region
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Edge Cache Hit Ratio
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
              99.4%
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Global CDN edge acceleration
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Active Tenant Sessions
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              34 <span className="text-sm font-normal text-slate-500">Live Devices</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Floor tablets & web desktops
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                Automated Backup
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
              Healthy
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Last snapshot: 42 mins ago
            </p>
          </div>
        </div>

        {/* Server Nodes & Service Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#3A3564]" />
              <span>Core Service Endpoints</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Supabase Auth Gateway</span>
                  <span className="text-[10px] text-slate-500">JWT sessions & multi-tenant auth</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Realtime WebSocket Bus</span>
                  <span className="text-[10px] text-slate-500">Floor piece counters & alerts</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Resend Transactional Mailer</span>
                  <span className="text-[10px] text-slate-500">OTP resets & demo notifications</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">AI Floor Copilot Engine</span>
                  <span className="text-[10px] text-slate-500">7-way isolated model streams</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3A3564]" />
              <span>Multi-Division Database Table Counts</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Cutting Lays</span>
                <span className="text-lg font-black text-slate-900">1,248</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Fabric Rolls</span>
                <span className="text-lg font-black text-slate-900">4,890</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Bundle Barcodes</span>
                <span className="text-lg font-black text-slate-900">82,400</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Operator Wages</span>
                <span className="text-lg font-black text-slate-900">14,290</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Export Cartons</span>
                <span className="text-lg font-black text-slate-900">22,100</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                <span className="text-[10px] text-slate-500 block">Rework Tickets</span>
                <span className="text-lg font-black text-slate-900">3,120</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PlatformAdminShell>
  )
}
