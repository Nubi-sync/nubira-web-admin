'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Flame,
  Gauge,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  Thermometer,
  Calculator,
  Truck,
  Activity,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react'
import {
  IronTable,
  IronProductionLog,
  BoilerTelemetryLog,
  FinishQcAudit,
  PackingHandover,
} from '../types/iron'
import {
  getIronTables,
  getIronProductionLogs,
  getBoilerLogs,
  getFinishQcAudits,
  getPackingHandovers,
  IRON_UPDATE_EVENT,
} from '../utils/ironStorage'

export function IronDashboardClient() {
  const [tables, setTables] = useState<IronTable[]>([])
  const [logs, setLogs] = useState<IronProductionLog[]>([])
  const [boilerLogs, setBoilerLogs] = useState<BoilerTelemetryLog[]>([])
  const [qcAudits, setQcAudits] = useState<FinishQcAudit[]>([])
  const [handovers, setPackingHandovers] = useState<PackingHandover[]>([])
  const [isLoading, setIsLoading] = useState(true)

  function loadData() {
    setTables(getIronTables())
    setLogs(getIronProductionLogs())
    setBoilerLogs(getBoilerLogs())
    setQcAudits(getFinishQcAudits())
    setPackingHandovers(getPackingHandovers())
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  // KPI Calculations
  const activeTablesCount = tables.filter(t => t.status === 'ACTIVE').length
  const totalPressedPieces = logs.reduce((acc, l) => acc + (l.piecesPressed || 0), 0)
  const totalEarnedWages = logs.reduce((acc, l) => acc + (l.totalEarnedWages || 0), 0)
  const totalShineDefects = logs.reduce((acc, l) => acc + (l.defectShineCount || 0), 0)
  const latestBoiler = boilerLogs[0] || { steamPressureBar: 4.5, boilerTempC: 154, condensateTrapStatus: 'NORMAL' }
  const firstPassRate = totalPressedPieces > 0
    ? (((totalPressedPieces - totalShineDefects) / totalPressedPieces) * 100).toFixed(1)
    : '99.1'

  const shiftTargetPcs = 7500
  const shiftProgressPct = Math.min(100, Math.round((totalPressedPieces / shiftTargetPcs) * 100))

  return (
    <div className="space-y-6">
      {/* Central Boiler Steam Status Ticker */}
      <div className="bg-[#FAF7F0] border border-black/10 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gauge className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10">
                Boiler Steam Telemetry
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {latestBoiler.steamPressureBar} Bar Steam Pressure (Optimal: 4.2–4.8 Bar)
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Central boiler feeding 12 vacuum buck stations • Temp: <strong>{latestBoiler.boilerTempC}°C</strong> • Condensate: <strong>{latestBoiler.condensateTrapStatus}</strong>
            </p>
          </div>
        </div>

        <Link
          href="/iron/boiler-telemetry"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#3A3564] text-xs font-bold transition-all border border-black/10 shadow-2xs shrink-0"
        >
          <span>Boiler Gauges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4 Master KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Daily Pressed Volume */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Daily Pressed Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalPressedPieces.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Pcs</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Shift Target: {shiftTargetPcs.toLocaleString()} pcs ({shiftProgressPct}%)
          </p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#3A3564] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${shiftProgressPct}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Steam Pressure */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Boiler Pressure
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {latestBoiler.steamPressureBar} Bar
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">Continuous Flow</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Operating band: 4.2 Bar – 4.8 Bar
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Condensate traps draining cleanly</span>
          </div>
        </div>

        {/* KPI 3: Active Vacuum Tables */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Vacuum Tables
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {activeTablesCount} / {tables.length}
            </span>
            <span className="text-xs font-bold text-emerald-600">Online</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            12-station vacuum buck layout
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Teflon shoe base: 140°C - 160°C</span>
          </div>
        </div>

        {/* KPI 4: Finishing First Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              First Pass QC Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {firstPassRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600">ISO 105-X11</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Zero glaze & shine defect SLA
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 font-mono">
            <span>Shift Wages: ₹{totalEarnedWages.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 12-Station Steam Vacuum Buck Tables Floor Matrix */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3A3564]" />
              <h2 className="text-base font-black text-slate-900">
                Steam Vacuum Buck Tables Matrix (12 Stations)
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Live Pressing Layout
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Station-by-station operational console showing operator assignments, Teflon shoe status, and hourly piece rate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/iron/tables"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Allot / Log Production</span>
            </Link>
          </div>
        </div>

        {/* 12 Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
          {tables.map(tbl => {
            const isActive = tbl.status === 'ACTIVE'
            const isIdle = tbl.status === 'IDLE'

            return (
              <div
                key={tbl.id}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-white border-[#3A3564]/30 shadow-2xs ring-1 ring-[#3A3564]/10'
                    : 'bg-slate-50/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-xs font-black tracking-tight text-slate-900 font-mono">
                      {tbl.tableNumber}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tbl.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Operator:</span>
                    <strong className="font-semibold text-slate-900 truncate max-w-[130px]">
                      {tbl.operatorName}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500">Challan Lot:</span>
                    <span className="font-mono font-bold text-[#3A3564] text-[11px]">
                      {tbl.challanId}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-600 truncate">
                    {tbl.articleName}
                  </div>

                  {isActive && (
                    <>
                      <div className="p-2 bg-[#FAF7F0] rounded-lg border border-black/5 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-500">Pressed:</span>
                        <strong className="text-slate-900 text-xs">
                          {tbl.currentPiecesPressed} pcs
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Thermometer className="w-3 h-3" />
                          {tbl.ironTempC}°C
                        </span>
                        <span className="text-[#3A3564] font-bold">₹{tbl.pieceRate}/pc</span>
                      </div>
                    </>
                  )}

                  {isIdle && (
                    <div className="py-2 text-center text-xs text-slate-400 italic">
                      Ready for next bundle lot
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Shift Production Logs & Wage Ledgers Summary */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Shift Finishing Production Logs & Wage Disbursements
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time piece-rate earnings ledger calculated as: Verified Passed Pressed Pieces &times; Piece Rate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/iron/wages"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-[#3A3564] text-xs font-bold transition-all shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Full Wage Ledger</span>
            </Link>
          </div>
        </div>

        {/* Production Logs Table */}
        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Table Station</th>
                <th className="p-3">Finishing Operator</th>
                <th className="p-3">Challan & Article</th>
                <th className="p-3">Pieces Pressed</th>
                <th className="p-3">Defects (Shine / Water)</th>
                <th className="p-3">Piece Rate</th>
                <th className="p-3 font-mono font-bold text-slate-900">Earned Wages (₹)</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#3A3564]">
                    {log.tableNumber}
                  </td>
                  <td className="p-3 font-bold text-slate-900">
                    {log.operatorName}
                  </td>
                  <td className="p-3">
                    <div className="font-mono text-slate-700">{log.challanId}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {log.articleName || 'Running Lot'}
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {log.piecesPressed.toLocaleString()} pcs
                  </td>
                  <td className="p-3">
                    {log.defectShineCount > 0 || log.waterStainCount > 0 ? (
                      <span className="text-amber-700 font-mono font-bold text-[11px]">
                        Shine: {log.defectShineCount} • Water: {log.waterStainCount}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Zero Defects</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    ₹{log.pieceRate.toFixed(2)}
                  </td>
                  <td className="p-3 font-mono font-bold text-[#3A3564] text-sm">
                    ₹{log.totalEarnedWages.toLocaleString()}
                  </td>
                  <td className="p-3 text-slate-500 text-xs max-w-[200px] truncate">
                    {log.notes || 'Verified passed by finish QC'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
