import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Flame,
  ChevronLeft,
  Thermometer,
  Sparkles,
  ArrowRight,
  Gauge,
  CheckCircle2,
  Boxes
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function IronModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Workspace Hub</span>
          </Link>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 08 • Ironing & Steam Pressing
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Ironing & Steam Pressing Floor
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Finishing Unit
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Industrial boiler steam pressing, vacuum buck tables, inline finish inspections, and operator piece-rate tracking
              </p>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Daily Pressed Volume</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">6,180 pcs</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Target: 7,500 pcs/shift</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Boiler Steam Pressure</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">4.5 Bar</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Optimal steam delivery: 4.2–4.8 Bar</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Pressing Tables</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">12 Tables</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Vacuum extraction active on all lines</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Finishing QC Pass</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">99.1%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Zero shine / glaze defects reported</p>
          </div>
        </div>

        {/* Live Ironing Table Batches */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Live Pressing Lines & Finished Batches</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time table throughput and handover to ready goods packing</p>
            </div>
            <Link
              href="/ready-goods"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A3564] hover:underline"
            >
              <span>Next: Ready Goods Packing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PRESS-LINE A</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">2,400 PCS DONE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Heavyweight Loopback Hoodies</h3>
              <p className="text-xs text-slate-600">Operator: Shift 1 Team • Temp: 160°C • Steam Vacuum Mode</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PRESS-LINE B</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">1,850 PCS DONE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Mercerized Interlock Polos</h3>
              <p className="text-xs text-slate-600">Operator: Shift 1 Team • Temp: 145°C • Teflon Shoe Plate</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PRESS-LINE C</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">1,930 PCS DONE</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cargo Jogger Bottoms</h3>
              <p className="text-xs text-slate-600">Operator: Shift 1 Team • Temp: 175°C • Crease Formation</p>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
