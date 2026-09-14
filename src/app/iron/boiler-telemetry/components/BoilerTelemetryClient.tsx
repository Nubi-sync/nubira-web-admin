'use client'

import { useState, useEffect } from 'react'
import {
  Gauge,
  Plus,
  Thermometer,
  Droplets,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { BoilerTelemetryLog } from '../../types/iron'
import { getBoilerLogs, IRON_UPDATE_EVENT } from '../../utils/ironStorage'
import { LogBoilerModal } from './LogBoilerModal'

export function BoilerTelemetryClient() {
  const [logs, setLogs] = useState<BoilerTelemetryLog[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadLogs() {
    setLogs(getBoilerLogs())
  }

  useEffect(() => {
    loadLogs()
    const handleUpdate = () => loadLogs()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  const latest = logs[0] || {
    steamPressureBar: 4.5,
    boilerTempC: 154,
    condensateTrapStatus: 'NORMAL',
    feedWaterLevelPct: 88,
  }

  const isOptimal = latest.steamPressureBar >= 4.2 && latest.steamPressureBar <= 4.8

  return (
    <div className="space-y-6 select-none">
      {/* 4 Boiler Telemetry Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Steam Header Pressure
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {latest.steamPressureBar} Bar
            </span>
            <span className="text-xs font-bold font-mono text-slate-600">
              {isOptimal ? 'OPTIMAL' : 'CHECK'}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Target continuous flow: 4.2–4.8 Bar
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Steam Core Temp
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {latest.boilerTempC}°C
            </span>
            <span className="text-xs font-bold text-slate-600">Saturated</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Dry saturated steam delivered to tables
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Feed Water Tank Level
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {latest.feedWaterLevelPct}%
            </span>
            <span className="text-xs font-bold text-slate-600">De-aerated</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Softened water TDS &lt; 50 ppm
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Condensate Traps
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {latest.condensateTrapStatus}
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">Clean</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero water spit on iron heads
          </p>
        </div>
      </div>

      {/* Boiler Logs Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 font-[family-name:var(--font-heading)]">
              Industrial Steam Boiler Pressure & Blowdown Log
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Hourly gauge logging ensuring continuous 4.5 Bar steam delivery across all 12 vacuum buck pressing tables.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Boiler Telemetry</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F0]/60 border-b border-black/10 text-slate-600 font-mono uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Log Time</th>
                <th className="p-3.5">Steam Pressure</th>
                <th className="p-3.5">Boiler Core Temp</th>
                <th className="p-3.5">Condensate Trap Status</th>
                <th className="p-3.5">Feed Water Level</th>
                <th className="p-3.5">Blowdown Done</th>
                <th className="p-3.5">Operating Engineer</th>
                <th className="p-3.5">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {log.logTime}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#3A3564] text-sm">
                      {log.steamPressureBar.toFixed(1)} Bar
                    </td>
                    <td className="p-3.5 font-mono text-slate-800">
                      {log.boilerTempC}°C
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {log.condensateTrapStatus}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-800">
                      {log.feedWaterLevelPct}%
                    </td>
                    <td className="p-3.5">
                      {log.blowdownDone ? (
                        <span className="text-slate-800 font-mono font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Pending</span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900">
                      {log.operatorName}
                    </td>
                    <td className="p-3.5 text-slate-500 text-xs max-w-[220px] truncate">
                      {log.remarks || 'Standard pressure check'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      variant="seamless"
                      icon={Gauge}
                      title="No boiler telemetry logs recorded"
                      description="Hourly steam pressure gauge recordings, condensate trap statuses, and boiler blowdown logs will display once logged."
                      actionLabel="Log Boiler Telemetry"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogBoilerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
