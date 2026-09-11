'use client'

import { useState } from 'react'
import { X, Check, Gauge, Thermometer, Droplets } from 'lucide-react'
import { BoilerTelemetryLog, CondensateStatus } from '../../types/iron'
import { saveBoilerLog } from '../../utils/ironStorage'

interface LogBoilerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogBoilerModal({ isOpen, onClose }: LogBoilerModalProps) {
  const [steamPressureBar, setSteamPressureBar] = useState(4.5)
  const [boilerTempC, setBoilerTempC] = useState(154)
  const [condensateTrapStatus, setCondensateTrapStatus] = useState<CondensateStatus>('NORMAL')
  const [blowdownDone, setBlowdownDone] = useState(true)
  const [feedWaterLevelPct, setFeedWaterLevelPct] = useState(88)
  const [operatorName, setOperatorName] = useState('G. Karmakar (Boiler In-Charge)')
  const [remarks, setRemarks] = useState('Steam pressure stable at 4.5 Bar. All station vacuum lines pressurized.')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newLog: BoilerTelemetryLog = {
      id: `bl-${Date.now()}`,
      logTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      steamPressureBar: Number(steamPressureBar),
      boilerTempC: Number(boilerTempC),
      condensateTrapStatus,
      blowdownDone,
      feedWaterLevelPct: Number(feedWaterLevelPct),
      operatorName,
      remarks,
    }

    saveBoilerLog(newLog)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Log Central Boiler Steam Telemetry
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record steam pressure, condensate traps, and blowdown cycles
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
            {/* Steam Pressure */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Steam Pressure (Bar) *
              </label>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="8.0"
                value={steamPressureBar}
                onChange={e => setSteamPressureBar(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold text-[#3A3564] rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
              <span className="text-[10px] text-slate-400">Target: 4.2 Bar – 4.8 Bar</span>
            </div>

            {/* Boiler Temperature */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Boiler Steam Temp (°C) *
              </label>
              <input
                type="number"
                min="100"
                max="200"
                value={boilerTempC}
                onChange={e => setBoilerTempC(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Nominal: ~150°C - 160°C</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Condensate Trap Status */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Condensate Trap Status *
              </label>
              <select
                value={condensateTrapStatus}
                onChange={e => setCondensateTrapStatus(e.target.value as CondensateStatus)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              >
                <option value="NORMAL">NORMAL (Free Flow)</option>
                <option value="DRAINING">DRAINING (Active Blow)</option>
                <option value="CLOGGED">CLOGGED (Needs Flushed)</option>
              </select>
            </div>

            {/* Feed Water Level */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Feed Water Level (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={feedWaterLevelPct}
                onChange={e => setFeedWaterLevelPct(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Softened water tank</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-xs text-slate-600 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={blowdownDone}
                onChange={e => setBlowdownDone(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Hourly Sediment Blowdown Completed</span>
            </label>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Safety Certified
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Boiler Engineer / Technician *
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={e => setOperatorName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
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
              <span>Record Boiler Reading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
