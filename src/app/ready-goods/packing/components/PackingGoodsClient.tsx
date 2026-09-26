'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PackageCheck,
  ChevronLeft,
  Boxes,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Warehouse,
  ExternalLink,
  Bot,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Wrench,
  Building2,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents } from '@/utils/floorRealtime'
import {
  ReadyGoodsWorker,
  FinishingInspectionTask,
  PackingAssignment,
  ReadyGoodsCarton
} from '../../types/readyGoods'
import {
  getReadyGoodsWorkers,
  getFinishingInspectionTasks,
  getPackingAssignments,
  updatePackingAssignmentStatus,
  deletePackingAssignment,
  getReadyGoodsCartons,
  READY_GOODS_UPDATE_EVENT
} from '../../utils/readyGoodsStorage'
import { getActiveBuyers, getOrders } from '@/app/merchandising/utils/merchandisingStorage'
import { AddWorkerModal } from '../../components/AddWorkerModal'
import { WorkerListModal } from '../../components/WorkerListModal'
import { AssignPackingModal } from '../../components/AssignPackingModal'

interface PackingGoodsClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  companyName?: string
}

function mergeBuyersFromAllSources(tasks: FinishingInspectionTask[], assignments: PackingAssignment[], companyName?: string): any[] {
  const buyerMap = new Map<string, any>()

  if (typeof window !== 'undefined') {
    try {
      const targetCompany = (companyName || '').trim().toLowerCase()
      const localBuyers = getActiveBuyers()
      localBuyers.forEach(b => {
        if (b && (b.id || b.buyer_name)) {
          if (targetCompany && b.company_name && b.company_name.trim().toLowerCase() !== targetCompany) return
          const key = (b.buyer_name || b.id).trim().toUpperCase()
          buyerMap.set(key, { ...b })
        }
      })
    } catch {}

    try {
      const targetCompany = (companyName || '').trim().toLowerCase()
      const localOrders = getOrders()
      localOrders.forEach(ord => {
        if (ord && (ord.brand_name || ord.po_number)) {
          if (targetCompany && ord.company_name && ord.company_name.trim().toLowerCase() !== targetCompany) return
          const buyerName = ord.brand_name || 'Direct Buyer'
          const key = buyerName.trim().toUpperCase()
          if (!buyerMap.has(key)) {
            buyerMap.set(key, {
              id: `buyer-ord-${key}`,
              buyer_name: buyerName,
              contracted_volume: ord.total_quantity || 1000,
              linked_article_number: ord.po_number || ord.style_ref,
              linked_article_name: ord.style_name || `${buyerName} Order`
            })
          }
        }
      })
    } catch {}
  }

  // Current tasks and assignments
  tasks.forEach(t => {
    if (t.buyer) {
      const key = t.buyer.trim().toUpperCase()
      if (!buyerMap.has(key)) {
        buyerMap.set(key, {
          id: `buyer-task-${key}`,
          buyer_name: t.buyer,
          linked_article_number: t.order_number,
          linked_article_name: t.style_name
        })
      }
    }
  })

  assignments.forEach(a => {
    if (a.buyer) {
      const key = a.buyer.trim().toUpperCase()
      if (!buyerMap.has(key)) {
        buyerMap.set(key, {
          id: `buyer-asn-${key}`,
          buyer_name: a.buyer,
          linked_article_number: a.order_number,
          linked_article_name: a.style_name
        })
      }
    }
  })

  if (buyerMap.size === 0) {
    const DEFAULT_PRESET_BUYERS = [
      { id: 'b-zara', buyer_name: 'Zara International', linked_article_number: 'PO-7715', linked_article_name: 'Heavyweight Boxy Tee' },
      { id: 'b-uo', buyer_name: 'Urban Outfitters', linked_article_number: 'PO-7714', linked_article_name: 'French Terry Hoodie' },
      { id: 'b-tommy', buyer_name: 'Tommy Hilfiger', linked_article_number: 'PO-7717', linked_article_name: 'Pique Heritage Polo' },
      { id: 'b-levi', buyer_name: 'Levi Strauss Co', linked_article_number: 'PO-7716', linked_article_name: 'Denim Overshirt' }
    ]
    DEFAULT_PRESET_BUYERS.forEach(b => buyerMap.set(b.buyer_name.toUpperCase(), b))
  }

  return Array.from(buyerMap.values())
}

