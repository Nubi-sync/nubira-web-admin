'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react'
import { FinishQcAudit } from '../../types/iron'
import { getFinishQcAudits, IRON_UPDATE_EVENT } from '../../utils/ironStorage'
import { RecordQcModal } from './RecordQcModal'

export function FinishQcClient() {
  const [audits, setAudits] = useState<FinishQcAudit[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadAudits() {
    setAudits(getFinishQcAudits())
  }

  useEffect(() => {
    loadAudits()
    const handleUpdate = () => loadAudits()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalAudits = audits.length
  const passedAudits = audits.filter(a => a.qcStatus === 'PASS').length
  const reworkAudits = audits.filter(a => a.qcStatus === 'REWORK_ALTERATION').length
  const passRate = totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 100

  const filtered = audits.filter(a => {
    const matchesSearch =
      a.auditCode.toLowerCase().includes(search.toLowerCase()) ||
      a.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.operatorName.toLowerCase().includes(search.toLowerCase()) ||
      a.challanId.toLowerCase().includes(search.toLowerCase()) ||
      a.articleName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || a.qcStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* 4 Quality Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Finishing Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {passRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              {passedAudits} / {totalAudits} Lots
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero shine / glaze defects SLA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              1000-Lux Inspections
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {audits.reduce((acc, a) => acc + (a.samplePcs || 20), 0)}
            </span>
            <span className="text-xs font-bold text-slate-600">Pcs</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            High-intensity shadowless lamps
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Quarantine to Alteration
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-600">
              {reworkAudits}
            </span>
            <span className="text-xs font-bold text-rose-700 font-mono">Quarantined</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Re-steamed & deburred in clinic
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Teflon Shoe Protection
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              100%
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">Fitted</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Prevents synthetic fiber scorching
          </p>
        </div>
      </div>

      {/* QC Audit Records Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit code, table, operator, lot..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
              {['ALL', 'PASS', 'REWORK_ALTERATION'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-[#3A3564] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record QC Audit</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Audit Code & Time</th>
                <th className="p-3">Table & Operator</th>
                <th className="p-3">Challan & Article</th>
                <th className="p-3">Sample Pieces</th>
                <th className="p-3">Glaze / Shine</th>
                <th className="p-3">Water Spots</th>
                <th className="p-3">QC Status</th>
                <th className="p-3">Auditor & Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {filtered.map(a => {
                const isPass = a.qcStatus === 'PASS'

                return (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-[#3A3564]">{a.auditCode}</div>
                      <div className="text-[11px] text-slate-500">{a.timestamp}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{a.operatorName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{a.tableNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-slate-700">{a.challanId}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{a.articleName}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {a.samplePcs} pcs
                    </td>
                    <td className="p-3 font-mono">
                      {a.glazeDefects > 0 ? (
                        <span className="text-rose-600 font-bold">{a.glazeDefects} pcs</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0</span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      {a.waterSpots > 0 ? (
                        <span className="text-amber-600 font-bold">{a.waterSpots} pcs</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">0</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {a.qcStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 max-w-[240px]">
                      <div className="font-medium text-slate-900">{a.auditorName}</div>
                      {a.actionTaken && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{a.actionTaken}</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RecordQcModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
