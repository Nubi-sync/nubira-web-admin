'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Ship } from 'lucide-react'
import { ExportShipment, ShipmentStatus, MerchandisingOrder } from '../../types/merchandising'
import { saveShipment, getOrders } from '../../utils/merchandisingStorage'

interface BookShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BookShipmentModal({ isOpen, onClose, onSuccess }: BookShipmentModalProps) {
  const [orders] = useState<MerchandisingOrder[]>(getOrders())
  const [selectedPo, setSelectedPo] = useState(orders[0]?.po_number || '')
  const [shipmentRef, setShipmentRef] = useState(`SHP-${Math.floor(80000 + Math.random() * 10000)}`)
  const [forwarderName, setForwarderName] = useState('Kuehne + Nagel Logistics')
  const [carrierVessel, setCarrierVessel] = useState('MSC GULSUN Voy 204E')
  const [containerNumber, setContainerNumber] = useState('MSCU-482019-4')
  const [bookingCbm, setBookingCbm] = useState('68.0')
  const [portOfLoading, setPortOfLoading] = useState('Nhava Sheva (INNSA)')
  const [portOfDischarge, setPortOfDischarge] = useState('Rotterdam (NLRTM)')
  const [etdDate, setEtdDate] = useState('')
  const [etaDate, setEtaDate] = useState('')
  const [blNumber, setBlNumber] = useState('')
  const [status, setStatus] = useState<ShipmentStatus>('BOOKED')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedOrder = orders.find(o => o.po_number === selectedPo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!shipmentRef.trim()) {
      setError('Shipment Booking Reference is required')
      return
    }
    if (!selectedPo) {
      setError('Please link a confirmed Buyer PO')
      return
    }
    const cbm = parseFloat(bookingCbm) || 0
    if (cbm <= 0 || cbm > 80) {
      setError('Booking CBM must be between 1.0 and 76.0 CBM')
      return
    }
    if (!etdDate || !etaDate) {
      setError('ETD Departure Date and ETA Destination Date are mandatory')
      return
    }

    const newShipment: ExportShipment = {
      id: `shp-${Date.now()}`,
      shipment_ref: shipmentRef.trim().toUpperCase(),
      order_id: selectedOrder?.id || `ord-${Date.now()}`,
      po_number: selectedPo,
      forwarder_name: forwarderName.trim(),
      carrier_vessel: carrierVessel.trim(),
      container_number: containerNumber.trim().toUpperCase(),
      booking_cbm: cbm,
      port_of_loading: portOfLoading.trim(),
      port_of_discharge: portOfDischarge.trim(),
      etd_date: etdDate,
      eta_date: etaDate,
      bl_number: blNumber.trim() ? blNumber.trim().toUpperCase() : undefined,
      status,
      created_at: new Date().toISOString().split('T')[0]
    }

    saveShipment(newShipment)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
              Form 5 • Export Logistics &amp; Customs
            </span>
            <h2 className="text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Book Container Export Shipment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Shipment Reference *
              </label>
              <input
                type="text"
                required
                value={shipmentRef}
                onChange={e => setShipmentRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 font-mono uppercase font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Commercial Buyer PO *
              </label>
              <select
                value={selectedPo}
                onChange={e => setSelectedPo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white"
              >
                {orders.map(o => (
                  <option key={o.id} value={o.po_number}>
                    {o.po_number} ({o.brand_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Freight Forwarder *
              </label>
              <input
                type="text"
                required
                value={forwarderName}
                onChange={e => setForwarderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Carrier Vessel &amp; Voyage *
              </label>
              <input
                type="text"
                required
                value={carrierVessel}
                onChange={e => setCarrierVessel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Container Number *
              </label>
              <input
                type="text"
                required
                value={containerNumber}
                onChange={e => setContainerNumber(e.target.value)}
                placeholder="e.g. MSCU-482019-4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Booking Volume (CBM) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="76"
                required
                value={bookingCbm}
                onChange={e => setBookingCbm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 font-bold text-[#3A3564]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Port of Loading (POL) *
              </label>
              <input
                type="text"
                required
                value={portOfLoading}
                onChange={e => setPortOfLoading(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Port of Discharge (POD) *
              </label>
              <input
                type="text"
                required
                value={portOfDischarge}
                onChange={e => setPortOfDischarge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                ETD Departure Date *
              </label>
              <input
                type="date"
                required
                value={etdDate}
                onChange={e => setEtdDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                ETA Destination Date *
              </label>
              <input
                type="date"
                required
                value={etaDate}
                onChange={e => setEtaDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Bill of Lading (B/L) Number
              </label>
              <input
                type="text"
                value={blNumber}
                onChange={e => setBlNumber(e.target.value)}
                placeholder="e.g. MSCUIN8829018"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Container Status Lifecycle *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ShipmentStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white font-semibold"
              >
                <option value="BOOKED">BOOKED</option>
                <option value="CONTAINER_STUFFED">CONTAINER_STUFFED</option>
                <option value="SAILING">SAILING</option>
                <option value="CUSTOMS_CLEARED">CUSTOMS_CLEARED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-black/5 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Book Export Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
