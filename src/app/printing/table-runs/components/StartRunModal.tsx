'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
import { PrintingProductionRun, PrintTechnique } from '../../types/printing'
import { saveProductionRun } from '../../utils/printingStorage'

interface StartRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const TECHNIQUES: PrintTechnique[] = [
  'PLASTISOL',
  'WATER_BASED',
  'DISCHARGE',
  'DTG',
  'PUFF',
  'HIGH_DENSITY'
]

export function StartRunModal({ isOpen, onClose, onSuccess }: StartRunModalProps) {
  const [poNumber, setPoNumber] = useState('PO-ZIG-8901')
  const [styleRef, setStyleRef] = useState('ART-HD-8821')
  const [styleName, setStyleName] = useState('Heavyweight French Terry Hoodie')
  const [tableOrMachine, setTableOrMachine] = useState('Octopus Carousel 01 (12 Color Auto)')
  const [operatorName, setOperatorName] = useState('R. Veeramani (Master Printer)')
  const [technique, setTechnique] = useState<PrintTechnique>('PLASTISOL')
  const [pantoneCodes, setPantoneCodes] = useState('Pantone 19-4052 TCX, Pantone 11-0601 TCX')
  const [totalPanelsIssued, setTotalPanelsIssued] = useState('800')
  const [curingTemp, setCuringTemp] = useState('162')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const issued = parseInt(totalPanelsIssued, 10) || 0
    if (issued <= 0) {
      setError('Please specify a positive panel count')
      return
    }

    const newRun: PrintingProductionRun = {
      id: `run-${Date.now()}`,
      run_number: `PRN-2026-${Math.floor(100 + Math.random() * 900)}`,
      po_number: poNumber.trim(),
      style_ref: styleRef.trim(),
      style_name: styleName.trim(),
      table_or_machine: tableOrMachine,
      operator_name: operatorName,
      technique: technique,
      pantone_codes: pantoneCodes.split(',').map(s => s.trim()),
      total_panels_issued: issued,
      panels_completed: 0,
      panels_rejected: 0,
      curing_temp_c: parseInt(curingTemp, 10) || 160,
      curing_temp_verified: false,
      stroke_speed_cpm: 30,
      status: 'PRINTING',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    saveProductionRun(newRun)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/60">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Schedule Table Batch or DTG Run
            </h2>
            <p className="text-xs text-slate-500">Assign station, operator, and panel quantities</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Buyer PO Number *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Style Reference
              </label>
              <input
                type="text"
                value={styleRef}
                onChange={e => setStyleRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Garment Style Name
            </label>
            <input
              type="text"
              value={styleName}
              onChange={e => setStyleName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Printing Station
              </label>
              <select
                value={tableOrMachine}
                onChange={e => setTableOrMachine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
              >
                <option value="Table 01 (60m Conveyor)">Table 01 (60m Conveyor)</option>
                <option value="Table 02 (60m Conveyor)">Table 02 (60m Conveyor)</option>
                <option value="Table 03 (Manual Vacuum)">Table 03 (Manual Vacuum)</option>
                <option value="Table 04 (60m Conveyor)">Table 04 (60m Conveyor)</option>
                <option value="DTG Unit 01 (Kornit Atlas)">DTG Unit 01 (Kornit Atlas)</option>
                <option value="DTG Unit 02 (Brother GTX-600)">DTG Unit 02 (Brother GTX-600)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Embellishment Technique
              </label>
              <select
                value={technique}
                onChange={e => setTechnique(e.target.value as PrintTechnique)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                {TECHNIQUES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Total Cut Panels Issued *
              </label>
              <input
                type="number"
                value={totalPanelsIssued}
                onChange={e => setTotalPanelsIssued(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Curing Target Temp (°C)
              </label>
              <input
                type="number"
                value={curingTemp}
                onChange={e => setCuringTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Pantone Target Swatches (Comma Separated)
            </label>
            <input
              type="text"
              value={pantoneCodes}
              onChange={e => setPantoneCodes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Master Printer
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={e => setOperatorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorize & Start Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
