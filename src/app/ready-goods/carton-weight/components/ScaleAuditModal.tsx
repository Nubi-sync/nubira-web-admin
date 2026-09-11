'use client'

import { useState } from 'react'
import {
  Scale,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { saveScaleLog, getReadyGoodsCartons } from '../../utils/readyGoodsStorage'
import { ScaleWeightLog } from '../../types/readyGoods'

interface ScaleAuditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ScaleAuditModal({
  isOpen,
  onClose,
  onSuccess
}: ScaleAuditModalProps) {
  const cartons = getReadyGoodsCartons()
  const [scaleId, setScaleId] = useState<'SCALE-BAY-03' | 'SCALE-BAY-04' | 'SCALE-BAY-05'>('SCALE-BAY-03')
  const [selectedCartonNumber, setSelectedCartonNumber] = useState(cartons[0]?.cartonNumber || 'CTN-001')
  const [measuredWeightKg, setMeasuredWeightKg] = useState(18.20)
  const [expectedWeightKg, setExpectedWeightKg] = useState(18.15)
  const [auditorName, setAuditorName] = useState('Mahesh Thapa (Metrology Tech)')
  const [error, setError] = useState<string | null>(null)

  const varianceKg = measuredWeightKg - expectedWeightKg
  const isTolerancePassed = Math.abs(varianceKg) <= 0.15

  const handleCartonChange = (cNum: string) => {
    setSelectedCartonNumber(cNum)
    const c = cartons.find(item => item.cartonNumber === cNum)
    if (c) {
      setMeasuredWeightKg(c.measuredGrossWeightKg)
      setExpectedWeightKg(c.expectedGrossWeightKg)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const c = cartons.find(item => item.cartonNumber === selectedCartonNumber)

    const newLog: ScaleWeightLog = {
      id: `scl-${Date.now()}`,
      scaleId,
      cartonNumber: selectedCartonNumber,
      orderNumber: c?.orderNumber || 'PO-7714',
      styleName: c?.styleName || 'French Terry Relaxed Hoodie',
      measuredWeightKg: Number(measuredWeightKg),
      expectedWeightKg: Number(expectedWeightKg),
      varianceKg: Number(varianceKg.toFixed(2)),
      tolerancePassed: isTolerancePassed,
      scaleCalibrationStatus: 'CALIBRATED',
      auditorName: auditorName.trim(),
      loggedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveScaleLog(newLog)
    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-5 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Digital Weighbridge Audit & Verification
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Load Cell Calibration & ±0.15 kg BOM Tolerance Check
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Weighbridge Station *
              </label>
              <select
                value={scaleId}
                onChange={e => setScaleId(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="SCALE-BAY-03">SCALE-BAY-03 (Bay 3 Floor Scale)</option>
                <option value="SCALE-BAY-04">SCALE-BAY-04 (Bay 4 Conveyor Scale)</option>
                <option value="SCALE-BAY-05">SCALE-BAY-05 (Bay 5 High-Capacity)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Carton Barcode *
              </label>
              <select
                value={selectedCartonNumber}
                onChange={e => handleCartonChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
              >
                {cartons.map(c => (
                  <option key={c.id} value={c.cartonNumber}>
                    {c.cartonNumber} • {c.orderNumber} ({c.measuredGrossWeightKg} kg)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scale Reading vs BOM Expected */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2.5">
            <span className="text-xs font-mono font-bold text-[#3A3564] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Weight Discrepancy Telemetry
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Theoretical BOM</span>
                <input
                  type="number"
                  step="0.01"
                  value={expectedWeightKg}
                  onChange={e => setExpectedWeightKg(Number(e.target.value))}
                  className="w-full text-center font-mono font-black text-slate-900 text-sm mt-0.5 border-b border-black/10 focus:outline-none"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Scale Reading</span>
                <input
                  type="number"
                  step="0.01"
                  value={measuredWeightKg}
                  onChange={e => setMeasuredWeightKg(Number(e.target.value))}
                  className="w-full text-center font-mono font-black text-[#3A3564] text-sm mt-0.5 border-b border-black/10 focus:outline-none"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Weight Delta</span>
                <div
                  className={`font-mono font-black text-sm mt-0.5 ${
                    isTolerancePassed ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {varianceKg >= 0 ? '+' : ''}
                  {varianceKg.toFixed(2)} kg
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-600 flex items-center justify-between pt-1">
              <span>Standard Tolerance: ±0.15 kg</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isTolerancePassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isTolerancePassed ? 'COMPLIANT (ZERO GHOST PASS)' : 'VARIANCE ALERT (QUARANTINE)'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Metrology Tech / Auditor Signoff *
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-amber-300" />
              <span>Log Scale Weight Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
