'use client'

import { useState } from 'react'
import { X, Check, Layers, User, Zap } from 'lucide-react'
import { IronTable } from '../../types/iron'
import { saveIronTable, getIronTables } from '../../utils/ironStorage'

interface AllotTableModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTable?: string
}

const FINISHING_OPERATORS = [
  'Rajesh Halder (Senior Iron Master)',
  'Subhas Mondal (Pressing Tech)',
  'Finishing Presser A',
  'Finishing Presser B',
  'Finish Tech C',
]

export function AllotTableModal({ isOpen, onClose, defaultTable }: AllotTableModalProps) {
  const [tableNumber, setTableNumber] = useState(defaultTable || 'Table 12')
  const [operatorName, setOperatorName] = useState(FINISHING_OPERATORS[0])
  const [selectedChallanId, setSelectedChallanId] = useState('')
  const [articleName, setArticleName] = useState('')
  const [targetHourlyPcs, setTargetHourlyPcs] = useState(60)
  const [pieceRate, setPieceRate] = useState(2.50)
  const [ironTempC, setIronTempC] = useState(150)
  const [vacuumActive, setVacuumActive] = useState(true)

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tables = getIronTables()
    const existing = tables.find(t => t.tableNumber === tableNumber)

    const updatedTable: IronTable = {
      id: existing ? existing.id : `tbl-${Date.now()}`,
      tableNumber,
      operatorName: operatorName.split(' (')[0],
      challanId: selectedChallanId || 'CH-001',
      articleName: articleName || 'Garment Lot',
      targetHourlyPcs: Number(targetHourlyPcs),
      pieceRate: Number(pieceRate),
      currentPiecesPressed: existing ? existing.currentPiecesPressed : 0,
      status: 'ACTIVE',
      ironTempC: Number(ironTempC),
      vacuumActive,
      teflonShoeVerified: true,
      shiftStartTime: new Date().toTimeString().slice(0, 5),
    }

    saveIronTable(updatedTable)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Form 1 • Ironing Table Allotment Form
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Assign operator and inward challan to vacuum buck table
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
                Vacuum Table *
              </label>
              <select
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const num = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`
                  return (
                    <option key={num} value={`Table ${num}`}>
                      Table {num} (Suction Buck)
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Finishing Operator *
              </label>
              <select
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                {FINISHING_OPERATORS.map(op => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Inward Lot Challan *
              </label>
              <input
                type="text"
                placeholder="e.g. CH-2001"
                value={selectedChallanId}
                onChange={e => setSelectedChallanId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Assigned Article *
              </label>
              <input
                type="text"
                placeholder="e.g. Garment Style"
                value={articleName}
                onChange={e => setArticleName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Hourly Target
              </label>
              <input
                type="number"
                min="30"
                max="100"
                value={targetHourlyPcs}
                onChange={e => setTargetHourlyPcs(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">Default: 60 pcs/hr</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Piece Rate (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={pieceRate}
                onChange={e => setPieceRate(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">Rate per piece</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Iron Temp (°C)
              </label>
              <input
                type="number"
                min="120"
                max="180"
                value={ironTempC}
                onChange={e => setIronTempC(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">140°C - 160°C Safe</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-xs text-slate-600 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={vacuumActive}
                onChange={e => setVacuumActive(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Foot-Pedal Vacuum Extraction Active</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-black/10">
              Teflon Shoe Verified
            </span>
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
              <span>Confirm Table Allotment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
