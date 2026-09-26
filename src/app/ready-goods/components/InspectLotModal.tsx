'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  Printer,
  Sparkles,
  Waves,
  Flame,
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react'
import { toast } from 'sonner'
import { FinishingInspectionTask, InspectionChecklist, ReadyGoodsWorker } from '../types/readyGoods'
import { submitQualityInspectionResult } from '../utils/readyGoodsStorage'
import { broadcastFloorEvent } from '@/utils/floorRealtime'

interface InspectLotModalProps {
  isOpen: boolean
  onClose: () => void
  task: FinishingInspectionTask | null
  workers: ReadyGoodsWorker[]
  companyName?: string
  onInspectionCompleted: () => void
}

export function InspectLotModal({
  isOpen,
  onClose,
  task,
  workers,
  companyName,
  onInspectionCompleted
}: InspectLotModalProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [checklist, setChecklist] = useState<InspectionChecklist>({
    cutting_done_right: false,
    printing_done_right: false,
    embroidery_done_right: false,
    washing_done_right: false,
    iron_done_right: false
  })
  const [isDefectMode, setIsDefectMode] = useState(false)
  const [defectReason, setDefectReason] = useState('OPEN_SEAM')
  const [defectNotes, setDefectNotes] = useState('')
  const [defectStation, setDefectStation] = useState('Mending Station 01')

  useEffect(() => {
    if (task) {
      setChecklist(task.checklist)
      setIsDefectMode(false)
      setDefectNotes('')
    }
    // Default to first active checker or both
    const checker = workers.find(w => w.role === 'CHECKER' || w.role === 'BOTH')
    if (checker) {
      setSelectedWorkerId(checker.id)
    } else if (workers.length > 0) {
      setSelectedWorkerId(workers[0].id)
    }
  }, [task, workers, isOpen])

  if (!isOpen || !task) return null

  // Validation: can only approve if all applicable criteria are checked
  const canApprove = () => {
    if (!checklist.cutting_done_right) return false
    if (task.has_printing && !checklist.printing_done_right) return false
    if (task.has_embroidery && !checklist.embroidery_done_right) return false
    if (!checklist.washing_done_right) return false
    if (!checklist.iron_done_right) return false
    return true
  }

  const assignedWorker = workers.find(w => w.id === selectedWorkerId) || workers[0]

  const handleApprove = () => {
    if (!assignedWorker) {
      toast.error('Please assign an inspector worker.')
      return
    }

    submitQualityInspectionResult({
      taskId: task.id,
      workerId: assignedWorker.id,
      workerName: assignedWorker.worker_name,
      checklist,
      decision: 'APPROVE'
    })

    broadcastFloorEvent({
      eventType: 'TASK_VERIFIED',
      sourceModule: 'ready-goods',
      companyName,
      title: 'QC Inspection Passed -> Ready for Packing',
      message: `${task.pieces_count} pcs of ${task.style_name} (${task.order_number}) approved and passed to Packing line.`,
      pieces: task.pieces_count,
      taskRef: task.task_code
    })

    toast.success(`Lot #${task.task_code} approved! Passed to Packing Goods line.`)
    onInspectionCompleted()
    onClose()
  }

  const handleReject = () => {
    if (!assignedWorker) {
      toast.error('Please assign an inspector worker.')
      return
    }

    submitQualityInspectionResult({
      taskId: task.id,
      workerId: assignedWorker.id,
      workerName: assignedWorker.worker_name,
      checklist,
      decision: 'REJECT_TO_ALTER',
      defectCategory: defectReason,
      defectNotes: defectNotes.trim() || `Flagged at ${defectStation}: ${defectReason}`
    })

    broadcastFloorEvent({
      eventType: 'TASK_VERIFIED',
      sourceModule: 'alter',
      companyName,
      title: 'Garment Flagged for Alteration',
      message: `${task.pieces_count} pcs of ${task.style_name} routed to Alteration Clinic (${defectReason}).`,
      pieces: task.pieces_count,
      taskRef: task.task_code
    })

    toast.error(`Lot #${task.task_code} routed to Alteration Clinic (${defectReason})`)
    onInspectionCompleted()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Quality Inspection Check
                </h3>
                <span className="text-xs font-mono font-bold bg-[#3A3564] text-white px-2 py-0.5 rounded">
                  #{task.task_code}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {task.buyer} • {task.style_name} ({task.pieces_count} pcs • Size {task.size})
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

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Origin Batch Context */}
          <div className="p-3 bg-slate-50 rounded-xl border border-black/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-mono">WASH BATCH: </span>
              <span className="font-bold text-slate-800">{task.wash_batch_ref}</span>
            </div>
            <div>
              <span className="text-slate-500 font-mono">IRON TABLE: </span>
              <span className="font-bold text-slate-800">{task.iron_station_ref}</span>
            </div>
          </div>

          {/* Inspector Assignment */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Quality Checker
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-black/15 bg-white text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
            >
              {workers.length === 0 ? (
                <option value="">No registered floor workers</option>
              ) : (
                workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} ({w.role === 'BOTH' ? 'Checker & Packer' : w.role}) • {w.assigned_station}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Verification Criteria */}
          {!isDefectMode ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Verification Criteria
                </span>
                <span className="text-[11px] text-slate-500">Tick to verify and approve</span>
              </div>

              {/* 1. Cutting (Mandatory) */}
              <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.cutting_done_right ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="checkbox"
                  checked={checklist.cutting_done_right}
                  onChange={(e) => setChecklist({ ...checklist, cutting_done_right: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Cutting Done Right</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pattern symmetry, panel alignment, notches matching, and balanced grain line.
                  </p>
                </div>
              </label>

              {/* 2. Printing (ONLY if tech pack says printing) */}
              {task.has_printing ? (
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  checklist.printing_done_right ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10 hover:border-black/20'
                }`}>
                  <input
                    type="checkbox"
                    checked={checklist.printing_done_right}
                    onChange={(e) => setChecklist({ ...checklist, printing_done_right: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Printer className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Printing Done Right</span>
                      <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-100 px-1.5 py-0.2 rounded">Per Tech-Pack</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Color strike-off matched, screen registration aligned, no bleed or smudges.
                    </p>
                  </div>
                </label>
              ) : null}

              {/* 3. Embroidery (ONLY if tech pack says embroidery) */}
              {task.has_embroidery ? (
                <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  checklist.embroidery_done_right ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10 hover:border-black/20'
                }`}>
                  <input
                    type="checkbox"
                    checked={checklist.embroidery_done_right}
                    onChange={(e) => setChecklist({ ...checklist, embroidery_done_right: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-bold text-slate-900">Embroidery Done Right</span>
                      <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">Per Tech-Pack</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      DST stitch placement accurate, correct thread tension, clean jump thread trims.
                    </p>
                  </div>
                </label>
              ) : null}

              {/* 4. Washing (Mandatory) */}
              <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.washing_done_right ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="checkbox"
                  checked={checklist.washing_done_right}
                  onChange={(e) => setChecklist({ ...checklist, washing_done_right: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-slate-900">Washing Done Right</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Softener hand feel verified, shade clearance approved, zero residual chemical odor.
                  </p>
                </div>
              </label>

              {/* 5. Ironing (Mandatory) */}
              <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                checklist.iron_done_right ? 'border-emerald-500 bg-emerald-50/20' : 'border-black/10 hover:border-black/20'
              }`}>
                <input
                  type="checkbox"
                  checked={checklist.iron_done_right}
                  onChange={(e) => setChecklist({ ...checklist, iron_done_right: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#3A3564] rounded border-slate-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">Ironing Done Right</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Mandatory</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Seams pressed flat, zero shine marks or glazing, collars and hems crisp.
                  </p>
                </div>
              </label>
            </div>
          ) : (
            /* Defect Flagging Mode */
            <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Defect for Alteration Clinic</span>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Defect Reason
                </label>
                <select
                  value={defectReason}
                  onChange={(e) => setDefectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-black/15 bg-white text-slate-900"
                >
                  <option value="OPEN_SEAM">Open Seam / Skipped Stitch</option>
                  <option value="PRINT_SMUDGE">Print Misalignment / Curing Smudge</option>
                  <option value="EMB_THREAD_BREAK">Embroidery Thread Pull / Frays</option>
                  <option value="WASH_STAIN">Washing Oil / Water Spot</option>
                  <option value="IRON_SHINE">Iron Shine / Thermal Glaze</option>
                  <option value="ASYMMETRY">Panel Sizing / Asymmetry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Target Repair Station
                </label>
                <select
                  value={defectStation}
                  onChange={(e) => setDefectStation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-black/15 bg-white text-slate-900"
                >
                  <option value="Mending Station 01">Mending Station 01 (Seam & Stitch Repair)</option>
                  <option value="Spot Cleaning Table 02">Spot Cleaning Table 02 (Chemical Cleaning)</option>
                  <option value="Touchup Press 03">Touchup Press 03 (Re-Ironing)</option>
                  <option value="Alteration Master Desk">Alteration Master Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Defect Notes / Instructions
                </label>
                <textarea
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="Specify defect location (e.g. left armhole open seam 2 inches)..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-black/15 bg-white text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-between gap-3">
          {!isDefectMode ? (
            <>
              <button
                type="button"
                onClick={() => setIsDefectMode(true)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag Defect & Alter</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={!canApprove()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Pass to Packing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsDefectMode(false)}
                className="px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Back to Checklist
              </button>

              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm & Send to Alteration</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
