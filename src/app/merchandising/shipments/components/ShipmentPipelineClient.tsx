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
import { EmptyState } from '@/components/ui/EmptyState'

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
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Ship className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Shipment &amp; FOB Export Pipeline
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                {shipments.length} Consignments
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Container stuffing control, customs documentation, vessel ETD/ETA tracking, and Bill of Lading (BL) handshake
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0B1220] hover:bg-[#162032] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Book Export Shipment</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Layers className="w-5 h-5 text-[#0B1220]" />
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Containers
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Anchor className="w-5 h-5 text-[#0B1220]" />
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Sailing
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Truck className="w-5 h-5 text-[#0B1220]" />
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              Port Gate-In
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs">
            <Ship className="w-5 h-5 text-[#0B1220]" />
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
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              CBM Cubic
            </span>
          </div>
        </div>
      </div>

      {/* 4. Main Shipments Table Card (Toolbar + Table with 6th Box Design) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
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
                    ? 'bg-[#0B1220] text-white shadow-2xs font-bold'
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
              placeholder="Search Shipment, Container, Vessel..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 focus:border-[#0B1220]"
            />
          </div>
        </div>

        {/* Shipments Table or Empty State */}
        {filteredShipments.length === 0 ? (
          <EmptyState
            icon={Ship}
            title={searchQuery || activeFilter !== 'ALL' ? "No matching consignments" : "No export consignments"}
            description={searchQuery || activeFilter !== 'ALL' ? "Try adjusting your search query or shipment status filter." : "Schedule and book export container shipments."}
            actionLabel="Book Export Shipment"
            onAction={() => setIsModalOpen(true)}
            secondaryActionLabel={searchQuery || activeFilter !== 'ALL' ? "Reset Filters" : undefined}
            onSecondaryAction={searchQuery || activeFilter !== 'ALL' ? () => {
              setSearchQuery('')
              setActiveFilter('ALL')
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
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
                {filteredShipments.map(shp => (
                  <tr key={shp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-[#0B1220]">
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
                      <div className="text-slate-900 font-bold font-mono">ETD: {shp.etd_date}</div>
                      <div className="text-slate-400 text-[10px]">ETA: {shp.eta_date}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {shp.bl_number || <span className="text-slate-400 italic">Pending</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          shp.status === 'DELIVERED'
                            ? 'bg-slate-50 text-[#0B1220] border border-slate-200 font-bold'
                            : shp.status === 'SAILING'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200 font-semibold'
                            : 'bg-slate-50 text-slate-600 border border-slate-200'
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
                          className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold text-[#0B1220] bg-slate-50 hover:bg-[slate-100] border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                        >
                          Advance Status
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-700 inline-flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0B1220]" />
                          Delivered
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

      {/* Modal: Form 5 Book Shipment */}
      <BookShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
