'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, Cpu, AlertTriangle } from 'lucide-react'
import {
  EmbroideryMachineRun,
  EmbroideryRunStatus,
} from '../../types/embroidery'
import { saveMachineRun } from '../../utils/embroideryStorage'

interface CompleteRunModalProps {
  isOpen: boolean
  onClose: () => void
  activeRun?: EmbroideryMachineRun | null
}

export function CompleteRunModal({
  isOpen,
  onClose,
  activeRun,
}: CompleteRunModalProps) {
  const [machineNumber, setMachineNumber] = useState(activeRun?.machine_number || 'Machine 01 (20-Head Tajima)')
  const [operatorName, setOperatorName] = useState(activeRun?.operator_name || 'Kavitha Ramanathan')
  const [designCode, setDesignCode] = useState(activeRun?.design_code || 'DST-ZARA-CREST-04')
  const [panelsCompleted, setPanelsCompleted] = useState(activeRun?.panels_completed || 960)
  const [threadBreaks, setThreadBreaks] = useState(activeRun?.thread_breaks_count || 2)
  const [totalStitchesRun, setTotalStitchesRun] = useState(activeRun?.total_stitches_run || 17712000)
  const [runStatus, setRunStatus] = useState<EmbroideryRunStatus>('COMPLETED')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const updatedRun: EmbroideryMachineRun = {
      id: activeRun?.id || `run-emb-${Date.now()}`,
      run_number: activeRun?.run_number || `RUN-EMB-2026-${Math.floor(100 + Math.random() * 900)}`,
      machine_number: machineNumber,
      operator_name: operatorName,
      design_id: activeRun?.design_id || 'emb-des-001',
      design_code: designCode,
      order_po: activeRun?.order_po || 'PO-2026-ACTIVE',
      panels_loaded: activeRun?.panels_loaded || Number(panelsCompleted),
      panels_completed: Number(panelsCompleted),
      thread_breaks_count: Number(threadBreaks),
      total_stitches_run: Number(totalStitchesRun),
      rpm_speed: activeRun?.rpm_speed || 880,
      active_heads: activeRun?.active_heads || 20,
      total_heads: 20,
      backing_spec: activeRun?.backing_spec || 'Tear-Away 40 GSM',
      status: runStatus,
      run_date: new Date().toISOString().split('T')[0],
      created_at: activeRun?.created_at || new Date().toISOString(),
    }

    saveMachineRun(updatedRun)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Complete Machine Shift Run
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Form 2 • Machine Run & Thread Break Completion
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
                <option value="Machine 01 (20-Head Tajima)">Machine 01 (20-Head Tajima)</option>
                <option value="Machine 02 (20-Head Barudan)">Machine 02 (20-Head Barudan)</option>
                <option value="Machine 03 (20-Head Tajima)">Machine 03 (20-Head Tajima)</option>
                <option value="Machine 04 (20-Head SWF)">Machine 04 (20-Head SWF)</option>
                <option value="Machine 05 (20-Head Tajima)">Machine 05 (20-Head Tajima)</option>
                <option value="Machine 06 (20-Head Barudan)">Machine 06 (20-Head Barudan)</option>
                <option value="Machine 07 (20-Head SWF)">Machine 07 (20-Head SWF)</option>
                <option value="Machine 08 (20-Head Tajima)">Machine 08 (20-Head Tajima)</option>
                <option value="Machine 09 (20-Head Barudan)">Machine 09 (20-Head Barudan)</option>
                <option value="Machine 10 (20-Head Tajima)">Machine 10 (20-Head Tajima)</option>
              </select>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Operator Master Name *
              </label>
              <input
                type="text"
                required
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Design DST Code
              </label>
              <input
                type="text"
                value={designCode}
                onChange={e => setDesignCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Run Termination Status *
              </label>
              <select
                value={runStatus}
                onChange={e => setRunStatus(e.target.value as EmbroideryRunStatus)}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none bg-white font-medium"
              >
                <option value="COMPLETED">COMPLETED (Shift Target Met)</option>
                <option value="RUNNING">RUNNING (Active Cycle)</option>
                <option value="PAUSED_NEEDLE_ERROR">PAUSED_NEEDLE_ERROR (Calibration)</option>
                <option value="MAINTENANCE">MAINTENANCE (Rotary Hook Overhaul)</option>
              </select>
            </div>
          </div>

          {/* Shift Counters */}
          <div className="grid grid-cols-3 gap-3 bg-[#FAF7F0]/60 p-3.5 rounded-xl border border-black/5">
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Panels Completed *
              </label>
              <input
                type="number"
                required
                min={0}
                max={10000}
                value={panelsCompleted}
                onChange={e => setPanelsCompleted(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold text-[#3A3564]"
              />
              <span className="text-[10px] text-slate-400">Target count</span>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Thread Breaks *
              </label>
              <input
                type="number"
                required
                min={0}
                value={threadBreaks}
                onChange={e => setThreadBreaks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold text-amber-700"
              />
              <span className="text-[10px] text-slate-400">Total snaps</span>
            </div>
            <div>
              <label className="block font-mono font-bold text-slate-700 mb-1">
                Stitches Odometer *
              </label>
              <input
                type="number"
                required
                value={totalStitchesRun}
                onChange={e => setTotalStitchesRun(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-black/10 focus:ring-1 focus:ring-[#3A3564] outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400">Machine reading</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-black/5 flex items-start gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Directly commits to <code className="font-mono font-bold">embroidery_machine_runs</code>. Updates live floor odometer and piece-rate stitch billing ledgers.
            </span>
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
              <span>Record & Complete Shift</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
