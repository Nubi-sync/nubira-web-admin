'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertTriangle } from 'lucide-react'
import {
  EmbroideryQcAudit,
  DefectType,
  DefectSeverity,
} from '../../types/embroidery'
import { saveQcAudit } from '../../utils/embroideryStorage'

interface LogThreadBreakModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogThreadBreakModal({ isOpen, onClose }: LogThreadBreakModalProps) {
  const [machineNumber, setMachineNumber] = useState('Machine 01')
  const [headNumber, setHeadNumber] = useState(8)
  const [defectType, setDefectType] = useState<DefectType>('TENSION_LOOPING')
  const [severity, setSeverity] = useState<DefectSeverity>('MINOR')
  const [actionTaken, setActionTaken] = useState('Re-calibrated rotary tension spring disk; wiped needle plate lint.')
  const [auditorName, setAuditorName] = useState('Rajesh QAO')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const newAudit: EmbroideryQcAudit = {
      id: `qc-emb-${Date.now()}`,
      audit_code: `AUD-EMB-${Math.floor(100 + Math.random() * 900)}`,
      run_id: `run-emb-${Date.now()}`,
      machine_number: machineNumber,
      head_number: Number(headNumber),
      defect_type: defectType,
      severity,
      action_taken: actionTaken.trim(),
      auditor_name: auditorName.trim(),
      created_at: new Date().toISOString(),
    }

    saveQcAudit(newAudit)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Log Thread Break & Needle QC
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Head 1–20 Root Cause Calibration
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
                Machine Number *
              </label>
              <select
                value={machineNumber}
                onChange={e => setMachineNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i} value={`Machine ${String(i + 1).padStart(2, '0')}`}>
                    Machine {String(i + 1).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Head Position (1–20) *
              </label>
              <select
                value={headNumber}
                onChange={e => setHeadNumber(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-mono font-bold text-[#3A3564]"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <option key={i} value={i + 1}>
                    Head #{i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Defect Classification *
              </label>
              <select
                value={defectType}
                onChange={e => setDefectType(e.target.value as DefectType)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="BIRD_NESTING">BIRD_NESTING (Bobbin Entanglement)</option>
                <option value="NEEDLE_BREAKAGE">NEEDLE_BREAKAGE (Burred DBxK5)</option>
                <option value="TENSION_LOOPING">TENSION_LOOPING (Loose Spring Disk)</option>
                <option value="HOOP_DISTORTION">HOOP_DISTORTION (Puckered Knits)</option>
                <option value="MISSED_STITCH">MISSED_STITCH (Rotary Timing)</option>
                <option value="JUMP_TRIM_STRAY">JUMP_TRIM_STRAY (Auto-Trimmer Blade)</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Defect Severity *
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as DefectSeverity)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="MINOR">MINOR (Corrected on-fly)</option>
                <option value="MAJOR">MAJOR (Panel Recut Required)</option>
                <option value="CRITICAL">CRITICAL (Line Halted)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 mb-1">
              Corrective Action Taken *
            </label>
            <textarea
              required
              rows={3}
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-medium"
              placeholder="e.g. Replaced needle, cleaned rotary hook lint..."
            />
          </div>

          <div>
            <label className="block font-mono font-bold text-slate-700 mb-1">
              Auditor / Technician *
            </label>
            <input
              type="text"
              required
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-medium"
            />
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
              <span>Log Incident</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
