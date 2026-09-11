'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronLeft,
  Search,
  ShieldCheck,
  Check,
  Eye,
  ArrowRight,
  Sparkles,
  Layers,
  Wrench,
  AlertTriangle
} from 'lucide-react'
import { getAlterTickets, ALTER_UPDATE_EVENT } from '../../utils/alterStorage'
import { AlterationTicket } from '../../types/alter'

interface SecondaryQcClientProps {
  userEmail?: string
}

export function SecondaryQcClient({ userEmail }: SecondaryQcClientProps) {
  const [tickets, setTickets] = useState<AlterationTicket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<AlterationTicket | null>(null)

  function loadTickets() {
    setTickets(getAlterTickets())
  }

  useEffect(() => {
    loadTickets()
    const handleUpdate = () => loadTickets()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  const clearedTickets = tickets.filter(t => t.resolutionStatus === 'REPAIRED_PASSED')

  const filteredTickets = clearedTickets.filter(t => {
    return (
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.garmentBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.menderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.inspectorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
          Secondary AQL Inspection Station • 1000-Lux Verification Gate
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Secondary AQL Re-Inspection Station
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider">
                100% Repaired Clearance
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Dedicated QA audit gate authorizing repaired garments to re-enter Division 08 Steam Ironing or Division 09 Ready Goods Packing
            </p>
          </div>
        </div>

        <Link
          href="/alter/repair-stations"
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Scissors className="w-4 h-4" />
          <span>View Active Mending</span>
        </Link>
      </div>

      {/* 4 Clearance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Repaired & Cleared
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {clearedTickets.length} Garments
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Approved for Re-Injection</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Secondary AQL SLA
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            100% Inspected
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Zero Defect Re-Occurrence</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Re-Injection Channel
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            08. Ironing / 09. Pack
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Seamless Stream Return</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Direct Cost Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            ₹18,450
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">BOM Value Salvaged Today</p>
        </div>
      </div>

      {/* Main Table: Cleared Quality Re-Inspections */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Secondary Quality Assurance Clearance Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold">
                {filteredTickets.length} Cleared Lots
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Garments certified under 1000-lux inspection light after mending or chemical spotting
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Ticket, Mender, Inspector..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Ticket Voucher</th>
                <th className="py-3 px-4">Garment Barcode</th>
                <th className="py-3 px-4">Order PO & Buyer</th>
                <th className="py-3 px-4">Initial Defect</th>
                <th className="py-3 px-4">Senior Mender</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">QA Auditor</th>
                <th className="py-3 px-4">Clearance Status</th>
                <th className="py-3 px-4 text-right">Cleared At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No cleared tickets match your query.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564]">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ticket.garmentBarcode}
                      <div className="text-[10px] text-slate-400">{ticket.size} • {ticket.color}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{ticket.orderNumber}</span>
                      <div className="text-[10px] text-slate-500">{ticket.buyer}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ticket.defectType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {ticket.menderName || 'Fatima Bano'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#3A3564] font-semibold">
                      {ticket.repairActionTaken}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {ticket.inspectorName || 'Devendra Patel'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> AQL CLEARED
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {ticket.clearedAt || ticket.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">
                  AQL Clearance Certificate: {selectedTicket.ticketNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono">Garment Barcode:</span>
                <div className="font-mono font-bold text-slate-900">{selectedTicket.garmentBarcode}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Order PO & Buyer:</span>
                <div className="font-bold text-slate-900">{selectedTicket.orderNumber} • {selectedTicket.buyer}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Original Defect:</span>
                <div className="font-mono font-bold text-amber-800">{selectedTicket.defectType}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Action Performed:</span>
                <div className="font-mono font-bold text-emerald-700">{selectedTicket.repairActionTaken}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Mender / Tailor:</span>
                <div className="font-medium text-slate-900">{selectedTicket.menderName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">QA Auditor:</span>
                <div className="font-medium text-slate-900">{selectedTicket.inspectorName}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs space-y-1">
              <div className="font-mono font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Authorized for Production Stream Re-Injection
              </div>
              <p className="text-emerald-800 text-[11px]">
                Garment inspected under 1000-lux daylight luminaire. Zero seam puckering, zero tension imbalance, and zero fabric shine detected.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
