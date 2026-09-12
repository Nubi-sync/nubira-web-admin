'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Layers,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react'
import { TnaMilestone } from '../../types/merchandising'
import { getTnaMilestones, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { UpdateTnaMilestoneModal } from './UpdateTnaMilestoneModal'

interface TnaPlannerClientProps {
  initialMilestones?: TnaMilestone[]
}

export function TnaPlannerClient({ initialMilestones }: TnaPlannerClientProps = {}) {
  const [milestones, setMilestones] = useState<TnaMilestone[]>(() => {
    if (initialMilestones && initialMilestones.length > 0) return initialMilestones
    return []
  })
  const [selectedPo, setSelectedPo] = useState<string>(() => {
    if (initialMilestones && initialMilestones.length > 0) return initialMilestones[0].po_number
    return 'PO-ZIG-8901'
  })
  const [editingMilestone, setEditingMilestone] = useState<TnaMilestone | null>(null)

  const reloadData = () => {
    setMilestones(getTnaMilestones())
  }

  useEffect(() => {
    if (initialMilestones && initialMilestones.length > 0) {
      setMilestones(initialMilestones)
      setSelectedPo(initialMilestones[0].po_number)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_merchandising_tna_milestones_v1', JSON.stringify(initialMilestones))
      }
    } else {
      reloadData()
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialMilestones])

  // Unique POs available in milestones
  const availablePos = Array.from(new Set(milestones.map(m => m.po_number)))

  const activeMilestones = milestones
    .filter(m => m.po_number === selectedPo)
    .sort((a, b) => a.sort_order - b.sort_order)

  const completedCount = activeMilestones.filter(m => m.status === 'COMPLETED').length
  const delayedCount = activeMilestones.filter(m => m.status === 'DELAYED' || m.status === 'ESCALATED').length
  const inProgressCount = activeMilestones.length - completedCount - delayedCount

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/merchandising" className="hover:text-[#3A3564] transition-colors">
          Merchandising &amp; Sourcing
        </Link>
        <span>/</span>
        <span>Commercial Ops</span>
        <span>/</span>
        <span className="font-bold text-slate-900">
          Time &amp; Action (T&amp;A) Planner
        </span>
      </div>

      {/* 2. Top Header Card (6th Box Theme) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Time &amp; Action (T&amp;A) Planner
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                8 Milestone Gates
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Critical path schedule, lead-time control, PPM meeting milestones, and AQL inspection cut-offs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedCount} of {activeMilestones.length} Gates Cleared
          </span>
          {delayedCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {delayedCount} Delayed
            </span>
          )}
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards (Matching 6th Box) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 01
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Tracked POs
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Orders under T&amp;A SLA</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {availablePos.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Contracts
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 02
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Completed Gates
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Successfully signed-off</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {completedCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Cleared
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 03
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pending Gates
            </div>
            <div className="text-[11px] text-slate-400 font-medium">On-schedule in progress</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {inProgressCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              In Flow
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 04
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Critical Alerts
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Delayed &amp; escalated steps</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className={`text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] ${delayedCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {delayedCount}
            </div>
            <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
              delayedCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
            }`}>
              {delayedCount > 0 ? 'Action Required' : 'Zero Delay'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PO Selector Bar (6th Box Styled) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/10 shadow-2xs flex items-center gap-3 overflow-x-auto">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
          SELECT ORDER PO:
        </span>
        <div className="flex items-center gap-2">
          {availablePos.map(po => (
            <button
              key={po}
              type="button"
              onClick={() => setSelectedPo(po)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs font-mono font-bold cursor-pointer ${
                selectedPo === po
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#F2ECE1] border border-black/10'
              }`}
            >
              {po}
            </button>
          ))}
        </div>
      </div>

      {/* 5. 8-Milestone Interactive Timeline Flow (6th Box Design) */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Critical Path Timeline &amp; Milestone Stages ({selectedPo})
              </h2>
              <span className="text-xs text-slate-400 font-mono">ISO 9001 Standard Lead-Time Schedule</span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {activeMilestones.length} Serial Gates
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-5 before:absolute before:left-3 before:sm:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {activeMilestones.map((m, idx) => {
            const isCompleted = m.status === 'COMPLETED'
            const isDelayed = m.status === 'DELAYED' || m.status === 'ESCALATED'

            return (
              <div key={m.id} className="relative group">
                {/* Step Marker Dot */}
                <span
                  className={`absolute -left-[29px] sm:-left-[33px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-xs transition-transform group-hover:scale-125 ${
                    isCompleted
                      ? 'bg-emerald-600'
                      : isDelayed
                      ? 'bg-rose-600 animate-pulse'
                      : 'bg-[#3A3564]'
                  }`}
                />

                <div className="p-4 sm:p-5 rounded-2xl border border-black/10 hover:border-black/20 bg-white hover:bg-slate-50/50 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        GATE {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {m.milestone_name}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDelayed
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 text-slate-500 text-xs flex-wrap">
                      <span>Planned Target: <strong className="text-slate-800 font-mono">{m.planned_date}</strong></span>
                      {m.actual_date && (
                        <span>Actual Completed: <strong className="text-emerald-700 font-mono font-bold">{m.actual_date}</strong></span>
                      )}
                    </div>

                    {m.delay_reason && (
                      <div className="text-xs text-rose-700 font-medium flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Delay Reason: <strong>{m.delay_reason}</strong></span>
                      </div>
                    )}

                    {m.mitigation_notes && (
                      <div className="text-xs text-slate-600 italic">
                        Mitigation Plan: &quot;{m.mitigation_notes}&quot;
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingMilestone(m)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs font-bold text-[#3A3564] transition-colors shrink-0 shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#3A3564]" />
                    <span>Update Gate</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal: Form 3 T&A Milestone Update */}
      <UpdateTnaMilestoneModal
        milestone={editingMilestone}
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        onSuccess={reloadData}
      />
    </div>
  )
}
