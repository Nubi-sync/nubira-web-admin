'use client'

import { useState, useEffect } from 'react'
import { X, Check, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { IronProductionLog, IronTable } from '../../types/iron'
import { getIronTables, saveIronProductionLog } from '../../utils/ironStorage'

interface LogProductionModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTable?: string
}

export function LogProductionModal({ isOpen, onClose, defaultTable }: LogProductionModalProps) {
  const [tables, setTables] = useState<IronTable[]>([])
  const [selectedTableNumber, setSelectedTableNumber] = useState(defaultTable || 'Table 01')
  const [piecesPressed, setPiecesPressed] = useState(120)
  const [defectShineCount, setDefectShineCount] = useState(0)
  const [waterStainCount, setWaterStainCount] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const loaded = getIronTables()
    setTables(loaded)
    if (defaultTable) {
      setSelectedTableNumber(defaultTable)
    }
  }, [isOpen, defaultTable])

  if (!isOpen) return null

  const activeTable = tables.find(t => t.tableNumber === selectedTableNumber) || tables[0]
  const rate = activeTable?.pieceRate || 2.20
  const earnedWages = Math.round(piecesPressed * rate * 100) / 100

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newLog: IronProductionLog = {
      id: `log-${Date.now()}`,
      tableNumber: selectedTableNumber,
      operatorName: activeTable?.operatorName || 'Pressing Operator',
      challanId: activeTable?.challanId || 'CH-2026-901',
      articleName: activeTable?.articleName || 'Garments Lot',
      piecesPressed: Number(piecesPressed),
      defectShineCount: Number(defectShineCount),
      waterStainCount: Number(waterStainCount),
      pieceRate: rate,
      totalEarnedWages: earnedWages,
      shiftDate: new Date().toISOString().slice(0, 10),
      shiftType: 'SHIFT_1',
      notes: notes || 'Verified passed by Finish QC inspection.',
    }

    saveIronProductionLog(newLog)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Form 2 • Operator Shift Pressing & Wage Log Form
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Log completed wrinkle-free pieces and auto-calculate earnings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Table Number */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Vacuum Table Station *
              </label>
              <select
                value={selectedTableNumber}
                onChange={e => setSelectedTableNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.tableNumber}>
                    {t.tableNumber} ({t.operatorName})
                  </option>
                ))}
              </select>
            </div>

            {/* Operator (Read-only bound) */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Assigned Operator
              </label>
              <input
                type="text"
                readOnly
                value={activeTable?.operatorName || 'Unassigned'}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl border border-black/10 bg-slate-100/70 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Lot & Article</span>
              <strong className="text-slate-900 font-mono">{activeTable?.challanId}</strong> • {activeTable?.articleName}
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Piece Rate</span>
              <strong className="text-[#3A3564] font-mono text-sm">₹{rate.toFixed(2)}/pc</strong>
            </div>
          </div>

          {/* Pieces Pressed */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Verified Passed Pressed Pieces *
            </label>
            <input
              type="number"
              min="1"
              max="1500"
              value={piecesPressed}
              onChange={e => setPiecesPressed(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
            <span className="text-[10px] text-slate-400">100% wrinkle-free inspected pieces</span>
          </div>

          {/* Defects Log (Shine & Water Spot) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Fabric Glaze / Shine Defects
              </label>
              <input
                type="number"
                min="0"
                value={defectShineCount}
                onChange={e => setDefectShineCount(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-500">Sent to 10 Alteration</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Water Condensate Spots
              </label>
              <input
                type="number"
                min="0"
                value={waterStainCount}
                onChange={e => setWaterStainCount(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-500">Steam spit spots</span>
            </div>
          </div>

          {/* Auto-Calculated Wages Banner */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                Calculated Shift Earnings
              </span>
              <div className="text-xs text-emerald-900 font-mono">
                {piecesPressed} pcs &times; ₹{rate.toFixed(2)}/pc
              </div>
            </div>
            <div className="text-xl font-black font-mono text-emerald-700">
              ₹{earnedWages.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Remarks & Shift Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Completed lot CH-2026-901 ahead of schedule"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit Production & Wages</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
