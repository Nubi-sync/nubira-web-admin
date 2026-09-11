'use client'

import { useState } from 'react'
import { X, Check, Droplets } from 'lucide-react'
import { WaterAuditLog } from '../../types/washing'
import { saveWaterAuditLog } from '../../utils/washingStorage'

interface LogWaterAuditModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogWaterAuditModal({ isOpen, onClose }: LogWaterAuditModalProps) {
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10))
  const [meterInitial, setMeterInitial] = useState(55600)
  const [meterFinal, setMeterFinal] = useState(62800)
  const [dryWeightKg, setDryWeightKg] = useState(1400)
  const [effluentPh, setEffluentPh] = useState(7.3)
  const [effluentTdsPpm, setEffluentTdsPpm] = useState(440)
  const [auditorName, setAuditorName] = useState('P. Sengupta (Environmental Auditor)')
  const [notes, setNotes] = useState('Water consumption logged from main industrial supply meter.')

  if (!isOpen) return null

  const litersConsumed = Math.max(0, meterFinal - meterInitial)
  const calculatedRatio = dryWeightKg > 0 ? (litersConsumed / dryWeightKg).toFixed(2) : '0'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const complianceStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT' =
      effluentPh >= 6.5 && effluentPh <= 8.0 && Number(calculatedRatio) <= 5.5
        ? 'COMPLIANT'
        : effluentPh < 6.0 || effluentPh > 8.5
        ? 'NON_COMPLIANT'
        : 'WARNING'

    const newAudit: WaterAuditLog = {
      id: `wa-${Date.now()}`,
      auditDate,
      meterReadingInitial: Number(meterInitial),
      meterReadingFinal: Number(meterFinal),
      litersConsumed,
      dryWeightProcessedKg: Number(dryWeightKg),
      actualLiquorRatio: Number(calculatedRatio),
      effluentPh: Number(effluentPh),
      effluentTdsPpm: Number(effluentTdsPpm),
      complianceStatus,
      auditorName,
      notes,
    }

    saveWaterAuditLog(newAudit)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Log Daily Water & Effluent Audit</h3>
              <p className="text-xs text-slate-500 font-medium">1:5.0 Liquor Ratio & Environmental pH Compliance</p>
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
                Audit Date *
              </label>
              <input
                type="date"
                value={auditDate}
                onChange={e => setAuditDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Dry Garments (kg) *
              </label>
              <input
                type="number"
                value={dryWeightKg}
                onChange={e => setDryWeightKg(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Initial Meter (L)
              </label>
              <input
                type="number"
                value={meterInitial}
                onChange={e => setMeterInitial(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Final Meter (L)
              </label>
              <input
                type="number"
                value={meterFinal}
                onChange={e => setMeterFinal(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Calculated Consumption Callout */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Total Consumed:</span>
              <strong className="text-slate-900 text-sm">{litersConsumed.toLocaleString()} Liters</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Actual Liquor Ratio:</span>
              <strong className="text-[#3A3564] text-sm">1 : {calculatedRatio}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Effluent pH (6.5 - 8.0) *
              </label>
              <input
                type="number"
                step="0.1"
                value={effluentPh}
                onChange={e => setEffluentPh(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                TDS (ppm)
              </label>
              <input
                type="number"
                value={effluentTdsPpm}
                onChange={e => setEffluentTdsPpm(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Environmental Inspector *
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              required
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
              <span>Record Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
