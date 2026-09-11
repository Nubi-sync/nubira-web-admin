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
  DollarSign,
  ArrowUpRight
} from 'lucide-react'
import { MerchandisingOrder } from '../../types/merchandising'
import { getOrders, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateOrderModal } from './CreateOrderModal'

export function OrdersCatalogClient() {
  const [orders, setOrders] = useState<MerchandisingOrder[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderForBreakdown, setSelectedOrderForBreakdown] = useState<MerchandisingOrder | null>(null)

  const reloadData = () => {
    setOrders(getOrders())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

  const filteredOrders = orders.filter(ord => {
    const matchesFilter = activeFilter === 'ALL' || ord.status === activeFilter
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
          Buyer Purchase Orders (PO)
        </span>
      </div>

      {/* 2. Top Header Card (6th Box Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Buyer Purchase Orders (PO)
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {orders.length} Active Contracts
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Master buyer contract ledger, color &amp; size distribution, and production line handover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Buyer PO</span>
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards (Matching 6th Box) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              LEDGER
            </span>
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Global Buyers
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              VOLUME
            </span>
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Total Pcs
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              WIP FLOOR
            </span>
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active WIP Lines
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              FINANCIAL
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Contract Value
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Booked export revenue</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              ${(totalValue / 1000).toFixed(1)}k
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Export Value
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Ledger Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['ALL', 'BOOKED', 'IN_FABRIC', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                }`}
              >
                {tab.replace('_', ' ')}
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Primary Order Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Brand / Buyer</th>
                <th className="py-3 px-4">Style Reference</th>
                <th className="py-3 px-4 text-right">Total Pcs</th>
                <th className="py-3 px-4 text-right">Unit FOB</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4">Ex-Factory</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No purchase orders found matching your search. Click &quot;Book New Buyer PO&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#3A3564] font-mono">
                      {order.po_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-600">
                      {order.brand_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{order.style_ref}</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">{order.style_name}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {order.total_quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {order.currency === 'USD' ? '$' : order.currency === 'INR' ? '₹' : '€'}
                      {order.unit_fob_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {order.currency === 'USD' ? '$' : order.currency === 'INR' ? '₹' : '€'}
                      {order.total_contract_value.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono font-medium">
                      {order.ex_factory_date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'IN_PRODUCTION'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : order.status === 'IN_FABRIC'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : order.status === 'PACKED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'DISPATCHED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForBreakdown(order)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Color Ratio
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Color & Size Ratio Modal Drawer */}
      {selectedOrderForBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  Size Ratio Breakdown
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  {selectedOrderForBreakdown.po_number} • {selectedOrderForBreakdown.style_ref}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForBreakdown(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                <span>Buyer: <strong className="text-indigo-600 font-bold">{selectedOrderForBreakdown.brand_name}</strong></span>
                <span>Total Order: <strong className="text-[#3A3564] font-mono font-bold">{selectedOrderForBreakdown.total_quantity.toLocaleString()} pcs</strong></span>
              </div>

              {selectedOrderForBreakdown.color_matrix?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-black/10 bg-white space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Colorway: {item.color}</span>
                    <span className="text-[#3A3564] font-mono">{item.total.toLocaleString()} pcs</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
                    {Object.entries(item.sizes).map(([size, qty]) => (
                      <div key={size} className="text-center p-2 rounded-lg bg-[#FAF7F0] border border-black/5">
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">{size}</div>
                        <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">{qty.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderForBreakdown(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Form 1 Master Buyer PO */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
