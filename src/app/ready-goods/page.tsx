import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Boxes,
  ChevronLeft,
  PackageCheck,
  CheckCircle2,
  Tag,
  ArrowRight,
  Warehouse,
  Truck
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsModulePage() {
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
            Division 09 • Ready Goods & Packing
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Ready Goods & Carton Packing
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Final Packing
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                AQL 2.5 final inspection, barcode hangtag affixing, polybag packing, and master export carton manifest
              </p>
            </div>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Packed Cartons Today</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">142 Cartons</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">5,680 Finished Garments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">AQL 2.5 Final Score</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">PASS (0.4%)</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Critical Defect: 0 • Major: 2</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Polybag Barcode Tagged</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">100% Verified</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">EAN-13 & QR hangtags matched</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Ready in Godown</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">42,500 pcs</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Stored in Central Godown Bay 3-5</p>
          </div>
        </div>

        {/* Live Export Packing Manifests */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Live Export Carton Packing Manifest</h2>
              <p className="text-xs text-slate-500 mt-0.5">Sealed export boxes ready for container loading and delivery challans</p>
            </div>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A3564] hover:underline"
            >
              <span>Next: Central Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">CARTON #001–#060</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">SEALED & WEIGHED</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Urban Outfitters • French Terry Hoodies</h3>
              <p className="text-xs text-slate-600">40 pcs/carton • Gross Wt: 18.2 kg • Bay 3A</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">CARTON #061–#110</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">AQL CLEARED</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zara Men • Slub Henley Tees</h3>
              <p className="text-xs text-slate-600">50 pcs/carton • Gross Wt: 12.4 kg • Bay 4B</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">CARTON #111–#142</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">HANGTAG VERIFY</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pull & Bear • Cargo Bottoms</h3>
              <p className="text-xs text-slate-600">30 pcs/carton • Gross Wt: 16.5 kg • Bay 5C</p>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
