'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react'
import { TnaMilestone } from '../../types/merchandising'
import { getTnaMilestones, MERCHANDISING_UPDATE_EVENT } from '../../utils/merchandisingStorage'
import { UpdateTnaMilestoneModal } from './UpdateTnaMilestoneModal'

export function TnaPlannerClient() {
  const [milestones, setMilestones] = useState<TnaMilestone[]>([])
  const [selectedPo, setSelectedPo] = useState<string>('PO-ZIG-8901')
  const [editingMilestone, setEditingMilestone] = useState<TnaMilestone | null>(null)

  const reloadData = () => {
    setMilestones(getTnaMilestones())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [])

  // Unique POs available in milestones
  const availablePos = Array.from(new Set(milestones.map(m => m.po_number)))

  const activeMilestones = milestones
    .filter(m => m.po_number === selectedPo)
    .sort((a, b) => a.sort_order - b.sort_order)

  const completedCount = activeMilestones.filter(m => m.status === 'COMPLETED').length
  const delayedCount = activeMilestones.filter(m => m.status === 'DELAYED' || m.status === 'ESCALATED').length

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#09090b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#FAF7F0]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/merchandising"
              className="p-2 rounded-xl bg-white border border-black/10 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
                  Division 02 • Critical Path
                </span>
                <span className="text-xs text-slate-500 font-medium">8 Industry Milestone Gates</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
                Time &amp; Action (T&amp;A) Planner
              </h1>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-2">
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
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Order Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] mr-2">Select Order:</span>
          {availablePos.map(po => (
            <button
              key={po}
              onClick={() => setSelectedPo(po)}
              className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedPo === po
                  ? 'bg-[#3A3564] text-white shadow-xs font-bold'
                  : 'bg-white border border-black/10 text-slate-700 hover:bg-black/5'
              }`}
            >
              {po}
            </button>
          ))}
        </div>

        {/* 8 Milestone Interactive Timeline Flow */}
        <div className="p-6 rounded-2xl bg-white border border-black/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Critical Path Timeline &amp; Milestone Stages ({selectedPo})
            </h2>
            <span className="text-xs text-slate-500 font-mono">ISO 9001 Standard Lead-Time Schedule</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {activeMilestones.map((m, idx) => {
              const isCompleted = m.status === 'COMPLETED'
              const isDelayed = m.status === 'DELAYED' || m.status === 'ESCALATED'

              return (
                <div key={m.id} className="relative group">
                  {/* Step Marker Dot */}
                  <span
                    className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600'
                        : isDelayed
                        ? 'bg-rose-600 animate-pulse'
                        : 'bg-[#3A3564]'
                    }`}
                  />

                  <div className="p-4 rounded-xl border border-black/10 hover:border-black/20 bg-[#FAF7F0]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {m.milestone_name}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isDelayed
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-[#3A3564]'
                          }`}
                        >
                          {m.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                        <span>Planned Target: <strong className="text-slate-800 font-mono">{m.planned_date}</strong></span>
                        {m.actual_date && (
                          <span>Actual Completed: <strong className="text-emerald-700 font-mono">{m.actual_date}</strong></span>
                        )}
                      </div>

                      {m.delay_reason && (
                        <div className="mt-1 text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Delay: {m.delay_reason}</span>
                        </div>
                      )}

                      {m.mitigation_notes && (
                        <div className="text-[11px] text-slate-600">
                          Mitigation: <em>{m.mitigation_notes}</em>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingMilestone(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs font-semibold text-slate-700 transition-colors shrink-0 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#3A3564]" />
                      Update Gate
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
      </main>
    </div>
  )
}
