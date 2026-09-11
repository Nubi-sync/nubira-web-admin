'use client'

import React, { useState } from 'react'
import { X, Calculator, CheckCircle2 } from 'lucide-react'
import { StitchBillingLedger, BillingStatus } from '../../types/embroidery'
import { saveBillingLedger } from '../../utils/embroideryStorage'

interface CreateBillingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBillingModal({ isOpen, onClose }: CreateBillingModalProps) {
  const [orderPo, setOrderPo] = useState('PO-2026-ZARA-01')
  const [buyerName, setBuyerName] = useState('Zara Man')
  const [designCode, setDesignCode] = useState('DST-ZARA-CREST-04')
  const [totalPieces, setTotalPieces] = useState(1200)
  const [stitchCountPerPiece, setStitchCountPerPiece] = useState(18450)
  const [ratePerThousand, setRatePerThousand] = useState(2.80)
  const [backingCostPerPiece, setBackingCostPerPiece] = useState(1.20)
  const [billingStatus, setBillingStatus] = useState<BillingStatus>('APPROVED')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  // Industry Standard Piece-rate calculation
  const stitchCostPerPiece = (Number(stitchCountPerPiece) / 1000) * Number(ratePerThousand)
  const totalCostPerPiece = stitchCostPerPiece + Number(backingCostPerPiece)
  const totalAmount = Number(totalPieces) * totalCostPerPiece
  const totalStitchesBilled = Number(totalPieces) * Number(stitchCountPerPiece)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const newLedger: StitchBillingLedger = {
      id: `bill-emb-${Date.now()}`,
      invoice_code: `INV-EMB-2026-${Math.floor(100 + Math.random() * 900)}`,
      order_po: orderPo,
      buyer_name: buyerName,
      design_code: designCode,
      total_pieces: Number(totalPieces),
      stitch_count_per_piece: Number(stitchCountPerPiece),
      total_stitches_billed: totalStitchesBilled,
      rate_per_thousand: Number(ratePerThousand),
      backing_cost_per_piece: Number(backingCostPerPiece),
      total_amount: Math.round(totalAmount * 100) / 100,
      billing_status: billingStatus,
      created_at: new Date().toISOString(),
    }

    saveBillingLedger(newLedger)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Generate Stitch Billing Ledger
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Piece-rate Jobwork Calculation Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Buyer Name
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-medium"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Order PO Reference
              </label>
              <input
                type="text"
                required
                value={orderPo}
                onChange={e => setOrderPo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Punch File Code
              </label>
              <input
                type="text"
                required
                value={designCode}
                onChange={e => setDesignCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Total Pieces Embroidered *
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalPieces}
                onChange={e => setTotalPieces(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Stitches / Pc *
              </label>
              <input
                type="number"
                required
                min={500}
                value={stitchCountPerPiece}
                onChange={e => setStitchCountPerPiece(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold text-[#3A3564]"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Rate / 1k Stitches (₹)
              </label>
              <input
                type="number"
                step="0.05"
                required
                value={ratePerThousand}
                onChange={e => setRatePerThousand(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Backing Cost / Pc (₹)
              </label>
              <input
                type="number"
                step="0.10"
                required
                value={backingCostPerPiece}
                onChange={e => setBackingCostPerPiece(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          {/* Live Calculation Preview */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2 font-mono text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Commercial Formula Breakdown:
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Stitch Rate Component:</span>
              <span className="font-bold text-slate-900">
                ({stitchCountPerPiece.toLocaleString()} / 1,000) × ₹{ratePerThousand.toFixed(2)} = ₹{stitchCostPerPiece.toFixed(2)} / pc
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Unit Cost (Stitch + Backing):</span>
              <span className="font-bold text-slate-900">
                ₹{totalCostPerPiece.toFixed(2)} / piece
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-black/10 text-sm">
              <span className="font-bold text-[#3A3564]">Total Ledger Value:</span>
              <span className="font-black text-emerald-700">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-slate-600 hover:bg-slate-100 font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Generate Billing Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
