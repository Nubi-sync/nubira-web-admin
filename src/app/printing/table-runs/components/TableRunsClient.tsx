'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Cpu,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  ArrowRight,
  Flame,
  FileSpreadsheet
} from 'lucide-react'
import { PrintingProductionRun, PrintRunStatus } from '../../types/printing'
import { getProductionRuns, saveProductionRun, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
import { LogProductionModal } from './LogProductionModal'
import { StartRunModal } from './StartRunModal'

export function TableRunsClient() {
  const [runs, setRuns] = useState<PrintingProductionRun[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [selectedRunForLog, setSelectedRunForLog] = useState<PrintingProductionRun | null>(null)
  const [isStartModalOpen, setIsStartModalOpen] = useState(false)

  const reloadData = () => {
    setRuns(getProductionRuns())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [])

  const handleAdvanceStatus = (run: PrintingProductionRun) => {
    let next: PrintRunStatus = run.status
    if (run.status === 'QUEUED') next = 'PRINTING'
    else if (run.status === 'PRINTING') next = 'CURING'
    else if (run.status === 'CURING') next = 'COMPLETED'

    const updated = saveProductionRun({
      ...run,
      status: next,
      curing_temp_verified: next === 'CURING' ? true : run.curing_temp_verified
    })
    setRuns(updated)
  }

  const filteredRuns = runs.filter(r => {
    const matchesFilter = statusFilter === 'ALL' || r.status === statusFilter
    const matchesSearch =
      r.run_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.table_or_machine.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Executive KPI summary
  const totalIssued = runs.reduce((acc, r) => acc + r.total_panels_issued, 0)
  const totalGood = runs.reduce((acc, r) => acc + r.panels_completed, 0)
  const totalRejects = runs.reduce((acc, r) => acc + r.panels_rejected, 0)
  const activeRuns = runs.filter(r => r.status === 'PRINTING' || r.status === 'CURING').length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/printing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">Table Batch Queue & DTG Runs</span>
        </div>

        <button
          onClick={() => setIsStartModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule New Batch Run</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Table Batch Queue & DTG Machine Runs
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Shift Production Ledger
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Live stroke counts, operator allocation, good panel outputs, and defect rejection logs with curing verification.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Active Running Jobs
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {activeRuns} Stations
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Table passes & DTG heads</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Total Cut Panels Issued
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {totalIssued.toLocaleString()} Pcs
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">From 03. Cutting floor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Panels Printed & Cured
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 font-mono">
            {totalGood.toLocaleString()} Pcs
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Ready for 06. Sewing Floor</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Total Shift Rejections
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-rose-600 font-mono">
            {totalRejects} Pcs
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Logged for end-bit recut</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'PRINTING', 'CURING', 'QUEUED', 'COMPLETED', 'QUARANTINED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search run, style, station..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F0]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Run #</th>
                <th className="py-3 px-4">PO & Garment</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Technique</th>
                <th className="py-3 px-4 text-right">Issued</th>
                <th className="py-3 px-4 text-right">Completed</th>
                <th className="py-3 px-4 text-right">Rejects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
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
                      <div className="font-bold text-slate-900">{run.style_name}</div>
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
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
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
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedRunForLog(run)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
                      >
                        Log Output
                      </button>

                      {run.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleAdvanceStatus(run)}
                          className="px-2.5 py-1 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {run.status === 'QUEUED' ? 'Start Print' : run.status === 'PRINTING' ? 'Send to Oven' : 'Complete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No printing runs match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogProductionModal
        isOpen={selectedRunForLog !== null}
        onClose={() => setSelectedRunForLog(null)}
        run={selectedRunForLog}
        onSuccess={reloadData}
      />

      <StartRunModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
