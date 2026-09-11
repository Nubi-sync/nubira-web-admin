'use client'

import { useState, useEffect } from 'react'
import { X, Check, Tag, Plus, Minus, RotateCw, AlertTriangle } from 'lucide-react'
import { TrimsInventoryItem } from '../../types/store'
import { adjustTrimsStock } from '../../utils/storeStorage'

interface AdjustTrimStockModalProps {
  isOpen: boolean
  onClose: () => void
  item: TrimsInventoryItem | null
}

export function AdjustTrimStockModal({ isOpen, onClose, item }: AdjustTrimStockModalProps) {
  const [adjustmentQty, setAdjustmentQty] = useState<number>(100)
  const [mode, setMode] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD')
  const [reason, setReason] = useState<string>('Mill delivery replenishment')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      setAdjustmentQty(item.currentStock <= item.reorderLevel ? item.reorderLevel * 2 : 100)
    }
  }, [item])

  if (!isOpen || !item) return null

  const calculatedNewStock = mode === 'ADD'
    ? item.currentStock + adjustmentQty
    : mode === 'SUBTRACT'
    ? Math.max(0, item.currentStock - adjustmentQty)
    : Math.max(0, adjustmentQty)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      adjustTrimsStock(item.id, adjustmentQty, mode, reason)
      onClose()
    } catch (err) {
      console.error('Failed to adjust stock:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Adjust Trim Stock
              </h2>
              <p className="text-xs font-mono text-slate-500">
                {item.itemCode} • {item.binLocation}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10">
          <span className="text-xs font-bold text-slate-900 block">
            {item.itemName}
          </span>
          <div className="flex items-center justify-between mt-2 text-xs font-mono">
            <span className="text-slate-500">Current Stock:</span>
            <span className="font-black text-slate-900">
              {item.currentStock.toLocaleString()} {item.unit}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs font-mono">
            <span className="text-slate-500">Re-Order Level (ROL):</span>
            <span className="font-bold text-amber-700">
              {item.reorderLevel.toLocaleString()} {item.unit}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('ADD')}
              className={`p-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'ADD'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Inward / Add</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('SUBTRACT')}
              className={`p-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'SUBTRACT'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Deduct / Loss</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('SET')}
              className={`p-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                mode === 'SET'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                  : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Cycle Audit</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
              Quantity ({item.unit})
            </label>
            <input
              type="number"
              min="1"
              value={adjustmentQty}
              onChange={(e) => setAdjustmentQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              required
            />
          </div>

          {/* New Stock Preview */}
          <div className="p-3 rounded-xl border border-black/5 bg-slate-50 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 font-bold">Projected New Balance:</span>
            <span className="text-sm font-black text-slate-900">
              {calculatedNewStock.toLocaleString()} {item.unit}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
              Adjustment Reason & Reference
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. GRN receipt or monthly physical audit"
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Commit Stock Update'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
