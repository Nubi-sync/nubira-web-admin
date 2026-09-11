'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Droplets,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { getSpottingLogs, ALTER_UPDATE_EVENT } from '../../utils/alterStorage'
import { SpotCleaningLog } from '../../types/alter'
import { ExecuteSpotCleanModal } from './ExecuteSpotCleanModal'

interface SpotCleaningClientProps {
  userEmail?: string
}

export function SpotCleaningClient({ userEmail }: SpotCleaningClientProps) {
  const [logs, setLogs] = useState<SpotCleaningLog[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function loadLogs() {
    setLogs(getSpottingLogs())
  }

  useEffect(() => {
    loadLogs()
    const handleUpdate = () => loadLogs()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredLogs = logs.filter(log => {
    return (
      log.logCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.stainType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/alter"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Clinic Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Stations 05 & 06 • High-Pressure Chemical Vacuum Spotting
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Droplets className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Chemical Spotting & Cleaning Desk
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Eco Degreasing
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Dissolving machine oil, grease, dye tint, and dirt smudges using eco-certified Trichloroethylene-free vacuum spotting tables
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Execute Spot Cleaning</span>
        </button>
      </div>

      {/* 4 Spotting Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Spotting Tables
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            2 Tables Online
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Stations 05 & 06 with Vacuum Baffles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Stains Salvaged Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            27 Pieces
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Saved from Scrap Write-Off</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Zero-Halo Standard
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            100% Clear
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Vacuum Suction Evaporates Rings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Solvent Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            OEKO-TEX OK
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">TCE-Free Citrus Formulation</p>
        </div>
      </div>

      {/* Main Table: Spotting Logs */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Chemical Spot Cleaning Execution Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredLogs.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified records of oil degreasing operations with solvent safety certification
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Log, Ticket, Stain, Operator..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Log Code</th>
                <th className="py-3 px-4">Ticket Voucher</th>
                <th className="py-3 px-4">Diagnosed Stain</th>
                <th className="py-3 px-4">Chemical Solvent Used</th>
                <th className="py-3 px-4">Vacuum Duration</th>
                <th className="py-3 px-4">Stain Removal</th>
                <th className="py-3 px-4">Halo Check</th>
                <th className="py-3 px-4">Spotting Specialist</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No chemical spotting logs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564]">
                      {log.logCode}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.stainType}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#3A3564]">
                      {log.solventUsed}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {log.vacuumTableSec} sec
                    </td>
                    <td className="py-3 px-4">
                      {log.stainRemoved ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          REMOVED (100%)
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          RESIDUAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {!log.haloVisible ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          ZERO HALO
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          RING VISIBLE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {log.operatorName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {log.timestamp}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExecuteSpotCleanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadLogs}
      />
    </div>
  )
}
