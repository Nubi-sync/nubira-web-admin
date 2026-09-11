'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Layers,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Archive,
  ArrowRight
} from 'lucide-react'
import { PrintingScreen, ScreenStatus } from '../../types/printing'
import { getScreens, saveScreen, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
import { CreateScreenModal } from './CreateScreenModal'

export function ScreensClient() {
  const [screens, setScreens] = useState<PrintingScreen[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const reloadData = () => {
    setScreens(getScreens())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [])

  const handleUpdateStatus = (screen: PrintingScreen, nextStatus: ScreenStatus) => {
    const updated = saveScreen({
      ...screen,
      status: nextStatus
    })
    setScreens(updated)
  }

  const filteredScreens = screens.filter(scr => {
    const matchesFilter = statusFilter === 'ALL' || scr.status === statusFilter
    const matchesSearch =
      scr.screen_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scr.artwork_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scr.color_separation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scr.rack_location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Summary Metrics
  const totalScreens = screens.length
  const readyCount = screens.filter(s => s.status === 'READY_FOR_PRINT').length
  const inUseCount = screens.filter(s => s.status === 'IN_USE').length
  const reclamationCount = screens.filter(s => s.status === 'NEEDS_RECLAMATION' || s.status === 'DAMAGED_MESH').length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/printing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">Screen & Stencil Library</span>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Screen</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Screen & Stencil Library
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Mesh 120–305 Catalog
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Photo-emulsion exposed frames, pneumatic tension monitoring (Newtons), and physical rack slot indexing.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Total Inventory
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {totalScreens} Screens
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Aluminum tension frames</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Ready for Table
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 font-mono">
            {readyCount} Frames
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Pin-hole checked & blocked</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Currently In-Use
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-blue-700 font-mono">
            {inUseCount} Frames
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Clamped on 60m tables</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Needs Reclamation
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-amber-700 font-mono">
            {reclamationCount} Frames
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Chemical strip / restretch</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'READY_FOR_PRINT', 'IN_USE', 'NEEDS_RECLAMATION', 'DAMAGED_MESH'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, artwork, rack..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F0]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Screen Code</th>
                <th className="py-3 px-4">Artwork Ref & Separation</th>
                <th className="py-3 px-4">Mesh</th>
                <th className="py-3 px-4">Tension</th>
                <th className="py-3 px-4">Rack Slot</th>
                <th className="py-3 px-4 text-right">Exposures</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredScreens.length > 0 ? (
                filteredScreens.map(scr => (
                  <tr key={scr.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {scr.screen_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{scr.artwork_ref}</div>
                      <div className="text-[11px] font-mono text-[#3A3564]">
                        Channel: {scr.color_separation}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {scr.mesh_count} T
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={scr.tension_newtons >= 22 ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}>
                        {scr.tension_newtons} N/cm
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {scr.rack_location}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {scr.exposures_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        scr.status === 'READY_FOR_PRINT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : scr.status === 'IN_USE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : scr.status === 'NEEDS_RECLAMATION'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {scr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {scr.status === 'READY_FOR_PRINT' && (
                        <button
                          onClick={() => handleUpdateStatus(scr, 'IN_USE')}
                          className="px-2.5 py-1 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          Mount on Table
                        </button>
                      )}
                      {scr.status === 'IN_USE' && (
                        <button
                          onClick={() => handleUpdateStatus(scr, 'NEEDS_RECLAMATION')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:bg-slate-50 text-slate-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          Strip & Wash
                        </button>
                      )}
                      {scr.status === 'NEEDS_RECLAMATION' && (
                        <button
                          onClick={() => handleUpdateStatus(scr, 'READY_FOR_PRINT')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          Mark Cleaned
                        </button>
                      )}
                      {scr.status === 'DAMAGED_MESH' && (
                        <span className="text-[11px] font-mono text-rose-600 font-bold">Restretch Frame</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                    No screen stencils match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateScreenModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
