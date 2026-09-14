'use client'

import { useState, useEffect } from 'react'
import {
  Cpu,
  Plus,
  Search,
  Clock,
  Thermometer,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Waves
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
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
    <div className="space-y-6 select-none">
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
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
            {['ALL', 'WASHING', 'HYDRO', 'DRYING', 'PASSED', 'FAILED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Load New Batch</span>
          </button>
        </div>
      </div>

      {/* 3 Machine Fleet Summary Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Washers Column */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Waves className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-900">Belly Washers ({washers.length})</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">600 kg</span>
          </div>

          <div className="space-y-2">
            {washers.map(m => (
              <div key={m.id} className="p-3 bg-[#FAF7F0]/60 rounded-xl border border-black/5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                    {m.status}
                  </span>
                </div>
                {m.currentBatchNumber && (
                  <div className="mt-1 pt-1 border-t border-black/5 flex justify-between text-[11px] text-slate-600">
                    <span className="text-[#3A3564] font-bold">{m.currentBatchNumber}</span>
                    <span>{m.timeRemainingMin} min</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hydro Extractors Column */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <RotateCw className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-900">Hydro Spin ({hydros.length})</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">1200 RPM</span>
          </div>

          <div className="space-y-2">
            {hydros.map(m => (
              <div key={m.id} className="p-3 bg-[#FAF7F0]/60 rounded-xl border border-black/5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                    {m.status}
                  </span>
                </div>
                {m.currentBatchNumber && (
                  <div className="mt-1 pt-1 border-t border-black/5 flex justify-between text-[11px] text-slate-600">
                    <span className="text-[#3A3564] font-bold">{m.currentBatchNumber}</span>
                    <span>{m.timeRemainingMin} min</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tumbler Dryers Column */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                <Thermometer className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-slate-900">Tumbler Dryers ({dryers.length})</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">80°C</span>
          </div>

          <div className="space-y-2">
            {dryers.map(m => (
              <div key={m.id} className="p-3 bg-[#FAF7F0]/60 rounded-xl border border-black/5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{m.name}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                    {m.status}
                  </span>
                </div>
                {m.currentBatchNumber && (
                  <div className="mt-1 pt-1 border-t border-black/5 flex justify-between text-[11px] text-slate-600">
                    <span className="text-[#3A3564] font-bold">{m.currentBatchNumber}</span>
                    <span>{m.timeRemainingMin} min</span>
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
            <h2 className="text-base font-black text-slate-900 font-[family-name:var(--font-heading)]">
              Active Batch Runs & Timeline ({filteredBatches.length} Batches)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click stage progression buttons to advance garments through Centrifugal Hydro and Tumbler Drying.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredBatches.length > 0 ? (
            filteredBatches.map(b => {
              const isWashing = b.status === 'WASHING'
              const isHydro = b.status === 'HYDRO'
              const isDrying = b.status === 'DRYING'
              const isPass = b.status === 'PASSED'
              const isFail = b.status === 'FAILED'

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-black/10 bg-white hover:border-black/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                        {b.batchNumber}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{b.challanId}</span>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 font-[family-name:var(--font-heading)]">{b.articleName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {b.color} • <strong className="text-slate-900">{b.totalPieces.toLocaleString()} pcs</strong> ({b.dryWeightKg} kg)
                    </div>
                  </div>

                  {/* Recipe & Parameters */}
                  <div className="text-xs space-y-1 min-w-[200px] font-mono">
                    <div className="font-semibold text-slate-800">{b.recipeName}</div>
                    <div className="text-slate-500 text-[11px]">
                      Water: {b.waterVolumeLiters.toLocaleString()} L (1:5.0) • Temp: {b.tumblerTempC}°C
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Assigned: {b.washerMachineId} • Op: {b.operatorName}
                    </div>
                  </div>

                  {/* Shrinkage Measurement */}
                  <div className="text-xs min-w-[140px] font-mono">
                    {b.measuredShrinkageLengthPct !== undefined ? (
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Measured Shrinkage:</div>
                        <div className="font-bold text-xs text-slate-900">
                          L: {b.measuredShrinkageLengthPct}% | W: {b.measuredShrinkageWidthPct}%
                        </div>
                        <div className="text-[10px] text-slate-400">Fastness: {b.colorfastnessRating}/5</div>
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        Cycle in progress...
                      </div>
                    )}
                  </div>

                  {/* Action Transition Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isWashing && (
                      <button
                        onClick={() => advanceBatch(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Start Hydro Spin</span>
                      </button>
                    )}

                    {isHydro && (
                      <button
                        onClick={() => advanceBatch(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>Transfer to Dryer</span>
                      </button>
                    )}

                    {isDrying && (
                      <button
                        onClick={() => advanceBatch(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unload & Finish</span>
                      </button>
                    )}

                    {isPass && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-[#FAF7F0] px-3 py-1.5 rounded-xl border border-black/10 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>QC Certified</span>
                      </span>
                    )}

                    {isFail && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-[#FAF7F0] px-3 py-1.5 rounded-xl border border-black/10 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>Cutting Alerted</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <EmptyState
              variant="seamless"
              icon={Cpu}
              title="No washing machine runs scheduled"
              description="Washer-extractor drums, centrifugal hydro-spin runs, and tumble drying cycles will display once loaded."
              actionLabel="Load Washer Batch"
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </div>
      </div>

      <LoadBatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
