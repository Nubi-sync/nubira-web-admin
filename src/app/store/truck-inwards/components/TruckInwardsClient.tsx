'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Truck, 
  ChevronLeft, 
  Search, 
  Plus, 
  Scale, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Phone,
  PackageCheck
} from 'lucide-react'
import { TruckInwardGateRecord } from '../../types/store'
import { getTruckInwards, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { RecordTruckInwardModal } from './RecordTruckInwardModal'
import { EmptyState } from '@/components/ui/EmptyState'

export function TruckInwardsClient() {
  const [inwards, setInwards] = useState<TruckInwardGateRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadInwards = () => {
    setInwards(getTruckInwards())
  }

  useEffect(() => {
    loadInwards()
    const handleUpdate = () => loadInwards()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const totalTrucks = inwards.length
  const totalNetKg = inwards.reduce((acc, t) => acc + t.netWeightKg, 0)
  const totalPackages = inwards.reduce((acc, t) => acc + t.totalPackages, 0)
  const verifiedCount = inwards.filter(t => t.gateSecurityStatus === 'UNLOADED_VERIFIED').length

  const filteredInwards = inwards.filter(t => {
    const matchesSearch =
      t.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.poReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (categoryFilter === 'ALL') return true
    return t.itemCategory === categoryFilter
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
          Gatehouse 01 & Weighbridge Substation • Electronic GRN
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Truck Inward Gate (GRN) Hub
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider">
                Weighbridge Slip Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Vehicle gate security log, gross/tare weighbridge calculations, and electronic Goods Received Note (GRN) generation
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Truck Inward (2-Step GRN)</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards - Unified Icon & Neutral Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Inward Trucks
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalTrucks} <span className="text-sm font-normal text-slate-500">Consignments</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Registered via Gatehouse 01
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Net Inward Cargo Weight
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {Math.round(totalNetKg / 1000 * 10) / 10} <span className="text-sm font-normal text-slate-500">Tons</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            {totalNetKg.toLocaleString()} kg Verified Net Weight
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Packages Received
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalPackages.toLocaleString()} <span className="text-sm font-normal text-slate-500">Pkgs</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Rolls, Cartons, Trim Bundles
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Gate Clearance Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            100%
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            {verifiedCount} of {totalTrucks} Consignments Unloaded
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
            placeholder="Search by GRN slip no, vehicle reg, mill supplier, PO ref, or driver name..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'RAW_FABRIC_ROLL', 'TRIMS', 'PACKAGING', 'CHEMICAL'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Consignments' : tab.replace(/_/g, ' ')
            const active = categoryFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
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

      {/* Truck Inward Manifest Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">GRN No & Arrival</th>
                <th className="py-3 px-4">Vehicle Reg & Driver</th>
                <th className="py-3 px-4">Supplier / PO Reference</th>
                <th className="py-3 px-4">Consignment Category</th>
                <th className="py-3 px-4">Packages</th>
                <th className="py-3 px-4">Weighbridge (Gross / Net)</th>
                <th className="py-3 px-4">Gate Security Status</th>
                <th className="py-3 px-4 text-right">Receiver Sign-Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredInwards.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      variant="seamless"
                      icon={Truck}
                      title="No Truck Inward Records Found"
                      description="No vehicle arrivals match your search criteria or consignment filter."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearchQuery('')
                        setCategoryFilter('ALL')
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredInwards.map(t => (
                  <tr key={t.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-slate-900">
                        {t.grnNumber}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {new Date(t.arrivalTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(t.arrivalTimestamp).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-black text-slate-900">
                        {t.vehicleNumber}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{t.driverName} ({t.driverPhone})</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {t.supplierName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        PO: {t.poReference}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 text-[10px] font-bold uppercase border border-black/10">
                        {t.itemCategory.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">
                        {t.totalPackages}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">pkgs</span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900 tabular-nums">
                        {t.netWeightKg.toLocaleString()} kg Net
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        Gross: {t.grossWeightKg.toLocaleString()} | Tare: {t.tareWeightKg.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {t.gateSecurityStatus === 'UNLOADED_VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-[#3A3564]" />
                          Unloaded & Verified
                        </span>
                      ) : t.gateSecurityStatus === 'WEIGHBRIDGE_COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                          <Scale className="w-3 h-3 text-[#3A3564]" />
                          Weighbridge Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 text-[10px] font-mono font-bold uppercase border border-black/10">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Gate Inwarded
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-600">
                      {t.receiverInspector}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <RecordTruckInwardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  )
}
