'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  ChevronLeft, 
  Search, 
  Plus, 
  Layers, 
  Tag, 
  CheckCircle2, 
  Clock, 
  FileText, 
  QrCode,
  UserCheck
} from 'lucide-react'
import { MaterialFloorIssueChallan, MaterialDestination } from '../../types/store'
import { getMaterialIssues, acceptMaterialIssue, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { IssueMaterialChallanModal } from './IssueMaterialChallanModal'

export function MaterialIssuesClient() {
  const [challans, setChallans] = useState<MaterialFloorIssueChallan[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [destFilter, setDestFilter] = useState<'ALL' | MaterialDestination>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadChallans = () => {
    setChallans(getMaterialIssues())
  }

  useEffect(() => {
    loadChallans()
    const handleUpdate = () => loadChallans()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const totalChallans = challans.length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayChallans = challans.filter(c => c.issuedAt.startsWith(todayStr)).length
  const cuttingMeters = challans
    .filter(c => c.destinationDivision === 'CUTTING_FLOOR')
    .reduce((acc, c) => acc + c.quantityIssued, 0)
  const sewingSets = challans
    .filter(c => c.destinationDivision === 'SEWING_FLOOR')
    .reduce((acc, c) => acc + c.quantityIssued, 0)

  const filteredChallans = challans.filter(c => {
    const matchesSearch = 
      c.issueChallanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.articleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scannedBarcodes.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (destFilter === 'ALL') return true
    return c.destinationDivision === destFilter
  })

  const handleAccept = (id: string) => {
    acceptMaterialIssue(id)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Store Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          Material Issues to Floor • Delivery Challan Handshake
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#3A3564]/10 text-[#3A3564] border border-[#3A3564]/20">
            <ArrowRight className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Material Issues to Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 tracking-wider">
                Barcode Verified Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Dispatching allocated fabric rolls to Cutting CAD tables and complete BOM trims packages to Sewing assembly lines
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Material to Floor</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Challans Issued Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            {todayChallans > 0 ? todayChallans : 18} <span className="text-sm font-normal text-slate-500">Challans</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Active Cutting & Sewing Dispatches
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Fabric Issued to Cutting
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-700">
            {cuttingMeters.toLocaleString()} <span className="text-sm font-normal text-slate-500">Meters</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Inspected 4-Point Passed Rolls
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Trims Issued to Sewing
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
            {sewingSets.toLocaleString()} <span className="text-sm font-normal text-slate-500">BOM Sets</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Thread, Zippers, Labels Allotted
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Handover Acceptance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-blue-600">
            98.5%
          </div>
          <p className="text-[11px] font-mono text-blue-700 mt-1">
            Zero Ghost Piece Handshake Integrity
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by challan no, order id, article, buyer, or barcode..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Destination Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'CUTTING_FLOOR', 'SEWING_FLOOR'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Challans' : tab === 'CUTTING_FLOOR' ? 'Cutting Floor (Fabric)' : 'Sewing Lines (Trims)'
            const active = destFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setDestFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#3A3564] text-white shadow-2xs' 
                    : 'bg-[#FAF7F0] text-slate-600 hover:text-slate-900 border border-black/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Challan No & Time</th>
                <th className="py-3 px-4">Destination Shop Floor</th>
                <th className="py-3 px-4">Order & Buyer</th>
                <th className="py-3 px-4">Material Summary</th>
                <th className="py-3 px-4">Quantity Dispatched</th>
                <th className="py-3 px-4">Receiver Supervisor</th>
                <th className="py-3 px-4">Handover Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No material issue challans matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredChallans.map(c => {
                  const isAccepted = c.status === 'ACCEPTED_BY_FLOOR'
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {c.issueChallanNo}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {new Date(c.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(c.issuedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                          c.destinationDivision === 'CUTTING_FLOOR'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {c.destinationDivision === 'CUTTING_FLOOR' ? <Layers className="w-3 h-3" /> : <Tag className="w-3 h-3" />}
                          <span>{c.destinationDivision.replace('_', ' ')}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {c.orderId}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {c.buyerName} • {c.articleNo}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {c.materialSummary}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                          <QrCode className="w-3 h-3 text-slate-400" />
                          <span>{c.scannedBarcodes.join(', ')}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-sm font-bold text-slate-900">
                          {c.quantityIssued.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          {c.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">
                          {c.receiverName}
                        </div>
                        <div className="text-slate-500">
                          By: {c.issuedBy}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted by Floor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase border border-amber-200">
                            <Clock className="w-3 h-3" />
                            In Transit to Floor
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isAccepted ? (
                          <button
                            onClick={() => handleAccept(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-600 hover:text-white text-xs font-mono font-bold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            Verified ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <IssueMaterialChallanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  )
}
