'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Flame,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { CuringOvenLog } from '../../types/printing'
import { getCuringLogs, saveCuringLog, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
import { LogCuringProbeModal } from './LogCuringProbeModal'

export function CuringQcClient() {
  const [logs, setLogs] = useState<CuringOvenLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setLogs(getCuringLogs())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [])

  const filteredLogs = logs.filter(l => {
    const matchesFilter = statusFilter === 'ALL' || l.status === statusFilter
    const matchesSearch =
      l.log_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.oven_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.po_number && l.po_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.auditor_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Executive KPI calculations
  const totalAudits = logs.length
  const optimalAudits = logs.filter(l => l.status === 'OPTIMAL').length
  const warningAudits = logs.filter(l => l.status === 'TEMP_WARNING' || l.status === 'CRITICAL').length
  const avgProbeTemp = logs.length > 0
    ? (logs.reduce((acc, l) => acc + l.probe_temp_c, 0) / logs.length).toFixed(1)
    : '160.0'

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
          <span className="font-mono font-bold text-slate-900">Curing Oven & Fastness QC</span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Thermal Probe Audit</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Tunnel Curing Oven & Fastness QC
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Target 160°C ± 3°C SLA
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Thermal strip heat probe calibration, 2.5 min dwell chamber verification, and 50-wash cycle durability testing.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Average Tunnel Temp
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {avgProbeTemp}°C
          </div>
          <p className="text-xs text-emerald-700 mt-1 font-medium font-mono">Target: 160.0°C (±3°C window)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Audit Passes (160°C)
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 font-mono">
            {optimalAudits} / {totalAudits} Passes
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Thermal test strips compliant</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Temperature Alerts
          </span>
          <div className={`text-2xl sm:text-[28px] font-bold font-mono ${
            warningAudits > 0 ? 'text-amber-700' : 'text-slate-900'
          }`}>
            {warningAudits} Warnings
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Auto-compensated conveyor speed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Standard Dwell Time
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-[#3A3564] font-mono">
            2.5 Minutes
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Full plastisol polymerization</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'OPTIMAL', 'TEMP_WARNING', 'CRITICAL'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search log #, oven, PO..."
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
                <th className="py-3 px-4">Log #</th>
                <th className="py-3 px-4">Tunnel Oven Unit</th>
                <th className="py-3 px-4">Set Temp</th>
                <th className="py-3 px-4">Probe Heat Reading</th>
                <th className="py-3 px-4">Belt Speed</th>
                <th className="py-3 px-4">Dwell Time</th>
                <th className="py-3 px-4 text-center">50-Wash Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Technician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.log_number}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {log.oven_id}
                      {log.po_number && (
                        <div className="text-[11px] font-mono text-slate-400">PO: {log.po_number}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 font-bold">
                      {log.target_temp_c}°C
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={
                        log.status === 'OPTIMAL' ? 'text-emerald-700' : 'text-amber-600'
                      }>
                        {log.probe_temp_c.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.conveyor_speed_mpm > 0 ? `${log.conveyor_speed_mpm} m/min` : 'Static Chamber'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.dwell_time_minutes} min
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {log.fastness_rating} / 5.0
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        log.status === 'OPTIMAL'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.status === 'TEMP_WARNING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {log.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                      {log.auditor_name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No curing oven probe logs match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogCuringProbeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
