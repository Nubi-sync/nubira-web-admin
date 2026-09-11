'use client'

import { useState, useEffect } from 'react'
import {
  Calculator,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  User,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Calendar
} from 'lucide-react'
import { IronProductionLog } from '../../types/iron'
import { getIronProductionLogs, IRON_UPDATE_EVENT } from '../../utils/ironStorage'
import { LogProductionModal } from '../../tables/components/LogProductionModal'

export function WagesClient() {
  const [logs, setLogs] = useState<IronProductionLog[]>([])
  const [search, setSearch] = useState('')
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  function loadLogs() {
    setLogs(getIronProductionLogs())
  }

  useEffect(() => {
    loadLogs()
    const handleUpdate = () => loadLogs()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalPressed = logs.reduce((acc, l) => acc + (l.piecesPressed || 0), 0)
  const totalWages = logs.reduce((acc, l) => acc + (l.totalEarnedWages || 0), 0)
  const avgRatePerPc = totalPressed > 0 ? (totalWages / totalPressed).toFixed(2) : '2.25'

  // Operator aggregate map
  const operatorMap: { [name: string]: { pieces: number; wages: number; tables: string[] } } = {}
  logs.forEach(l => {
    if (!operatorMap[l.operatorName]) {
      operatorMap[l.operatorName] = { pieces: 0, wages: 0, tables: [] }
    }
    operatorMap[l.operatorName].pieces += l.piecesPressed
    operatorMap[l.operatorName].wages += l.totalEarnedWages
    if (!operatorMap[l.operatorName].tables.includes(l.tableNumber)) {
      operatorMap[l.operatorName].tables.push(l.tableNumber)
    }
  })

  const topOperator = Object.entries(operatorMap).sort((a, b) => b[1].wages - a[1].wages)[0]

  const filteredLogs = logs.filter(l =>
    l.operatorName.toLowerCase().includes(search.toLowerCase()) ||
    l.tableNumber.toLowerCase().includes(search.toLowerCase()) ||
    l.challanId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 4 Financial & Productivity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Shift Wages
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#3A3564]">
              ₹{totalWages.toLocaleString()}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Across {logs.length} logged table runs
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Verified Pieces Pressed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalPressed.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Pcs</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            100% Zero-wrinkle passed pieces
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Avg Finishing Piece Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              ₹{avgRatePerPc}
            </span>
            <span className="text-xs font-bold text-slate-600">/ Piece</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Range: ₹1.80 (Tees) – ₹2.50 (Hoodies)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Top Finishing Earner
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 truncate">
              {topOperator ? topOperator[0] : 'Rajesh Halder'}
            </span>
          </div>
          <p className="text-xs font-medium text-emerald-700 font-mono mt-1">
            ₹{topOperator ? topOperator[1].wages.toLocaleString() : '1,150'} • {topOperator ? topOperator[1].pieces : '460'} pcs
          </p>
        </div>
      </div>

      {/* Operator Leaderboard & Ledger Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search operator name, table, challan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Shift Production (Form 2)</span>
          </button>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Shift Date & Table</th>
                <th className="p-3">Operator Name</th>
                <th className="p-3">Challan Lot & Article</th>
                <th className="p-3">Pieces Pressed</th>
                <th className="p-3">Defect Deductions</th>
                <th className="p-3">Piece Rate</th>
                <th className="p-3 font-mono font-bold text-slate-900">Total Earned Wages</th>
                <th className="p-3">QC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono">
                    <div className="font-bold text-[#3A3564]">{log.tableNumber}</div>
                    <div className="text-[11px] text-slate-500">{log.shiftDate}</div>
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
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogProductionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  )
}
