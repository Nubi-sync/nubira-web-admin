'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  Search,
  Plus,
  QrCode,
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Layers,
  Wrench
} from 'lucide-react'
import { getAlterTickets, ALTER_UPDATE_EVENT } from '../../utils/alterStorage'
import { AlterationTicket } from '../../types/alter'
import { LogDefectModal } from './LogDefectModal'

interface DefectIntakeClientProps {
  userEmail?: string
}

export function DefectIntakeClient({ userEmail }: DefectIntakeClientProps) {
  const [tickets, setTickets] = useState<AlterationTicket[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('ALL')

  function loadTickets() {
    setTickets(getAlterTickets())
  }

  useEffect(() => {
    loadTickets()
    const handleUpdate = () => loadTickets()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSource =
      sourceFilter === 'ALL' || ticket.sourceDivision === sourceFilter

    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.garmentBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.linemanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.defectType.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSource && matchesSearch
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
          Intake Triage Gate • Lineman Operator Attribution
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Defect Intake & Pareto Categorization
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Root Cause Triage
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Scanned garment barcode triage recording defect taxonomy, originating floor line, and responsible operator
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Inward Defect (Form 1)</span>
        </button>
      </div>

      {/* 4 Intake Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Intake Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {tickets.length} Garments
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Triaged & Barcode Registered</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Lineman Traceability
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            100.0%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Direct FK Attribution to Operator</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Primary Origin Floor
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            Sewing (68%)
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Lines 2, 4, 5 Overlock & Lockstitch</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Secondary Quality Gate
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            Station 01-06
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">Direct Workstation Dispatch</p>
        </div>
      </div>

      {/* Main Table: Inward Defect Manifest */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Inward Defect Triage Manifest
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredTickets.length} Defect Tickets
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live incoming quarantined pieces with yellow defect stickers and operator origin
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Ticket, Barcode, Lineman..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564] font-mono"
            />
          </div>
        </div>

        {/* Tab Filters by Origin Division */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-black/5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Sources' },
            { id: 'SEWING_LINE', label: 'Sewing Floor' },
            { id: 'IRONING', label: 'Ironing Floor' },
            { id: 'WASHING', label: 'Washing Plant' },
            { id: 'PACKING_AQL', label: 'Packing AQL Rejects' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSourceFilter(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                sourceFilter === tab.id
                  ? 'border-[#3A3564] text-[#3A3564] bg-[#FAF7F0]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Ticket Voucher</th>
                <th className="py-3 px-4">Garment Barcode</th>
                <th className="py-3 px-4">Order PO & Buyer</th>
                <th className="py-3 px-4">Origin Division</th>
                <th className="py-3 px-4">Defect Taxonomy</th>
                <th className="py-3 px-4">Responsible Lineman</th>
                <th className="py-3 px-4">Allocated Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Intake Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No inward defects recorded matching your search.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-[#3A3564]">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ticket.garmentBarcode}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">{ticket.orderNumber}</span>
                      <div className="text-[10px] text-slate-500">{ticket.buyer}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#3A3564] font-semibold">
                      {ticket.sourceDivision}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ticket.defectType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {ticket.linemanName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ticket.assignedStation}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {ticket.resolutionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                      {ticket.createdAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LogDefectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadTickets}
      />
    </div>
  )
}
