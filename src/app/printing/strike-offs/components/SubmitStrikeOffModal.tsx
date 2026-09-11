'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, FileCheck2, Sparkles } from 'lucide-react'
import { StrikeOffTest, PrintTechnique, StrikeOffStatus } from '../../types/printing'
import { saveStrikeOff } from '../../utils/printingStorage'

interface SubmitStrikeOffModalProps {
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

export function SubmitStrikeOffModal({ isOpen, onClose, onSuccess }: SubmitStrikeOffModalProps) {
  const [poNumber, setPoNumber] = useState('PO-ZIG-8901')
  const [styleRef, setStyleRef] = useState('STY-HD-8901')
  const [pantoneTarget, setPantoneTarget] = useState('Pantone 19-4052 TCX (Classic Navy)')
  const [technique, setTechnique] = useState<PrintTechnique>('PLASTISOL')
  const [spectroDeltaE, setSpectroDeltaE] = useState('0.65')
  const [curingTemp, setCuringTemp] = useState('160')
  const [stretchTestPass, setStretchTestPass] = useState(true)
  const [crockingTestPass, setCrockingTestPass] = useState(true)
  const [washFastness, setWashFastness] = useState('4.5')
  const [approvalStatus, setApprovalStatus] = useState<StrikeOffStatus>('APPROVED')
  const [auditorName, setAuditorName] = useState('M. Anitha (Color Spectro Lab)')
  const [remarks, setRemarks] = useState('Spectro match within ΔE 1.0 limit. Excellent elongation without cracking.')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const deltaEVal = parseFloat(spectroDeltaE) || 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (deltaEVal > 1.0 && approvalStatus === 'APPROVED') {
      setError('Cannot approve strike-off when Delta E > 1.0 according to ISO / AATCC standard')
      return
    }

    if (!stretchTestPass && approvalStatus === 'APPROVED') {
      setError('Cannot approve strike-off when 100% stretch test fails')
      return
    }

    const newTest: StrikeOffTest = {
      id: `sto-${Date.now()}`,
      test_number: `STO-2026-${Math.floor(100 + Math.random() * 900)}`,
      po_number: poNumber.trim(),
      style_ref: styleRef.trim(),
      pantone_target: pantoneTarget.trim(),
      technique: technique,
      spectro_delta_e: deltaEVal,
      curing_temp_c: parseInt(curingTemp, 10) || 160,
      stretch_test_pass: stretchTestPass,
      wash_fastness_rating: parseFloat(washFastness) || 4.5,
      crocking_test_pass: crockingTestPass,
      approval_status: approvalStatus,
      auditor_name: auditorName.trim(),
      remarks: remarks.trim(),
      tested_at: new Date().toISOString()
    }

    saveStrikeOff(newTest)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Conduct Strike-Off Lab Audit (Form 1)
              </h2>
              <p className="text-xs text-slate-500">Spectrophotometer Delta E & wash fastness verification</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pantone Target Code *
              </label>
              <input
                type="text"
                value={pantoneTarget}
                onChange={e => setPantoneTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Print Technique
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
                Spectro Delta E (ΔE ≤ 1.0 to Pass) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.00"
                max="5.00"
                value={spectroDeltaE}
                onChange={e => setSpectroDeltaE(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs bg-white border font-mono font-bold focus:outline-none focus:ring-1 ${
                  deltaEVal <= 1.0
                    ? 'border-black/10 text-emerald-700 focus:ring-emerald-600'
                    : 'border-rose-300 text-rose-600 focus:ring-rose-500'
                }`}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Curing Temperature (°C)
              </label>
              <input
                type="number"
                value={curingTemp}
                onChange={e => setCuringTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-[#FAF7F0]/60 border border-black/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stretchTestPass}
                onChange={e => setStretchTestPass(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span className="text-xs font-bold text-slate-700">100% Stretch No-Crack Pass</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={crockingTestPass}
                onChange={e => setCrockingTestPass(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span className="text-xs font-bold text-slate-700">Dry/Wet Crocking Pass</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Wash Fastness (1–5)
              </label>
              <select
                value={washFastness}
                onChange={e => setWashFastness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
              >
                <option value="5.0">5.0 (Flawless)</option>
                <option value="4.5">4.5 (AATCC Standard Pass)</option>
                <option value="4.0">4.0 (Commercial Minimum)</option>
                <option value="3.5">3.5 (Minor Fading / Fail)</option>
                <option value="3.0">3.0 (Reject)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Audit Approval Decision
              </label>
              <select
                value={approvalStatus}
                onChange={e => setApprovalStatus(e.target.value as StrikeOffStatus)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
              >
                <option value="APPROVED">APPROVED (Authorized for Bulk)</option>
                <option value="REVISE_RECIPE">REVISE_RECIPE (Adjust Pigment)</option>
                <option value="REJECTED">REJECTED</option>
                <option value="PENDING_LAB">PENDING_LAB</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Auditor Remarks & Recipe Adjustments
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-medium"
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
              <span>Record Strike-Off Test</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
