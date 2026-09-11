'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Plus, 
  ArrowLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Package, 
  Layers,
  ArrowRight
} from 'lucide-react'
import { SourcingRequisition } from '../../types/merchandising'
import { getSourcingRequisitions, saveSourcingRequisition, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateRequisitionModal } from './CreateRequisitionModal'

export function SourcingRequisitionsClient() {
  const [requisitions, setRequisitions] = useState<SourcingRequisition[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setRequisitions(getSourcingRequisitions())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

  const handleUpdateStatus = (req: SourcingRequisition, newStatus: SourcingRequisition['fulfillment_status']) => {
    const updated: SourcingRequisition = {
      ...req,
      fulfillment_status: newStatus
    }
    saveSourcingRequisition(updated)
  }

  const filteredRequisitions = requisitions.filter(r => {
    const matchesFilter = activeFilter === 'ALL' || r.fulfillment_status === activeFilter
    const matchesSearch = 
      r.pr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())
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
                  Division 02 • Procurement Handshake
                </span>
                <span className="text-xs text-slate-500 font-medium">Auto-Sync with 11. Central Store</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
                Trim &amp; Sourcing Requisitions (PR)
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
              Generate Sourcing PR
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {['ALL', 'PENDING', 'ORDERED', 'STORE_RECEIVED'].map(tab => (
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

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by PR #, PO #, Material, Vendor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">PR Number</th>
                  <th className="px-5 py-3.5">Linked PO</th>
                  <th className="px-5 py-3.5">Material Description</th>
                  <th className="px-5 py-3.5">Classification</th>
                  <th className="px-5 py-3.5 text-right">Required Qty</th>
                  <th className="px-5 py-3.5">Approved Vendor</th>
                  <th className="px-5 py-3.5">In-House Target</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                      No material sourcing requisitions found. Click &quot;Generate Sourcing PR&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold font-mono text-[#3A3564]">
                        {req.pr_number}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {req.po_number}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs font-medium text-slate-900">
                        {req.material_name}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-[10px]">
                          {req.material_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {req.required_quantity.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">{req.unit}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {req.vendor_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">
                        {req.required_in_store_date}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            req.fulfillment_status === 'STORE_RECEIVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.fulfillment_status === 'ORDERED'
                              ? 'bg-indigo-100 text-[#3A3564]'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.fulfillment_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.fulfillment_status !== 'STORE_RECEIVED' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(req, req.fulfillment_status === 'PENDING' ? 'ORDERED' : 'STORE_RECEIVED')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            {req.fulfillment_status === 'PENDING' ? 'Mark Ordered' : 'Inward to Store'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Form 4 Sourcing PR */}
        <CreateRequisitionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={reloadData}
        />
      </main>
    </div>
  )
}
