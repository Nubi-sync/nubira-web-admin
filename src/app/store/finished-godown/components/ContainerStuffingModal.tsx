'use client'

import { useState } from 'react'
import { X, Check, Warehouse, Ship, ShieldCheck, Box, Tag } from 'lucide-react'
import { FinishedExportPallet } from '../../types/store'
import { assignContainerStuffing } from '../../utils/storeStorage'

interface ContainerStuffingModalProps {
  isOpen: boolean
  onClose: () => void
  availablePallets: FinishedExportPallet[]
}

export function ContainerStuffingModal({ isOpen, onClose, availablePallets }: ContainerStuffingModalProps) {
  const [containerNumber, setContainerNumber] = useState('')
  const [shippingLine, setShippingLine] = useState('')
  const [sealNumber, setSealNumber] = useState(`SEAL-${Math.floor(100000 + Math.random() * 900000)}`)
  const [destinationPort, setDestinationPort] = useState('')
  const [selectedPalletIds, setSelectedPalletIds] = useState<string[]>(
    availablePallets.filter(p => p.shippingStatus === 'STAGED_IN_BAY').map(p => p.id)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const togglePallet = (id: string) => {
    setSelectedPalletIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const selectedPallets = availablePallets.filter(p => selectedPalletIds.includes(p.id))
  const totalCartons = selectedPallets.reduce((acc, p) => acc + p.cartonCount, 0)
  const totalPcs = selectedPallets.reduce((acc, p) => acc + p.totalPcs, 0)
  const totalWeight = Math.round(selectedPallets.reduce((acc, p) => acc + p.grossWeightKg, 0) * 10) / 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPalletIds.length === 0) {
      alert('Please select at least 1 pallet for container stuffing.')
      return
    }

    setIsSubmitting(true)
    try {
      assignContainerStuffing(selectedPalletIds, containerNumber, destinationPort)
      onClose()
    } catch (err) {
      console.error('Failed to assign container stuffing:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold shadow-2xs">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-[family-name:var(--font-heading)]">
                Container Stuffing & Export Gate Pass
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Overseas Export Logistics Manifest & Seal Authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Load Tally Summary Banner */}
        <div className="bg-[#FAF7F0] p-4 rounded-xl border border-black/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Consolidated Cargo Manifest
            </span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
                {totalCartons} Cartons
              </span>
              <span className="text-xs font-mono font-bold text-[#3A3564] tabular-nums">
                ({totalPcs.toLocaleString()} Garment Pcs)
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                • {totalWeight} kg Gross
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            {selectedPalletIds.length} Pallets Selected
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Container No (40ft High-Cube)
              </label>
              <input
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MSCU-482091-7"
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Shipping Carrier Line
              </label>
              <select
                value={shippingLine}
                onChange={(e) => setShippingLine(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
              >
                <option value="MSC Mediterranean Shipping Co.">MSC Mediterranean Shipping Co.</option>
                <option value="Maersk Line (A.P. Moller)">Maersk Line (A.P. Moller)</option>
                <option value="Hapag-Lloyd AG">Hapag-Lloyd AG</option>
                <option value="CMA CGM Group">CMA CGM Group</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Customs High-Security Bolt Seal #
              </label>
              <input
                type="text"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Destination Port of Discharge
              </label>
              <input
                type="text"
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                placeholder="e.g. Port of Rotterdam (NLRTM)"
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>
          </div>

          {/* Pallet Selector List */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1.5">
              Select Finished Pallets to Stuff into this Container
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {availablePallets.map(p => {
                const isSelected = selectedPalletIds.includes(p.id)
                const isAlreadyStuffed = p.shippingStatus === 'SHIPPED_EXPORTED'

                return (
                  <div
                    key={p.id}
                    onClick={() => !isAlreadyStuffed && togglePallet(p.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      isAlreadyStuffed 
                        ? 'opacity-50 bg-[#FAF7F0] border-black/10 cursor-not-allowed'
                        : isSelected 
                        ? 'bg-[#FAF7F0] border-[#3A3564] shadow-2xs cursor-pointer' 
                        : 'bg-white border-black/10 hover:border-black/20 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAlreadyStuffed}
                        onChange={() => {}}
                        className="rounded border-black/20 text-[#3A3564] focus:ring-[#3A3564] cursor-pointer"
                      />
                      <div>
                        <span className="font-mono font-bold text-slate-900">
                          {p.palletId} ({p.bayLocation})
                        </span>
                        <span className="text-slate-500 block text-[11px]">
                          {p.buyerName} • {p.styleDescription}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900 block tabular-nums">
                        {p.cartonCount} ctns / {p.totalPcs} pcs
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Seal: {p.aqlPassSealNumber}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedPalletIds.length === 0}
              className="px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2c284e] transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Stuffing Container...' : 'Generate Customs Gate Pass'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
