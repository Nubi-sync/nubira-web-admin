'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
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
import { EmptyState } from '@/components/ui/EmptyState'

interface ScrapSalvageClientProps {
  userEmail?: string
  companyName?: string
}

export function ScrapSalvageClient({ userEmail, companyName }: ScrapSalvageClientProps) {
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
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Scrap Salvage & Write-Off Ledger
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
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
          className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-[#0B1220] text-white text-xs font-bold hover:bg-[#162032] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Declare Scrap & Re-Cut</span>
        </button>
      </div>

      {/* 4 Scrap Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Scrap Write-Off Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            0.04%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Well Below 0.05% Ceiling SLA</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Scrapped Garments
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {scraps.length} Pieces
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Irreparable Structural Tears</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Salvage Rag Weight
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {totalSalvageWeight} kg
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Down-Cycled to Industrial Wipes</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Re-Cut Orders Dispatched
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {scraps.length} Orders
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Sent to 03. Cutting Floor CAD</p>
        </div>
      </div>

      {/* Main Table: Scrap Write-Off Requisitions */}
      <div className="bg-white rounded-2xl border border-black/15 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#F0FDFA]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Official Scrap Write-Off & Re-Cut Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#0B1220] text-white font-bold">
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
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/15 bg-white focus:outline-none focus:ring-1 focus:ring-[#0B1220] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
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
                  <td colSpan={10} className="p-8">
                    <EmptyState
                      icon={Trash2}
                      title="No scrap write-off records found"
                      description="Zero garments have been declared scrap today. High clinic salvage rate active."
                      actionLabel="Declare Scrap & Re-Cut"
                      onAction={() => setIsModalOpen(true)}
                      variant="seamless"
                    />
                  </td>
                </tr>
              ) : (
                filteredScraps.map(scrap => (
                  <tr key={scrap.id} className="hover:bg-[#F0FDFA]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-[#0B1220]">
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
                      <span className="font-mono font-bold text-[#0B1220] bg-[#F0FDFA] px-2 py-0.5 rounded border border-black/15 text-[11px]">
                        {scrap.scrapReason}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {scrap.salvageWeightKg} kg
                    </td>
                    <td className="py-3 px-4">
                      {scrap.reCutAuthorized ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F0FDFA] text-[#0B1220] font-bold border border-black/15 inline-flex items-center gap-1">
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
