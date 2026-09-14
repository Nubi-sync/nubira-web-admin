'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { FinishingHandover } from '../../types/washing'
import { getFinishingHandovers, WASHING_UPDATE_EVENT } from '../../utils/washingStorage'
import { CreateHandoverModal } from './CreateHandoverModal'

export function HandoverClient() {
  const [handovers, setHandovers] = useState<FinishingHandover[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadHandovers() {
    setHandovers(getFinishingHandovers())
  }

  useEffect(() => {
    loadHandovers()
    const handleUpdate = () => loadHandovers()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [])

  const totalPieces = handovers.reduce((acc, h) => acc + (h.piecesTransferred || 0), 0)

  const filtered = handovers.filter(h =>
    h.handoverCode.toLowerCase().includes(search.toLowerCase()) ||
    h.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
    h.challanId.toLowerCase().includes(search.toLowerCase()) ||
    h.articleName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 select-none">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Dispatched to Ironing
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
            Conditioned garments transferred
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Zero Dampness
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
            Zero residual moisture verified
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Odor Neutrality
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              100%
            </span>
            <span className="text-xs font-bold text-slate-600">Fresh Peach</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero chemical acid aroma
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Piece Match Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              100%
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">Zero Loss</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Matches sewing inward challan
          </p>
        </div>
      </div>

      {/* Handover Gate Passes Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gate pass, batch, challan..."
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
            <span>Generate Handover Gate Pass</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F0]/60 border-b border-black/10 text-slate-600 font-mono uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Gate Pass ID</th>
                <th className="p-3.5">Batch & Challan</th>
                <th className="p-3.5">Garment Article</th>
                <th className="p-3.5">Pieces Transferred</th>
                <th className="p-3.5">Destination Unit</th>
                <th className="p-3.5">Condition Verification</th>
                <th className="p-3.5">Supervisor Sign-off</th>
                <th className="p-3.5">Handover Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-sans">
              {filtered.length > 0 ? (
                filtered.map(h => (
                  <tr key={h.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#3A3564]">
                      {h.handoverCode}
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{h.batchNumber}</div>
                      <div className="text-[11px] font-mono text-slate-500">{h.challanId}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800">
                      {h.articleName}
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
                        <span>Dry • Odorless • Count Match</span>
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
                      title="No drying handovers recorded"
                      description="Gate passes transferring moisture-verified dried garments to steam ironing tables will appear once created."
                      actionLabel="Generate Handover Gate Pass"
                      onAction={() => setIsModalOpen(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateHandoverModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
