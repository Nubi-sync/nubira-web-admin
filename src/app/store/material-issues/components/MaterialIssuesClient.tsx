'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowRight, 
  Search, 
  Plus, 
  Layers, 
  Tag, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  FileText,
  QrCode
} from 'lucide-react'
import { MaterialFloorIssueChallan, MaterialDestination } from '../../types/store'
import { getMaterialIssueChallans, updateMaterialIssueChallanStatus, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { IssueMaterialChallanModal } from './IssueMaterialChallanModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ArticleConsumptionLedger } from '../../components/ArticleConsumptionLedger'
import { MaterialFlowBespokeIcon } from '@/components/icons/CustomStoreIcons'

interface MaterialIssuesClientProps {
  activeAllotments?: any[]
  truckInwards?: any[]
}

export function MaterialIssuesClient({
  activeAllotments = [],
  truckInwards = []
}: MaterialIssuesClientProps) {
  const [challans, setChallans] = useState<MaterialFloorIssueChallan[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [destFilter, setDestFilter] = useState<'ALL' | MaterialDestination>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadChallans = () => {
    setChallans(getMaterialIssueChallans())
  }

  useEffect(() => {
    loadChallans()
    const handleUpdate = () => loadChallans()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const todayChallans = challans.length
  const cuttingMeters = challans
    .filter(c => c.destinationDivision === 'CUTTING_FLOOR')
    .reduce((acc, c) => acc + c.quantityIssued, 0)
  const sewingSets = challans
    .filter(c => c.destinationDivision === 'SEWING_FLOOR')
    .reduce((acc, c) => acc + c.quantityIssued, 0)
  const acceptedCount = challans.filter(c => c.status === 'ACCEPTED_BY_FLOOR').length

  const filteredChallans = challans.filter(c => {
    const matchesSearch =
      c.issueChallanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.articleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.materialSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scannedBarcodes.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (destFilter === 'ALL') return true
    return c.destinationDivision === destFilter
  })

  const handleAccept = (id: string) => {
    updateMaterialIssueChallanStatus(id, 'ACCEPTED_BY_FLOOR')
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <FileText className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Material Issues <span className="text-[#1D4ED8]">to Floor</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
                Barcode Verified Dispatch
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Dispatching allocated fabric rolls to Cutting CAD tables and complete BOM trims packages to Sewing assembly lines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <Link
            href="/store"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <MaterialFlowBespokeIcon className="w-4 h-4 text-[#0B1220]" />
            <span>Central Store Hub</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all shrink-0 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Issue Material to Floor</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards - Unified Icon & Neutral Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Challans Issued Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {todayChallans} <span className="text-sm font-normal text-slate-500">Challans</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Active Cutting & Sewing Dispatches
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Fabric Issued to Cutting
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {cuttingMeters.toLocaleString()} <span className="text-sm font-normal text-slate-500">Meters</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Inspected 4-Point Passed Rolls
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Trims Issued to Sewing
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {sewingSets.toLocaleString()} <span className="text-sm font-normal text-slate-500">BOM Sets</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Thread, Zippers, Labels Allotted
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/15 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Handover Acceptance Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {challans.length > 0 ? `${((acceptedCount / challans.length) * 100).toFixed(1)}%` : '100%'}
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Zero Ghost Piece Handshake Integrity
          </p>
        </div>
      </div>

      {/* Live Article Material Consumption Ledger */}
      {activeAllotments.length > 0 && (
        <ArticleConsumptionLedger 
          activeAllotments={activeAllotments} 
          truckInwards={truckInwards} 
        />
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/15 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by challan no, order id, article, buyer, or barcode..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#F0FDFA] border border-black/15 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1220]"
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold' 
                    : 'text-slate-600 bg-slate-50 border border-slate-100 hover:bg-[#F0FDFA]/60'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-2xl border border-black/15 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#F0FDFA] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      variant="seamless"
                      icon={ArrowRight}
                      title="No Material Challans Found"
                      description="No shop floor dispatches match your search criteria or floor destination filter."
                      actionLabel="Reset Filters"
                      onAction={() => {
                        setSearchQuery('')
                        setDestFilter('ALL')
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredChallans.map(c => {
                  const isAccepted = c.status === 'ACCEPTED_BY_FLOOR'
                  return (
                    <tr key={c.id} className="hover:bg-[#F0FDFA]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {c.issueChallanNo}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500" suppressHydrationWarning>
                          {new Date(c.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(c.issuedAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-[#F0FDFA] text-[#0B1220] border border-black/15">
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
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-[#0B1220]" />
                            Accepted by Floor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F0FDFA] text-slate-700 text-[10px] font-mono font-bold uppercase border border-black/15">
                            <Clock className="w-3 h-3 text-slate-500" />
                            In Transit to Floor
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isAccepted ? (
                          <button
                            onClick={() => handleAccept(c.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 active:scale-[0.98]"
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
