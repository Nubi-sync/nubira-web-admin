'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Cpu,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import {
  getMachineRuns,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { EmbroideryMachineRun, EmbroideryRunStatus } from '../../types/embroidery'
import { CompleteRunModal } from './CompleteRunModal'
import { StartRunModal } from './StartRunModal'

export function MachineRunsClient() {
  const [runs, setRuns] = useState<EmbroideryMachineRun[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [activeRunToComplete, setActiveRunToComplete] = useState<EmbroideryMachineRun | null>(null)

  function loadRuns() {
    setRuns(getMachineRuns())
  }

  useEffect(() => {
    loadRuns()
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadRuns)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadRuns)
  }, [])

  const filteredRuns = runs.filter(run => {
    const matchesSearch =
      run.machine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.design_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.order_po.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/embroidery"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Embroidery Floor</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Machine Floor Telemetry
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Machine Runs & Hooping
              </h1>
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                20-Head Automation Floor
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Active shift progression, RPM speed, needle thread breaks, and pieces completed logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsStartOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Machine Run</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'RUNNING', 'COMPLETED', 'PAUSED_NEEDLE_ERROR', 'MAINTENANCE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                statusFilter === tab
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-[#FAF7F0] hover:text-[#3A3564]'
              }`}
            >
              {tab.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter runs, DST, operator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-slate-50/50"
          />
        </div>
      </div>

      {/* Machine Runs Table / List */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0]/80 border-b border-black/10 text-slate-700 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4">Machine & Run #</th>
                <th className="p-4">Running DST / PO</th>
                <th className="p-4">Operator</th>
                <th className="p-4">Progress (Completed / Loaded)</th>
                <th className="p-4">RPM & Heads</th>
                <th className="p-4">Thread Breaks</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredRuns.map(run => {
                const pct = Math.min(100, Math.round((run.panels_completed / (run.panels_loaded || 1)) * 100))
                return (
                  <tr key={run.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{run.machine_number}</div>
                      <div className="font-mono text-[11px] text-slate-500">{run.run_number}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono font-bold text-[#3A3564]">{run.design_code}</div>
                      <div className="font-mono text-[11px] text-slate-500">{run.order_po}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {run.operator_name}
                    </td>
                    <td className="p-4 min-w-[160px]">
                      <div className="flex justify-between font-mono text-[11px] mb-1">
                        <span className="font-bold text-slate-800">{run.panels_completed} pcs</span>
                        <span className="text-slate-500">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-black/5">
                        <div
                          className={`h-full rounded-full ${
                            run.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-[#3A3564]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Loaded: {run.panels_loaded} pcs
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-900">{run.rpm_speed} RPM</div>
                      <div className="text-[11px] text-slate-500">{run.active_heads}/{run.total_heads} Heads</div>
                    </td>
                    <td className="p-4 font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                        run.thread_breaks_count > 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {run.thread_breaks_count} snaps
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                          run.status === 'RUNNING'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : run.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : run.status === 'PAUSED_NEEDLE_ERROR'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {run.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveRunToComplete(run)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-black/10 hover:bg-[#FAF7F0] text-[#3A3564] font-bold text-xs shadow-2xs transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Log Shift (Form 2)</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Run Modal */}
      <StartRunModal
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
      />

      {/* Form 2 Complete Shift Modal */}
      <CompleteRunModal
        isOpen={!!activeRunToComplete}
        onClose={() => setActiveRunToComplete(null)}
        activeRun={activeRunToComplete}
      />
    </div>
  )
}
