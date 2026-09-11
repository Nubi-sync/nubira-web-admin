'use client'

import React, { useState } from 'react'
import { X, Boxes, CheckCircle2 } from 'lucide-react'
import {
  ThreadConeItem,
  ThreadBrand,
  ThreadType,
  StockStatus,
} from '../../types/embroidery'
import { saveThreadCone } from '../../utils/embroideryStorage'

interface AddThreadConeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddThreadConeModal({ isOpen, onClose }: AddThreadConeModalProps) {
  const [brand, setBrand] = useState<ThreadBrand>('Madeira')
  const [shadeNumber, setShadeNumber] = useState('')
  const [pantoneMatch, setPantoneMatch] = useState('')
  const [threadType, setThreadType] = useState<ThreadType>('Polyester 40wt')
  const [initialWeight, setInitialWeight] = useState(1000)
  const [conesInStock, setConesInStock] = useState(24)
  const [storageBin, setStorageBin] = useState('Rack E-02 / Bin 08')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!shadeNumber) return

    setIsSubmitting(true)

    const newCone: ThreadConeItem = {
      id: `cone-${Date.now()}`,
      cone_code: `CONE-${brand.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      brand,
      shade_number: shadeNumber.trim(),
      pantone_match: pantoneMatch.trim() || 'Pantone Custom Match',
      thread_type: threadType,
      initial_weight_grams: Number(initialWeight),
      current_weight_grams: Number(initialWeight),
      cones_in_stock: Number(conesInStock),
      storage_bin: storageBin.trim(),
      status: Number(conesInStock) < 5 ? 'LOW_STOCK' : 'IN_STOCK',
      created_at: new Date().toISOString(),
    }

    saveThreadCone(newCone)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register Thread Cone Stock
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Madeira / Isacord Inventory Allocation
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
                Thread Manufacturer *
              </label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value as ThreadBrand)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="Madeira">Madeira Classic</option>
                <option value="Isacord">Isacord Polyester</option>
                <option value="Coats">Coats Sylko</option>
                <option value="Vardhman">Vardhman Rayon</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Thread Material *
              </label>
              <select
                value={threadType}
                onChange={e => setThreadType(e.target.value as ThreadType)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="Polyester 40wt">Polyester 40wt</option>
                <option value="Rayon Viscose 40wt">Rayon Viscose 40wt</option>
                <option value="Metallic Gold">Metallic Gold</option>
                <option value="Flame Retardant">Flame Retardant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Shade Number / Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1800 Jet Obsidian"
                value={shadeNumber}
                onChange={e => setShadeNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Pantone Match Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Pantone 19-4007 TCX"
                value={pantoneMatch}
                onChange={e => setPantoneMatch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Cone Weight (Grams)
              </label>
              <input
                type="number"
                required
                value={initialWeight}
                onChange={e => setInitialWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Cones in Stock *
              </label>
              <input
                type="number"
                required
                min={1}
                value={conesInStock}
                onChange={e => setConesInStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold text-[#3A3564]"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Storage Shelf / Bin
              </label>
              <input
                type="text"
                value={storageBin}
                onChange={e => setStorageBin(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
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
              <span>Store Cones</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
