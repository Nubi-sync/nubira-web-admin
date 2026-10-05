'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Eye, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  X,
  TrendingUp,
  Layers,
  IndianRupee,
  ArrowUpRight
} from 'lucide-react'
import { MerchandisingOrder } from '../../types/merchandising'
import { TechPack } from '@/app/design/types/design'
import { getOrders, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateOrderModal } from './CreateOrderModal'
import { ViewOrderDetailModal } from './ViewOrderDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'

interface OrdersCatalogClientProps {
  initialOrders?: MerchandisingOrder[]
  availableTechPacks?: TechPack[]
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
  companyName?: string
}

export function OrdersCatalogClient({ 
  initialOrders,
  availableTechPacks = [],
  availableBrands = [],
  companyName
}: OrdersCatalogClientProps = {}) {
  const [orders, setOrders] = useState<MerchandisingOrder[]>(() => {
    if (initialOrders && initialOrders.length > 0) return initialOrders
    return []
  })
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderForView, setSelectedOrderForView] = useState<MerchandisingOrder | null>(null)

  const reloadData = () => {
    setOrders(getOrders())
  }

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_merchandising_orders_v1', JSON.stringify(initialOrders))
      }
    } else {
      reloadData()
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialOrders])

  const normalizeStatus = (status?: string): string => {
    if (!status || status === 'BOOKED') return 'IN_CUTTING'
    return status
  }

  const getStatusLabel = (status?: string): string => {
    const s = normalizeStatus(status)
    switch (s) {
      case 'IN_CUTTING': return 'In Cutting'
      case 'IN_PRINTING': return 'In Printing'
      case 'IN_EMBROIDERY': return 'In Embroidery'
      case 'IN_SEWING': return 'In Sewing'
      case 'IRON': return 'Iron'
      case 'WASHING': return 'Washing'
      case 'ALTER': return 'Alter'
      case 'DISPATCHED': return 'Dispatched'
      case 'COMPLETED': return 'Completed'
      default: return s.replace('_', ' ')
    }
  }

  const filteredOrders = orders.filter(ord => {
    const matchesFilter = activeFilter === 'ALL' || normalizeStatus(ord.status) === activeFilter
    const matchesSearch = 
      ord.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.style_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Executive KPI summary calculations
  const totalPieces = orders.reduce((sum, o) => sum + o.total_quantity, 0)
  const activeWip = orders.filter(o => o.status === 'IN_PRODUCTION' || o.status === 'IN_FABRIC').length
  const totalValue = orders.reduce((sum, o) => sum + o.total_contract_value, 0)

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <ClipboardList className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Buyer Purchase <span className="text-[#1D4ED8]">Orders (PO)</span>
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                {orders.length} Active Contracts
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Master buyer contract ledger, color &amp; size distribution, and production line handover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Book New Buyer PO</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <ClipboardList className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contracted POs
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Registered commercial POs</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {orders.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Global Buyers
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Layers className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Order Volume
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Aggregated piece count</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {totalPieces.toLocaleString()}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Total Pcs
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <TrendingUp className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Floor Handover
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Fabric &amp; Sewing floor WIP</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {activeWip}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Active WIP Lines
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <IndianRupee className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contract Value
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Booked commercial revenue</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {totalValue >= 10000000 
                ? `₹${(totalValue / 10000000).toFixed(2)} Cr` 
                : totalValue >= 100000 
                ? `₹${(totalValue / 100000).toFixed(2)} Lakh` 
                : `₹${(totalValue / 1000).toFixed(1)}k`}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-slate-50 text-[#0B1220] border border-slate-200">
              Order Value
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Ledger Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['ALL', 'IN_CUTTING', 'IN_PRINTING', 'IN_EMBROIDERY', 'IN_SEWING', 'IRON', 'WASHING', 'ALTER', 'DISPATCHED'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#14C8B4] text-[#0B1220] shadow-2xs font-bold'
                    : 'text-slate-600 bg-slate-50 border border-slate-100 hover:bg-black/5'
                }`}
              >
                {getStatusLabel(tab)}
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
              placeholder="Search PO, Buyer, Style..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 focus:border-[#0B1220]"
            />
          </div>
        </div>

        {/* Primary Order Table or Empty State */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={searchQuery || activeFilter !== 'ALL' ? "No matching orders" : "No purchase orders"}
            description={searchQuery || activeFilter !== 'ALL' ? "Try adjusting your search query or status filter." : "Register your first buyer purchase order to begin commercial tracking."}
            actionLabel="Book New Buyer PO"
            onAction={() => setIsCreateModalOpen(true)}
            secondaryActionLabel={searchQuery || activeFilter !== 'ALL' ? "Reset Filters" : undefined}
            onSecondaryAction={searchQuery || activeFilter !== 'ALL' ? () => {
              setSearchQuery('')
              setActiveFilter('ALL')
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Buyer</th>
                  <th className="py-3 px-4">Article &amp; Style</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4">FOB &amp; Value</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Ex-Factory</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0B1220] font-mono">
                      {order.po_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {order.brand_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 font-mono block">{order.style_ref}</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">{order.style_name}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {order.total_quantity.toLocaleString()} Pcs
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900">
                        {order.currency === 'USD' ? '$' : order.currency === 'EUR' ? '€' : '₹'}
                        {order.unit_fob_price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {order.currency === 'USD' ? '$' : order.currency === 'EUR' ? '€' : '₹'}
                        {order.total_contract_value >= 100000 
                          ? `${(order.total_contract_value / 100000).toFixed(1)}L` 
                          : order.total_contract_value.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-[#0B1220] border border-slate-200 font-bold block max-w-[120px] truncate" title={order.embellishment_sequence || 'Standard Flow'}>
                        {order.embellishment_sequence === 'NONE' ? 'Cut & Sew' :
                         order.embellishment_sequence === 'ONLY_PRINTING' ? 'Printing' :
                         order.embellishment_sequence === 'ONLY_EMBROIDERY' ? 'Embroidery' :
                         order.embellishment_sequence === 'EMBROIDERY_FIRST_THEN_PRINT' ? 'Emb → Print' :
                         order.embellishment_sequence === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'Print → Emb' :
                         order.embellishment_sequence || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono font-medium">
                      {order.ex_factory_date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-slate-50 text-[#0B1220] border border-slate-200"
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForView(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0B1220] bg-slate-50 hover:bg-[slate-100] border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Full Order Details & Matrix Specification Modal */}
      <ViewOrderDetailModal
        isOpen={Boolean(selectedOrderForView)}
        onClose={() => setSelectedOrderForView(null)}
        order={selectedOrderForView}
      />

      {/* Modal: Form 1 Master Buyer PO */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadData}
        availableTechPacks={availableTechPacks}
        availableBrands={availableBrands}
        companyName={companyName}
      />
    </div>
  )
}
