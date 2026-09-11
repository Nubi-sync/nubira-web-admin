'use client'

import { useState, useEffect } from 'react'
import { X, Check, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { FinishQcAudit, IronTable, FinishQcStatus } from '../../types/iron'
import { getIronTables, saveFinishQcAudit } from '../../utils/ironStorage'

interface RecordQcModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RecordQcModal({ isOpen, onClose }: RecordQcModalProps) {
  const [tables, setTables] = useState<IronTable[]>([])
  const [selectedTableNumber, setSelectedTableNumber] = useState('Table 01')
  const [samplePcs, setSamplePcs] = useState(20)
  const [glazeDefects, setGlazeDefects] = useState(0)
  const [waterSpots, setWaterSpots] = useState(0)
  const [unalignedSeams, setUnalignedSeams] = useState(0)
  const [auditorName, setAuditorName] = useState('S. Bhattacharya (Finish QC Master)')
  const [actionTaken, setActionTaken] = useState('')

  useEffect(() => {
    const loaded = getIronTables()
    setTables(loaded)
  }, [isOpen])

  if (!isOpen) return null

  const activeTable = tables.find(t => t.tableNumber === selectedTableNumber) || tables[0]
  const totalDefects = glazeDefects + waterSpots + unalignedSeams
  const autoStatus: FinishQcStatus = totalDefects === 0 ? 'PASS' : 'REWORK_ALTERATION'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newAudit: FinishQcAudit = {
      id: `fqc-${Date.now()}`,
      auditCode: `FQC-${Math.floor(7710 + Math.random() * 80)}`,
      tableNumber: selectedTableNumber,
      operatorName: activeTable?.operatorName || 'Pressing Operator',
      challanId: activeTable?.challanId || 'CH-2026-901',
      articleName: activeTable?.articleName || 'Garments Lot',
      samplePcs: Number(samplePcs),
      glazeDefects: Number(glazeDefects),
      waterSpots: Number(waterSpots),
      unalignedSeams: Number(unalignedSeams),
      qcStatus: autoStatus,
      auditorName,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actionTaken:
        actionTaken ||
        (autoStatus === 'PASS'
          ? '100% Passed under 1000-lux lamp. Cleared for trolley packing.'
          : `Quarantined ${totalDefects} piece(s) to 10 Alteration for steam brushing / re-pressing.`),
    }

    saveFinishQcAudit(newAudit)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Record Inline Finishing & Shine QC Audit
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                1000-Lux Inspection Lamp Audit (ISO 105-X11 Standard)
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
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Pressing Table *
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

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Sample Pieces Audited *
              </label>
              <input
                type="number"
                min="10"
                max="50"
                value={samplePcs}
                onChange={e => setSamplePcs(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Standard: 20 pcs per trolley</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-xs text-slate-600">
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Lot & Operator</span>
            <strong className="text-slate-900 font-mono">{activeTable?.challanId}</strong> • {activeTable?.operatorName} ({activeTable?.articleName})
          </div>

          {/* 3 Inspection Criteria */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Fabric Glaze / Shine
              </label>
              <input
                type="number"
                min="0"
                value={glazeDefects}
                onChange={e => setGlazeDefects(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">Teflon shoe check</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Water Condensate
              </label>
              <input
                type="number"
                min="0"
                value={waterSpots}
                onChange={e => setWaterSpots(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">Steam spit check</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Unaligned Seams
              </label>
              <input
                type="number"
                min="0"
                value={unalignedSeams}
                onChange={e => setUnalignedSeams(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
              <span className="text-[10px] text-slate-400">Placket symmetry</span>
            </div>
          </div>

          {/* Auto-Verdict Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              autoStatus === 'PASS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              {autoStatus === 'PASS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span className="text-xs font-bold font-mono uppercase">
                Audit Verdict: {autoStatus === 'PASS' ? 'CLEAN PASS' : 'REWORK QUARANTINE'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold">
              {totalDefects} Defects Found
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              QC Auditor / Inspector *
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Corrective Action Taken
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared for packing OR Rework routed to 10 Alteration"
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
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
              <span>Submit Finish QC Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
