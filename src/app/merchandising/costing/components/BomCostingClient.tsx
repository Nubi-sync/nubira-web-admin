'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calculator, 
  Plus, 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react'
import { BomCosting } from '../../types/merchandising'
import { getBomCostings, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateCostingModal } from './CreateCostingModal'

export function BomCostingClient() {
  const [costings, setCostings] = useState<BomCosting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setCostings(getBomCostings())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

  const filteredCostings = costings.filter(c => 
    c.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.style_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const alertCostingsCount = costings.filter(c => c.variance_percent > 2.0).length

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#09090b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#FAF7F0]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/merchandising"
              className="p-2 rounded-xl bg-white border border-black/10 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
                  Division 02 • Financial Ledger
                </span>
                <span className="text-xs text-slate-500 font-medium">Standard Garment Costing Engine</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
                BOM & Pre/Post-Costing Ledgers
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Costing Sheet
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Industry Formula Alert Banner */}
        <div className="p-4 rounded-2xl bg-white border border-black/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3A3564]/5 text-[#3A3564] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Garment Cost Realization Model</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Total FOB Cost = Fabric + Trims + Print/Embellish + CMT + Wash + Pack + 12% Factory Overhead
              </div>
            </div>
          </div>

          {alertCostingsCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{alertCostingsCount} Style(s) exceeding &gt; 2.0% variance threshold</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by PO Number or Style Code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Costing Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">PO Number</th>
                  <th className="px-5 py-3.5">Style Reference</th>
                  <th className="px-4 py-3.5 text-right">Fabric</th>
                  <th className="px-4 py-3.5 text-right">Trims</th>
                  <th className="px-4 py-3.5 text-right">CMT Sew</th>
                  <th className="px-4 py-3.5 text-right">Embellish/Wash</th>
                  <th className="px-4 py-3.5 text-right">Overhead (12%)</th>
                  <th className="px-5 py-3.5 text-right font-bold text-[#3A3564]">Planned FOB</th>
                  <th className="px-5 py-3.5 text-right">Actual Cost</th>
                  <th className="px-5 py-3.5 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCostings.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-8 text-center text-slate-500">
                      No costing records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredCostings.map(costing => {
                    const embellishWashTotal = costing.embellishment_cost + costing.washing_finishing_cost
                    const directSub = 
                      costing.fabric_cost + 
                      costing.trims_accessories_cost + 
                      costing.cmt_sewing_rate + 
                      embellishWashTotal + 
                      costing.packaging_cost
                    const overheadVal = directSub * (costing.factory_overhead_percent / 100)
                    const isExceeded = costing.variance_percent > 2.0

                    return (
                      <tr key={costing.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-[#3A3564]">
                          {costing.po_number}
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-semibold text-slate-900">{costing.style_ref}</div>
                          <div className="text-[11px] text-slate-500 truncate">{costing.style_name}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {costing.fabric_cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {costing.trims_accessories_cost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {costing.cmt_sewing_rate.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {embellishWashTotal.toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                          {overheadVal.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-[#3A3564]">
                          {costing.net_fob_cost.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                          {costing.actual_realized_cost.toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isExceeded
                                ? 'bg-rose-100 text-rose-800'
                                : costing.variance_percent < 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {costing.variance_percent > 0 ? `+${costing.variance_percent.toFixed(2)}%` : `${costing.variance_percent.toFixed(2)}%`}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Form 2 BOM Costing Sheet */}
        <CreateCostingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={reloadData}
        />
      </main>
    </div>
  )
}
