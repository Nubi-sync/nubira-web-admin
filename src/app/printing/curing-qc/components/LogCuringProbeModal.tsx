'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Flame, Thermometer, Sparkles } from 'lucide-react'
import { CuringOvenLog } from '../../types/printing'
import { saveCuringLog } from '../../utils/printingStorage'
import { getOrders } from '@/app/merchandising/utils/merchandisingStorage'

interface LogCuringProbeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LogCuringProbeModal({ isOpen, onClose, onSuccess }: LogCuringProbeModalProps) {
  const [availablePos, setAvailablePos] = useState<any[]>([])
  const [ovenId, setOvenId] = useState('Continuous Tunnel Oven #1 (Gas Infrared)')
  const [targetTemp, setTargetTemp] = useState('160.0')
  const [probeTemp, setProbeTemp] = useState('162.5')
  const [conveyorSpeed, setConveyorSpeed] = useState('2.4')
  const [dwellTime, setDwellTime] = useState('2.0')
  const [poNumber, setPoNumber] = useState('PO-2026-9901')
  const [washCycles, setWashCycles] = useState('50')
  const [fastnessRating, setFastnessRating] = useState('5.0')
  const [auditorName, setAuditorName] = useState('Senior Thermal QC Lead')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orders = getOrders()
      setAvailablePos(orders)
      const activePo = orders.find(p => p.po_number === 'PO-2026-9901') || orders[0]
      if (activePo) {
        setPoNumber(activePo.po_number)
      }
    }
  }, [isOpen])

  const applyPreset54 = () => {
    setOvenId('Continuous Tunnel Oven #1 (Gas Infrared)')
    setTargetTemp('160.0')
    setProbeTemp('162.5')
    setConveyorSpeed('2.4')
    setDwellTime('2.0')
    setPoNumber('PO-2026-9901')
    setWashCycles('50')
    setFastnessRating('5.0')
    setAuditorName('Senior Thermal QC Lead')
  }

  if (!isOpen) return null

  const pTemp = parseFloat(probeTemp) || 160
  const tTemp = parseFloat(targetTemp) || 160
  const tempVariance = Math.abs(pTemp - tTemp)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    let status: 'OPTIMAL' | 'TEMP_WARNING' | 'CRITICAL' = 'OPTIMAL'
    if (tempVariance > 5.0) status = 'CRITICAL'
    else if (tempVariance > 3.0) status = 'TEMP_WARNING'

    const newLog: CuringOvenLog = {
      id: `ovn-${Date.now()}`,
      log_number: `OVN-LOG-${Math.floor(900 + Math.random() * 99)}`,
      oven_id: ovenId,
      target_temp_c: tTemp,
      probe_temp_c: pTemp,
      conveyor_speed_mpm: parseFloat(conveyorSpeed) || 2.4,
      dwell_time_minutes: parseFloat(dwellTime) || 2.0,
      po_number: poNumber.trim(),
      wash_test_cycles: parseInt(washCycles, 10) || 50,
      fastness_rating: parseFloat(fastnessRating) || 5.0,
      auditor_name: auditorName.trim(),
      status: status,
      logged_at: new Date().toISOString()
    }

    saveCuringLog(newLog)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#3A3564]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Log Curing Oven Thermal Probe Audit
              </h2>
              <p className="text-xs text-slate-500">Continuous 160°C temperature & dwell time verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 5.4 Quick Fill Preset */}
        <div className="px-5 pt-4">
          <div className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
              Step 5.4 Oven Preset:
            </span>
            <button
              type="button"
              onClick={applyPreset54}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-white text-[#3A3564] border border-black/10 rounded-lg hover:bg-[#3A3564] hover:text-white transition-all shadow-2xs cursor-pointer"
            >
              Tunnel #01 (160°C / 162.5°C • 2.4 m/min • 5.0 Rating)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Tunnel Oven Equipment
            </label>
            <select
              value={ovenId}
              onChange={e => setOvenId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
            >
              <option value="Continuous Tunnel Oven #1 (Gas Infrared)">Tunnel Dryer Oven #01 (Continuous Gas Infrared)</option>
              <option value="Tunnel Oven #2 (Electric High-Airflow)">Tunnel Dryer Oven #02 (Electric High-Airflow)</option>
              <option value="Batch Curing Chamber #3 (Specialty Foil & Puff)">Batch Curing Chamber #03 (Specialty Foil & Puff)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Oven Temp (°C)
              </label>
              <input
                type="number"
                value={targetTemp}
                onChange={e => setTargetTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Heat Strip Probe Temp (°C) *
              </label>
              <input
                type="number"
                step="0.1"
                value={probeTemp}
                onChange={e => setProbeTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Conveyor Speed (m/min)
              </label>
              <input
                type="number"
                step="0.1"
                value={conveyorSpeed}
                onChange={e => setConveyorSpeed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Dwell Chamber Time (Minutes)
              </label>
              <input
                type="number"
                step="0.1"
                value={dwellTime}
                onChange={e => setDwellTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Linked Buyer PO
              </label>
              <select
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
              >
                {availablePos.map(p => (
                  <option key={p.po_number} value={p.po_number}>
                    {p.po_number} ({p.brand_name || 'Buyer'})
                  </option>
                ))}
                {availablePos.length === 0 && (
                  <option value="PO-2026-9901">PO-2026-9901 (ZARA INTERNATIONAL)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                50-Wash Fastness Rating (1–5)
              </label>
              <input
                type="number"
                step="0.1"
                value={fastnessRating}
                onChange={e => setFastnessRating(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Auditor / Master Technician
            </label>
            <input
              type="text"
              value={auditorName}
              onChange={e => setAuditorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Probe Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
