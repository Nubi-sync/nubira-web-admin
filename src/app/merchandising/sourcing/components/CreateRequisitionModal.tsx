'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react'
import { SourcingRequisition, MaterialType, MerchandisingOrder } from '../../types/merchandising'
import { saveSourcingRequisition, getOrders } from '../../utils/merchandisingStorage'

interface CreateRequisitionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateRequisitionModal({ isOpen, onClose, onSuccess }: CreateRequisitionModalProps) {
  const [orders] = useState<MerchandisingOrder[]>(getOrders())
  const [selectedPo, setSelectedPo] = useState(orders[0]?.po_number || '')
  const [materialName, setMaterialName] = useState('')
  const [materialType, setMaterialType] = useState<MaterialType>('FABRIC')
  const [requiredQuantity, setRequiredQuantity] = useState('500')
  const [unit, setUnit] = useState('Kg')
  const [vendorName, setVendorName] = useState('')
  const [requiredDate, setRequiredDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedOrder = orders.find(o => o.po_number === selectedPo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedPo) {
      setError('Please link a Buyer PO')
      return
    }
    if (!materialName.trim()) {
      setError('Material Name is required')
      return
    }
    const qty = parseFloat(requiredQuantity) || 0
    if (qty <= 0) {
      setError('Required Quantity must be greater than 0')
      return
    }
    if (!vendorName.trim()) {
      setError('Suggested Vendor / Mill is required')
      return
    }
    if (!requiredDate) {
      setError('Required in-store date is required')
      return
    }

    const newPr: SourcingRequisition = {
      id: `pr-${Date.now()}`,
      pr_number: `PR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: selectedOrder?.id || `ord-${Date.now()}`,
      po_number: selectedPo,
      material_name: materialName.trim(),
      material_type: materialType,
      required_quantity: qty,
      unit: unit.trim(),
      vendor_name: vendorName.trim(),
      required_in_store_date: requiredDate,
      fulfillment_status: 'PENDING',
      created_at: new Date().toISOString().split('T')[0]
    }

    saveSourcingRequisition(newPr)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
              Form 4 • Central Store Requisition
            </span>
            <h2 className="text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Generate Material Sourcing PR
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Linked PO */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Link Commercial Purchase Order *
            </label>
            <select
              value={selectedPo}
              onChange={e => setSelectedPo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 bg-white"
            >
              {orders.map(o => (
                <option key={o.id} value={o.po_number}>
                  {o.po_number} — {o.brand_name} ({o.style_ref})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Material Classification *
              </label>
              <select
                value={materialType}
                onChange={e => {
                  const t = e.target.value as MaterialType
                  setMaterialType(t)
                  if (t === 'FABRIC') setUnit('Kg')
                  else if (t === 'SEWING_THREAD') setUnit('Cones')
                  else if (t === 'LABEL') setUnit('Pcs')
                  else if (t === 'CARTON') setUnit('Boxes')
                  else setUnit('Pcs')
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 bg-white"
              >
                <option value="FABRIC">Fabric (Shell / Rib)</option>
                <option value="SEWING_THREAD">Sewing Thread (Core Spun)</option>
                <option value="LABEL">Brand Label / Care Tag</option>
                <option value="ZIPPER">Zipper / Fastener</option>
                <option value="POLYBAG">Export Polybag</option>
                <option value="CARTON">Master Corrugated Carton</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Required In-Store Date *
              </label>
              <input
                type="date"
                required
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Material Specification &amp; Color *
            </label>
            <input
              type="text"
              required
              value={materialName}
              onChange={e => setMaterialName(e.target.value)}
              placeholder="e.g. 100% Combed Single Jersey 190 GSM (Lemon Yellow)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Required Quantity *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={requiredQuantity}
                onChange={e => setRequiredQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 font-bold text-[#3A3564]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Unit of Measure *
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. Kg, Mtr, Cones, Gross, Boxes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Suggested Vendor / Approved Mill *
            </label>
            <input
              type="text"
              required
              value={vendorName}
              onChange={e => setVendorName(e.target.value)}
              placeholder="e.g. Vardhman Textiles Ltd / Coats India Global"
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10"
            />
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
              Issue Sourcing PR
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
