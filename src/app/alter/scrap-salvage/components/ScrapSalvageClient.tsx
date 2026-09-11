'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Scissors,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { getScrapRequisitions, ALTER_UPDATE_EVENT } from '../../utils/alterStorage'
import { ScrapRequisition } from '../../types/alter'
import { DeclareScrapModal } from './DeclareScrapModal'

interface ScrapSalvageClientProps {
  userEmail?: string
}

export function ScrapSalvageClient({ userEmail }: ScrapSalvageClientProps) {
  const [scraps, setScraps] = useState<ScrapRequisition[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function loadScraps() {
    setScraps(getScrapRequisitions())
  }

  useEffect(() => {
    loadScraps()
    const handleUpdate = () => loadScraps()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredScraps = scraps.filter(scrap => {
    return (
      scrap.scrapCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scrap.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scrap.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scrap.scrapReason.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalSalvageWeight = scraps.reduce((acc, s) => acc + s.salvageWeightKg, 0).toFixed(2)

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
          Scrap Ledger • Cutting Floor Re-Cut Requisitions
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-rose-50 text-rose-700 border border-rose-200">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Scrap Salvage & Write-Off Ledger
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 tracking-wider">
                0.04% Plant True Scrap
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Formal write-off authorization for irreparable garments and automatic single-piece replacement re-cut orders to Division 03 Cutting Floor
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Declare Scrap & Re-Cut</span>
        </button>
      </div>

      {/* 4 Scrap Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Scrap Write-Off Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            0.04%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Well Below 0.05% Ceiling SLA</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Scrapped Garments
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700">
            {scraps.length} Pieces
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Irreparable Structural Tears</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Salvage Rag Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {totalSalvageWeight} kg
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Down-Cycled to Industrial Wipes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Re-Cut Orders Dispatched
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-[#3A3564]">
            {scraps.length} Orders
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Sent to 03. Cutting Floor CAD</p>
        </div>
      </div>

      {/* Main Table: Scrap Write-Off Requisitions */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Official Scrap Write-Off & Re-Cut Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-700 text-white font-bold">
                {filteredScraps.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized write-offs triggering Zero Ghost Piece replacement panel cut orders
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Scrap Code, Ticket, PO..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Scrap Code</th>
                <th className="py-3 px-4">Origin Ticket</th>
                <th className="py-3 px-4">Order PO & Buyer</th>
                <th className="py-3 px-4">Garment Style</th>
                <th className="py-3 px-4">Size & Color</th>
                <th className="py-3 px-4">Scrap Reason</th>
                <th className="py-3 px-4">Salvage Wt</th>
                <th className="py-3 px-4">Cutting Re-Cut Order</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredScraps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No scrap write-off records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredScraps.map(scrap => (
                  <tr key={scrap.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-rose-700">
                      {scrap.scrapCode}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {scrap.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{scrap.orderNumber}</span>
                      <div className="text-[10px] text-slate-500">{scrap.buyer}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {scrap.styleName}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-900">{scrap.size}</span> • {scrap.color}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                        {scrap.scrapReason}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {scrap.salvageWeightKg} kg
                    </td>
                    <td className="py-3 px-4">
                      {scrap.reCutAuthorized ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> RE-CUT SENT (DIV 03)
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {scrap.authorizedBy}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {scrap.sentToCuttingAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeclareScrapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadScraps}
      />
    </div>
  )
}
