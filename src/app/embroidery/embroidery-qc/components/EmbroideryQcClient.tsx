'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  Plus,
  Search
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getQcAudits,
  EMBROIDERY_UPDATE_EVENT,
} from '../../utils/embroideryStorage'
import { EmbroideryQcAudit } from '../../types/embroidery'
import { LogThreadBreakModal } from './LogThreadBreakModal'

interface EmbroideryQcClientProps {
  initialAudits?: EmbroideryQcAudit[]
}

export function EmbroideryQcClient({ initialAudits }: EmbroideryQcClientProps = {}) {
  const [audits, setAudits] = useState<EmbroideryQcAudit[]>(() => {
    if (initialAudits && initialAudits.length > 0) return initialAudits
    return []
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadAudits() {
    if (initialAudits && initialAudits.length > 0) {
      setAudits(initialAudits)
    } else {
      setAudits(getQcAudits())
    }
  }

  useEffect(() => {
    if (initialAudits && initialAudits.length > 0) {
      setAudits(initialAudits)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_embroidery_qc_v2', JSON.stringify(initialAudits))
      }
    } else {
      setAudits(getQcAudits())
    }
    window.addEventListener(EMBROIDERY_UPDATE_EVENT, loadAudits)
    return () => window.removeEventListener(EMBROIDERY_UPDATE_EVENT, loadAudits)
  }, [initialAudits])

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
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Quality &amp; <span className="text-[#1D4ED8]">Thread Break QC</span>
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                Head 1–20 Diagnostics
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Bird-nesting tracking, needle hook timing, tension disc spring calibrations, and de-hooping audits.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <Link
            href="/embroidery"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-[#F0FDFA] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Thread Break Incident</span>
          </button>
        </div>
      </div>

      {/* 3. Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Total Audits Logged</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {audits.length} Incidents
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Shift maintenance events</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Thread Break Frequency</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            0.02% TBF
          </div>
          <p className="text-xs font-medium text-slate-600 mt-1">Below 0.03% threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500">Critical Stop Events</span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-2">
            {criticalCount} Critical
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Immediate needle/hook repairs</p>
        </div>
      </div>

      {/* 4. Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F0FDFA]/30">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'CRITICAL', 'MAJOR', 'MINOR'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSeverityFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                severityFilter === tab
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-[#0B1220] border border-black/15 hover:bg-[#F0FDFA]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, machine, defect..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-black/15 focus:outline-none focus:ring-1 focus:ring-[#0B1220] bg-white text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* 5. Audits Table */}
      <div className="bg-white rounded-2xl border border-black/15 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F0FDFA]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Incident Code</th>
                <th className="p-4">Machine & Head #</th>
                <th className="p-4">Defect Classification</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Corrective Maintenance Action</th>
                <th className="p-4">Auditor</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-900">
              {filteredAudits.length > 0 ? (
                filteredAudits.map(audit => (
                  <tr key={audit.id} className="hover:bg-[#F0FDFA]/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#0B1220]">
                      {audit.audit_code}
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-900">{audit.machine_number}</div>
                      <div className="text-[11px] text-slate-500 font-semibold">Head #{audit.head_number}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F0FDFA] border border-black/15 font-mono font-bold text-slate-800 text-[11px]">
                        {audit.defect_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyState
                      variant="seamless"
                      icon={CheckCircle2}
                      title="No thread break audits logged"
                      description="Needle hook timing, tension disc calibrations, and birdnesting incident logs will display once recorded."
                      actionLabel="Log Thread Break Incident"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
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
