'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Warehouse, 
  ChevronLeft, 
  Search, 
  Ship, 
  Boxes, 
  Clock, 
  ShieldCheck, 
  Globe,
  Tag
} from 'lucide-react'
import { FinishedExportPallet } from '../../types/store'
import { getFinishedExportPallets, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { ContainerStuffingModal } from './ContainerStuffingModal'
import { EmptyState } from '@/components/ui/EmptyState'

export function FinishedGodownClient() {
  const [pallets, setPallets] = useState<FinishedExportPallet[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [bayFilter, setBayFilter] = useState<'ALL' | 'BAY_3' | 'BAY_4' | 'BAY_5' | 'STUFFED'>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadPallets = () => {
    setPallets(getFinishedExportPallets())
  }

  useEffect(() => {
    loadPallets()
    const handleUpdate = () => loadPallets()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const totalPallets = pallets.length
  const totalCartons = pallets.reduce((acc, p) => acc + p.cartonCount, 0)
  const totalPcs = pallets.reduce((acc, p) => acc + p.totalPcs, 0)
  const stagedPallets = pallets.filter(p => p.shippingStatus === 'STAGED_IN_BAY').length
  const stuffedPallets = pallets.filter(p => p.shippingStatus === 'STUFFED_IN_CONTAINER' || p.shippingStatus === 'SHIPPED_EXPORTED').length

  const filteredPallets = pallets.filter(p => {
    const matchesSearch =
      p.palletId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.styleDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.aqlPassSealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.containerNumber && p.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (bayFilter === 'ALL') return true
    if (bayFilter === 'STUFFED') return p.shippingStatus === 'STUFFED_IN_CONTAINER' || p.shippingStatus === 'SHIPPED_EXPORTED'
    return p.bayLocation === bayFilter
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Store Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Finished Goods Warehouse • Export Bays 3, 4 & 5
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Finished Export Goods Bay 3–5
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider">
                AQL 2.5 Passed Only
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              High-bay pallet racking matrix, sealed carton tracking received from Division 09, and container stuffing gate pass authorization
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Ship className="w-4 h-4" />
          <span>Assign Container Stuffing</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards - Unified Icon & Neutral Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Finished Export Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalPcs.toLocaleString()} <span className="text-sm font-normal text-slate-500">Pcs</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Stored in Godown Bay 3, 4 & 5
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Master Cartons Staged
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalCartons.toLocaleString()} <span className="text-sm font-normal text-slate-500">Cartons</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Across {totalPallets} High-Bay Pallets
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pallets Staged in Bay
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {stagedPallets} <span className="text-sm font-normal text-slate-500">Pallets</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Awaiting Export Container Stuffing
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Container Stuffed / Loaded
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {stuffedPallets} <span className="text-sm font-normal text-slate-500">Pallets</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Customs Bolt Sealed & Dispatched
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pallet ID, buyer, order no, style, AQL seal, or container no..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Bay Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'BAY_3', 'BAY_4', 'BAY_5', 'STUFFED'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Pallets' : tab === 'STUFFED' ? 'Stuffed in Container' : tab.replace('_', ' ')
            const active = bayFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setBayFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#3A3564] text-white shadow-2xs' 
                    : 'bg-[#FAF7F0] text-slate-600 hover:text-slate-900 hover:bg-[#F2ECE1] border border-black/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Export Pallets Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Pallet ID & Staged Time</th>
                <th className="py-3 px-4">Buyer & Order Ref</th>
                <th className="py-3 px-4">Style Description</th>
                <th className="py-3 px-4">Bay & Rack Location</th>
                <th className="py-3 px-4">Cartons & Pcs</th>
                <th className="py-3 px-4">AQL Pass Seal</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-right">Logistics Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredPallets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      variant="seamless"
                      icon={Warehouse}
                      title="No Export Pallets Found"
                      description="No staged export pallets match your search query or high-bay racking filter."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearchQuery('')
                        setBayFilter('ALL')
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredPallets.map(p => {
                  const isStuffed = p.shippingStatus === 'STUFFED_IN_CONTAINER'
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {p.palletId}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {new Date(p.stagedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {p.buyerName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {p.orderNumber}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900">
                        {p.styleDescription}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold text-xs">
                          {p.bayLocation.replace('_', ' ')} • {p.rackNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 tabular-nums">
                          {p.cartonCount} ctns ({p.totalPcs.toLocaleString()} pcs)
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums">
                          {p.grossWeightKg} kg Gross
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10 text-[11px] font-bold">
                          {p.aqlPassSealNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.destinationCountry}</span>
                        </div>
                        {p.destinationPort && (
                          <div className="text-[11px] font-mono text-slate-500">
                            {p.destinationPort}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isStuffed ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                              <Ship className="w-3 h-3 text-[#3A3564]" />
                              Stuffed: {p.containerNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 text-[10px] font-mono font-bold uppercase border border-black/10">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Staged in Bay
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ContainerStuffingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availablePallets={pallets}
      />

    </div>
  )
}
