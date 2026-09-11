'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Printer,
  ChevronLeft,
  Layers,
  Cpu,
  FileCheck2,
  Palette,
  Flame,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Maximize2,
  TrendingUp,
  Thermometer
} from 'lucide-react'
import {
  PrintingProductionRun,
  PrintingScreen,
  StrikeOffTest,
  CuringOvenLog
} from '../types/printing'
import {
  getProductionRuns,
  getScreens,
  getStrikeOffs,
  getCuringLogs,
  PRINTING_UPDATE_EVENT
} from '../utils/printingStorage'

export function PrintingDashboardClient() {
  const [runs, setRuns] = useState<PrintingProductionRun[]>([])
  const [screens, setScreens] = useState<PrintingScreen[]>([])
  const [strikeOffs, setStrikeOffs] = useState<StrikeOffTest[]>([])
  const [curingLogs, setCuringLogs] = useState<CuringOvenLog[]>([])
  const [activeTab, setActiveTab] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const reloadData = () => {
    setRuns(getProductionRuns())
    setScreens(getScreens())
    setStrikeOffs(getStrikeOffs())
    setCuringLogs(getCuringLogs())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [])

  // KPI Calculations
  const activeRunsCount = runs.filter(r => r.status === 'PRINTING' || r.status === 'CURING').length
  const totalCompletedPanels = runs.reduce((acc, r) => acc + r.panels_completed, 0)
  const totalIssuedPanels = runs.reduce((acc, r) => acc + r.total_panels_issued, 0)
  const totalRejectedPanels = runs.reduce((acc, r) => acc + r.panels_rejected, 0)
  const rejectionRate = totalCompletedPanels > 0 
    ? ((totalRejectedPanels / (totalCompletedPanels + totalRejectedPanels)) * 100).toFixed(2) 
    : '0.00'

  const readyScreensCount = screens.filter(s => s.status === 'READY_FOR_PRINT' || s.status === 'IN_USE').length
  const approvedStrikeOffs = strikeOffs.filter(s => s.approval_status === 'APPROVED').length

  const filteredRuns = runs.filter(run => {
    const matchesTab = activeTab === 'ALL' || run.status === activeTab
    const matchesSearch = 
      run.run_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.table_or_machine.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Table Matrix simulation
  const printStations = [
    { name: 'Table 01 (60m Conveyor)', type: 'ROTARY_TABLE', status: 'RUNNING', run: runs[0], temp: 161 },
    { name: 'Table 02 (60m Conveyor)', type: 'ROTARY_TABLE', status: 'COMPLETED', run: runs[1], temp: 160 },
    { name: 'DTG Unit 01 (Kornit)', type: 'DIGITAL_DTG', status: 'RUNNING', run: runs[2], temp: 158 },
    { name: 'Table 03 (Manual Vacuum)', type: 'MANUAL_TABLE', status: 'SETUP', run: runs[3], temp: 160 }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumb Hierarchy Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
            Workspace Hub
          </Link>
          <span>/</span>
          <span>Surface Art</span>
          <span>/</span>
          <span className="font-bold text-slate-900 font-mono">04. Screen & Digital Printing</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Curing Tunnel: 160°C Verified
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            AATCC 61 Fastness 4.5+
          </span>
        </div>
      </div>

      {/* 2. Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Screen & Digital Printing Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Division 04
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Automated conveyor screen printing, industrial Kornit DTG digital queues, spectrophotometer strike-off delta E matching, and 160°C thermal curing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Link
            href="/printing/strike-offs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Strike-Off Approvals</span>
          </Link>
          <Link
            href="/printing/table-runs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Table Runs & DTG</span>
          </Link>
        </div>
      </div>

      {/* 3. Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Active Table Lots</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {activeRunsCount} Active Runs
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span className="text-emerald-700 font-mono font-bold">8 Conveyor Tables</span>
            <span>running continuous passes</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Panels Printed Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {totalCompletedPanels.toLocaleString()} Pcs
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span className="text-slate-700 font-mono font-bold">{totalIssuedPanels.toLocaleString()} planned</span>
            <span>• {rejectionRate}% scrap rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Strike-Off Approval Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {strikeOffs.length > 0 ? Math.round((approvedStrikeOffs / strikeOffs.length) * 100) : 100}% Passed
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span className="text-emerald-700 font-mono font-bold">ΔE ≤ 0.85 avg</span>
            <span>against Pantone TCX target</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Screen Stencil Ready</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {readyScreensCount} / {screens.length} Screens
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span className="text-slate-700 font-mono font-bold">120–305 mesh</span>
            <span>exposed & tension checked</span>
          </div>
        </div>
      </div>

      {/* 4. Active Conveyor Table & DTG Units Status Matrix */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Continuous Spreading Table & DTG Machine Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time monitoring of 60m table passes, Kornit DTG digital stroke cycle, and tunnel curing oven probe temperatures.
            </p>
          </div>
          <Link
            href="/printing/curing-qc"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#3A3564] hover:underline"
          >
            <span>Oven Temperature Logs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {printStations.map((st, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/40 flex flex-col justify-between space-y-3 hover:border-black/20 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Station 0{idx + 1} • {st.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{st.name}</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  st.status === 'RUNNING'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : st.status === 'COMPLETED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {st.status}
                </span>
              </div>

              {st.run ? (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-mono text-slate-400">Active Job:</span>
                    <span className="font-mono font-bold text-slate-900">{st.run.run_number}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">Style:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{st.run.style_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">Technique:</span>
                    <span className="font-mono font-bold text-[#3A3564]">{st.run.technique}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400">Progress:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {st.run.panels_completed} / {st.run.total_panels_issued}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#3A3564] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (st.run.panels_completed / st.run.total_panels_issued) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-4 pb-2 text-center text-xs text-slate-400 italic">
                  Station currently idle / scheduled
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Oven: {st.temp}°C</span>
                </span>
                <span className="text-emerald-700 font-bold">160°C Target</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Quick Functional Workflows Carousel / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/printing/screens"
          className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs hover:border-[#3A3564]/40 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
            Screen & Stencil Library
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mesh counts (120–305), tension checks, and rack bin slots.
          </p>
        </Link>

        <Link
          href="/printing/table-runs"
          className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs hover:border-[#3A3564]/40 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
            Batch Queue & Shifts
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Table lots, stroke speed, and end-of-shift rejection logs.
          </p>
        </Link>

        <Link
          href="/printing/ink-kitchen"
          className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs hover:border-[#3A3564]/40 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Palette className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
            Ink Kitchen & Recipes
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Grams formulation, viscosity (cps), and eco certifications.
          </p>
        </Link>

        <Link
          href="/printing/curing-qc"
          className="p-4 rounded-2xl bg-white border border-black/10 shadow-2xs hover:border-[#3A3564]/40 hover:shadow-xs transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors">
            Curing & Fastness QC
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            160°C tunnel heat logger, dwell time, and 50-wash testing.
          </p>
        </Link>
      </div>

      {/* 6. Primary Data Table: Live Floor Production Queue */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'PRINTING', 'CURING', 'QUEUED', 'COMPLETED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search run #, PO, style..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* High-Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F0]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Run Number</th>
                <th className="py-3 px-4">PO & Style</th>
                <th className="py-3 px-4">Table / Machine</th>
                <th className="py-3 px-4">Technique</th>
                <th className="py-3 px-4 text-right">Issued</th>
                <th className="py-3 px-4 text-right">Completed</th>
                <th className="py-3 px-4 text-right">Rejected</th>
                <th className="py-3 px-4">Oven Temp</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredRuns.length > 0 ? (
                filteredRuns.map(run => (
                  <tr key={run.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {run.run_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{run.style_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {run.po_number} • {run.style_ref}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {run.table_or_machine}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {run.technique}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                      {run.total_panels_issued.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {run.panels_completed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      {run.panels_rejected}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <span className={run.curing_temp_verified ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                        {run.curing_temp_c}°C
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        run.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : run.status === 'PRINTING'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : run.status === 'CURING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No printing production runs match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
