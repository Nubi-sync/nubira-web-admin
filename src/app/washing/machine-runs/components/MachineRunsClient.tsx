'use client'

import { useState, useEffect } from 'react'
import {
  Cpu,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Thermometer,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Layers,
  Waves
} from 'lucide-react'
import { WashBatch, WasherMachine } from '../../types/washing'
import {
  getWashBatches,
  getWasherMachines,
  updateBatchStatus,
  saveWasherMachine,
  WASHING_UPDATE_EVENT,
} from '../../utils/washingStorage'
import { LoadBatchModal } from './LoadBatchModal'

export function MachineRunsClient() {
  const [batches, setBatches] = useState<WashBatch[]>([])
  const [machines, setMachines] = useState<WasherMachine[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadData() {
    setBatches(getWashBatches())
    setMachines(getWasherMachines())
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [])

  function advanceBatch(batch: WashBatch) {
    if (batch.status === 'WASHING') {
      updateBatchStatus(batch.id, 'HYDRO', { stageTimeRemainingMin: 8 })
      // free washer
      const mach = machines.find(m => m.name === batch.washerMachineId)
      if (mach) {
        saveWasherMachine({ ...mach, status: 'IDLE', currentBatchNumber: undefined, currentRecipe: undefined })
      }
    } else if (batch.status === 'HYDRO') {
      updateBatchStatus(batch.id, 'DRYING', { stageTimeRemainingMin: 25 })
    } else if (batch.status === 'DRYING') {
      updateBatchStatus(batch.id, 'PASSED', {
        completedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        measuredShrinkageLengthPct: 1.10,
        measuredShrinkageWidthPct: 0.90,
        colorfastnessRating: 4.8,
      })
    }
  }

  const filteredBatches = batches.filter(b => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.articleName.toLowerCase().includes(search.toLowerCase()) ||
      b.challanId.toLowerCase().includes(search.toLowerCase()) ||
      b.washerMachineId.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Machine breakdown
  const washers = machines.filter(m => m.type === 'WASHER')
  const hydros = machines.filter(m => m.type === 'HYDRO')
  const dryers = machines.filter(m => m.type === 'TUMBLER_DRYER')

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batch number, challan, machine..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
            {['ALL', 'WASHING', 'HYDRO', 'DRYING', 'PASSED', 'FAILED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Load New Batch (Form 1)</span>
          </button>
        </div>
      </div>

      {/* 3-Stage Equipment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stage 1: Wash Tumblers */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#3A3564]" />
              <h3 className="text-sm font-black text-slate-900">Stage 1 • Wash Tumblers</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              600 kg Tumblers
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {washers.map(m => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border ${
                  m.status === 'RUNNING'
                    ? 'bg-blue-50/50 border-blue-200'
                    : m.status === 'MAINTENANCE'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{m.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  {m.currentBatchNumber || 'Idle'}
                </div>
                {m.timeRemainingMin && (
                  <div className="text-[10px] font-mono text-[#3A3564] font-bold mt-0.5">
                    {m.timeRemainingMin} min left
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stage 2: Hydro Extractors */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-[#3A3564]" />
              <h3 className="text-sm font-black text-slate-900">Stage 2 • Hydro Extractors</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              900 RPM Centrifuge
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {hydros.map(m => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border ${
                  m.status === 'RUNNING'
                    ? 'bg-purple-50/50 border-purple-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{m.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === 'RUNNING' ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  {m.currentBatchNumber || 'Idle'}
                </div>
                {m.status === 'RUNNING' && (
                  <div className="text-[10px] font-mono text-purple-700 font-bold mt-0.5">
                    {m.rpm || 920} RPM • 45% Moisture
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stage 3: Tumbler Dryers */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#3A3564]" />
              <h3 className="text-sm font-black text-slate-900">Stage 3 • Steam Tumbler Dryers</h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              65°C Heat Curve
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {dryers.map(m => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border ${
                  m.status === 'RUNNING'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{m.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                  {m.currentBatchNumber || 'Idle'}
                </div>
                {m.status === 'RUNNING' && (
                  <div className="text-[10px] font-mono text-amber-800 font-bold mt-0.5">
                    {m.tempC || 65}°C • {m.timeRemainingMin} min left
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Batches Live Floor Schedule */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Active Batch Runs & Timeline ({filteredBatches.length} Batches)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click stage progression buttons to advance garments through Centrifugal Hydro and Tumbler Drying
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredBatches.map(b => {
            const isWashing = b.status === 'WASHING'
            const isHydro = b.status === 'HYDRO'
            const isDrying = b.status === 'DRYING'
            const isPass = b.status === 'PASSED'
            const isFail = b.status === 'FAILED'

            return (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-black/10 bg-white hover:border-[#3A3564]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                      {b.batchNumber}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{b.challanId}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
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
                  </div>
                  <div className="text-sm font-black text-slate-900">{b.articleName}</div>
                  <div className="text-xs text-slate-500">
                    {b.color} • <strong className="text-slate-700">{b.totalPieces.toLocaleString()} pcs</strong> ({b.dryWeightKg} kg)
                  </div>
                </div>

                {/* Recipe & Parameters */}
                <div className="text-xs space-y-1 min-w-[200px]">
                  <div className="font-semibold text-slate-800">{b.recipeName}</div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Water: {b.waterVolumeLiters.toLocaleString()} L (1:5.0) • Temp: {b.tumblerTempC}°C
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Assigned: {b.washerMachineId} • Op: {b.operatorName}
                  </div>
                </div>

                {/* Shrinkage Measurement */}
                <div className="text-xs min-w-[140px]">
                  {b.measuredShrinkageLengthPct !== undefined ? (
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">Measured Shrinkage:</div>
                      <div
                        className={`font-mono font-bold text-xs ${
                          b.measuredShrinkageLengthPct > 2.5
                            ? 'text-rose-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        L: {b.measuredShrinkageLengthPct}% | W: {b.measuredShrinkageWidthPct}%
                      </div>
                      <div className="text-[10px] text-slate-400">Fastness: {b.colorfastnessRating}/5</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic text-[11px] font-mono">
                      Cycle in progress...
                    </div>
                  )}
                </div>

                {/* Action Transition Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isWashing && (
                    <button
                      onClick={() => advanceBatch(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Start Hydro Spin</span>
                    </button>
                  )}

                  {isHydro && (
                    <button
                      onClick={() => advanceBatch(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>Transfer to Dryer</span>
                    </button>
                  )}

                  {isDrying && (
                    <button
                      onClick={() => advanceBatch(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unload & Finish</span>
                    </button>
                  )}

                  {isPass && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>QC Certified</span>
                    </span>
                  )}

                  {isFail && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Cutting Alerted</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <LoadBatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
