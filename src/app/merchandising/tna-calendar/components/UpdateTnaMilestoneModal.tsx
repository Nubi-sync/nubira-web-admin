'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import { TnaMilestone, TnaStatus } from '../../types/merchandising'
import { saveTnaMilestone } from '../../utils/merchandisingStorage'

interface UpdateTnaMilestoneModalProps {
  milestone: TnaMilestone | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function UpdateTnaMilestoneModal({
  milestone,
  isOpen,
  onClose,
  onSuccess
}: UpdateTnaMilestoneModalProps) {
  if (!isOpen || !milestone) return null

  const [status, setStatus] = useState<TnaStatus>(milestone.status)
  const [plannedDate, setPlannedDate] = useState(milestone.planned_date)
  const [actualDate, setActualDate] = useState(milestone.actual_date || '')
  const [delayReason, setDelayReason] = useState(milestone.delay_reason || '')
  const [mitigationNotes, setMitigationNotes] = useState(milestone.mitigation_notes || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (status === 'DELAYED' && !delayReason.trim()) {
      setError('Please provide a delay reason when marking a milestone as DELAYED')
      return
    }

    const updated: TnaMilestone = {
      ...milestone,
      status,
      planned_date: plannedDate,
      actual_date: actualDate ? actualDate : null,
      delay_reason: delayReason.trim() ? delayReason.trim() : null,
      mitigation_notes: mitigationNotes.trim() ? mitigationNotes.trim() : undefined
    }

    saveTnaMilestone(updated)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
              Form 3 • Milestone Gate Calibration
            </span>
            <h2 className="text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              Update T&amp;A Milestone Gate
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {milestone.po_number} • {milestone.milestone_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Status Dropdown */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Milestone Critical Path Status *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as TnaStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 bg-white font-semibold"
            >
              <option value="ON_SCHEDULE">ON_SCHEDULE — Within Critical Path SLA</option>
              <option value="DELAYED">DELAYED — Milestone Breached Target Date</option>
              <option value="COMPLETED">COMPLETED — Milestone Sign-Off Complete</option>
              <option value="ESCALATED">ESCALATED — Senior Management Escalation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Planned Date *
              </label>
              <input
                type="date"
                required
                value={plannedDate}
                onChange={e => setPlannedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Actual Completed Date
              </label>
              <input
                type="date"
                value={actualDate}
                onChange={e => setActualDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Delay Reason / Root Cause (If Breached)
            </label>
            <input
              type="text"
              value={delayReason}
              onChange={e => setDelayReason(e.target.value)}
              placeholder="e.g. Dyeing house lab dip shade mismatch re-dip in progress"
              className="w-full px-3.5 py-2 rounded-xl border border-black/10"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Recovery Mitigation Action Plan
            </label>
            <textarea
              rows={2}
              value={mitigationNotes}
              onChange={e => setMitigationNotes(e.target.value)}
              placeholder="e.g. Expedited air express dispatch arranged to recover 3 days"
              className="w-full px-3.5 py-2 rounded-xl border border-black/10"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-black/5 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Milestone Gate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
