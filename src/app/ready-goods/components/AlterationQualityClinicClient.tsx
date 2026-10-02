'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wrench,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Check,
  PackageCheck,
  Bot,
  UserPlus,
  Users,
  Printer,
  Sparkles,
  Waves,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Box,
  PackagePlus,
  Trash2,
  RotateCcw,
  Building2,
  ChevronDown,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents } from '@/utils/floorRealtime'
import {
  ReadyGoodsWorker,
  FinishingInspectionTask,
  InspectionTaskStatus
} from '../types/readyGoods'
import {
  getReadyGoodsWorkers,
  getFinishingInspectionTasks,
  updateFinishingInspectionStatus,
  deleteFinishingInspectionTask,
  clearAllReadyGoodsData,
  READY_GOODS_UPDATE_EVENT
} from '../utils/readyGoodsStorage'
import { getActiveBuyers, getOrders } from '@/app/merchandising/utils/merchandisingStorage'
import { AddWorkerModal } from './AddWorkerModal'
import { WorkerListModal } from './WorkerListModal'
import { InspectLotModal } from './InspectLotModal'
import { InwardLotModal } from './InwardLotModal'

interface AlterationQualityClinicClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  companyName?: string
}

function mergeBuyersFromAllSources(tasks: FinishingInspectionTask[], companyName?: string): any[] {
  const buyerMap = new Map<string, any>()

  // 1. Process active buyers from merchandising
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

    // 2. Process orders from merchandising
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

  // 3. Process buyers from current module tasks
  tasks.forEach(t => {
    if (t.buyer) {
      const key = t.buyer.trim().toUpperCase()
      const existing = buyerMap.get(key)
      if (!existing) {
        buyerMap.set(key, {
          id: `buyer-task-${key}`,
          buyer_name: t.buyer,
          linked_article_number: t.order_number,
          linked_article_name: t.style_name
        })
      }
    }
  })

  // 4. Default presets if completely empty (so the user always has suggested buyer tabs to click and test!)
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

export function AlterationQualityClinicClient({
  userEmail,
  isSuperAdmin = true,
  companyName
}: AlterationQualityClinicClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ALTERATION' | 'PASSED'>('ALL')

  // Buyer Filtering & Switcher State
  const [buyers, setBuyers] = useState<any[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('ALL')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')
  
  // Modals
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddLotOpen, setIsAddLotOpen] = useState(false)
  const [selectedTaskToInspect, setSelectedTaskToInspect] = useState<FinishingInspectionTask | null>(null)

  const reloadData = () => {
    setWorkers(getReadyGoodsWorkers(companyName))
    setTasks(getFinishingInspectionTasks(companyName))
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

  // WebSocket real-time subscription
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

  // Update merged buyers whenever tasks change
  useEffect(() => {
    const merged = mergeBuyersFromAllSources(tasks, companyName)
    setBuyers(merged)
  }, [tasks, companyName])

  // Active Selected Buyer Resolution
  const activeSelectedBuyerId = selectedBuyerId === 'ALL'
    ? 'ALL'
    : (selectedBuyerId && (buyers.some(b => b.id === selectedBuyerId || b.buyer_name === selectedBuyerId) || tasks.some(t => t.buyer === selectedBuyerId))
        ? selectedBuyerId
        : 'ALL')

  const selectedBuyer = activeSelectedBuyerId === 'ALL'
    ? null
    : (buyers.find(b => b.id === activeSelectedBuyerId || b.buyer_name === activeSelectedBuyerId) || {
        id: activeSelectedBuyerId,
        buyer_name: activeSelectedBuyerId
      })

  // Scoped tasks for the selected buyer
  const buyerTasks = tasks.filter(task => {
    if (activeSelectedBuyerId === 'ALL' || !selectedBuyer) return true
    const selectedName = (selectedBuyer.buyer_name || selectedBuyer.brand_name || '').trim().toLowerCase()
    return (task.buyer || '').trim().toLowerCase() === selectedName
  })

  // Progress calculations for the active buyer (or overall if 'ALL')
  const totalBuyerLots = buyerTasks.length
  const totalBuyerPieces = buyerTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  const passedTasks = buyerTasks.filter(t => t.status === 'PASSED_TO_PACKING' || t.status === 'PACKED_IN_CARTON')
  const passedPcs = passedTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  const inCheckingTasks = buyerTasks.filter(t => t.status === 'IN_CHECKING')
  const inCheckingPcs = inCheckingTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  const alterationTasks = buyerTasks.filter(t => t.status === 'REJECTED_TO_ALTERATION')
  const alterationPcs = alterationTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  const pendingTasks = buyerTasks.filter(t => t.status === 'PENDING_CHECK')
  const pendingPcs = pendingTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  const inspectionQueueCount = pendingTasks.length + inCheckingTasks.length
  const inspectionQueuePcs = pendingPcs + inCheckingPcs

  const clearanceRate = totalBuyerPieces > 0 ? Math.round((passedPcs / totalBuyerPieces) * 100) : 0

  const passedPct = totalBuyerPieces > 0 ? (passedPcs / totalBuyerPieces) * 100 : 0
  const inCheckingPct = totalBuyerPieces > 0 ? (inCheckingPcs / totalBuyerPieces) * 100 : 0
  const alterationPct = totalBuyerPieces > 0 ? (alterationPcs / totalBuyerPieces) * 100 : 0
  const pendingPct = totalBuyerPieces > 0 ? (pendingPcs / totalBuyerPieces) * 100 : 0

  // Buyer selector text
  const selectedBuyerDisplayText = activeSelectedBuyerId === 'ALL'
    ? `All Buyers (${tasks.length} Lots • ${tasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)} Pcs)`
    : (selectedBuyer 
        ? `${selectedBuyer.buyer_name || selectedBuyer.brand_name} (${totalBuyerLots} Lots • ${totalBuyerPieces} Pcs)`
        : 'Select Buyer')

  const filteredBuyersList = buyers.filter(b => 
    (b.buyer_name || b.brand_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.linked_article_number || '').toLowerCase().includes(buyerSearchQuery.toLowerCase())
  )

  // Filter tasks by active status tab and text search
  const filteredTasks = buyerTasks.filter(task => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      task.task_code.toLowerCase().includes(q) ||
      task.order_number.toLowerCase().includes(q) ||
      task.buyer.toLowerCase().includes(q) ||
      task.style_name.toLowerCase().includes(q) ||
      task.color.toLowerCase().includes(q) ||
      task.wash_batch_ref.toLowerCase().includes(q) ||
      task.iron_station_ref.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (statusFilter === 'PENDING') {
      return task.status === 'PENDING_CHECK' || task.status === 'IN_CHECKING'
    } else if (statusFilter === 'ALTERATION') {
      return task.status === 'REJECTED_TO_ALTERATION'
    } else if (statusFilter === 'PASSED') {
      return task.status === 'PASSED_TO_PACKING' || task.status === 'PACKED_IN_CARTON'
    }
    return true
  })

  // Mark alteration repaired & return to checking
  const handleMarkRepaired = (taskId: string, taskCode: string) => {
    updateFinishingInspectionStatus(taskId, 'IN_CHECKING', {
      origin_stage: 'REPAIRED_ALTERATION_REINSPECTION',
      defect_notes: 'Repaired by Alteration Master Desk - Ready for re-check'
    })
    toast.success(`Lot #${taskCode} marked repaired! Returned to checking queue.`)
    reloadData()
  }

  const handleDeleteTask = (taskId: string, taskCode: string) => {
    if (confirm(`Remove lot #${taskCode} from inspection queue?`)) {
      deleteFinishingInspectionTask(taskId)
      toast.success(`Lot #${taskCode} removed.`)
      reloadData()
    }
  }

  const handleResetAllData = () => {
    if (confirm('Clear all floor test data and reset this module to a completely clean state?')) {
      clearAllReadyGoodsData()
      toast.success('Ready goods floor reset to clean state.')
      reloadData()
    }
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto select-none text-[#09090b]">
      
      {/* Top Welcome / Company Identification */}
      <div className="pt-1">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
          <span className="text-slate-600 font-semibold">Welcome, </span>
          <span className="text-[#0B1220] font-extrabold relative inline-block">
            {companyName || 'Demo Industries'}
            <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#0B1220]/25 rounded-full" />
          </span>
        </h2>
      </div>

      {/* Module Title Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Alteration &amp; <span className="text-[#1D4ED8]">Quality Clinic</span>
              </h1>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                {workers.length} Specialists Registered
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
              Post-wash QC inspection, defect clinic, rework stations &amp; packing clearance
            </p>
          </div>
        </div>

        {/* Quick Utilities in Header */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
          <Link
            href="/ready-goods/packing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0B1220] transition-colors shadow-2xs cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Packing Goods</span>
          </Link>

          <Link
            href="/ready-goods/notifications"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0B1220] transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <span>Notifications</span>
          </Link>

          <Link
            href="/ready-goods/workers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0B1220] transition-colors shadow-2xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Staff List</span>
          </Link>

          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0B1220] transition-colors shadow-2xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Worker Terminal</span>
          </Link>

          <Link
            href="/ready-goods/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#0B1220] transition-colors shadow-2xs cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-slate-500" />
            <span>Zigza AI</span>
          </Link>

          <button
            type="button"
            onClick={handleResetAllData}
            title="Reset Floor to Clean State"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 3. Selected Buyer Contract & Floor Action Bar */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        
        {/* Left: Active Buyer Info + Dropdown selector */}
        <div className="flex items-center gap-3.5 sm:gap-4 flex-wrap sm:flex-nowrap">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>

          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Selected Buyer Contract
            </div>
            <div className="text-base sm:text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : 'All Buyers & Contracts'}</span>
              {selectedBuyer?.linked_article_number && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15">
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
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-black/15 bg-[#F0FDFA] hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-[#0B1220] shrink-0" />
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
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#0B1220]"
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
                        ? 'bg-[#0B1220] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold">All Buyers &amp; Contracts</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${activeSelectedBuyerId === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Show all {tasks.length} lots ({tasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)} pcs)
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
                      const bLots = tasks.filter(t => (t.buyer || '').trim().toLowerCase() === bName.trim().toLowerCase())
                      const bPcs = bLots.reduce((sum, t) => sum + (t.pieces_count || 0), 0)
                      const vol = Number(b.contracted_volume) || bPcs || 0

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
                              ? 'bg-[#0B1220] text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold">{bName}</div>
                            <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {vol > 0 ? `${vol.toLocaleString('en-IN')} Pcs` : `${bLots.length} Lots`} {b.linked_article_number ? `• ${b.linked_article_number}` : ''}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] transition-all cursor-pointer shadow-2xs"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>Workers ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] transition-all cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>+ Worker</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddLotOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ Inward Lot</span>
          </button>

          <button
            type="button"
            onClick={reloadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Sync floor data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Summary Metric Boxes (STRICTLY 3 ELEMENTS: Title, Icon, Pure Number ONLY) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        
        {/* Box 1: Inspection Queue */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Inspection Queue
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/15 bg-[#F0FDFA] text-[#0B1220] flex items-center justify-center shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {inspectionQueueCount}
          </div>
        </div>

        {/* Box 2: Alteration Rework */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Alteration Rework
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/15 bg-[#F0FDFA] text-[#0B1220] flex items-center justify-center shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {alterationTasks.length}
          </div>
        </div>

        {/* Box 3: Passed for Packing */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Passed for Packing
            </span>
            <div className="w-11 h-11 rounded-xl border border-black/15 bg-[#F0FDFA] text-[#0B1220] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {passedTasks.length}
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
            placeholder="Search lot #, buyer, style, wash batch..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#0B1220]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Lots', count: buyerTasks.length },
            { id: 'PENDING', label: 'Pending Check', count: inspectionQueueCount },
            { id: 'ALTERATION', label: 'In Alteration', count: alterationTasks.length },
            { id: 'PASSED', label: 'Passed to Packing', count: passedTasks.length }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#14C8B4] text-[#0B1220] shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-[#0B1220] text-white font-bold' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Incoming Post-Wash & Iron Quality Checking Lots Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Quality Inspection Lots
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-black/15 font-bold">
              {filteredTasks.length} lots
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Check &rarr; Mending &rarr; Pass to Packing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Lot # / Order</th>
                <th className="py-3.5 px-5">Buyer &amp; Style</th>
                <th className="py-3.5 px-5">Pieces &amp; Size</th>
                <th className="py-3.5 px-5">Wash &amp; Iron Origin</th>
                <th className="py-3.5 px-5">Tech-Pack Criteria</th>
                <th className="py-3.5 px-5">Checker</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] mx-auto shadow-2xs">
                        <Scissors className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedBuyer ? `No Lots for ${selectedBuyer.buyer_name || selectedBuyer.brand_name}` : 'Quality Clinic Clear'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Inward incoming garment lots from washing &amp; pressing to begin inspection.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddLotOpen(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-mono font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                        >
                          <PackagePlus className="w-4 h-4" />
                          <span>+ Inward Lot</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddWorkerOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-bold text-slate-700 hover:text-[#0B1220] transition-all cursor-pointer shadow-2xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>+ Add Worker</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isPending = task.status === 'PENDING_CHECK' || task.status === 'IN_CHECKING'
                  const isAlteration = task.status === 'REJECTED_TO_ALTERATION'
                  const isPassed = task.status === 'PASSED_TO_PACKING' || task.status === 'PACKED_IN_CARTON'

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Lot & Order */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#0B1220]">#{task.task_code}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{task.order_number}</div>
                      </td>

                      {/* Buyer & Style */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{task.buyer}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{task.style_name}</div>
                      </td>

                      {/* Pieces & Size */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{task.pieces_count} pcs</div>
                        <div className="text-[11px] text-slate-500 font-mono">Size {task.size} • {task.color}</div>
                      </td>

                      {/* Wash & Iron Origin */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-800">
                          <Waves className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{task.wash_batch_ref}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{task.iron_station_ref}</span>
                        </div>
                      </td>

                      {/* Tech-Pack Criteria */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[240px]">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Cutting
                          </span>
                          {task.has_printing && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
                              Printing
                            </span>
                          )}
                          {task.has_embroidery && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono">
                              Embroidery
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Washing
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Ironing
                          </span>
                        </div>
                      </td>

                      {/* Assigned Checker */}
                      <td className="py-3.5 px-4">
                        {task.checked_by_worker_name ? (
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <div className="w-5 h-5 rounded-full bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[10px] text-[#0B1220]">
                              <Scissors className="w-2.5 h-2.5" />
                            </div>
                            <span>{task.checked_by_worker_name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending Check</span>
                          </span>
                        )}
                        {isAlteration && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>In Alteration</span>
                            </span>
                            {task.defect_category && (
                              <div className="text-[10px] font-mono text-rose-600 truncate max-w-[120px]">
                                {task.defect_category}
                              </div>
                            )}
                          </div>
                        )}
                        {isPassed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passed to Packing</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => setSelectedTaskToInspect(task)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Inspect &amp; Verify</span>
                            </button>
                          )}
                          {isAlteration && (
                            <button
                              type="button"
                              onClick={() => handleMarkRepaired(task.id, task.task_code)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] text-xs font-bold transition-all cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Mark Mended</span>
                            </button>
                          )}
                          {isPassed && (
                            <Link
                              href="/ready-goods/packing"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] text-xs font-bold transition-all cursor-pointer"
                            >
                              <span>Open Packing &rarr;</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id, task.task_code)}
                            title="Remove Lot"
                            className="p-1.5 rounded-lg border border-black/10 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <InwardLotModal
        isOpen={isAddLotOpen}
        onClose={() => setIsAddLotOpen(false)}
        workers={workers}
        companyName={companyName}
        defaultBuyerName={selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : undefined}
        onLotCreated={() => reloadData()}
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

      <InspectLotModal
        isOpen={!!selectedTaskToInspect}
        onClose={() => setSelectedTaskToInspect(null)}
        task={selectedTaskToInspect}
        workers={workers}
        companyName={companyName}
        onInspectionCompleted={() => reloadData()}
      />
    </div>
  )
}
