'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Waves,
  FlaskConical,
  Cpu,
  Droplets,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  Thermometer,
  Layers,
  ChevronRight,
  Activity,
  AlertTriangle,
  PlayCircle
} from 'lucide-react'
import {
  WashBatch,
  WasherMachine,
  WashRecipe,
  WaterAuditLog,
  ShrinkageQcRecord,
} from '../types/washing'
import {
  getWashBatches,
  getWasherMachines,
  getWashRecipes,
  getWaterAuditLogs,
  getShrinkageQcRecords,
  WASHING_UPDATE_EVENT,
  updateBatchStatus,
} from '../utils/washingStorage'

interface WashingDashboardClientProps {
  initialBatches?: WashBatch[]
  initialRecipes?: WashRecipe[]
  initialShrinkageQc?: ShrinkageQcRecord[]
}

export function WashingDashboardClient({
  initialBatches,
  initialRecipes,
  initialShrinkageQc
}: WashingDashboardClientProps = {}) {
  const [batches, setBatches] = useState<WashBatch[]>(initialBatches && initialBatches.length > 0 ? initialBatches : [])
  const [machines, setMachines] = useState<WasherMachine[]>([])
  const [recipes, setRecipes] = useState<WashRecipe[]>(initialRecipes && initialRecipes.length > 0 ? initialRecipes : [])
  const [waterAudits, setWaterAudits] = useState<WaterAuditLog[]>([])
  const [shrinkageQc, setShrinkageQc] = useState<ShrinkageQcRecord[]>(initialShrinkageQc && initialShrinkageQc.length > 0 ? initialShrinkageQc : [])
  const [isLoading, setIsLoading] = useState(true)

  function loadAllData() {
    const localBatches = getWashBatches()
    setBatches(initialBatches && initialBatches.length > 0 ? initialBatches : localBatches)
    setMachines(getWasherMachines())
    const localRecipes = getWashRecipes()
    setRecipes(initialRecipes && initialRecipes.length > 0 ? initialRecipes : localRecipes)
    setWaterAudits(getWaterAuditLogs())
    const localShrinkage = getShrinkageQcRecords()
    setShrinkageQc(initialShrinkageQc && initialShrinkageQc.length > 0 ? initialShrinkageQc : localShrinkage)
    setIsLoading(false)
  }

  useEffect(() => {
    loadAllData()
    const handleUpdate = () => loadAllData()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [initialBatches, initialRecipes, initialShrinkageQc])

  // KPI Calculations
  const runningWashers = machines.filter(m => m.type === 'WASHER' && m.status === 'RUNNING').length
  const totalWashers = machines.filter(m => m.type === 'WASHER').length
  const totalPiecesToday = batches.reduce((acc, b) => acc + (b.totalPieces || 0), 0)
  const criticalAlerts = shrinkageQc.filter(q => q.qcStatus === 'CRITICAL_FAIL' || (q.avgLengthShrinkPct > 2.5 || q.avgWidthShrinkPct > 2.5))
  const latestAudit = waterAudits[0]
  const avgLiquorRatio = latestAudit ? latestAudit.actualLiquorRatio.toFixed(1) : '5.1'

  const activeBatches = batches.filter(b => b.status === 'WASHING' || b.status === 'HYDRO' || b.status === 'DRYING')

  return (
    <div className="space-y-6">
      {/* High-Shrinkage Auto-Escalation Banner if any failure */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Auto-Escalation Protocol Active
                  </span>
                  <span className="text-xs font-semibold text-rose-700">
                    {criticalAlerts.length} batch exceeded &gt; 2.5% shrinkage threshold
                  </span>
                </div>
                <p className="text-xs font-medium text-rose-900 mt-1">
                  <strong>03 Cutting Floor CAD Station</strong> notified to expand marker length & width to compensate for high fabric relaxation.
                </p>
              </div>
            </div>
            <Link
              href="/washing/shrinkage-qc"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <span>View QC Audits</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 Master KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Wash Tumblers */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Tumblers
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {runningWashers} / {totalWashers || 6}
            </span>
            <span className="text-xs font-bold text-emerald-600">Running</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            600 kg capacity industrial drums
          </p>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#3A3564] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((runningWashers || 3) / (totalWashers || 6)) * 100}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Daily Wash Volume */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Daily Wash Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalPiecesToday.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Pcs</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Today cumulative wet load
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-600">
            <span>Capacity: 6,000 pcs</span>
            <span className="font-bold text-[#3A3564]">{Math.round((totalPiecesToday / 6000) * 100)}%</span>
          </div>
        </div>

        {/* KPI 3: Standard Liquor Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Liquor Ratio (M:L)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              1 : {avgLiquorRatio}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">Target 1:5.0</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Eco water conservation verified
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Effluent pH {latestAudit?.effluentPh || 7.2} (6.5-8.0 OK)</span>
          </div>
        </div>

        {/* KPI 4: Residual Shrinkage Rate */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden group hover:border-[#3A3564]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Residual Shrinkage
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              &lt; 1.15%
            </span>
            <span className="text-xs font-bold text-emerald-600">AATCC 135</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1.5">
            Strict tolerance: &le; 1.5% Length & Width
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Colorfastness: 4.6 / 5.0 Grey Scale</span>
          </div>
        </div>
      </div>

      {/* Live Machine Floor Matrix & Quick Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3A3564]" />
              <h2 className="text-base font-black text-slate-900">
                Live Machine Floor Matrix
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Washers • Hydros • Tumblers
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Commercial wash tumblers (600 kg), centrifugal extractors, and thermal dryers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/washing/machine-runs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Load New Batch</span>
            </Link>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-1">
          {machines.map((machine) => {
            const isRunning = machine.status === 'RUNNING'
            const isMaintenance = machine.status === 'MAINTENANCE'
            return (
              <div
                key={machine.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRunning
                    ? 'bg-white border-[#3A3564]/30 shadow-2xs ring-1 ring-[#3A3564]/10'
                    : isMaintenance
                    ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                    : 'bg-slate-50/70 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isRunning
                          ? 'bg-emerald-500 animate-pulse'
                          : isMaintenance
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-xs font-black tracking-tight text-slate-900">
                      {machine.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      isRunning
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isMaintenance
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {machine.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Capacity:</span>
                    <span className="font-mono font-bold text-slate-700">{machine.capacityKg} kg</span>
                  </div>

                  {machine.currentBatchNumber ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Batch:</span>
                        <span className="font-mono font-bold text-[#3A3564]">
                          {machine.currentBatchNumber}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 truncate">
                        {machine.currentRecipe || 'Processing'}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-500 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#3A3564]" />
                          {machine.timeRemainingMin} min left
                        </span>
                        {machine.tempC && (
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <Thermometer className="w-3 h-3" />
                            {machine.tempC}°C
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-2 text-center text-xs text-slate-400 italic">
                      {isMaintenance ? 'Under preventive maintenance' : 'Ready for next batch loading'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Wash Batches & Pipeline Tracker */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Active Wet Processing Queue ({batches.length} Total Batches)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time progression: Wash Cycle &rarr; Centrifugal Hydro &rarr; Steam Tumbler Drying &rarr; QC Pass
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/washing/handover"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-[#3A3564] text-xs font-bold transition-all shadow-2xs"
            >
              <span>Outward Handover</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Batches Table */}
        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Batch & Challan</th>
                <th className="p-3">Article & Color</th>
                <th className="p-3">Pieces / Dry Weight</th>
                <th className="p-3">Recipe & Water (1:5.0)</th>
                <th className="p-3">Machine & Tech</th>
                <th className="p-3">Shrinkage QC</th>
                <th className="p-3">Stage Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {batches.map((b) => {
                const isFail = b.status === 'FAILED'
                const isPass = b.status === 'PASSED'
                const isWashing = b.status === 'WASHING'
                const isHydro = b.status === 'HYDRO'
                const isDrying = b.status === 'DRYING'

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-bold text-[#3A3564] text-xs">{b.batchNumber}</div>
                      <div className="text-[11px] font-mono text-slate-500">{b.challanId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.articleName}</div>
                      <div className="text-[11px] text-slate-500">{b.color}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">{b.totalPieces.toLocaleString()} pcs</div>
                      <div className="text-[11px] font-mono text-slate-500">{b.dryWeightKg} kg dry</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800 truncate max-w-[180px]">{b.recipeName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {b.waterVolumeLiters.toLocaleString()} L water ({b.tumblerTempC}°C)
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800">{b.washerMachineId}</div>
                      <div className="text-[11px] text-slate-500">{b.operatorName}</div>
                    </td>
                    <td className="p-3">
                      {b.measuredShrinkageLengthPct !== undefined ? (
                        <div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              b.measuredShrinkageLengthPct > 2.5 || (b.measuredShrinkageWidthPct && b.measuredShrinkageWidthPct > 2.5)
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            L: {b.measuredShrinkageLengthPct}% • W: {b.measuredShrinkageWidthPct}%
                          </span>
                          <div className="text-[10px] text-slate-500">Fastness: {b.colorfastnessRating || 4.5}/5</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic font-mono">Pending QC</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isFail
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isWashing
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isHydro
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {isWashing && (
                        <button
                          onClick={() => updateBatchStatus(b.id, 'HYDRO')}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#3A3564] hover:text-white text-[#3A3564] border border-black/10 text-[11px] font-bold transition-all"
                        >
                          To Hydro &rarr;
                        </button>
                      )}
                      {isHydro && (
                        <button
                          onClick={() => updateBatchStatus(b.id, 'DRYING')}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#3A3564] hover:text-white text-[#3A3564] border border-black/10 text-[11px] font-bold transition-all"
                        >
                          To Dryer &rarr;
                        </button>
                      )}
                      {isDrying && (
                        <Link
                          href="/washing/shrinkage-qc"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all"
                        >
                          Audit QC
                        </Link>
                      )}
                      {(isPass || isFail) && (
                        <span className="text-[11px] font-mono text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
