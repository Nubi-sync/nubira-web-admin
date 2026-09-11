'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Ship, 
  Plus, 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  Anchor, 
  CheckCircle2, 
  FileText, 
  Truck 
} from 'lucide-react'
import { ExportShipment, ShipmentStatus } from '../../types/merchandising'
import { getShipments, saveShipment, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { BookShipmentModal } from './BookShipmentModal'

export function ShipmentPipelineClient() {
  const [shipments, setShipments] = useState<ExportShipment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setShipments(getShipments())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

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
                  Division 02 • Global Forwarding
                </span>
                <span className="text-xs text-slate-500 font-medium">Export Container &amp; Bill of Lading (BL) Desk</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
                Shipment &amp; FOB Export Pipeline
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
              Book Export Shipment
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {['ALL', 'BOOKED', 'CONTAINER_STUFFED', 'SAILING', 'CUSTOMS_CLEARED', 'DELIVERED'].map(tab => (
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
              placeholder="Search Shipment, Container, Vessel..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Shipment Ref</th>
                  <th className="px-5 py-3.5">Linked PO</th>
                  <th className="px-5 py-3.5">Forwarder &amp; Vessel</th>
                  <th className="px-5 py-3.5">Container #</th>
                  <th className="px-4 py-3.5 text-right">CBM</th>
                  <th className="px-5 py-3.5">Routing (POL → POD)</th>
                  <th className="px-4 py-3.5">ETD / ETA</th>
                  <th className="px-4 py-3.5">B/L Number</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-8 text-center text-slate-500">
                      No container shipments found. Click &quot;Book Export Shipment&quot; to schedule one.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map(shp => (
                    <tr key={shp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-bold font-mono text-[#3A3564]">
                        {shp.shipment_ref}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {shp.po_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{shp.forwarder_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{shp.carrier_vessel}</div>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">
                        {shp.container_number}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">
                        {shp.booking_cbm.toFixed(1)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        <div className="font-medium text-[11px]">{shp.port_of_loading}</div>
                        <div className="text-[10px] text-slate-400">↓ {shp.port_of_discharge}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-700">
                        <div className="text-emerald-700 font-medium">ETD: {shp.etd_date}</div>
                        <div className="text-slate-500">ETA: {shp.eta_date}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">
                        {shp.bl_number || <span className="text-slate-400 italic">Pending</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            shp.status === 'SAILING'
                              ? 'bg-sky-100 text-sky-800'
                              : shp.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : shp.status === 'CUSTOMS_CLEARED'
                              ? 'bg-indigo-100 text-[#3A3564]'
                              : shp.status === 'CONTAINER_STUFFED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {shp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
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
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Advance Status
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Archived
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
      </main>
    </div>
  )
}
