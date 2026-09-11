'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Wrench,
  Sparkles,
  Eye,
  FileCheck2,
  Layers,
  ArrowRight
} from 'lucide-react'
import {
  getAlterTickets,
  getRepairStations,
  ALTER_UPDATE_EVENT
} from '../../utils/alterStorage'
import { AlterationTicket, RepairStation } from '../../types/alter'
import { SignOffRepairModal } from './SignOffRepairModal'

interface RepairStationsClientProps {
  userEmail?: string
}

export function RepairStationsClient({ userEmail }: RepairStationsClientProps) {
  const [tickets, setTickets] = useState<AlterationTicket[]>([])
  const [stations, setStations] = useState<RepairStation[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  function loadData() {
    setTickets(getAlterTickets())
    setStations(getRepairStations())
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener(ALTER_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(ALTER_UPDATE_EVENT, handleUpdate)
  }, [])

  // Filter mending stations (Stations 01-04)
  const mendingStations = stations.filter(s => s.stationCode.startsWith('STN-MEND-01') || s.stationCode.startsWith('STN-MEND-02') || s.stationCode.startsWith('STN-MEND-03') || s.stationCode.startsWith('STN-MEND-04'))

  const openTickets = tickets.filter(t => t.resolutionStatus === 'IN_REWORK')

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
          Master Mending Stations • Precision Restitching
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Master Mending Stations
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                Stations 01–04
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Collar unpicking, placket re-setting, skip-stitch re-sewing, and precision garment reconstructive surgery
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedTicketId(undefined)
            setIsModalOpen(true)
          }}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-300" />
          <span>Sign Off Repair (Form 2)</span>
        </button>
      </div>

      {/* 4 Mending Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mendingStations.map(stn => {
          const stationTickets = openTickets.filter(t => t.assignedStation.includes(stn.stationCode.slice(-2)))
          return (
            <div
              key={stn.id}
              className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#3A3564]">
                  {stn.stationCode}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  {stn.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{stn.stationName}</h3>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{stn.menderName}</p>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF7F0] border border-black/5 text-[11px] font-mono text-slate-600">
                Machine: {stn.equipmentType.substring(0, 24)}...
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
                <div className="bg-slate-50 p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-400 uppercase">In Queue</span>
                  <div className="font-black text-amber-700 text-sm mt-0.5">
                    {stn.activeTicketsCount} pcs
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-400 uppercase">Cleared</span>
                  <div className="font-black text-emerald-700 text-sm mt-0.5">
                    {stn.repairedTodayCount} pcs
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Mending Queue Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#FAF7F0]/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Active Mending & Seam Reconstruction Queue
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A3564] text-white font-bold">
                {openTickets.length} Open Tickets
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Garments actively staged on Mending Stations 01–04 awaiting technician signoff
            </p>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Ticket, Barcode, Style..."
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
                <th className="py-3 px-4">Defect Diagnosis</th>
                <th className="py-3 px-4">Source Operator</th>
                <th className="py-3 px-4">Workstation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Sign Off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {openTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                    All mending tickets have been cleared! Zero defects currently in queue.
                  </td>
                </tr>
              ) : (
                openTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
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
                      <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                        {ticket.defectDescription}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {ticket.linemanName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      {ticket.assignedStation}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {ticket.resolutionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicketId(ticket.id)
                          setIsModalOpen(true)
                        }}
                        className="px-3 py-1 rounded-lg bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileCheck2 className="w-3 h-3" />
                        <span>Sign Off</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SignOffRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        initialTicketId={selectedTicketId}
      />
    </div>
  )
}
