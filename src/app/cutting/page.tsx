import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Scissors,
  ChevronLeft,
  Layers,
  Ruler,
  QrCode,
  ArrowRight,
  Bot,
  Zap,
  Gauge
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CuttingModulePage() {
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
            Division 03 • Cutting & Lay Floor
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Cutting & Lay Floor
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Lay Execution
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Fabric roll lay sheets, marker efficiency, computerized auto-cutters, and bundle QR ticket generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/cutting/zigza-ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Cutting AI</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Daily Cut Volume</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">8,240 pcs</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">4 Active Cutting Tables</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Marker Efficiency</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">88.4%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Fabric utilization target &gt;86%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Bundles Issued</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">328 Bundles</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">100% QR Barcode Tagged</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Fabric Meterage Consumed</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">4,120 m</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">End-bit scrap: 1.4%</p>
          </div>
        </div>

        {/* Active Cutting Tables */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Active Cutting Tables & Lay Sheets</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live cutting lots currently on spreading tables</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/printing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A3564] hover:underline"
              >
                <span>Print Unit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/stitching-sewing/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A3564] hover:underline"
              >
                <span>Sewing Floor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">TABLE 01 • CUT-8801</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">SPREADING</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Single Jersey 180 GSM • 80 Plies</h3>
              <p className="text-xs text-slate-600">Lot: Zara Slub Crewneck • Ratio: 1:2:2:1 (S-M-L-XL)</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">TABLE 02 • CUT-8802</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">AUTO-CUTTING</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Heavy French Terry 380 GSM • 45 Plies</h3>
              <p className="text-xs text-slate-600">Lot: Oversize Hoodie • Gerber Auto-Cutter Line A</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">TABLE 03 • CUT-8803</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">QR BUNDLING</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Twill Weave 260 GSM • 60 Plies</h3>
              <p className="text-xs text-slate-600">Lot: Cargo Jogger • Lineman QR Ticket Print & Numbering</p>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
