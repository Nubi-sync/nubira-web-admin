'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  Plus,
  Search,
  AlertTriangle,
  Wrench,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react'
import {
  getQcAudits,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { EmbroideryQcAudit } from '../../types/embroidery'
import { LogThreadBreakModal } from './LogThreadBreakModal'

export function EmbroideryQcClient() {
  const [audits, setAudits] = useState<EmbroideryQcAudit[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadAudits() {
    setAudits(getQcAudits())
  }

  useEffect(() => {
    loadAudits()
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadAudits)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadAudits)
  }, [])

  const filteredAudits = audits.filter(a => {
    const matchesSearch =
      a.audit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.machine_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.defect_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.auditor_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const criticalCount = audits.filter(a => a.severity === 'CRITICAL').length

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
          Thread Break & Quality Control
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Quality & Thread Break QC
              </h1>
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Head 1–20 Diagnostics
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Bird-nesting tracking, needle hook timing, tension disc spring calibrations, and de-hooping audits
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Thread Break Incident</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Total Audits Logged</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {audits.length} Incidents
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Shift maintenance events</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Thread Break Frequency</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            0.02% TBF
          </div>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Below 0.03% threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Critical Stop Events</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {criticalCount} Critical
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Immediate needle/hook repairs</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'CRITICAL', 'MAJOR', 'MINOR'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSeverityFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                severityFilter === tab
                  ? 'bg-[#3A3564] text-white shadow-2xs'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-[#FAF7F0] hover:text-[#3A3564]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, machine, defect..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] bg-slate-50/50"
          />
        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0]/80 border-b border-black/10 text-slate-700 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4">Incident Code</th>
                <th className="p-4">Machine & Head #</th>
                <th className="p-4">Defect Classification</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Corrective Maintenance Action</th>
                <th className="p-4">Auditor</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAudits.map(audit => (
                <tr key={audit.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#3A3564]">
                    {audit.audit_code}
                  </td>
                  <td className="p-4 font-mono">
                    <div className="font-bold text-slate-900">{audit.machine_number}</div>
                    <div className="text-[11px] text-slate-500 font-semibold">Head #{audit.head_number}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono font-bold text-slate-800 text-[11px]">
                      {audit.defect_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                        audit.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : audit.severity === 'MAJOR'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {audit.severity}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 max-w-xs font-medium">
                    {audit.action_taken}
                  </td>
                  <td className="p-4 font-semibold text-slate-900">
                    {audit.auditor_name}
                  </td>
                  <td className="p-4 font-mono text-slate-500 text-[11px]">
                    {new Date(audit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogThreadBreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
