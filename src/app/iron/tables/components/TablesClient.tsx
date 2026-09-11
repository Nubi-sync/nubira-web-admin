'use client'

import { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Search,
  Filter,
  User,
  Calculator,
  Thermometer,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck
} from 'lucide-react'
import { IronTable } from '../../types/iron'
import { getIronTables, IRON_UPDATE_EVENT } from '../../utils/ironStorage'
import { AllotTableModal } from './AllotTableModal'
import { LogProductionModal } from './LogProductionModal'

export function TablesClient() {
  const [tables, setTables] = useState<IronTable[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isAllotOpen, setIsAllotOpen] = useState(false)
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [selectedTableForAction, setSelectedTableForAction] = useState<string>('Table 01')

  function loadTables() {
    setTables(getIronTables())
  }

  useEffect(() => {
    loadTables()
    const handleUpdate = () => loadTables()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  function handleOpenAllot(tableNumber?: string) {
    if (tableNumber) setSelectedTableForAction(tableNumber)
    setIsAllotOpen(true)
  }

  function handleOpenLog(tableNumber?: string) {
    if (tableNumber) setSelectedTableForAction(tableNumber)
    setIsLogOpen(true)
  }

  const filtered = tables.filter(t => {
    const matchesSearch =
      t.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.operatorName.toLowerCase().includes(search.toLowerCase()) ||
      t.challanId.toLowerCase().includes(search.toLowerCase()) ||
      t.articleName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = tables.filter(t => t.status === 'ACTIVE').length
  const idleCount = tables.filter(t => t.status === 'IDLE').length

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table, operator, challan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
            {['ALL', 'ACTIVE', 'IDLE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st} {st === 'ACTIVE' ? `(${activeCount})` : st === 'IDLE' ? `(${idleCount})` : `(12)`}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenAllot()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF7F0] hover:bg-white text-[#3A3564] border border-black/10 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Allot Table (Form 1)</span>
          </button>

          <button
            onClick={() => handleOpenLog()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Calculator className="w-4 h-4" />
            <span>Log Production (Form 2)</span>
          </button>
        </div>
      </div>

      {/* 12-Station Vacuum Buck Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(t => {
          const isActive = t.status === 'ACTIVE'
          return (
            <div
              key={t.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-[#3A3564]/20 shadow-2xs ring-1 ring-[#3A3564]/10'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-black text-slate-900 font-mono">
                      {t.tableNumber}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Operator:</span>
                    </span>
                    <strong className="text-slate-900 font-semibold truncate max-w-[140px]">
                      {t.operatorName}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500">Inward Challan:</span>
                    <span className="font-mono font-bold text-[#3A3564]">
                      {t.challanId}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#FAF7F0] rounded-xl border border-black/5 space-y-1">
                    <div className="font-bold text-slate-900 truncate">{t.articleName}</div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <span>Rate: <strong>₹{t.pieceRate.toFixed(2)}/pc</strong></span>
                      <span>Target: <strong>{t.targetHourlyPcs} pcs/hr</strong></span>
                    </div>
                  </div>

                  {isActive ? (
                    <div className="pt-2 border-t border-black/5 space-y-1.5">
                      <div className="flex justify-between items-baseline font-mono text-xs">
                        <span className="text-slate-500">Pressed Today:</span>
                        <strong className="text-slate-900 text-sm">
                          {t.currentPiecesPressed.toLocaleString()} pcs
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span className="flex items-center gap-1 text-amber-700 font-bold">
                          <Thermometer className="w-3 h-3" />
                          {t.ironTempC}°C
                        </span>
                        <span className="text-emerald-700 font-bold">Vacuum Suction OK</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      Table ready for allocation
                    </div>
                  )}
                </div>
              </div>

              {/* Station Action Buttons */}
              <div className="pt-4 mt-3 border-t border-black/5 flex items-center gap-2">
                <button
                  onClick={() => handleOpenAllot(t.tableNumber)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all text-center"
                >
                  Re-Allot
                </button>
                <button
                  onClick={() => handleOpenLog(t.tableNumber)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs text-center"
                >
                  Log Output
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AllotTableModal
        isOpen={isAllotOpen}
        onClose={() => setIsAllotOpen(false)}
        defaultTable={selectedTableForAction}
      />

      <LogProductionModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        defaultTable={selectedTableForAction}
      />
    </div>
  )
}
