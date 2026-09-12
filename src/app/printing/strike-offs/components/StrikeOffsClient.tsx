'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileCheck2,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  Sliders,
  ArrowRight
} from 'lucide-react'
import { StrikeOffTest, StrikeOffStatus } from '../../types/printing'
import { getStrikeOffs, saveStrikeOff, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
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
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/printing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">Strike-Off Lab Approvals</span>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Strike-Off Test (Form 1)</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Strike-Off Color Approvals (Form 1 Gate)
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Delta E ≤ 1.0 Gate
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Spectrophotometer colorimetric certification, wash durability (AATCC 61), and 100% stretch elastic crack inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Total Strike-Offs Audited
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {totalTests} Tests
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pre-bulk laboratory test prints</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Cleared for Production
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 font-mono">
            {approvedCount} Approved
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Buyer tech sign-off verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Average Delta E (ΔE)
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-[#3A3564] font-mono">
            ΔE {avgDeltaE}
          </div>
          <p className="text-xs text-emerald-700 font-medium font-mono">Within standard target ≤ 1.00</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Recipe Adjustments Required
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-amber-700 font-mono">
            {reviseCount} Tests
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Returned to ink kitchen</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'APPROVED', 'REVISE_RECIPE', 'REJECTED', 'PENDING_LAB'].map(status => (
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
              placeholder="Search test #, PO, Pantone..."
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
                  <tr key={test.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {test.test_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{test.po_number}</div>
                      <div className="text-[11px] font-mono text-slate-400">{test.style_ref}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-800 font-semibold">{test.pantone_target}</span>
                      <div className="text-[11px] font-mono text-[#3A3564]">{test.technique}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        test.spectro_delta_e <= 1.0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        ΔE {test.spectro_delta_e.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {test.stretch_test_pass ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {test.wash_fastness_rating} / 5.0
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        test.approval_status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : test.approval_status === 'REVISE_RECIPE'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
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
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No strike-off test records match the filter criteria.
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
