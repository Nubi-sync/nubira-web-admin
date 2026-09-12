'use client'

import React, { useState } from 'react'
import { X, Upload, FileCode, CheckCircle2 } from 'lucide-react'
import {
  EmbroideryDesign,
  ThreadBrand,
  BackingType,
} from '../../types/embroidery'
import { saveEmbroideryDesign } from '../../utils/embroideryStorage'

interface UploadPunchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadPunchModal({ isOpen, onClose }: UploadPunchModalProps) {
  const [designCode, setDesignCode] = useState('')
  const [designName, setDesignName] = useState('')
  const [buyerName, setBuyerName] = useState('OLLYPOP')
  const [orderId, setOrderId] = useState('PO-ZIG-8901')
  const [fileName, setFileName] = useState('')
  const [totalStitches, setTotalStitches] = useState(18500)
  const [colorStopsCount, setColorStopsCount] = useState(4)
  const [backingType, setBackingType] = useState<BackingType>('Tear-Away 40 GSM')
  const [threadBrand, setThreadBrand] = useState<ThreadBrand>('Madeira')
  const [ratePerThousand, setRatePerThousand] = useState(2.80)
  const [widthMm, setWidthMm] = useState(80)
  const [heightMm, setHeightMm] = useState(85)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!designCode || !totalStitches) return

    setIsSubmitting(true)

    const newDesign: EmbroideryDesign = {
      id: `emb-des-${Date.now()}`,
      design_code: designCode.trim().toUpperCase(),
      design_name: designName.trim() || `${designCode.trim().toUpperCase()} Design`,
      buyer_name: buyerName,
      order_id: orderId,
      total_stitches: Number(totalStitches),
      color_stops_count: Number(colorStopsCount),
      dst_file_name: fileName || `${designCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}.dst`,
      rate_per_thousand_stitches: Number(ratePerThousand),
      backing_type: backingType,
      thread_brand: threadBrand,
      status: 'APPROVED',
      width_mm: Number(widthMm),
      height_mm: Number(heightMm),
      created_at: new Date().toISOString(),
    }

    saveEmbroideryDesign(newDesign)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register DST Punch File
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Form 1 • Digitized Stitch File Registration
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Design Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DST-OLLY-HD8821-CHEST"
                value={designCode}
                onChange={e => setDesignCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Design Name
              </label>
              <input
                type="text"
                placeholder="e.g. Chest Monogram Crest"
                value={designName}
                onChange={e => setDesignName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Buyer Account
              </label>
              <select
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="OLLYPOP">OLLYPOP</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Linked PO Reference *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PO-ZIG-8901"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          {/* Stitch Counts & Needle Color Stops */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Total Stitch Count *
              </label>
              <input
                type="number"
                required
                min={500}
                max={250000}
                value={totalStitches}
                onChange={e => setTotalStitches(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold text-[#3A3564]"
              />
              <span className="text-[10px] text-slate-400">Min 500 – Max 250k stitches</span>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Color Stops (Needle Changes) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={15}
                value={colorStopsCount}
                onChange={e => setColorStopsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">1 to 15 thread changes</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Backing Stabilizer Type *
              </label>
              <select
                value={backingType}
                onChange={e => setBackingType(e.target.value as BackingType)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="Tear-Away 40 GSM">Tear-Away 40 GSM</option>
                <option value="Cut-Away 60 GSM">Cut-Away 60 GSM</option>
                <option value="Water Soluble">Water Soluble</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Thread Brand *
              </label>
              <select
                value={threadBrand}
                onChange={e => setThreadBrand(e.target.value as ThreadBrand)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="Madeira">Madeira Classic</option>
                <option value="Isacord">Isacord Polyester</option>
                <option value="Coats">Coats Sylko</option>
                <option value="Vardhman">Vardhman Rayon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Width (mm)
              </label>
              <input
                type="number"
                value={widthMm}
                onChange={e => setWidthMm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Height (mm)
              </label>
              <input
                type="number"
                value={heightMm}
                onChange={e => setHeightMm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Rate / 1k Stitches (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={ratePerThousand}
                onChange={e => setRatePerThousand(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
          </div>

          {/* Upload Dropzone Preview */}
          <div>
            <label className="block font-mono font-bold text-slate-700 mb-1">
              Machine Binary Stitch File (.DST / .DSB)
            </label>
            <div className="p-3 border-2 border-dashed border-black/10 rounded-xl bg-slate-50/70 flex flex-col items-center justify-center text-center">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <input
                type="text"
                placeholder="punch_file_name.dst"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                className="w-full max-w-xs px-2 py-1 text-center font-mono text-[11px] rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1">
                Auto-generates binary header and needle travel coordinates
              </span>
            </div>
          </div>

          {/* Submit */}
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
              <span>Register & Save DST</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
