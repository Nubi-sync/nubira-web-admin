'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileCheck2,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { StrikeOffTest } from '../../types/printing'
import { getStrikeOffs, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
import { SubmitStrikeOffModal } from './SubmitStrikeOffModal'

interface StrikeOffsClientProps {
  initialStrikeOffs?: StrikeOffTest[]
}

export function StrikeOffsClient({ initialStrikeOffs }: StrikeOffsClientProps = {}) {
  const [strikeOffs, setStrikeOffs] = useState<StrikeOffTest[]>(() => {
    if (initialStrikeOffs && initialStrikeOffs.length > 0) return initialStrikeOffs
    return []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  const reloadData = () => {
    if (initialStrikeOffs && initialStrikeOffs.length > 0) {
      setStrikeOffs(initialStrikeOffs)
    } else {
      setStrikeOffs(getStrikeOffs())
    }
  }

  useEffect(() => {
    if (initialStrikeOffs && initialStrikeOffs.length > 0) {
      setStrikeOffs(initialStrikeOffs)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_printing_strike_offs_v2', JSON.stringify(initialStrikeOffs))
      }
    } else {
      setStrikeOffs(getStrikeOffs())
    }
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [initialStrikeOffs])

  const filteredTests = strikeOffs.filter(t => {
    const matchesFilter = statusFilter === 'ALL' || t.approval_status === statusFilter
    const matchesSearch =
      t.test_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.style_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pantone_target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.auditor_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Executive KPI summary
  const totalTests = strikeOffs.length
  const approvedCount = strikeOffs.filter(t => t.approval_status === 'APPROVED').length
  const reviseCount = strikeOffs.filter(t => t.approval_status === 'REVISE_RECIPE').length
  const avgDeltaE = strikeOffs.length > 0 
    ? (strikeOffs.reduce((acc, t) => acc + t.spectro_delta_e, 0) / strikeOffs.length).toFixed(2)
    : '0.00'

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b] select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Strike-Off Color Approvals (Form 1 Gate)
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                Delta E ≤ 1.0 Gate
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Spectrophotometer colorimetric certification, wash durability (AATCC 61), and 100% stretch elastic crack inspection.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <Link
            href="/printing"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-black/15 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] hover:bg-[#F0FDFA] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Strike-Off</span>
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-2">
            Total Strike-Offs Audited
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalTests} Tests
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pre-bulk laboratory test prints</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-2">
            Cleared for Production
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {approvedCount} Approved
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Buyer tech sign-off verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-2">
            Average Delta E (ΔE)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            ΔE {avgDeltaE}
          </div>
          <p className="text-xs text-slate-600 font-medium font-mono">Within standard target ≤ 1.00</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-2">
            Recipe Adjustments Required
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {reviseCount} Tests
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Returned to ink kitchen</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/15 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#F0FDFA]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'APPROVED', 'REVISE_RECIPE', 'REJECTED', 'PENDING_LAB'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#0B1220] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#0B1220] border border-black/15 hover:bg-[#F0FDFA]'
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
              placeholder="Search test #, PO, Pantone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-black/15 focus:outline-none focus:ring-1 focus:ring-[#0B1220] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F0FDFA]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Test #</th>
                <th className="py-3 px-4">PO & Style</th>
                <th className="py-3 px-4">Pantone Swatch Target</th>
                <th className="py-3 px-4">Spectro ΔE</th>
                <th className="py-3 px-4 text-center">100% Stretch</th>
                <th className="py-3 px-4 text-center">Fastness</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Auditor Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredTests.length > 0 ? (
                filteredTests.map(test => (
                  <tr key={test.id} className="hover:bg-[#F0FDFA]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {test.test_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{test.po_number}</div>
                      <div className="text-[11px] font-mono text-slate-500">{test.style_ref}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-800 font-semibold">{test.pantone_target}</span>
                      <div className="text-[11px] font-mono text-[#0B1220]">{test.technique}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                        ΔE {test.spectro_delta_e.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0B1220]" />
                        <span>{test.stretch_test_pass ? 'PASS' : 'FAIL'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {test.wash_fastness_rating} / 5.0
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                        {test.approval_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <div className="text-xs truncate">{test.remarks}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{test.auditor_name}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      variant="seamless"
                      icon={FileCheck2}
                      title="No strike-off test records found"
                      description="Pre-bulk laboratory test prints and spectrophotometer delta E readings will display once submitted."
                      actionLabel="Submit Strike-Off Test (Form 1)"
                      onAction={() => setIsSubmitModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SubmitStrikeOffModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
