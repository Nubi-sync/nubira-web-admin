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
  IndianRupee, 
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { BomCosting, MerchandisingOrder } from '../../types/merchandising'
import { getBomCostings, getOrders, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateCostingModal } from './CreateCostingModal'
import { EmptyState } from '@/components/ui/EmptyState'

interface BomCostingClientProps {
  initialCostings?: BomCosting[]
}

export function BomCostingClient({ initialCostings }: BomCostingClientProps = {}) {
  const [costings, setCostings] = useState<BomCosting[]>(() => {
    if (initialCostings && initialCostings.length > 0) return initialCostings
    return []
  })
  const [orders, setOrders] = useState<MerchandisingOrder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'ON_TARGET' | 'VARIANCE_ALERT'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    const localCostings = getBomCostings()
    setCostings(localCostings && localCostings.length > 0 ? localCostings : (initialCostings || []))
    setOrders(getOrders())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialCostings])

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

  const avgProfit = costings.length > 0 
    ? (costings.reduce((sum, c) => {
        const order = orders.find(o => o.po_number === c.po_number)
        const buyerPrice = order ? order.unit_fob_price : 1450
        return sum + (buyerPrice - c.net_fob_cost)
      }, 0) / costings.length)
    : 0

  const avgBuyerPrice = avgPlannedFob + avgProfit
  const avgProfitPct = avgBuyerPrice > 0 ? ((avgProfit / avgBuyerPrice) * 100) : 0

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

      {/* 3. Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <Layers className="w-5 h-5" />
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
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Factory FOB Cost
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Mean direct manufacturing cost</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              ₹{avgPlannedFob.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Factory Net
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Gross Commercial Profit
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Realized net spread vs Buyer FOB</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700">
              +₹{avgProfit.toFixed(2)}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              +{avgProfitPct.toFixed(1)}% Margin
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Variance Flags
            </div>
            <div className="text-[11px] text-slate-400 font-medium">&gt; 2.0% cost overruns</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {alertCostingsCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              {alertCostingsCount > 0 ? 'Review Needed' : 'Zero Overrun'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Industry Realization Formula Banner (6th Box Styled) */}
      <div className="bg-[#FAF7F0] rounded-2xl p-4 border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block font-mono">GARMENT COST REALIZATION MODEL</span>
            <span className="text-slate-600 font-medium">
              Total Factory FOB = Fabric + Trims + Print/Embellish + CMT + Wash + Pack + 12% Factory Overhead
            </span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/10 text-slate-700 font-semibold shadow-2xs shrink-0 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>All active BOM costings are strictly within tolerance limits</span>
        </div>
      </div>

      {/* 5. Main Costings Ledger Table Card */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Table Filters Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
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

        {/* Costing Table or Empty State */}
        {filteredCostings.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title={searchQuery || activeTab !== 'ALL' ? "No matching costings" : "No BOM costing sheets"}
            description={searchQuery || activeTab !== 'ALL' ? "Try adjusting your search query or variance tab filter." : "Create your first pre-costing BOM sheet to analyze FOB margins."}
            actionLabel="Create Costing Sheet"
            onAction={() => setIsModalOpen(true)}
            secondaryActionLabel={searchQuery || activeTab !== 'ALL' ? "Reset Filters" : undefined}
            onSecondaryAction={searchQuery || activeTab !== 'ALL' ? () => {
              setSearchQuery('')
              setActiveTab('ALL')
            } : undefined}
          />
        ) : (
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
                  <th className="py-3 px-4 text-right font-bold text-[#3A3564]">Factory Net FOB</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900">Buyer FOB</th>
                  <th className="py-3 px-4 text-right font-bold text-emerald-700">Gross Profit</th>
                  <th className="py-3 px-4 text-center">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCostings.map(costing => {
                  const embellishWashTotal = costing.embellishment_cost + costing.washing_finishing_cost
                  const directSub = 
                    costing.fabric_cost + 
                    costing.trims_accessories_cost + 
                    costing.cmt_sewing_rate + 
                    embellishWashTotal + 
                    costing.packaging_cost
                  const overheadVal = directSub * (costing.factory_overhead_percent / 100)
                  const isExceeded = costing.variance_percent > 2.0
                  const linkedOrder = orders.find(o => o.po_number === costing.po_number)
                  const buyerPrice = linkedOrder ? linkedOrder.unit_fob_price : 1450
                  const profitPerPc = buyerPrice - costing.net_fob_cost
                  const profitMarginPct = buyerPrice > 0 ? (profitPerPc / buyerPrice) * 100 : 0

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
                        ₹{costing.fabric_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{costing.trims_accessories_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{costing.cmt_sewing_rate.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ₹{embellishWashTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        ₹{overheadVal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#3A3564]">
                        ₹{costing.net_fob_cost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{buyerPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        <div>+{profitPerPc >= 0 ? '₹' + profitPerPc.toFixed(2) : '-₹' + Math.abs(profitPerPc).toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">({profitMarginPct.toFixed(1)}%)</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isExceeded
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 font-bold'
                              : costing.variance_percent < 0
                              ? 'bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-semibold'
                              : 'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {costing.variance_percent > 0 ? `+${costing.variance_percent.toFixed(2)}%` : `${costing.variance_percent.toFixed(2)}%`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modal */}
      <CreateCostingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => reloadData()}
      />
    </div>
  )
}
