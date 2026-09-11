'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft, 
  Eye, 
  FileText, 
  Download, 
  Calendar, 
  Tag, 
  CheckCircle2,
  X
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
                  Division 02 • Commercial Master
                </span>
                <span className="text-xs text-slate-500 font-medium">Buyer Contract Ledger</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
                Buyer Purchase Orders (PO)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Book New Buyer PO
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {['ALL', 'BOOKED', 'IN_FABRIC', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  activeFilter === tab
                    ? 'bg-[#3A3564] text-white'
                    : 'text-slate-600 bg-white border border-black/5 hover:bg-black/5'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by PO, Buyer, Style Code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Primary Order Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">PO Number</th>
                  <th className="px-5 py-3.5">Brand / Buyer</th>
                  <th className="px-5 py-3.5">Style Reference</th>
                  <th className="px-5 py-3.5 text-right">Total Pcs</th>
                  <th className="px-5 py-3.5 text-right">Unit FOB</th>
                  <th className="px-5 py-3.5 text-right">Total Contract Value</th>
                  <th className="px-5 py-3.5">Ex-Factory Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                      No purchase orders found. Click &quot;Book New Buyer PO&quot; to add one.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-[#3A3564]">
                        {order.po_number}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        {order.brand_name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{order.style_ref}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{order.style_name}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {order.total_quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">
                        {order.currency === 'USD' && '$'}
                        {order.currency === 'INR' && '₹'}
                        {order.currency === 'EUR' && '€'}
                        {order.unit_fob_price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {order.currency === 'USD' && '$'}
                        {order.currency === 'INR' && '₹'}
                        {order.currency === 'EUR' && '€'}
                        {order.total_contract_value.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {order.ex_factory_date}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            order.status === 'IN_PRODUCTION'
                              ? 'bg-indigo-100 text-[#3A3564]'
                              : order.status === 'IN_FABRIC'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'PACKED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'DISPATCHED'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForBreakdown(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-[#3A3564] bg-[#3A3564]/10 hover:bg-[#3A3564]/20 rounded-lg transition-colors"
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
                  <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
                    Size Ratio Breakdown
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                    {selectedOrderForBreakdown.po_number} • {selectedOrderForBreakdown.style_ref}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForBreakdown(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-700 font-medium">
                  <span>Buyer: <strong>{selectedOrderForBreakdown.brand_name}</strong></span>
                  <span>Total Order: <strong className="text-[#3A3564] font-bold">{selectedOrderForBreakdown.total_quantity.toLocaleString()} pcs</strong></span>
                </div>

                {selectedOrderForBreakdown.color_matrix?.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-black/10 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Colorway: {item.color}</span>
                      <span className="text-[#3A3564]">{item.total.toLocaleString()} pcs</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 pt-2 border-t border-black/5">
                      {Object.entries(item.sizes).map(([size, qty]) => (
                        <div key={size} className="text-center p-2 rounded-lg bg-[#FAF7F0]">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">{size}</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">{qty.toLocaleString()}</div>
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl"
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
      </main>
    </div>
  )
}
