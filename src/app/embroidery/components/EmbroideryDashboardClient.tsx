'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Search
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getEmbroideryDesigns,
  getMachineRuns,
  EMBROIDERY_UPDATE_EVENT,
} from '../utils/embroideryStorage'
import { EmbroideryMachineRun, EmbroideryDesign } from '../types/embroidery'

interface EmbroideryDashboardClientProps {
  userEmail?: string
  liveKpis?: any
  initialRuns?: EmbroideryMachineRun[]
  initialDesigns?: EmbroideryDesign[]
  initialAudits?: any[]
  initialCones?: any[]
}

export function EmbroideryDashboardClient({
  userEmail,
  liveKpis,
  initialRuns,
  initialDesigns,
  initialAudits,
  initialCones
}: EmbroideryDashboardClientProps = {}) {
  const router = useRouter()
  const [runs, setRuns] = useState<EmbroideryMachineRun[]>(() => {
    if (initialRuns && initialRuns.length > 0) return initialRuns
    return []
  })
  const [designs, setDesigns] = useState<EmbroideryDesign[]>(() => {
    if (initialDesigns && initialDesigns.length > 0) return initialDesigns
    return []
  })
  const [searchFilter, setSearchFilter] = useState('')

  function loadData() {
    if (initialRuns && initialRuns.length > 0) {
      setRuns(initialRuns)
    } else {
      setRuns(getMachineRuns())
    }
    if (initialDesigns && initialDesigns.length > 0) {
      setDesigns(initialDesigns)
    } else {
      setDesigns(getEmbroideryDesigns())
    }
  }

  useEffect(() => {
    if (initialRuns && initialRuns.length > 0) {
      setRuns(initialRuns)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_runs_v2', JSON.stringify(initialRuns))
      }
    } else {
      setRuns(getMachineRuns())
    }

    if (initialDesigns && initialDesigns.length > 0) {
      setDesigns(initialDesigns)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_designs_v2', JSON.stringify(initialDesigns))
      }
    } else {
      setDesigns(getEmbroideryDesigns())
    }

    if (initialAudits && initialAudits.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_qc_v2', JSON.stringify(initialAudits))
      }
    }

    if (initialCones && initialCones.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_cones_v2', JSON.stringify(initialCones))
      }
    }

    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadData)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadData)
  }, [initialRuns, initialDesigns, initialAudits, initialCones])

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      {/* 1. Top Breadcrumb & Tag */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/modules"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Workspace Hub</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Division 05 • Multi-Head Embroidery</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3A3564]" />
            200 Heads Active
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            ASTM D204 / ISO 4915
          </span>
        </div>
      </div>

      {/* 2. Header Banner Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Multi-Head Embroidery Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Division 05
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Computerized 20-head Tajima and Barudan lines, Tajima DST binary files, tension checks, and stitch piece-rate billing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <Link
            href="/embroidery/punch-library"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-black/10 hover:bg-[#FAF7F0] text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>DST Library</span>
          </Link>
          <Link
            href="/embroidery/machine-runs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Machine Shifts</span>
          </Link>
        </div>
      </div>

      {/* 3. Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">Active 20-Head Lines</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {activeLinesCount} / {runs.length} Lines
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            200 Automated high-speed heads
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">Daily Stitch Throughput</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {(totalStitchesToday / 1000000).toFixed(2)}M Stitches
          </div>
          <p className="text-xs font-medium text-slate-600 mt-1">
            {totalCompletedPanels.toLocaleString()} Panels finished today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">Thread Break Frequency (TBF)</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0.02%
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {totalBreaks} Breaks recorded (&lt;0.03% ASTM standard)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">DST Punch Library</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {designs.length} Approved Files
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Network loaded Tajima / Barudan
          </p>
        </div>
      </div>

      {/* 4. Quick Access Portal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/embroidery/punch-library"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">DST Punch Files</div>
            <div className="text-[11px] text-slate-500 font-medium">Stitch densities & colors</div>
          </div>
        </Link>

        <Link
          href="/embroidery/machine-runs"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">20-Head Machine Floor</div>
            <div className="text-[11px] text-slate-500 font-medium">Active shift progression</div>
          </div>
        </Link>

        <Link
          href="/embroidery/stitch-billing"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Stitch Billing & Rates</div>
            <div className="text-[11px] text-slate-500 font-medium">Commercial piece-rate</div>
          </div>
        </Link>

        <Link
          href="/embroidery/thread-store"
          className="bg-white p-4 rounded-xl border border-black/10 hover:border-[#3A3564]/30 hover:bg-[#FAF7F0]/60 transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#3A3564] transition-colors" />
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold text-slate-900">Thread Cones Store</div>
            <div className="text-[11px] text-slate-500 font-medium">Madeira & Isacord stock</div>
          </div>
        </Link>
      </div>

      {/* 5. Real-Time Multi-Head Machine Floor Matrix */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#FAF7F0]/30">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Multi-Head Computerized Machine Grid (10 Production Lines)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time telemetry across 20-head Tajima, Barudan & SWF automated lines.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search machine, DST, operator..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-white text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {filteredRuns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
            {filteredRuns.map(run => {
              const pct = Math.min(100, Math.round((run.panels_completed / (run.panels_loaded || 1)) * 100))

              return (
                <div
                  key={run.id}
                  className="p-4 rounded-xl border border-black/10 hover:border-black/20 bg-white transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {run.machine_number}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {run.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-600 mt-0.5">
                        Operator: <span className="font-bold text-slate-900">{run.operator_name}</span>
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
                      <span className="font-bold text-slate-900">
                        {run.panels_completed} / {run.panels_loaded} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#3A3564] h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                    <span>Thread Breaks: <strong className="text-slate-900">{run.thread_breaks_count}</strong></span>
                    <span>Stitches: <strong className="text-slate-900 font-bold">{(run.total_stitches_run / 1000).toFixed(0)}k</strong></span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              variant="seamless"
              icon={Cpu}
              title="No multi-head machine runs found"
              description="Active 20-head Tajima and Barudan production runs, stitch counters, and telemetry will appear once scheduled."
              actionLabel="Schedule Machine Shift"
              onAction={() => router.push('/embroidery/machine-runs')}
            />
          </div>
        )}
      </div>
    </div>
  )
}
