'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calculator,
  Filter,
  Eye,
  Plus,
  ArrowRight,
  Boxes,
  HelpCircle,
  FileCheck2
} from 'lucide-react'
import { getAqlAudits, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { AqlAudit } from '../../types/readyGoods'
import { AqlAuditModal } from './AqlAuditModal'

interface AqlInspectionClientProps {
  userEmail?: string
}

export function AqlInspectionClient({ userEmail }: AqlInspectionClientProps) {
  const [audits, setAudits] = useState<AqlAudit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('ALL')
  const [selectedAudit, setSelectedAudit] = useState<AqlAudit | null>(null)

  function loadAudits() {
    setAudits(getAqlAudits())
  }

  useEffect(() => {
    loadAudits()
    const handleUpdate = () => loadAudits()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredAudits = audits.filter(audit => {
    const matchesDecision =
      decisionFilter === 'ALL' || audit.auditDecision === decisionFilter

    const matchesSearch =
      audit.auditNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.cartonNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.inspectorName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDecision && matchesSearch
  })

  const passedCount = audits.filter(a => a.auditDecision === 'PASS').length
  const quarantinedCount = audits.filter(a => a.auditDecision === 'REJECT_QUARANTINE').length
  const passRate = audits.length > 0 ? ((passedCount / audits.length) * 100).toFixed(1) : '100.0'

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/ready-goods"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Ready Goods Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Inspection Station • ISO 2859-1 Normal Level II
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                AQL 2.5 Statistical Inspection Station
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                Normal Level II
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Quality gate enforcing international sampling standards: 0 Critical Defects, ≤ 10 Major Defects per 200 pcs sample
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct AQL Audit (Form 1)</span>
        </button>
      </div>

      {/* 4 Inspection Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Audits Executed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {audits.length} Audits
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Export Cartons Sampled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Audit Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {passRate}%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">{passedCount} Lots Approved for Dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Quarantined Lots
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700">
            {quarantinedCount} Cartons
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Locked in Bay 5 Quarantine</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Critical Defect SLA
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0 Allowed
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Zero Tolerance for Sharp/Broken Needles</p>
        </div>
      </div>

      {/* ISO 2859-1 Sampling Standard Reference Accordion */}
      <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#3A3564]" />
            <h3 className="text-sm font-black text-slate-900">
              ISO 2859-1 Level II Normal Sampling Acceptance Table
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Official Garment Export Standard
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40">
            <div className="font-mono font-bold text-[#3A3564]">Lot: 501 – 1,200 pcs</div>
            <div className="text-slate-600 mt-1">Sample Size: <span className="font-bold">80 pcs</span></div>
            <div className="text-[11px] text-slate-500">AQL 2.5 Major: ≤ 5 | Minor: ≤ 7</div>
          </div>
          <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40">
            <div className="font-mono font-bold text-[#3A3564]">Lot: 1,201 – 3,200 pcs</div>
            <div className="text-slate-600 mt-1">Sample Size: <span className="font-bold">125 pcs</span></div>
            <div className="text-[11px] text-slate-500">AQL 2.5 Major: ≤ 7 | Minor: ≤ 10</div>
          </div>
          <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0] border-[#3A3564]/30 shadow-2xs">
            <div className="font-mono font-black text-[#3A3564]">Lot: 3,201 – 10,000 pcs</div>
            <div className="text-slate-900 mt-1 font-bold">Sample Size: 200 pcs</div>
            <div className="text-[11px] font-semibold text-emerald-800">AQL 2.5 Major: ≤ 10 | Minor: ≤ 14</div>
          </div>
          <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0]/40">
            <div className="font-mono font-bold text-[#3A3564]">Lot: 10,001 – 35,000 pcs</div>
            <div className="text-slate-600 mt-1">Sample Size: <span className="font-bold">315 pcs</span></div>
            <div className="text-[11px] text-slate-500">AQL 2.5 Major: ≤ 14 | Minor: ≤ 21</div>
          </div>
        </div>
      </div>

      {/* Main Table: Historical & Active Quality Audits */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                AQL 2.5 Inspection Audit Logs
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredAudits.length} Audits
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified statistical defect reports with certified QA inspector signoffs
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search AQL #, Carton, PO, Auditor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-black/5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Decisions' },
            { id: 'PASS', label: 'PASS Only' },
            { id: 'REJECT_QUARANTINE', label: 'Quarantined Only' },
            { id: 'RE_AUDIT', label: 'Re-Audit Pending' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDecisionFilter(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                decisionFilter === tab.id
                  ? 'border-[#3A3564] text-[#3A3564] bg-[#FAF7F0]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Audits Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Audit Voucher</th>
                <th className="py-3 px-4">Target Carton</th>
                <th className="py-3 px-4">Order PO</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Lot Size</th>
                <th className="py-3 px-4">Sample Size</th>
                <th className="py-3 px-4">Defects (C / M / m)</th>
                <th className="py-3 px-4">QA Decision</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No inspection audits found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredAudits.map(audit => (
                  <tr
                    key={audit.id}
                    className="hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedAudit(audit)}
                  >
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564]">
                      {audit.auditNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {audit.cartonNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {audit.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {audit.inspectorName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {audit.lotSizePieces.toLocaleString()} pcs
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      {audit.sampleSizeAudited} pcs
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          audit.criticalDefects > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          C:{audit.criticalDefects}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          audit.majorDefects > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          M:{audit.majorDefects}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          m:{audit.minorDefects}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {audit.auditDecision === 'PASS' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          PASS
                        </span>
                      )}
                      {audit.auditDecision === 'REJECT_QUARANTINE' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          REJECT_QUARANTINE
                        </span>
                      )}
                      {audit.auditDecision === 'RE_AUDIT' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          RE_AUDIT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {audit.auditDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedAudit(audit)
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-black/10 text-slate-700 text-xs font-mono font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedAudit(null)}
        >
          <div
            className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#3A3564]" />
                <h3 className="text-lg font-black text-slate-900">
                  Audit Voucher: {selectedAudit.auditNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono">Target Carton:</span>
                <div className="font-mono font-bold text-slate-900">{selectedAudit.cartonNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Order PO:</span>
                <div className="font-mono font-bold text-slate-900">{selectedAudit.orderNumber}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Auditor:</span>
                <div className="font-bold text-slate-900">{selectedAudit.inspectorName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Decision:</span>
                <div className="font-mono font-bold text-emerald-700">{selectedAudit.auditDecision}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Lot Size:</span>
                <div className="font-mono font-bold text-slate-900">{selectedAudit.lotSizePieces} pcs</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Sample Size:</span>
                <div className="font-mono font-bold text-[#3A3564]">{selectedAudit.sampleSizeAudited} pcs</div>
              </div>
            </div>

            {/* Defect Breakdown List */}
            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Cataloged Defects (C: {selectedAudit.criticalDefects} | M: {selectedAudit.majorDefects} | m: {selectedAudit.minorDefects})
              </span>
              <div className="mt-2 space-y-1.5">
                {selectedAudit.defects.map((d, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg border border-black/10 bg-[#FAF7F0]/40 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-800">{d.type}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        d.category === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : d.category === 'MAJOR'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {d.count}x {d.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remarks */}
            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Auditor Remarks
              </span>
              <p className="text-xs text-slate-700 mt-1 italic bg-slate-50 p-2.5 rounded-lg border border-black/5">
                "{selectedAudit.remarks}"
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form 1 Modal */}
      <AqlAuditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadAudits}
      />
    </div>
  )
}
