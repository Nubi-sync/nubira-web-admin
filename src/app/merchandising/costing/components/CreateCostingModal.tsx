'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Calculator } from 'lucide-react'
import { BomCosting, MerchandisingOrder } from '../../types/merchandising'
import { saveBomCosting, getOrders } from '../../utils/merchandisingStorage'

interface CreateCostingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCostingModal({ isOpen, onClose, onSuccess }: CreateCostingModalProps) {
  const [orders] = useState<MerchandisingOrder[]>(getOrders())
  const [selectedPo, setSelectedPo] = useState(orders[0]?.po_number || '')
  
  // Costing line items
  const [fabricCost, setFabricCost] = useState('6.50')
  const [trimsCost, setTrimsCost] = useState('1.20')
  const [embellishmentCost, setEmbellishmentCost] = useState('0.75')
  const [cmtSewingRate, setCmtSewingRate] = useState('2.00')
  const [washingCost, setWashingCost] = useState('0.50')
  const [packagingCost, setPackagingCost] = useState('0.40')
  const [targetMargin, setTargetMargin] = useState('18.0')
  const [actualRealized, setActualRealized] = useState('13.20')

  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedOrder = orders.find(o => o.po_number === selectedPo)

  // Calculations
  const fCost = parseFloat(fabricCost) || 0
  const tCost = parseFloat(trimsCost) || 0
  const eCost = parseFloat(embellishmentCost) || 0
  const cmtCost = parseFloat(cmtSewingRate) || 0
  const wCost = parseFloat(washingCost) || 0
  const pCost = parseFloat(packagingCost) || 0

  const directSubtotal = fCost + tCost + eCost + cmtCost + wCost + pCost
  const overhead = directSubtotal * 0.12 // 12% factory overhead
  const netFobCost = directSubtotal + overhead

  const actualCost = parseFloat(actualRealized) || netFobCost
  const variancePercent = netFobCost > 0 ? ((actualCost - netFobCost) / netFobCost) * 100 : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedPo) {
      setError('Please select an active Buyer PO')
      return
    }

    const newSheet: BomCosting = {
      id: `bom-${Date.now()}`,
      order_id: selectedOrder?.id || `ord-${Date.now()}`,
      po_number: selectedPo,
      style_ref: selectedOrder?.style_ref || 'CUSTOM-STYLE',
      style_name: selectedOrder?.style_name || 'Custom Garment Spec',
      fabric_cost: fCost,
      trims_accessories_cost: tCost,
      embellishment_cost: eCost,
      cmt_sewing_rate: cmtCost,
      washing_finishing_cost: wCost,
      packaging_cost: pCost,
      factory_overhead_percent: 12.0,
      net_fob_cost: parseFloat(netFobCost.toFixed(2)),
      target_margin_percent: parseFloat(targetMargin) || 15.0,
      actual_realized_cost: parseFloat(actualCost.toFixed(2)),
      variance_percent: parseFloat(variancePercent.toFixed(2))
    }

    saveBomCosting(newSheet)
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
              Form 2 • Pre-Costing & Post-Costing
            </span>
            <h2 className="text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Create BOM Costing Sheet
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Linked PO Dropdown */}
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

          {/* Cost Line Items Grid */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Direct Production Cost Breakdown (Per Garment)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Fabric Cost</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={fabricCost}
                  onChange={e => setFabricCost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Trims & Thread</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={trimsCost}
                  onChange={e => setTrimsCost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Print / Embellish</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={embellishmentCost}
                  onChange={e => setEmbellishmentCost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">CMT Sewing Rate</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cmtSewingRate}
                  onChange={e => setCmtSewingRate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Washing / Finish</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={washingCost}
                  onChange={e => setWashingCost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Export Packaging</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={packagingCost}
                  onChange={e => setPackagingCost(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-black/10 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Computed Ledger Totals */}
          <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Direct Manufacturing Subtotal:</span>
              <span>{directSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Factory Overhead (Fixed 12%):</span>
              <span>+{overhead.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-black/10 text-sm">
              <span>Planned Net FOB Cost:</span>
              <span className="text-[#3A3564]">{netFobCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Actual Realized & Variance Post-Costing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Actual Realized Post-Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={actualRealized}
                onChange={e => setActualRealized(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cost Variance
              </label>
              <div className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                variancePercent > 2.0 
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <span>{variancePercent > 0 ? `+${variancePercent.toFixed(2)}%` : `${variancePercent.toFixed(2)}%`}</span>
                <span>{variancePercent > 2.0 ? 'Over Budget' : 'Within Margin'}</span>
              </div>
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
              Save BOM Costing Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