export function PackingGoodsClient({
  userEmail,
  isSuperAdmin = true,
  companyName
}: PackingGoodsClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [assignments, setAssignments] = useState<PackingAssignment[]>([])
  const [cartons, setCartons] = useState<ReadyGoodsCarton[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PACKING' | 'PACKED' | 'DISPATCHED'>('ALL')

  // Buyer Filtering & Switcher State
  const [buyers, setBuyers] = useState<any[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('ALL')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)

  const reloadData = () => {
    setWorkers(getReadyGoodsWorkers(companyName))
    setTasks(getFinishingInspectionTasks(companyName))
    setAssignments(getPackingAssignments(companyName))
    setCartons(getReadyGoodsCartons())
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      }
    }
  }, [companyName])

  // WebSocket sync
  useEffect(() => {
    const unsub = subscribeToFloorEvents({
      companyName,
      onRefresh: () => reloadData(),
      onEvent: (event) => {
        reloadData()
        if (event.eventType === 'TASK_ALLOCATED' || event.eventType === 'TASK_VERIFIED') {
          toast.info(event.title, { description: event.message })
        }
      }
    })
    return () => unsub()
  }, [companyName])

  // Merge buyers whenever tasks or assignments update
  useEffect(() => {
    const merged = mergeBuyersFromAllSources(tasks, assignments, companyName)
    setBuyers(merged)
  }, [tasks, assignments, companyName])

  // Active Selected Buyer Resolution
  const activeSelectedBuyerId = selectedBuyerId === 'ALL'
    ? 'ALL'
    : (selectedBuyerId && (buyers.some(b => b.id === selectedBuyerId || b.buyer_name === selectedBuyerId) || tasks.some(t => t.buyer === selectedBuyerId) || assignments.some(a => a.buyer === selectedBuyerId))
        ? selectedBuyerId
        : 'ALL')

  const selectedBuyer = activeSelectedBuyerId === 'ALL'
    ? null
    : (buyers.find(b => b.id === activeSelectedBuyerId || b.buyer_name === activeSelectedBuyerId) || {
        id: activeSelectedBuyerId,
        buyer_name: activeSelectedBuyerId
      })

  // Scoped tasks and assignments for selected buyer
  const buyerTasks = tasks.filter(task => {
    if (activeSelectedBuyerId === 'ALL' || !selectedBuyer) return true
    const selectedName = (selectedBuyer.buyer_name || selectedBuyer.brand_name || '').trim().toLowerCase()
    return (task.buyer || '').trim().toLowerCase() === selectedName
  })

  const buyerAssignments = assignments.filter(asn => {
    if (activeSelectedBuyerId === 'ALL' || !selectedBuyer) return true
    const selectedName = (selectedBuyer.buyer_name || selectedBuyer.brand_name || '').trim().toLowerCase()
    return (asn.buyer || '').trim().toLowerCase() === selectedName
  })

  // Approved lots passed from QC available to pack for this buyer
  const passedFromQcTasks = buyerTasks.filter(t => t.status === 'PASSED_TO_PACKING')
  const totalApprovedPcs = passedFromQcTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  // Active Packers count
  const activePackersCount = workers.filter(w => w.role === 'PACKER' || w.role === 'BOTH').length

  // Total Cartons Packed for this buyer
  const totalCartonsPacked = buyerAssignments
    .filter(a => a.status === 'PACKED_SEALED' || a.status === 'DISPATCHED_TO_GODOWN')
    .reduce((sum, a) => sum + a.cartons_count, 0)

  const totalPiecesPacked = buyerAssignments
    .filter(a => a.status === 'PACKED_SEALED' || a.status === 'DISPATCHED_TO_GODOWN')
    .reduce((sum, a) => sum + a.total_pieces, 0)

  const inPackingPieces = buyerAssignments
    .filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PACKING')
    .reduce((sum, a) => sum + a.total_pieces, 0)

  const totalPackingQueuePieces = totalApprovedPcs + inPackingPieces + totalPiecesPacked
  const packingClearanceRate = totalPackingQueuePieces > 0 ? Math.round((totalPiecesPacked / totalPackingQueuePieces) * 100) : 0

  // Buyer selector text
  const selectedBuyerDisplayText = activeSelectedBuyerId === 'ALL'
    ? `All Buyers (${assignments.length} Assignments • ${totalCartonsPacked} Cartons)`
    : (selectedBuyer 
        ? `${selectedBuyer.buyer_name || selectedBuyer.brand_name} (${buyerAssignments.length} Assignments)`
        : 'Select Buyer')

  const filteredBuyersList = buyers.filter(b => 
    (b.buyer_name || b.brand_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.linked_article_number || '').toLowerCase().includes(buyerSearchQuery.toLowerCase())
  )

  // Filter assignments
  const filteredAssignments = buyerAssignments.filter(asn => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      asn.assignment_code.toLowerCase().includes(q) ||
      asn.order_number.toLowerCase().includes(q) ||
      asn.buyer.toLowerCase().includes(q) ||
      asn.style_name.toLowerCase().includes(q) ||
      asn.packer_worker_name.toLowerCase().includes(q) ||
      asn.carton_prefix.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (statusFilter === 'IN_PACKING') {
      return asn.status === 'ASSIGNED' || asn.status === 'IN_PACKING'
    } else if (statusFilter === 'PACKED') {
      return asn.status === 'PACKED_SEALED'
    } else if (statusFilter === 'DISPATCHED') {
      return asn.status === 'DISPATCHED_TO_GODOWN'
    }
    return true
  })

  const handleMarkPacked = (id: string, code: string) => {
    updatePackingAssignmentStatus(id, 'PACKED_SEALED')
    toast.success(`Assignment #${code} marked as packed & sealed!`)
    reloadData()
  }

  const handleDispatchGodown = (id: string, code: string, bay: string) => {
    updatePackingAssignmentStatus(id, 'DISPATCHED_TO_GODOWN')
    toast.success(`Cartons from #${code} dispatched to Central Godown ${bay}!`)
    reloadData()
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto select-none text-[#09090b]">
      
      {/* 1. Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <Link
                href="/modules"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Workspace Hub</span>
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <Link
            href="/ready-goods"
            className="text-xs font-mono font-bold text-[#3A3564] hover:underline"
          >
            Alteration &amp; Quality Clinic
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Export Packing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ready-goods"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-[#3A3564]" />
            <span>&larr; Alteration &amp; Quality Clinic</span>
          </Link>
        </div>
      </div>

      {/* 2. Module Title Header Card (Spacey, Brand-Aligned & Minimal Words) */}
      <div className="bg-white p-6 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Packing Goods &amp; Carton Allocation
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
              Export carton packing, barcode sealing &amp; godown bay dispatch
            </p>
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-all shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Worker Terminal</span>
          </Link>

          <Link
            href="/ready-goods/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-all shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
        </div>
      </div>

      {/* 3. Selected Buyer Contract & Floor Action Bar */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Left: Active Buyer Info + Dropdown selector */}
        <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#3A3564]" />
          </div>

          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Selected Buyer Contract
            </div>
            <div className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : 'All Buyers & Contracts'}</span>
              {selectedBuyer?.linked_article_number && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  {selectedBuyer.linked_article_number}
                </span>
              )}
            </div>
          </div>

          {/* Buyer Selector Searchable Dropdown */}
          <div className="relative min-w-[220px] sm:min-w-[260px] sm:ml-2">
            <button
              type="button"
              onClick={() => setIsBuyerMenuOpen(!isBuyerMenuOpen)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-[#3A3564]" />
                <span className="truncate">{selectedBuyerDisplayText}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isBuyerMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBuyerMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-black/10 shadow-xl z-40 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={buyerSearchQuery}
                    onChange={e => setBuyerSearchQuery(e.target.value)}
                    placeholder="Search buyers..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5 pt-1">
                  {/* All Buyers Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuyerId('ALL')
                      setIsBuyerMenuOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between border-b border-black/5 mb-1 ${
                      activeSelectedBuyerId === 'ALL'
                        ? 'bg-[#3A3564] text-white font-bold'
                        : 'text-slate-700 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">All Buyers &amp; Contracts</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${activeSelectedBuyerId === 'ALL' ? 'text-indigo-200' : 'text-slate-500'}`}>
                        Show all {assignments.length} assignments
                      </div>
                    </div>
                    {activeSelectedBuyerId === 'ALL' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  {filteredBuyersList.length === 0 ? (
                    <div className="py-3 px-2 text-center text-xs text-slate-400">
                      No buyers found
                    </div>
                  ) : (
                    filteredBuyersList.map(b => {
                      const bName = b.buyer_name || b.brand_name || ''
                      const isSelected = activeSelectedBuyerId === b.id || activeSelectedBuyerId === bName
                      const bAsns = assignments.filter(a => (a.buyer || '').trim().toLowerCase() === bName.trim().toLowerCase())
                      const vol = Number(b.contracted_volume) || (bAsns.length > 0 ? bAsns.reduce((s, a) => s + (a.total_pieces || 0), 0) : 0)

                      return (
                        <button
                          key={b.id || bName}
                          type="button"
                          onClick={() => {
                            setSelectedBuyerId(b.id || bName)
                            setIsBuyerMenuOpen(false)
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#3A3564] text-white font-bold'
                              : 'text-slate-700 hover:bg-[#FAF7F0]'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold">{bName}</div>
                            <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {vol > 0 ? `${vol.toLocaleString('en-IN')} Pcs` : `${bAsns.length} Assignments`} {b.linked_article_number ? `• ${b.linked_article_number}` : ''}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Floor Actions & Refresh Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 justify-end flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsWorkerListOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-mono font-bold text-[#3A3564] transition-all cursor-pointer shadow-2xs"
          >
            <Users className="w-4 h-4 text-[#3A3564]" />
            <span>Workers ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs font-mono font-bold text-[#3A3564] transition-all cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Worker</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign Packing</span>
          </button>

          <button
            type="button"
            onClick={reloadData}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Sync floor data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Summary Metric Boxes (STRICTLY 3 ELEMENTS: Title, Icon, Pure Number ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Box 1: Approved for Packing */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Approved for Packing
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {totalApprovedPcs}
          </div>
        </div>

        {/* Box 2: Active Packers */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Packers
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {activePackersCount}
          </div>
        </div>

        {/* Box 3: Cartons Packed */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Cartons Packed
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {totalCartonsPacked}
          </div>
        </div>

      </div>

      {/* 6. Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignment #, buyer, style, packer..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F0] p-1.5 rounded-xl border border-black/10 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Tasks', count: buyerAssignments.length },
            { id: 'IN_PACKING', label: 'In Packing', count: buyerAssignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PACKING').length },
            { id: 'PACKED', label: 'Packed & Sealed', count: buyerAssignments.filter(a => a.status === 'PACKED_SEALED').length },
            { id: 'DISPATCHED', label: 'In Godown', count: buyerAssignments.filter(a => a.status === 'DISPATCHED_TO_GODOWN').length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Active Packing Floor Allocations Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Packing Assignments &amp; Manifest
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#FAF7F0] text-slate-600 border border-black/5 font-bold">
              {filteredAssignments.length} assignments
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="text-xs text-[#3A3564] font-bold hover:underline cursor-pointer"
          >
            + New Assignment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Assignment #</th>
                <th className="py-3.5 px-5">Order &amp; Buyer</th>
                <th className="py-3.5 px-5">Style &amp; Spec</th>
                <th className="py-3.5 px-5">Assigned Packer</th>
                <th className="py-3.5 px-5">Cartons &amp; Pieces</th>
                <th className="py-3.5 px-5">Godown Bay</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto shadow-2xs">
                        <Boxes className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        No Packing Assignments
                      </h4>
                      <p className="text-xs text-slate-500">
                        Allocate QC-approved garment lots to export cartons for bay staging.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAssignModalOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Assign Packing</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddWorkerOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs font-mono font-bold text-[#3A3564] transition-all cursor-pointer shadow-2xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Add Worker</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(asn => (
                  <tr key={asn.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Assignment Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#3A3564]">#{asn.assignment_code}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Lot: {asn.task_code}</div>
                    </td>

                    {/* Order & Buyer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{asn.buyer}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{asn.order_number}</div>
                    </td>

                    {/* Style & Spec */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">{asn.style_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Size {asn.size} • {asn.color}</div>
                    </td>

                    {/* Assigned Packer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] font-bold text-[10px]">
                          {asn.packer_worker_name.slice(0, 1)}
                        </div>
                        <span className="font-semibold text-slate-800">{asn.packer_worker_name}</span>
                      </div>
                    </td>

                    {/* Cartons & Pieces */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {asn.cartons_count} Cartons • {asn.pieces_per_carton} pcs/ctn
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700 font-bold">
                        Total: {asn.total_pieces} pcs
                      </div>
                    </td>

                    {/* Godown Bay */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800">
                        {asn.target_godown_bay}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {asn.status === 'IN_PACKING' || asn.status === 'ASSIGNED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>In Packing</span>
                        </span>
                      ) : asn.status === 'PACKED_SEALED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Packed &amp; Sealed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          <Warehouse className="w-3 h-3" />
                          <span>In Godown</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {(asn.status === 'ASSIGNED' || asn.status === 'IN_PACKING') && (
                        <button
                          type="button"
                          onClick={() => handleMarkPacked(asn.id, asn.assignment_code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Packed</span>
                        </button>
                      )}

                      {asn.status === 'PACKED_SEALED' && (
                        <button
                          type="button"
                          onClick={() => handleDispatchGodown(asn.id, asn.assignment_code, asn.target_godown_bay)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>Send to Godown</span>
                        </button>
                      )}

                      <span className="text-[11px] font-mono text-slate-400">
                        {asn.carton_numbers[0]}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AssignPackingModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        passedTasks={passedFromQcTasks}
        workers={workers}
        companyName={companyName}
        onAssignmentCreated={() => reloadData()}
      />

      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        companyName={companyName}
        onWorkerAdded={() => reloadData()}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddModal={() => setIsAddWorkerOpen(true)}
        onWorkersUpdated={() => reloadData()}
      />
    </div>
  )
}
