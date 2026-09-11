'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ChevronLeft,
  Cpu,
  Zap,
  FileCode,
  Calculator,
  ArrowRight,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Clock,
  Layers,
  Search,
  Plus
} from 'lucide-react'
import {
  getEmbroideryDesigns,
  getMachineRuns,
  getBillingLedgers,
  getThreadCones,
  getQcAudits,
  EMBROIDERY_UPDATE_EVENT,
} from '../utils/embroideryStorage'
import { EmbroideryMachineRun, EmbroideryDesign } from '../types/embroidery'

export function EmbroideryDashboardClient() {
  const [runs, setRuns] = useState<EmbroideryMachineRun[]>([])
  const [designs, setDesigns] = useState<EmbroideryDesign[]>([])
  const [searchFilter, setSearchFilter] = useState('')

  function loadData() {
    setRuns(getMachineRuns())
    setDesigns(getEmbroideryDesigns())
  }

  useEffect(() => {
    loadData()
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadData)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadData)
  }, [])

  // Calculations
  const totalStitchesToday = runs.reduce((acc, r) => acc + (r.total_stitches_run || 0), 0)
  const totalCompletedPanels = runs.reduce((acc, r) => acc + (r.panels_completed || 0), 0)
  const totalBreaks = runs.reduce((acc, r) => acc + (r.thread_breaks_count || 0), 0)
  const activeLinesCount = runs.filter(r => r.status === 'RUNNING').length

  const filteredRuns = runs.filter(r =>
    r.machine_number.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.design_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.operator_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.order_po.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
      {/* Top Breadcrumb & Tag */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 05 • Thread Embellishment
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            200 Heads Active
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Multi-Head Embroidery Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                ASTM D204 / ISO 4915
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Computerized 20-head embroidery machines, Tajima DST binary files, thread tension, and stitch piece-rate billing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/embroidery/machine-runs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Shifts</span>
          </Link>
          <Link
            href="/embroidery/punch-library"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-black/10 hover:bg-[#FAF7F0] text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>DST Library</span>
          </Link>
        </div>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active 20-Head Lines</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {activeLinesCount} / {runs.length} Lines
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            200 Automated high-speed heads
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Daily Stitch Throughput</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {(totalStitchesToday / 1000000).toFixed(2)}M Stitches
          </div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            {totalCompletedPanels.toLocaleString()} Panels finished today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Thread Break Freq (TBF)</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0.02%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {totalBreaks} Breaks recorded (&lt;0.03% ASTM standard)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">DST Punch Library</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {designs.length} Approved Files
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Network loaded Tajima / Barudan
          </p>
        </div>
      </div>

      {/* Quick Access Portal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/embroidery/punch-library"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <FileCode className="w-5 h-5 text-[#3A3564]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">DST Punch Files</div>
            <div className="text-[11px] text-slate-500 font-medium">Stitch densities & colors</div>
          </div>
        </Link>

        <Link
          href="/embroidery/machine-runs"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Cpu className="w-5 h-5 text-[#3A3564]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">20-Head Machine Floor</div>
            <div className="text-[11px] text-slate-500 font-medium">Active shift progression</div>
          </div>
        </Link>

        <Link
          href="/embroidery/stitch-billing"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Calculator className="w-5 h-5 text-[#3A3564]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Stitch Billing & Rates</div>
            <div className="text-[11px] text-slate-500 font-medium">Commercial piece-rate</div>
          </div>
        </Link>

        <Link
          href="/embroidery/thread-store"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <Boxes className="w-5 h-5 text-[#3A3564]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Thread Cones Store</div>
            <div className="text-[11px] text-slate-500 font-medium">Madeira & Isacord stock</div>
          </div>
        </Link>
      </div>

      {/* Real-time Multi-Head Machine Floor Matrix */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#3A3564]" />
              <span>Multi-Head Computerized Machine Grid (10 Production Lines)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time telemetry across 20-head Tajima, Barudan & SWF automated lines
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search machine, DST, operator..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {filteredRuns.map(run => {
            const pct = Math.min(100, Math.round((run.panels_completed / (run.panels_loaded || 1)) * 100))
            const isPaused = run.status === 'PAUSED_NEEDLE_ERROR'
            const isRunning = run.status === 'RUNNING'
            const isCompleted = run.status === 'COMPLETED'

            return (
              <div
                key={run.id}
                className="p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 bg-white transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {run.machine_number}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isRunning
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPaused
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isCompleted
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {run.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      Operator: <span className="font-bold text-slate-800">{run.operator_name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      {run.rpm_speed} RPM
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {run.active_heads}/{run.total_heads} Heads
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF7F0]/60 p-3 rounded-xl border border-black/5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500 font-semibold">Punch File:</span>
                    <span className="font-bold text-[#3A3564]">{run.design_code}</span>
                  </div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-500 font-semibold">Buyer PO:</span>
                    <span className="text-slate-800 font-semibold">{run.order_po}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Backing Stabilizer:</span>
                    <span className="text-slate-700 text-[11px] font-mono">{run.backing_spec}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500">Panels Progress</span>
                    <span className="font-bold text-slate-800">
                      {run.panels_completed} / {run.panels_loaded} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-black/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-blue-600'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-[#3A3564]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-black/5 font-mono">
                  <span>Thread Breaks: <strong className="text-slate-800">{run.thread_breaks_count}</strong></span>
                  <span>Stitches: <strong className="text-slate-800">{(run.total_stitches_run / 1000).toFixed(0)}k</strong></span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
