'use client'

import React, { useState } from 'react'
import {
  X,
  PackagePlus,
  Scissors,
  Printer,
  Sparkles,
  Waves,
  Flame,
  Check,
  Building2,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { FinishingInspectionTask, ReadyGoodsWorker } from '../types/readyGoods'
import { saveFinishingInspectionTask } from '../utils/readyGoodsStorage'
import { broadcastFloorEvent } from '@/utils/floorRealtime'

interface InwardLotModalProps {
  isOpen: boolean
  onClose: () => void
  workers: ReadyGoodsWorker[]
  companyName?: string
  defaultBuyerName?: string
  onLotCreated: (task: FinishingInspectionTask) => void
}

const PRESETS = [
  {
    label: 'T-Shirt (Screen Print)',
    buyer: 'Zara International',
    style: 'Heavyweight Boxy Drop-Shoulder Tee',
    color: 'Onyx Black',
    size: 'M',
    pieces: 75,
    washBatch: 'WB-084 (Bio-Polish Enzyme Wash)',
    ironStation: 'Vacuum Table 01',
    hasPrinting: true,
    hasEmbroidery: false,
    summary: 'Chest Graphic Screen Print'
  },
  {
    label: 'Hoodie (Print & Embroidery)',
    buyer: 'Urban Outfitters',
    style: 'French Terry Relaxed Hoodie',
    color: 'Vintage Mineral Wash',
    size: 'L',
    pieces: 50,
    washBatch: 'WB-082 (Silicon Softener Wash)',
    ironStation: 'Steam Press Board 03',
    hasPrinting: true,
    hasEmbroidery: true,
    summary: 'Chest Embroidery + Back Screen Print'
  },
  {
    label: 'Polo (Embroidery Only)',
    buyer: 'Tommy Hilfiger',
    style: 'Pique Heritage Polo',
    color: 'Classic Navy',
    size: 'S',
    pieces: 60,
    washBatch: 'WB-081 (Silicone Soft Wash)',
    ironStation: 'Collar Crease Table 02',
    hasPrinting: false,
    hasEmbroidery: true,
    summary: 'Crest Logo Multi-Head Embroidery'
  },
  {
    label: 'Denim Overshirt (Plain)',
    buyer: 'Levi Strauss Co',
    style: 'Raw Denim Workwear Overshirt',
    color: 'Indigo Rinse',
    size: 'XL',
    pieces: 40,
    washBatch: 'WB-085 (Stone Wash & Tint)',
    ironStation: 'Heavy Steam Press 04',
    hasPrinting: false,
    hasEmbroidery: false,
    summary: 'Standard Denim Finish (No Print/Embroidery)'
  }
]

export function InwardLotModal({
  isOpen,
  onClose,
  workers,
  companyName,
  defaultBuyerName,
  onLotCreated
}: InwardLotModalProps) {
  const [lotCode, setLotCode] = useState(() => `QC-${Math.floor(1000 + Math.random() * 9000)}-01`)
  const [poNumber, setPoNumber] = useState(() => `PO-${Math.floor(7000 + Math.random() * 1000)}`)
  const [buyer, setBuyer] = useState(() => defaultBuyerName && defaultBuyerName !== 'ALL' ? defaultBuyerName : 'Urban Outfitters')
  const [styleName, setStyleName] = useState('French Terry Relaxed Hoodie')
  const [color, setColor] = useState('Vintage Mineral Wash')
  const [size, setSize] = useState('L')
  const [piecesCount, setPiecesCount] = useState<number>(50)
  const [washBatch, setWashBatch] = useState('WB-082 (Silicon Softener Wash)')
  const [ironStation, setIronStation] = useState('Steam Press Board 03')
  const [hasPrinting, setHasPrinting] = useState(true)
  const [hasEmbroidery, setHasEmbroidery] = useState(true)
  const [techPackSummary, setTechPackSummary] = useState('Embroidery First, Then Printing')
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>('')

  // Sync default buyer when opened
  React.useEffect(() => {
    if (isOpen && defaultBuyerName && defaultBuyerName !== 'ALL') {
      setBuyer(defaultBuyerName)
    }
  }, [isOpen, defaultBuyerName])

  if (!isOpen) return null

  // Active Checkers or Both
  const availableCheckers = workers.filter(w => w.role === 'CHECKER' || w.role === 'BOTH')

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setBuyer(preset.buyer)
    setStyleName(preset.style)
    setColor(preset.color)
    setSize(preset.size)
    setPiecesCount(preset.pieces)
    setWashBatch(preset.washBatch)
    setIronStation(preset.ironStation)
    setHasPrinting(preset.hasPrinting)
    setHasEmbroidery(preset.hasEmbroidery)
    setTechPackSummary(preset.summary)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!lotCode.trim() || !poNumber.trim() || !buyer.trim() || !styleName.trim()) {
      toast.error('Please complete all required garment information.')
      return
    }

    if (piecesCount <= 0) {
      toast.error('Pieces count must be at least 1.')
      return
    }

    const assignedWorker = workers.find(w => w.id === assignedWorkerId)

    const newTask: FinishingInspectionTask = {
      id: `task-fin-${Date.now()}`,
      task_code: lotCode.trim(),
      order_number: poNumber.trim(),
      buyer: buyer.trim(),
      style_name: styleName.trim(),
      color: color.trim() || 'Standard',
      size: size.trim() || 'M',
      pieces_count: piecesCount,
      origin_stage: 'WASHING_AND_IRON',
      wash_batch_ref: washBatch.trim() || 'Washing Batch #01',
      iron_station_ref: ironStation.trim() || 'Steam Iron Line 01',
      has_printing: hasPrinting,
      has_embroidery: hasEmbroidery,
      tech_pack_summary: techPackSummary.trim() || (
        hasPrinting && hasEmbroidery
          ? 'Printing & Embroidery Required'
          : hasPrinting
          ? 'Screen Printing Required'
          : hasEmbroidery
          ? 'Embroidery Required'
          : 'Plain Finish (No Print/Embroidery)'
      ),
      checklist: {
        cutting_done_right: false,
        printing_done_right: false,
        embroidery_done_right: false,
        washing_done_right: false,
        iron_done_right: false
      },
      status: assignedWorker ? 'IN_CHECKING' : 'PENDING_CHECK',
      checked_by_worker_id: assignedWorker?.id,
      checked_by_worker_name: assignedWorker?.worker_name,
      company_name: companyName,
      created_at: new Date().toISOString()
    }

    saveFinishingInspectionTask(newTask)

    broadcastFloorEvent({
      eventType: 'TASK_ALLOCATED',
      sourceModule: 'ready-goods',
      companyName,
      title: 'New QC Lot Arrived from Finishing',
      message: `${piecesCount} pcs of ${styleName} (${lotCode}) ready for inspection.`,
      pieces: piecesCount,
      taskRef: lotCode
    })

    toast.success(`Lot #${lotCode} successfully inwarded to Quality Clinic!`)
    onLotCreated(newTask)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inward Garments for Quality Clinic
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Record incoming lot arriving from washing &amp; steam iron to inspect and assign
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Quick 1-Click Presets
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill sample garment</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-2 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white hover:border-[#3A3564] text-left transition-all text-xs cursor-pointer shadow-2xs group"
                >
                  <div className="font-bold text-slate-900 group-hover:text-[#3A3564] truncate">
                    {preset.label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                    {preset.pieces} pcs • {preset.buyer}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Lot & PO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                QC Lot Code *
              </label>
              <input
                type="text"
                required
                value={lotCode}
                onChange={e => setLotCode(e.target.value)}
                placeholder="e.g. QC-7720-01"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-black/15 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Buyer Order / PO # *
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                placeholder="e.g. PO-7720"
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Buyer & Style Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Buyer Name *
              </label>
              <input
                type="text"
                required
                value={buyer}
                onChange={e => setBuyer(e.target.value)}
                placeholder="e.g. Urban Outfitters, Zara, H&M"
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Article / Style Name *
              </label>
              <input
                type="text"
                required
                value={styleName}
                onChange={e => setStyleName(e.target.value)}
                placeholder="e.g. French Terry Relaxed Hoodie"
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Quantity, Size & Color */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pieces Count *
              </label>
              <input
                type="number"
                min={1}
                required
                value={piecesCount}
                onChange={e => setPiecesCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Size
              </label>
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              >
                {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Free Size'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="e.g. Onyx Black"
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/15 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>
          </div>

          {/* Finishing Origin (Wash & Iron) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 rounded-xl border border-black/10">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider mb-1">
                Wash Batch Origin
              </label>
              <input
                type="text"
                value={washBatch}
                onChange={e => setWashBatch(e.target.value)}
                placeholder="e.g. WB-082 (Silicon Softener Wash)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-black/10 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider mb-1">
                Steam Iron Station
              </label>
              <input
                type="text"
                value={ironStation}
                onChange={e => setIronStation(e.target.value)}
                placeholder="e.g. Steam Press Board 03"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-black/10 bg-white"
              />
            </div>
          </div>

          {/* Tech Pack Criteria Toggles */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-white space-y-2.5">
            <span className="block text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
              Tech Pack Criteria Configuration
            </span>
            <p className="text-[11px] text-slate-500">
              Only enabled criteria will be required on the checker's verification checklist. (Cutting, Washing, and Ironing are always verified).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                hasPrinting ? 'border-[#3A3564] bg-[#3A3564]/5 font-semibold text-slate-900' : 'border-black/10 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={hasPrinting}
                  onChange={e => setHasPrinting(e.target.checked)}
                  className="w-4 h-4 text-[#3A3564] rounded border-slate-300"
                />
                <div className="flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-[#3A3564]" />
                  <span className="text-xs">Undergoes Printing (Screen/DTF)</span>
                </div>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                hasEmbroidery ? 'border-[#3A3564] bg-[#3A3564]/5 font-semibold text-slate-900' : 'border-black/10 text-slate-600'
              }`}>
                <input
                  type="checkbox"
                  checked={hasEmbroidery}
                  onChange={e => setHasEmbroidery(e.target.checked)}
                  className="w-4 h-4 text-[#3A3564] rounded border-slate-300"
                />
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs">Undergoes Embroidery</span>
                </div>
              </label>
            </div>
          </div>

          {/* Assign Quality Checker Worker */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assign Quality Checker (Optional)
            </label>
            <select
              value={assignedWorkerId}
              onChange={e => setAssignedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-black/15 bg-white text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
            >
              <option value="">Unassigned (Queue in Incoming Pool)</option>
              {availableCheckers.length === 0 ? (
                <option value="" disabled>No registered checkers yet (register via + Add Worker)</option>
              ) : (
                availableCheckers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} ({w.role === 'BOTH' ? 'Checker & Packer' : 'Checker'}) • {w.assigned_station}
                  </option>
                ))
              )}
            </select>
            {availableCheckers.length === 0 && (
              <p className="text-[11px] text-amber-700 mt-1">
                Tip: You can add workers with the "+ Add Worker" button and assign them to this lot anytime!
              </p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>Inward Lot for Inspection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
