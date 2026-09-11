'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Cpu, Sliders } from 'lucide-react'
import { PrintingProductionRun, DefectReason } from '../../types/printing'
import { saveProductionRun } from '../../utils/printingStorage'

interface LogProductionModalProps {
  isOpen: boolean
  onClose: () => void
  run: PrintingProductionRun | null
  onSuccess?: () => void
}

const DEFECT_REASONS: DefectReason[] = [
  'SMUDGE',
  'BLEED',
  'OFF_REGISTRATION',
  'CURING_SCORCH',
  'PINHOLE_LEAK',
  'POOR_COVERAGE'
]

export function LogProductionModal({ isOpen, onClose, run, onSuccess }: LogProductionModalProps) {
  const [completedCount, setCompletedCount] = useState(run ? String(run.panels_completed) : '0')
  const [rejectedCount, setRejectedCount] = useState(run ? String(run.panels_rejected) : '0')
  const [defectReason, setDefectReason] = useState<DefectReason>('SMUDGE')
  const [curingTempVerified, setCuringTempVerified] = useState(true)
  const [tempReading, setTempReading] = useState(run ? String(run.curing_temp_c) : '160')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !run) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const completed = parseInt(completedCount, 10) || 0
    const rejected = parseInt(rejectedCount, 10) || 0
    const temp = parseInt(tempReading, 10) || 160

    if (completed < 0 || rejected < 0) {
      setError('Panel counts must be non-negative integers')
      return
    }

    const isFullyComplete = (completed + rejected) >= run.total_panels_issued

    const updated: PrintingProductionRun = {
      ...run,
      panels_completed: completed,
      panels_rejected: rejected,
      defect_reason: rejected > 0 ? defectReason : undefined,
      curing_temp_c: temp,
      curing_temp_verified: curingTempVerified,
      status: isFullyComplete ? 'COMPLETED' : run.status
    }

    saveProductionRun(updated)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-black/10 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Log Shift Production & Rejection
              </h2>
              <p className="text-xs text-slate-500">Run: {run.run_number} • {run.po_number}</p>
            </div>
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

          {/* Job Overview Pill */}
          <div className="p-3 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span className="font-mono text-slate-400">Total Issued:</span>
              <span className="font-mono font-bold text-slate-900">{run.total_panels_issued.toLocaleString()} Pcs</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Station:</span>
              <span className="font-medium text-slate-900">{run.table_or_machine}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Good Panels Printed & Cured *
              </label>
              <input
                type="number"
                value={completedCount}
                onChange={e => setCompletedCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rejected / Defect Panels
              </label>
              <input
                type="number"
                value={rejectedCount}
                onChange={e => setRejectedCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-rose-500 text-rose-600 font-mono font-bold"
              />
            </div>
          </div>

          {parseInt(rejectedCount, 10) > 0 && (
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Primary Defect Root Cause (for Re-Cut)
              </label>
              <select
                value={defectReason}
                onChange={e => setDefectReason(e.target.value as DefectReason)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                {DEFECT_REASONS.map(d => (
                  <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Oven Probe Temp (°C)
              </label>
              <input
                type="number"
                value={tempReading}
                onChange={e => setTempReading(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={curingTempVerified}
                  onChange={e => setCuringTempVerified(e.target.checked)}
                  className="rounded text-[#3A3564] focus:ring-[#3A3564]"
                />
                <span className="text-xs font-bold text-slate-700">Thermal Strip Verified (160°C)</span>
              </label>
            </div>
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
              <span>Update Run Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
