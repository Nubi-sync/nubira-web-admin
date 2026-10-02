'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Package, 
  Layers,
  ArrowUpRight,
  Truck
} from 'lucide-react'
import { SourcingRequisition } from '../../types/merchandising'
import { getSourcingRequisitions, saveSourcingRequisition, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { CreateRequisitionModal } from './CreateRequisitionModal'
import { EmptyState } from '@/components/ui/EmptyState'

interface SourcingRequisitionsClientProps {
  initialRequisitions?: SourcingRequisition[]
}

export function SourcingRequisitionsClient({ initialRequisitions }: SourcingRequisitionsClientProps = {}) {
  const [requisitions, setRequisitions] = useState<SourcingRequisition[]>(() => {
    if (initialRequisitions && initialRequisitions.length > 0) return initialRequisitions
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setRequisitions(getSourcingRequisitions())
  }

  useEffect(() => {
    if (initialRequisitions && initialRequisitions.length > 0) {
      setRequisitions(initialRequisitions)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_merchandising_sourcing_pr_v1', JSON.stringify(initialRequisitions))
      }
    } else {
      reloadData()
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialRequisitions])

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

  const inStoreCount = requisitions.filter(r => r.fulfillment_status === 'STORE_RECEIVED').length
  const orderedCount = requisitions.filter(r => r.fulfillment_status === 'ORDERED').length
  const pendingCount = requisitions.filter(r => r.fulfillment_status === 'PENDING').length

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <ShoppingCart className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Trim &amp; Sourcing <span className="text-[#1D4ED8]">Requisitions (PR)</span>
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                {requisitions.length} Indents
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Material purchase requisitions, mill contracts, and automated handshake with 11. Central Store
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Generate Sourcing PR</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Layers className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Requisitions
            </div>
            <div className="text-[11px] text-slate-400 font-medium">BOM material indents</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {requisitions.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              All Indents
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Store Received
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Inwarded to central store</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {inStoreCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              In House OK
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Truck className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ordered in Transit
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Vendor PO placed</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {orderedCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              En Route
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Clock className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pending Indents
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Awaiting vendor quotation</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {pendingCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              {pendingCount > 0 ? 'PO Required' : 'Cleared'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Requisitions Table Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['ALL', 'PENDING', 'ORDERED', 'STORE_RECEIVED'].map(tab => (
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
              placeholder="Search PR #, PO #, Material, Vendor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 focus:border-[#0B1220]"
            />
          </div>
        </div>

        {/* Requisitions Table or Empty State */}
        {filteredRequisitions.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={searchQuery || activeFilter !== 'ALL' ? "No matching requisitions" : "No sourcing requisitions"}
            description={searchQuery || activeFilter !== 'ALL' ? "Try adjusting your search query or status filter." : "Generate a material purchase requisition to begin procurement."}
            actionLabel="Generate Sourcing PR"
            onAction={() => setIsModalOpen(true)}
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
                  <th className="py-3 px-4">PR Number</th>
                  <th className="py-3 px-4">Linked PO</th>
                  <th className="py-3 px-4">Material Description</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Required Qty</th>
                  <th className="py-3 px-4">Approved Vendor</th>
                  <th className="py-3 px-4">In-House Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRequisitions.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-[#0B1220]">
                      {req.pr_number}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {req.po_number}
                    </td>
                    <td className="py-3 px-4 max-w-xs font-semibold text-slate-900">
                      {req.material_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 font-mono text-[10px] font-bold text-slate-700">
                        {req.material_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {req.required_quantity.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">{req.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-semibold">
                      {req.vendor_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                      {req.required_in_store_date}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          req.fulfillment_status === 'STORE_RECEIVED'
                            ? 'bg-slate-50 text-[#0B1220] border border-slate-200'
                            : req.fulfillment_status === 'ORDERED'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {req.fulfillment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.fulfillment_status !== 'STORE_RECEIVED' ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req, req.fulfillment_status === 'PENDING' ? 'ORDERED' : 'STORE_RECEIVED')}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold text-[#0B1220] bg-slate-50 hover:bg-[slate-100] border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          {req.fulfillment_status === 'PENDING' ? 'Mark Ordered' : 'Inward to Store'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0B1220]" />
                          In Store OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Form 4 Sourcing PR */}
      <CreateRequisitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
