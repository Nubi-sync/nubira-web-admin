import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import Link from 'next/link'
import {
  Briefcase,
  ChevronLeft,
  DollarSign,
  Package,
  Calendar,
  ArrowRight,
  Bot,
  Truck,
  CheckCircle2
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MerchandisingModulePage() {
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
            Division 02 • Merchandising & Sourcing
          </span>
        </div>

        {/* Module Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  Merchandising & Sourcing Desk
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Commercial Ops
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Buyer PO contracts, BOM costing ledgers, trim allocation, and FOB/CIF shipment schedules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/merchandising/zigza-ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Merchandising AI</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Buyer POs</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">14 Orders</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Booked: 185,000 pcs</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">BOM Costing Realization</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">98.2%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Cost variance within ±1.8%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Trim Procurement</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">100% In-House</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">Zippers, labels, thread synced</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">On-Time Shipment (OTD)</span>
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">97.8%</div>
            <p className="text-xs font-semibold text-slate-500 mt-1">3 Shipments departing this week</p>
          </div>
        </div>

        {/* Active Buyer Contracts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Running Buyer Contracts & Milestones</h2>
              <p className="text-xs text-slate-500 mt-0.5">Critical path tracking across confirmed purchase orders</p>
            </div>
            <Link
              href="/cutting"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A3564] hover:underline"
            >
              <span>Next: Cutting Lay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PO-ZIG-8901</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">SEWING 85%</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Urban Outfitters • 24,000 pcs</h3>
              <p className="text-xs text-slate-600">Style: Vintage Boxy Crewneck • ETD: 18-Sep-2026</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PO-ZIG-8905</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">CUTTING 100%</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Zara Men • 36,000 pcs</h3>
              <p className="text-xs text-slate-600">Style: Slub Knit Henley • ETD: 24-Sep-2026</p>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">PO-ZIG-8910</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">TRIM READY</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pull & Bear • 18,500 pcs</h3>
              <p className="text-xs text-slate-600">Style: Heavy Washed Cargo Pant • ETD: 02-Oct-2026</p>
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
