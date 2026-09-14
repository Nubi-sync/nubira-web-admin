'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  Boxes,
  Sparkles
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PackingHandover } from '../../types/iron'
import { getPackingHandovers, IRON_UPDATE_EVENT } from '../../utils/ironStorage'
import { CreateTrolleyModal } from './CreateTrolleyModal'

export function PackingHandoverClient() {
  const [handovers, setHandovers] = useState<PackingHandover[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadHandovers() {
    setHandovers(getPackingHandovers())
  }

  useEffect(() => {
    loadHandovers()
    const handleUpdate = () => loadHandovers()
    window.addEventListener(IRON_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(IRON_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalPieces = handovers.reduce((acc, h) => acc + (h.piecesTransferred || 0), 0)

  const filtered = handovers.filter(h =>
    h.trolleyCode.toLowerCase().includes(search.toLowerCase()) ||
    h.challanId.toLowerCase().includes(search.toLowerCase()) ||
    h.articleName.toLowerCase().includes(search.toLowerCase()) ||
    h.color.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 select-none">
      {/* 4 Handover Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Dispatched to Packing
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalPieces.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Pcs</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Conditioned & pressed garments
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Wrinkle-Free Pass
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              100%
            </span>
            <span className="text-xs font-bold text-slate-600">Verified</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Vacuum suction dried on buck
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Zero Shine & Glaze
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              100%
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">Teflon Protected</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Certified under 1000-lux lamp
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Destination Entity
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-slate-900 truncate font-mono">
              09. Ready Goods
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Tagging, Polybag & Carton Packing
          </p>
        </div>
      </div>

      {/* Trolley Manifest Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trolley code, challan, article..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Trolley Handover</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F0]/60 border-b border-black/10 text-slate-600 font-mono uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Trolley Code</th>
                <th className="p-3.5">Challan Lot</th>
                <th className="p-3.5">Garment Article & Color</th>
                <th className="p-3.5">Pieces Transferred</th>
                <th className="p-3.5">Destination Unit</th>
                <th className="p-3.5">Finishing Quality Verification</th>
                <th className="p-3.5">Supervisor Sign-off</th>
                <th className="p-3.5">Handover Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {filtered.length > 0 ? (
                filtered.map(h => (
                  <tr key={h.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#3A3564]">
                      {h.trolleyCode}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800">
                      {h.challanId}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{h.articleName}</div>
                      <div className="text-[11px] text-slate-500">{h.color}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {h.piecesTransferred.toLocaleString()} pcs
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {h.transferredTo}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px] font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>Wrinkle-Free • Zero Shine</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">
                      {h.supervisorSignoff}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {h.handoverDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-0">
                    <EmptyState
                      variant="seamless"
                      icon={Truck}
                      title="No trolley handovers found"
                      description="Gate passes transferring vacuum-pressed garments in mobile finishing trolleys to packing floor will display once created."
                      actionLabel="Generate Trolley Handover"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateTrolleyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
