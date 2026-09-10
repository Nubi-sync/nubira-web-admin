import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Factory,
  ChevronLeft,
  Activity,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  Workflow
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FactoryModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Workspace Hub</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Plant Unit 1 Master Control
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Factory Control Center
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider">
                  Plant Grid Active
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Central telemetry, Overall Equipment Efficiency (OEE), and cross-department throughput
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/stitching-sewing/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>Sewing Operations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Overall Plant OEE</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">89.4%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Optimal manufacturing capacity</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Lines</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Workflow className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">12 / 12</div>
            <p className="text-xs font-semibold text-emerald-600 mt-1">100% Floor uptime recorded</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Power & Utilities</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">Stable</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Grid connected • Genset Standby</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Factory Shift</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">Shift A</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">08:00 AM - 05:30 PM (Regular)</p>
          </div>
        </div>

        {/* Manufacturing Units Status Grid */}
        <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Department Status Overview</h2>
            <span className="text-xs font-mono font-bold text-slate-500">6 Connected Units</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/stitching-sewing/dashboard"
              className="p-4 rounded-xl border border-[#3A3564]/30 bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 text-sm">Stitching & Sewing Floor</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">LIVE</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Active bundle allotments, worker rates, and QC stations.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-[#3A3564] flex items-center gap-1">Open Floor Ops <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link
              href="/washing"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F0]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 text-sm">Industrial Washing</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">STANDBY</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Garment enzyme wash, silicon softeners, liquor ratios.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-[#3A3564] flex items-center gap-1">View Department <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>

            <Link
              href="/printing"
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF7F0]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-slate-900 text-sm">Screen & Digital Printing</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">STANDBY</span>
                </div>
                <p className="text-xs font-semibold text-slate-600">Rotary screen tables, DTG printing, strike-off color checks.</p>
              </div>
              <span className="mt-3 text-xs font-bold text-[#3A3564] flex items-center gap-1">View Department <ArrowRight className="w-3.5 h-3.5" /></span>
            </Link>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
