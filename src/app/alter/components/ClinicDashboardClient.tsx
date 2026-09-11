'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wrench,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Scissors,
  Droplets,
  ShieldCheck,
  Search,
  Plus,
  Eye,
  Check,
  BarChart3,
  SlidersHorizontal,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react'
import {
  getAlterTickets,
  getAlterMetrics,
  getParetoDefectSummary,
  ALTER_UPDATE_EVENT
} from '../utils/alterStorage'
import { AlterationTicket, AlterationMetrics } from '../types/alter'

interface ClinicDashboardClientProps {
  userEmail?: string
}

export function ClinicDashboardClient({ userEmail }: ClinicDashboardClientProps) {
  const [tickets, setTickets] = useState<AlterationTicket[]>([])
  const [metrics, setMetrics] = useState<AlterationMetrics>(getAlterMetrics())
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedTicket, setSelectedTicket] = useState<AlterationTicket | null>(null)

  function loadData() {
    const all = getAlterTickets()
    setTickets(all)
    setMetrics(getAlterMetrics())
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  const paretoSummary = getParetoDefectSummary(tickets)

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus =
      statusFilter === 'ALL' || ticket.resolutionStatus === statusFilter

    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.garmentBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.linemanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.assignedStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.defectType.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Division 10 • Quality Recovery Clinic
          </span>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ≥ 95.0% Salvage SLA
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Alteration & Quality Rework Clinic
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Pareto Recovery
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Defect root-cause diagnosis, seam restitching, vacuum spotting degreasing, and secondary AQL clearance
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/alter/defect-intake"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Inward Defect</span>
          </Link>
          <Link
            href="/alter/repair-stations"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Mending Floor</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              In-Queue for Rework
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {metrics.activeInQueueCount} pcs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Current Floor Defect Rate: 0.8% • Low
          </p>
          <div className="mt-3 text-[11px] font-mono text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Avg Cycle: 18 min / piece
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Repaired & Cleared Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {metrics.repairedAndClearedToday} pcs
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Passed back to final finishing flow
          </p>
          <div className="mt-3 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> 100% Secondary AQL Pass
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Top Defect Root Cause
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
            {metrics.topRecurringDefect}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Line 2 & 4 Needle tension calibration
          </p>
          <div className="mt-3 text-[11px] font-mono text-slate-600 font-semibold bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10 inline-flex items-center gap-1">
            <span>34% of All Clinic Intakes</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Recovery Clearance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {metrics.recoveryClearanceRatePct}%
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            True Scrap Write-Off: 0.04% (High Salvage)
          </p>
          <div className="mt-3 text-[11px] font-mono text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-flex items-center gap-1">
            <UserCheck className="w-3 h-3" /> Lineman Root Tracking
          </div>
        </div>
      </div>

      {/* Pareto 80/20 Defect Analysis Panel */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#3A3564]" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pareto 80/20 Defect Frequency & Root Cause Analysis
              </h2>
              <p className="text-xs text-slate-500">
                80% of floor defects originate from 20% of machine calibration and operator handling causes
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            ASTM D3990 Standard
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {paretoSummary.map((item, idx) => (
            <div
              key={item.defectType}
              className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0]/40 space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3A3564] text-white text-[11px] font-mono font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({item.count} tickets)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="font-bold text-[#3A3564]">{item.percentage}% of Defects</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">Cumul: {item.cumulativePct}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3A3564] h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              {/* Root cause and fix advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="font-mono text-slate-400 text-[10px] uppercase">Diagnosed Root Cause:</span>
                  <p className="text-slate-700 font-medium text-[11px]">{item.rootCause}</p>
                </div>
                <div>
                  <span className="font-mono text-slate-400 text-[10px] uppercase">Corrective Machine Calibration:</span>
                  <p className="text-emerald-800 font-semibold text-[11px]">{item.recommendedFix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Operational Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-600 uppercase">
            Clinic Operations Quick Links:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/alter/defect-intake"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>02. Defect Intake & Triage</span>
          </Link>
          <Link
            href="/alter/repair-stations"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <Scissors className="w-3.5 h-3.5 text-purple-600" />
            <span>03. Master Mending Stations</span>
          </Link>
          <Link
            href="/alter/spot-cleaning"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>04. Chemical Spotting Table</span>
          </Link>
          <Link
            href="/alter/secondary-qc"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>05. Secondary AQL Gate</span>
          </Link>
          <Link
            href="/alter/scrap-salvage"
            className="px-3 py-1.5 rounded-lg bg-[#FAF7F0] hover:bg-[#eadecc] text-[#3A3564] text-xs font-bold border border-black/10 transition-colors inline-flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>06. Scrap & Re-Cut Ledger</span>
          </Link>
        </div>
      </div>

      {/* Main Table: Live Clinic Rework Queue */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Live Alteration & Quality Rework Queue
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {filteredTickets.length} Tickets
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Garments under triage, active restitching, chemical spot cleaning, and secondary AQL clearance
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
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
            <Link
              href="/alter/defect-intake"
              className="px-3 py-1.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shrink-0 inline-flex items-center gap-1"
            >
              <span>Intake Defect</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-black/5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Garments' },
            { id: 'IN_REWORK', label: 'Active in Mending' },
            { id: 'REPAIRED_PASSED', label: 'Repaired & Cleared' },
            { id: 'DECLARED_SCRAP', label: 'Declared Scrap' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 text-xs font-mono font-bold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                statusFilter === tab.id
                  ? 'border-[#3A3564] text-[#3A3564] bg-[#FAF7F0]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-slate-50/70 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Ticket Voucher</th>
                <th className="py-3 px-4">Garment Barcode</th>
                <th className="py-3 px-4">Order & Buyer</th>
                <th className="py-3 px-4">Defect Classification</th>
                <th className="py-3 px-4">Lineman Origin</th>
                <th className="py-3 px-4">Assigned Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Repair Cost</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No alteration tickets match the selected filters.
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
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{ticket.garmentBarcode}</span>
                      <div className="text-[10px] text-slate-400">
                        {ticket.size} • {ticket.color}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ticket.orderNumber}</div>
                      <div className="text-[11px] text-slate-500">{ticket.buyer}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {ticket.defectType}
                      </span>
                      <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {ticket.defectDescription}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{ticket.linemanName}</div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        Src: {ticket.sourceDivision}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      {ticket.assignedStation}
                    </td>
                    <td className="py-3 px-4">
                      {ticket.resolutionStatus === 'IN_REWORK' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          IN REWORK
                        </span>
                      )}
                      {ticket.resolutionStatus === 'REPAIRED_PASSED' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          REPAIRED PASSED
                        </span>
                      )}
                      {ticket.resolutionStatus === 'DECLARED_SCRAP' && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                          SCRAP
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ticket.repairCost > 0 ? `₹${ticket.repairCost.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedTicket(ticket)
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-black/10 text-slate-700 text-xs font-mono font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
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
                <Wrench className="w-5 h-5 text-[#3A3564]" />
                <h3 className="text-lg font-black text-slate-900">
                  Alteration Ticket: {selectedTicket.ticketNumber}
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
                <span className="text-slate-400 font-mono">Order & Buyer:</span>
                <div className="font-bold text-slate-900">
                  {selectedTicket.orderNumber} • {selectedTicket.buyer}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Garment Style:</span>
                <div className="font-bold text-slate-900">{selectedTicket.styleName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Size & Color:</span>
                <div className="font-mono font-bold text-slate-900">
                  {selectedTicket.size} • {selectedTicket.color}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Defect Type:</span>
                <div className="font-mono font-bold text-amber-700">{selectedTicket.defectType}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Source Division:</span>
                <div className="font-mono font-bold text-[#3A3564]">{selectedTicket.sourceDivision}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Responsible Lineman:</span>
                <div className="font-medium text-slate-900">{selectedTicket.linemanName}</div>
              </div>
              <div>
                <span className="text-slate-400 font-mono">Assigned Station:</span>
                <div className="font-mono font-bold text-[#3A3564]">{selectedTicket.assignedStation}</div>
              </div>
            </div>

            <div className="border-t border-black/10 pt-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">Defect Description</span>
              <p className="text-xs text-slate-700 mt-1 bg-[#FAF7F0] p-2.5 rounded-lg border border-black/5">
                {selectedTicket.defectDescription}
              </p>
            </div>

            {selectedTicket.menderName && (
              <div className="border-t border-black/10 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Mender:</span>
                  <div className="font-bold text-slate-900">{selectedTicket.menderName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono">Action Taken:</span>
                  <div className="font-mono font-bold text-emerald-700">
                    {selectedTicket.repairActionTaken || 'REPAIRED'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono">QA Inspector:</span>
                  <div className="font-bold text-slate-900">{selectedTicket.inspectorName || 'Devendra Patel'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono">Repair Cost:</span>
                  <div className="font-mono font-bold text-slate-900">₹{selectedTicket.repairCost}</div>
                </div>
              </div>
            )}

            <div className="border-t border-black/10 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Status: <strong className="text-slate-900">{selectedTicket.resolutionStatus}</strong></span>
              <span>Intake: {selectedTicket.createdAt}</span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                href="/alter/repair-stations"
                className="px-3 py-1.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e]"
              >
                Go to Repair Station
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
