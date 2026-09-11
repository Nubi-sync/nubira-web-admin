'use client'

import { useState, useEffect } from 'react'
import {
  Droplets,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Calendar,
  Sparkles,
  TrendingDown
} from 'lucide-react'
import { WaterAuditLog } from '../../types/washing'
import { getWaterAuditLogs, WASHING_UPDATE_EVENT } from '../../utils/washingStorage'
import { LogWaterAuditModal } from './LogWaterAuditModal'

export function LiquorAuditClient() {
  const [audits, setAudits] = useState<WaterAuditLog[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadAudits() {
    setAudits(getWaterAuditLogs())
  }

  useEffect(() => {
    loadAudits()
    const handleUpdate = () => loadAudits()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalLiters = audits.reduce((acc, a) => acc + (a.litersConsumed || 0), 0)
  const totalDryKg = audits.reduce((acc, a) => acc + (a.dryWeightProcessedKg || 0), 0)
  const overallRatio = totalDryKg > 0 ? (totalLiters / totalDryKg).toFixed(2) : '5.20'
  const compliantCount = audits.filter(a => a.complianceStatus === 'COMPLIANT').length

  return (
    <div className="space-y-6">
      {/* 4 Environmental KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Mean Liquor Ratio
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              1 : {overallRatio}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">Target 1:5.0</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Standard M:L ratio tolerance: &le; 1:5.5
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Water Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalLiters.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Liters</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Across {totalDryKg.toLocaleString()} kg processed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Effluent pH Standard
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              7.2 pH
            </span>
            <span className="text-xs font-bold text-emerald-600">Neutral</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Pollution Board limit: 6.5 - 8.0 pH
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Water Efficiency
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              -14%
            </span>
            <span className="text-xs font-bold text-emerald-600">Savings</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Optimized bath cycles vs standard 1:8 ratio
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Daily Water Consumption & Effluent Discharge Log
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Daily meter audits verifying compliance with 1:5.0 liquor ratio and zero hazardous effluent
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Water Audit</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Audit Date</th>
                <th className="p-3">Meter Readings (Init &rarr; Final)</th>
                <th className="p-3">Water Consumed</th>
                <th className="p-3">Dry Garments</th>
                <th className="p-3">Actual Ratio (M:L)</th>
                <th className="p-3">Effluent pH & TDS</th>
                <th className="p-3">Compliance</th>
                <th className="p-3">Auditor & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {audits.map(a => {
                const isCompliant = a.complianceStatus === 'COMPLIANT'
                const isWarning = a.complianceStatus === 'WARNING'
                return (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {a.auditDate}
                    </td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">
                      {a.meterReadingInitial.toLocaleString()} &rarr; {a.meterReadingFinal.toLocaleString()} L
                    </td>
                    <td className="p-3 font-mono font-bold text-[#3A3564]">
                      {a.litersConsumed.toLocaleString()} Liters
                    </td>
                    <td className="p-3 font-mono text-slate-800">
                      {a.dryWeightProcessedKg.toLocaleString()} kg
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-slate-900">
                        1 : {a.actualLiquorRatio}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      <div className="font-bold text-slate-800">pH {a.effluentPh}</div>
                      <div className="text-[10px] text-slate-500">{a.effluentTdsPpm} ppm TDS</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          isCompliant
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isWarning
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {a.complianceStatus}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-xs max-w-[220px]">
                      <div className="font-medium text-slate-800">{a.auditorName}</div>
                      {a.notes && <div className="text-[11px] text-slate-500 truncate">{a.notes}</div>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <LogWaterAuditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
