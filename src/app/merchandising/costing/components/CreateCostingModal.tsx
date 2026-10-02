'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Calculator } from 'lucide-react'
import { BomCosting, MerchandisingOrder } from '../../types/merchandising'
import { saveBomCosting, getOrders } from '../../utils/merchandisingStorage'
import { createBomCostingAction } from '../../actions'

interface CreateCostingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCostingModal({ isOpen, onClose, onSuccess }: CreateCostingModalProps) {
  const [orders, setOrders] = useState<MerchandisingOrder[]>([])
  const [selectedPo, setSelectedPo] = useState('')
  
  // Costing line items (INR ₹)
  const [fabricCost, setFabricCost] = useState('550.00')
  const [trimsCost, setTrimsCost] = useState('85.00')
  const [embellishmentCost, setEmbellishmentCost] = useState('65.00')
  const [cmtSewingRate, setCmtSewingRate] = useState('180.00')
  const [washingCost, setWashingCost] = useState('45.00')
  const [packagingCost, setPackagingCost] = useState('35.00')
  const [targetMargin, setTargetMargin] = useState('18.0')
  const [actualRealized, setActualRealized] = useState('1080.00')

  const [error, setError] = useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      const liveOrders = getOrders()
      setOrders(liveOrders)
      if (liveOrders.length > 0 && !selectedPo) {
        setSelectedPo(liveOrders[0].po_number)
      }
    }
  }, [isOpen, selectedPo])

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (selectedOrder?.id) {
      try {
        await createBomCostingAction({
          order_id: selectedOrder.id,
          fabric_cost: fCost,
          trims_cost: tCost,
          embellishment_cost: eCost,
          cmt_cost: cmtCost,
          washing_cost: wCost,
          packaging_cost: pCost,
          factory_overhead_pct: 12.0,
          target_margin_pct: parseFloat(targetMargin) || 15.0,
          planned_fob_rate: parseFloat(netFobCost.toFixed(2)),
          actual_realized_cost: parseFloat(actualCost.toFixed(2)),
          variance_pct: parseFloat(variancePercent.toFixed(2))
        })
      } catch (err) {
        console.warn('[CreateCostingModal] Server sync notice:', err)
      }
    }

    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#0B1220]/10 text-[#0B1220]">
              Form 2 • Pre-Costing &amp; Post-Costing
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Create BOM Costing Sheet
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs overflow-y-auto flex-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 bg-white"
            >
              {orders.map(o => (
                <option key={o.id} value={o.po_number}>
                  {o.po_number} — {o.brand_name} ({o.style_ref})
                </option>
              ))}
            </select>
          </div>

          {/* Cost Line Items Grid */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Direct Production Cost Breakdown (Per Garment in ₹ INR)
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Computed Ledger Totals */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Direct Manufacturing Subtotal:</span>
              <span>₹{directSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Factory Overhead (Fixed 12%):</span>
              <span>+₹{overhead.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-200 text-sm">
              <span>Planned Net FOB Cost:</span>
              <span className="text-[#0B1220]">₹{netFobCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Actual Realized & Variance Post-Costing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Actual Realized Post-Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={actualRealized}
                onChange={e => setActualRealized(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
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

          {/* Commercial Profit Realization vs Buyer Contract FOB */}
          {selectedOrder && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Buyer Contract FOB Price:</span>
                <span className="font-mono font-bold text-slate-900">
                  ₹{selectedOrder.unit_fob_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / pc
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Planned Factory Cost:</span>
                <span className="font-mono font-bold text-slate-700">
                  -₹{netFobCost.toFixed(2)} / pc
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Gross Commercial Profit:</span>
                  <span className="text-[11px] text-slate-500">Realized gross profit margin per piece</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono block ${
                    selectedOrder.unit_fob_price - netFobCost >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {selectedOrder.unit_fob_price - netFobCost >= 0 ? '+' : ''}₹{(selectedOrder.unit_fob_price - netFobCost).toFixed(2)} / pc
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {(((selectedOrder.unit_fob_price - netFobCost) / selectedOrder.unit_fob_price) * 100).toFixed(1)}% Gross Margin
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer"
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
