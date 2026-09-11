'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calculator, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { BomCosting } from '../../types/merchandising'
import { getBomCostings, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateCostingModal } from './CreateCostingModal'

export function BomCostingClient() {
  const [costings, setCostings] = useState<BomCosting[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'ON_TARGET' | 'VARIANCE_ALERT'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setCostings(getBomCostings())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

  const filteredCostings = costings.filter(c => {
    const matchesSearch = 
      c.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.style_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    if (activeTab === 'ON_TARGET') return c.variance_percent <= 2.0
    if (activeTab === 'VARIANCE_ALERT') return c.variance_percent > 2.0
    return true
  })

  const alertCostingsCount = costings.filter(c => c.variance_percent > 2.0).length
  const avgPlannedFob = costings.length > 0 
    ? (costings.reduce((sum, c) => sum + c.net_fob_cost, 0) / costings.length) 
    : 0

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
          Merchandising &amp; Sourcing
        </Link>
        <span>/</span>
        <span>Commercial Ops</span>
        <span>/</span>
        <span className="font-bold text-slate-900">
          BOM &amp; Pre/Post-Costing Ledgers
        </span>
      </div>

      {/* 2. Top Header Card (6th Box Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                BOM &amp; Pre/Post-Costing Ledgers
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {costings.length} Costing Sheets
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Standard garment costing engine, direct material breakdown, and live factory realization variance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Costing Sheet</span>
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards (Matching 6th Box) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 01
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Costings
            </div>
            <div className="text-[11px] text-slate-400 font-medium">BOM sheets on floor</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {costings.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              All Styles
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 02
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Average FOB Rate
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Mean contract unit rate</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              ${avgPlannedFob.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Unit FOB
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 03
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Variance Flags
            </div>
            <div className="text-[11px] text-slate-400 font-medium">&gt; 2.0% cost overruns</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className={`text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] ${alertCostingsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {alertCostingsCount}
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
              alertCostingsCount > 0 
                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {alertCostingsCount > 0 ? 'Review Needed' : 'Zero Overrun'}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 04
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Plant Overhead
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Standard factory markup</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              12.0%
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Standard SLA
            </span>
          </div>
        </div>
      </div>

      {/* 4. Industry Realization Formula Banner (6th Box Styled) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/10 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Garment Cost Realization Model
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Total FOB Cost = Fabric + Trims + Print/Embellish + CMT + Wash + Pack + 12% Factory Overhead
            </div>
          </div>
        </div>

        {alertCostingsCount > 0 ? (
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{alertCostingsCount} Style(s) exceeding &gt; 2.0% variance threshold</span>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All active BOM costings are strictly within tolerance limits</span>
          </div>
        )}
      </div>

      {/* 5. Main Costing Table Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { key: 'ALL', label: 'All Costings' },
              { key: 'ON_TARGET', label: 'On Target (≤ 2%)' },
              { key: 'VARIANCE_ALERT', label: 'Variance Alerts (> 2%)' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search PO Number or Style..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Costing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Style Reference</th>
                <th className="py-3 px-3 text-right">Fabric</th>
                <th className="py-3 px-3 text-right">Trims</th>
                <th className="py-3 px-3 text-right">CMT Sew</th>
                <th className="py-3 px-3 text-right">Embellish/Wash</th>
                <th className="py-3 px-3 text-right">Overhead (12%)</th>
                <th className="py-3 px-4 text-right font-bold text-[#3A3564]">Planned FOB</th>
                <th className="py-3 px-4 text-right">Actual Cost</th>
                <th className="py-3 px-4 text-center">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCostings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
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
                    <tr key={costing.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#3A3564] font-mono">
                        {costing.po_number}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 block">{costing.style_ref}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{costing.style_name}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ${costing.fabric_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ${costing.trims_accessories_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ${costing.cmt_sewing_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ${embellishWashTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        ${overheadVal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A3564]">
                        ${costing.net_fob_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        ${costing.actual_realized_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isExceeded
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : costing.variance_percent < 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
    </div>
  )
}
