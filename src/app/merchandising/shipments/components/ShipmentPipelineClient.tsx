'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Ship, 
  Plus, 
  Search, 
  Anchor, 
  CheckCircle2, 
  Truck,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { ExportShipment, ShipmentStatus } from '../../types/merchandising'
import { getShipments, saveShipment, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { BookShipmentModal } from './BookShipmentModal'

interface ShipmentPipelineClientProps {
  initialShipments?: ExportShipment[]
}

export function ShipmentPipelineClient({ initialShipments }: ShipmentPipelineClientProps = {}) {
  const [shipments, setShipments] = useState<ExportShipment[]>(() => {
    if (initialShipments && initialShipments.length > 0) return initialShipments
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setShipments(getShipments())
  }

  useEffect(() => {
    if (initialShipments && initialShipments.length > 0) {
      setShipments(initialShipments)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_merchandising_shipments_v1', JSON.stringify(initialShipments))
      }
    } else {
      reloadData()
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialShipments])

  const handleUpdateStatus = (shp: ExportShipment, nextStatus: ShipmentStatus) => {
    const updated: ExportShipment = {
      ...shp,
      status: nextStatus
    }
    saveShipment(updated)
  }

  const filteredShipments = shipments.filter(s => {
    const matchesFilter = activeFilter === 'ALL' || s.status === activeFilter
    const matchesSearch = 
      s.shipment_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.container_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.forwarder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier_vessel.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalCbm = shipments.reduce((sum, s) => sum + s.booking_cbm, 0)
  const sailingCount = shipments.filter(s => s.status === 'SAILING').length
  const stuffedCount = shipments.filter(s => s.status === 'CONTAINER_STUFFED').length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
          Merchandising &amp; Sourcing
        </Link>
        <span>/</span>
        <span>Global Forwarding</span>
        <span>/</span>
        <span className="font-bold text-slate-900">
          Shipment &amp; FOB Export Pipeline
        </span>
      </div>

      {/* 2. Top Header Card (6th Box Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Shipment &amp; FOB Export Pipeline
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {shipments.length} Consignments
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Container stuffing control, customs documentation, vessel ETD/ETA tracking, and Bill of Lading (BL) handshake
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
            <span>Book Export Shipment</span>
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
              Total Bookings
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Export container jobs</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {shipments.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Containers
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Anchor className="w-5 h-5 text-sky-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 02
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              On High Seas
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Vessels actively sailing</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {sailingCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Sailing
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 03
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Container Stuffed
            </div>
            <div className="text-[11px] text-slate-400 font-medium">ICD/CFS port gate-in</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {stuffedCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Port Gate-In
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Ship className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 04
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Total Volume
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Aggregated freight CBM</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {totalCbm.toFixed(1)}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              CBM Cubic
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Shipments Table Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {['ALL', 'BOOKED', 'CONTAINER_STUFFED', 'SAILING', 'CUSTOMS_CLEARED', 'DELIVERED'].map(tab => (
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
              placeholder="Search Shipment, Container, Vessel..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                <th className="py-3 px-4">Shipment Ref</th>
                <th className="py-3 px-4">Linked PO</th>
                <th className="py-3 px-4">Forwarder &amp; Vessel</th>
                <th className="py-3 px-4">Container #</th>
                <th className="py-3 px-3 text-right">CBM</th>
                <th className="py-3 px-4">Routing (POL → POD)</th>
                <th className="py-3 px-4">ETD / ETA</th>
                <th className="py-3 px-4">B/L Number</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No container shipments found. Click &quot;Book Export Shipment&quot; to schedule one.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shp => (
                  <tr key={shp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-[#3A3564]">
                      {shp.shipment_ref}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {shp.po_number}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{shp.forwarder_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[180px]">{shp.carrier_vessel}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {shp.container_number}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                      {shp.booking_cbm.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold text-[11px]">{shp.port_of_loading}</div>
                      <div className="text-[10px] text-slate-400">↓ {shp.port_of_discharge}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <div className="text-emerald-700 font-bold">ETD: {shp.etd_date}</div>
                      <div className="text-slate-400 text-[10px]">ETA: {shp.eta_date}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {shp.bl_number || <span className="text-slate-400 italic">Pending</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          shp.status === 'SAILING'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : shp.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : shp.status === 'CUSTOMS_CLEARED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : shp.status === 'CONTAINER_STUFFED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {shp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {shp.status !== 'DELIVERED' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const orderMap: Record<ShipmentStatus, ShipmentStatus> = {
                              'BOOKED': 'CONTAINER_STUFFED',
                              'CONTAINER_STUFFED': 'SAILING',
                              'SAILING': 'CUSTOMS_CLEARED',
                              'CUSTOMS_CLEARED': 'DELIVERED',
                              'DELIVERED': 'DELIVERED'
                            }
                            handleUpdateStatus(shp, orderMap[shp.status])
                          }}
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                        >
                          Advance Status
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Delivered
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

      {/* Modal: Form 5 Book Shipment */}
      <BookShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
