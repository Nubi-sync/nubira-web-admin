'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scale,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  Plus,
  Boxes,
  Gauge,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react'
import { getScaleLogs, READY_GOODS_UPDATE_EVENT } from '../../utils/readyGoodsStorage'
import { ScaleWeightLog } from '../../types/readyGoods'
import { ScaleAuditModal } from './ScaleAuditModal'

interface CartonWeightClientProps {
  userEmail?: string
}

export function CartonWeightClient({ userEmail }: CartonWeightClientProps) {
  const [logs, setLogs] = useState<ScaleWeightLog[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function loadLogs() {
    setLogs(getScaleLogs())
  }

  useEffect(() => {
    loadLogs()
    const handleUpdate = () => loadLogs()
    window.addEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(READY_GOODS_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredLogs = logs.filter(log => {
    return (
      log.cartonNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.scaleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.auditorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

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
          Metrology & Scale Log • ±0.15 kg Tolerance
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Scale Weight & Carton Audit Log
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Digital Weighbridges
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Real-time load cell telemetry verifying physical export carton weights against mathematical BOM weights (±0.15 kg threshold)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Weighbridge Audit</span>
        </button>
      </div>

      {/* 4 Scale Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Weighbridges Online
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            3 of 3 Active
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Bays 3, 4, 5 Calibrated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Tolerance Pass Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            97.4%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Within ±0.15 kg Limit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Tare Deductions
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0.95 kg (5-Ply)
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Box + Tape + Desiccant</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Ghost Piece Violations
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0 Detected
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">100% Quantity Integrity</p>
        </div>
      </div>

      {/* 3 Physical Scale Stations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3A3564]">SCALE-BAY-03</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              CALIBRATED
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">Hoodie & Heavy Knit Scale</div>
          <p className="text-xs text-slate-500">Capacity: 100 kg • Resolution: ±5g • Bay 3 Station</p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-black/5">
            Last Test: 2026-09-12 07:00 (20kg standard test pass)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3A3564]">SCALE-BAY-04</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              CALIBRATED
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">Tees & Lightweight Conveyor Scale</div>
          <p className="text-xs text-slate-500">Capacity: 60 kg • Resolution: ±2g • Bay 4 Station</p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-black/5">
            Last Test: 2026-09-12 07:15 (20kg standard test pass)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#3A3564]">SCALE-BAY-05</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              CALIBRATED
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">Cargo & Heavy Woven Scale</div>
          <p className="text-xs text-slate-500">Capacity: 150 kg • Resolution: ±10g • Bay 5 Station</p>
          <div className="pt-2 text-[11px] font-mono text-slate-400 border-t border-black/5">
            Last Test: 2026-09-12 07:30 (20kg standard test pass)
          </div>
        </div>
      </div>

      {/* Main Table: Scale Weight Audits */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Digital Scale Audit & Variance Log
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredLogs.length} Audits Logged
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified weight delta between physical weighbridge reading and theoretical BOM calculation
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search CTN #, PO, Scale, Auditor..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Scale Station</th>
                <th className="py-3 px-4">Carton Barcode</th>
                <th className="py-3 px-4">Order PO</th>
                <th className="py-3 px-4">Style Description</th>
                <th className="py-3 px-4">Measured Weight</th>
                <th className="py-3 px-4">Expected BOM Wt</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Tolerance Status</th>
                <th className="py-3 px-4">Auditor</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No scale weight records match your search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      {log.scaleId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.cartonNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.styleName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.measuredWeightKg.toFixed(2)} kg
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.expectedWeightKg.toFixed(2)} kg
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          log.tolerancePassed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.varianceKg >= 0 ? '+' : ''}
                        {log.varianceKg.toFixed(2)} kg
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.tolerancePassed ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          PASSED (±0.15 kg)
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> OUT OF SPEC
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {log.auditorName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {log.loggedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScaleAuditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadLogs}
      />
    </div>
  )
}
