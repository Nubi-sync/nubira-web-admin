'use client'

import { useState, useEffect } from 'react'
import {
  Warehouse,
  X,
  AlertTriangle,
  Boxes,
  Truck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react'
import { saveHandoverPallet, getReadyGoodsCartons } from '../../utils/readyGoodsStorage'
import { GodownHandoverPallet, ReadyGoodsCarton } from '../../types/readyGoods'

interface CreatePalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePalletModal({
  isOpen,
  onClose,
  onSuccess
}: CreatePalletModalProps) {
  const [availableCartons, setAvailableCartons] = useState<ReadyGoodsCarton[]>([])
  const [selectedCartonIds, setSelectedCartonIds] = useState<string[]>([])
  const [palletCode, setPalletCode] = useState('')
  const [orderNumber, setOrderNumber] = useState('PO-7714')
  const [buyer, setBuyer] = useState('Urban Outfitters')
  const [targetBay, setTargetBay] = useState<'BAY_3' | 'BAY_4' | 'BAY_5'>('BAY_3')
  const [dockGate, setDockGate] = useState<'DOCK_01' | 'DOCK_02' | 'DOCK_03'>('DOCK_01')
  const [supervisorSignoff, setSupervisorSignoff] = useState('Mukesh Chandra (Head of Packaging)')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const all = getReadyGoodsCartons()
      // Filter cartons that are AQL cleared or packed
      const suitable = all.filter(c => c.status === 'AQL_AUDIT_PASSED' || c.status === 'PACKED')
      setAvailableCartons(suitable)

      const randomCode = Math.floor(9000 + Math.random() * 900)
      setPalletCode(`PLT-${randomCode}`)

      // Pre-select first 2 if available
      if (suitable.length > 0) {
        setSelectedCartonIds([suitable[0].id])
        setOrderNumber(suitable[0].orderNumber)
        setBuyer(suitable[0].buyer)
        setTargetBay(suitable[0].godownBay)
      }
      setError(null)
    }
  }, [isOpen])

  const toggleCarton = (c: ReadyGoodsCarton) => {
    if (selectedCartonIds.includes(c.id)) {
      setSelectedCartonIds(selectedCartonIds.filter(id => id !== c.id))
    } else {
      setSelectedCartonIds([...selectedCartonIds, c.id])
    }
  }

  const selectedCartonObjects = availableCartons.filter(c => selectedCartonIds.includes(c.id))
  const totalPieces = selectedCartonObjects.reduce((acc, c) => acc + c.totalPieces, 0)
  const totalGrossWeight = selectedCartonObjects.reduce((acc, c) => acc + c.measuredGrossWeightKg, 0)
  const totalCbm = selectedCartonObjects.reduce((acc, c) => acc + (c.cbmVolume || 0.096), 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!palletCode.trim()) {
      setError('Pallet code is required.')
      return
    }

    if (selectedCartonIds.length === 0) {
      setError('Please select at least one carton to palletize.')
      return
    }

    const newPallet: GodownHandoverPallet = {
      id: `plt-${Date.now()}`,
      palletCode: palletCode.trim(),
      orderNumber,
      buyer,
      cartonIds: selectedCartonIds,
      cartonNumbers: selectedCartonObjects.map(c => c.cartonNumber),
      totalCartons: selectedCartonObjects.length,
      totalPieces,
      totalGrossWeightKg: Number(totalGrossWeight.toFixed(2)),
      totalCbm: Number(totalCbm.toFixed(3)),
      targetBay,
      dockGate,
      gatePassStatus: 'READY_FOR_STUFFING',
      supervisorSignoff: supervisorSignoff.trim(),
      handoverDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveHandoverPallet(newPallet)
    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Warehouse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Pallet Manifest & Central Godown Gate Pass
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Staging Sealed Export Cartons for High-Bay Storage & Container Loading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Pallet Barcode # *
              </label>
              <input
                type="text"
                value={palletCode}
                onChange={e => setPalletCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono font-black text-[#3A3564] focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Order PO / Buyer
              </label>
              <input
                type="text"
                value={`${orderNumber} • ${buyer}`}
                readOnly
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 text-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target Central Godown Bay *
              </label>
              <select
                value={targetBay}
                onChange={e => setTargetBay(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="BAY_3">Bay 3 (Hoodies & Fleece)</option>
                <option value="BAY_4">Bay 4 (Tees & Polos)</option>
                <option value="BAY_5">Bay 5 (Bottoms & Wovens)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Assigned Container Dock Gate *
              </label>
              <select
                value={dockGate}
                onChange={e => setDockGate(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
              >
                <option value="DOCK_01">DOCK_01 (40ft HC Container Loading)</option>
                <option value="DOCK_02">DOCK_02 (20ft Standard Staging)</option>
                <option value="DOCK_03">DOCK_03 (Domestic Courier Shuttle)</option>
              </select>
            </div>
          </div>

          {/* Select Cartons to Palletize */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                Select Cartons for this Pallet Manifest ({selectedCartonIds.length} Selected)
              </label>
            </div>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-black/10 p-2 space-y-1.5 bg-slate-50/50">
              {availableCartons.map(c => {
                const isSelected = selectedCartonIds.includes(c.id)
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCarton(c)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#3A3564] text-[#3A3564] font-bold'
                        : 'bg-white border-black/5 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-[#3A3564]"
                      />
                      <span className="font-mono">{c.cartonNumber}</span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {c.styleName.substring(0, 20)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>{c.totalPieces} pcs</span>
                      <span className="text-slate-400">|</span>
                      <span>{c.measuredGrossWeightKg} kg</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px]">
                        {c.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pallet Manifest Totals */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2">
            <span className="text-xs font-mono font-bold text-[#3A3564] uppercase flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              Manifest Aggregate Telemetry
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Pieces</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {totalPieces} Garments
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Gross Weight</span>
                <div className="font-mono font-black text-[#3A3564] text-sm mt-0.5">
                  {totalGrossWeight.toFixed(2)} kg
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Total Volume</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  {totalCbm.toFixed(3)} CBM
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Packaging Head / Supervisor Signoff *
            </label>
            <input
              type="text"
              value={supervisorSignoff}
              onChange={e => setSupervisorSignoff(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>Generate Pallet Gate Pass</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
