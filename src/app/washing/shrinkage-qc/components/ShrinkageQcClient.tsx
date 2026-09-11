'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  Ruler,
  Check,
  RotateCcw
} from 'lucide-react'
import { ShrinkageQcRecord } from '../../types/washing'
import { getShrinkageQcRecords, WASHING_UPDATE_EVENT } from '../../utils/washingStorage'
import { RecordShrinkageModal } from './RecordShrinkageModal'

export function ShrinkageQcClient() {
  const [records, setRecords] = useState<ShrinkageQcRecord[]>([])
  const [search, setSearch] = useState('')
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadRecords() {
    setRecords(getShrinkageQcRecords())
  }

  useEffect(() => {
    loadRecords()
    const handleUpdate = () => loadRecords()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [])

  const criticalAlerts = records.filter(r => r.qcStatus === 'CRITICAL_FAIL' || r.cuttingAlertSent)
  const passCount = records.filter(r => r.qcStatus === 'PASS').length
  const passRate = records.length > 0 ? Math.round((passCount / records.length) * 100) : 100

  const filtered = records.filter(r => {
    const matchesSearch =
      r.qcCode.toLowerCase().includes(search.toLowerCase()) ||
      r.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.articleName.toLowerCase().includes(search.toLowerCase()) ||
      r.auditorName.toLowerCase().includes(search.toLowerCase())
    const matchesVerdict = verdictFilter === 'ALL' || r.qcStatus === verdictFilter
    return matchesSearch && matchesVerdict
  })

  return (
    <div className="space-y-6">
      {/* High Shrinkage Auto-Escalation Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                  CRITICAL CUTTING ALERT TRIGGERED
                </span>
                <span className="text-xs font-semibold text-rose-800">
                  AATCC 135 Standard Exceeded (&gt; 2.5% Shrinkage)
                </span>
              </div>
              <p className="text-xs text-rose-950 font-medium mt-1">
                The auto-escalation engine has flagged {criticalAlerts.length} high-shrinkage batch(es). Cutting Floor CAD station has been instructed to apply proportional marker expansion factors before continuing roll cut orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {criticalAlerts.map(ca => (
              <div
                key={ca.id}
                className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="font-mono font-bold text-rose-900">
                    {ca.batchNumber} • {ca.qcCode}
                  </div>
                  <div className="text-slate-700 font-medium">{ca.articleName}</div>
                  <div className="text-[11px] font-mono font-bold text-rose-700 mt-0.5">
                    Length: +{ca.avgLengthShrinkPct}% | Width: +{ca.avgWidthShrinkPct}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-mono font-bold text-[10px] uppercase">
                    CAD Notified
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">Lay cutting suspended</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Statistical QC Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              QC Pass Rate
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
              {passCount} / {records.length} Lots
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Tolerance threshold: &le; 1.5% residual
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Mean Length Shrinkage
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              1.12%
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">&le; 1.5% Pass</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            AATCC 135 dimensional stabilization
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Mean Width Shrinkage
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              0.98%
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">&le; 1.5% Pass</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero post-wash seam twisting
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Colorfastness Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              4.6 / 5
            </span>
            <span className="text-xs font-bold text-emerald-600">Grey Scale</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero wet rub tint transfer
          </p>
        </div>
      </div>

      {/* Action and Table Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search QC code, batch, garment style..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
              {['ALL', 'PASS', 'MARGINAL_WARN', 'CRITICAL_FAIL'].map(st => (
                <button
                  key={st}
                  onClick={() => setVerdictFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    verdictFilter === st
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
              <span>Record Shrinkage QC (Form 2)</span>
            </button>
          </div>
        </div>

        {/* QC Records Table */}
        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">QC Code & Date</th>
                <th className="p-3">Batch & Article</th>
                <th className="p-3">Tested Pcs</th>
                <th className="p-3">Length (Pre &rarr; Post)</th>
                <th className="p-3">Width (Pre &rarr; Post)</th>
                <th className="p-3">Colorfastness</th>
                <th className="p-3">QC Status</th>
                <th className="p-3">Inspector & Corrective Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {filtered.map(r => {
                const isPass = r.qcStatus === 'PASS'
                const isFail = r.qcStatus === 'CRITICAL_FAIL'
                const isWarn = r.qcStatus === 'MARGINAL_WARN'

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#3A3564]">{r.qcCode}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.auditDate}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{r.articleName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{r.batchNumber}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {r.samplePiecesTested} pcs
                    </td>
                    <td className="p-3 font-mono">
                      <div className={`font-bold ${r.avgLengthShrinkPct > 2.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {r.avgLengthShrinkPct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.preWashLengthCm} &rarr; {r.postWashLengthCm} cm
                      </div>
                    </td>
                    <td className="p-3 font-mono">
                      <div className={`font-bold ${r.avgWidthShrinkPct > 2.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {r.avgWidthShrinkPct}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.preWashWidthCm} &rarr; {r.postWashWidthCm} cm
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      {r.colorfastnessRating} / 5.0
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            isPass
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isFail
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {r.qcStatus.replace('_', ' ')}
                        </span>
                        {r.cuttingAlertSent && (
                          <span className="text-[9px] font-mono font-bold text-rose-700 uppercase bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200 inline-block text-center">
                            Cutting Notified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 max-w-[240px]">
                      <div className="font-semibold text-slate-800">{r.auditorName}</div>
                      {r.actionTaken && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{r.actionTaken}</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RecordShrinkageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
