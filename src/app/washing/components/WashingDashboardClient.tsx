'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Waves,
  ChevronLeft,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  X,
  AlertCircle,
  Building2,
  Users,
  Search,
  ChevronDown,
  Check,
  ShoppingBag,
  Cpu,
  Bot,
  UserPlus,
  TableProperties,
  Phone,
  Trash2,
  Calendar,
  FlaskConical,
  Droplets,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'
import { FloorNotificationDrawer } from '@/components/notifications/FloorNotificationDrawer'
import { subscribeToFloorEvents, broadcastFloorEvent } from '@/utils/floorRealtime'
import { getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'
import { 
  WashingWorker, 
  WashingTaskAllocation, 
  WashingAllocationStatus 
} from '../types/washing'
import {
  getWashingWorkers,
  saveWashingWorker,
  deleteWashingWorker,
  getWashingTaskAllocations,
  saveWashingTaskAllocation,
  updateWashingTaskStatus,
  deleteWashingTaskAllocation,
  mergeWashingTaskAllocations,
  WASHING_FLOOR_UPDATE_EVENT
} from '../utils/washingFloorStorage'
import {
  getCuttingTaskAllocations,
  mergeCuttingTaskAllocations,
  CUTTING_UPDATE_EVENT
} from '@/app/cutting/utils/cuttingStorage'
import { 
  getActiveBuyers, 
  getOrders, 
  MERCHANDISING_UPDATE_EVENT 
} from '@/app/merchandising/utils/merchandisingStorage'
import { AddWorkerModal } from './AddWorkerModal'
import { WorkerListModal } from './WorkerListModal'
import { AddTaskAllocationModal } from './AddTaskAllocationModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { 
  saveWashingTaskAllocationAction, 
  deleteWashingTaskAllocationAction, 
  fetchWashingTaskAllocationsAction, 
  fetchWashingWorkersAction, 
  deleteWashingWorkerAction 
} from '../actions'
import { fetchCuttingTaskAllocationsAction } from '@/app/cutting/actions'

interface WashingDashboardClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  initialBuyers?: any[]
  initialWorkers?: WashingWorker[]
  initialAllocations?: WashingTaskAllocation[]
  initialCuttingAllocations?: any[]
  initialTechPacks?: any[]
  liveKpis?: any
  companyName?: string
}

function mergeBuyersFromAllSources(serverBuyers: any[] = [], companyName?: string): any[] {
  const buyerMap = new Map<string, any>()

  // 1. Process server buyers
  serverBuyers.forEach(b => {
    if (b && (b.id || b.buyer_name)) {
      const key = (b.buyer_name || b.id).trim().toUpperCase()
      buyerMap.set(key, { ...b })
    }
  })

  // 2. Process localStorage active buyers ONLY if matching tenant company
  if (typeof window !== 'undefined') {
    try {
      const targetCompany = (companyName || '').trim().toLowerCase()
      if (targetCompany) {
        const localBuyers = getActiveBuyers()
        localBuyers.forEach(b => {
          if (b && (b.id || b.buyer_name)) {
            const bCompany = (b.company_name || '').trim().toLowerCase()
            if (bCompany !== targetCompany) return

            const key = (b.buyer_name || b.id).trim().toUpperCase()
            const existing = buyerMap.get(key)
            if (!existing) {
              buyerMap.set(key, { ...b })
            } else {
              if (Number(b.contracted_volume) > Number(existing.contracted_volume || 0)) {
                existing.contracted_volume = b.contracted_volume
              }
              if (b.linked_article_number && !existing.linked_article_number) {
                existing.linked_article_number = b.linked_article_number
                existing.linked_article_name = b.linked_article_name
              }
            }
          }
        })
      }
    } catch {}

    // 3. Process localStorage BPO orders ONLY if matching tenant company
    try {
      const targetCompany = (companyName || '').trim().toLowerCase()
      if (targetCompany) {
        const localOrders = getOrders()
        localOrders.forEach(ord => {
          if (ord && (ord.brand_name || ord.po_number)) {
            const ordCompany = (ord.company_name || '').trim().toLowerCase()
            if (ordCompany !== targetCompany) return

            const buyerName = ord.brand_name || 'Direct Buyer'
            const key = buyerName.trim().toUpperCase()
            const existing = buyerMap.get(key)
            const qty = Number(ord.total_quantity) || 0
            const price = Number(ord.unit_fob_price) || 12.5

            if (!existing) {
              buyerMap.set(key, {
                id: ord.buyer_id || `byr-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                buyer_name: buyerName,
                buyer_code: ord.buyer_code || buyerName.slice(0, 4).toUpperCase(),
                brand_name: buyerName,
                contact_person: 'Procurement Lead',
                contracted_volume: qty,
                price_per_piece: price,
                total_contract_value: qty * price,
                currency: ord.currency || 'INR',
                linked_article_id: ord.tech_pack_id,
                linked_article_number: ord.style_ref,
                linked_article_name: ord.style_name,
                status: 'LINKED',
                company_name: ord.company_name,
                created_at: ord.created_at
              })
            } else {
              if (qty > Number(existing.contracted_volume || 0)) {
                existing.contracted_volume = qty
              }
              if (!existing.linked_article_number && ord.style_ref) {
                existing.linked_article_number = ord.style_ref
                existing.linked_article_name = ord.style_name
              }
            }
          }
        })
      }
    } catch (_) {}
  }

  return Array.from(buyerMap.values())
}

export function WashingDashboardClient({ 
  userEmail,
  isSuperAdmin = false,
  initialBuyers,
  initialWorkers = [],
  initialAllocations = [],
  initialCuttingAllocations = [],
  companyName
}: WashingDashboardClientProps) {
  // Workers & Task Allocations State
  const [workers, setWorkers] = useState<WashingWorker[]>([])
  const [allocations, setAllocations] = useState<WashingTaskAllocation[]>([])
  const [cuttingAllocations, setCuttingAllocations] = useState<any[]>([])

  // Modal Controls
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  // Active Buyers for Contract Selection
  const [buyers, setBuyers] = useState<any[]>(() => mergeBuyersFromAllSources(initialBuyers, companyName))
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Spreadsheet Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'NEEDS_VERIFY' | 'COMPLETED'>('ALL')

  // Delete Task Modal State
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string
    taskRef: string
    workerName: string
    buyerName: string
    articleNumber: string
    pieces: number
    machine: string
  } | null>(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

  // Load and refresh floor state
  const refreshFloorData = () => {
    const loadedWorkers = getWashingWorkers(companyName)
    const mergedAllocations = mergeWashingTaskAllocations(initialAllocations, companyName)
    const mergedCutting = mergeCuttingTaskAllocations(initialCuttingAllocations, getCuttingTaskAllocations(companyName), companyName)
    const mergedBuyers = mergeBuyersFromAllSources(initialBuyers, companyName)

    setWorkers(loadedWorkers)
    setAllocations(mergedAllocations)
    setCuttingAllocations(mergedCutting)
    setBuyers(mergedBuyers)
  }

  useEffect(() => {
    refreshFloorData()

    const handleUpdate = () => refreshFloorData()
    window.addEventListener(WASHING_FLOOR_UPDATE_EVENT, handleUpdate)
    window.addEventListener(CUTTING_UPDATE_EVENT, handleUpdate)
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, handleUpdate)

    return () => {
      window.removeEventListener(WASHING_FLOOR_UPDATE_EVENT, handleUpdate)
      window.removeEventListener(CUTTING_UPDATE_EVENT, handleUpdate)
      window.removeEventListener(MERCHANDISING_UPDATE_EVENT, handleUpdate)
    }
  }, [companyName])

  // Handle Manual Refresh Sync
  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const [serverAlloc, serverWork, serverCut] = await Promise.all([
        fetchWashingTaskAllocationsAction(companyName),
        fetchWashingWorkersAction(companyName),
        fetchCuttingTaskAllocationsAction(companyName)
      ])

      const mergedAlloc = mergeWashingTaskAllocations(serverAlloc, companyName)
      setAllocations(mergedAlloc)
      setWorkers(serverWork)
      setCuttingAllocations(serverCut || [])
      toast.success('Washing floor matrix synchronized with cloud!')
    } catch {
      toast.error('Sync failed, using offline state.')
    } finally {
      setIsSyncing(false)
    }
  }

  // Active Buyer selection resolution
  const activeSelectedBuyerId = selectedBuyerId === 'ALL'
    ? 'ALL'
    : (selectedBuyerId && buyers.some(b => b.id === selectedBuyerId)
        ? selectedBuyerId
        : (buyers[0]?.id || ''))

  const selectedBuyer = activeSelectedBuyerId === 'ALL'
    ? null
    : (buyers.find(b => b.id === activeSelectedBuyerId) || (buyers.length > 0 ? buyers[0] : null))

  const filteredBuyersList = buyers.filter(b => 
    (b.buyer_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.buyer_code || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.linked_article_number || '').toLowerCase().includes(buyerSearchQuery.toLowerCase())
  )

  // Calculate In Hand, Pending, and Completed metrics
  let localOrders: any[] = []
  if (typeof window !== 'undefined') {
    localOrders = getOrders().filter(o => {
      if (!companyName) return true
      return (o.company_name || '').trim().toLowerCase() === companyName.trim().toLowerCase()
    })
  }

  const matchingBpos = selectedBuyer
    ? localOrders.filter(o => 
        (o.brand_name && (selectedBuyer.buyer_name || selectedBuyer.brand_name) && 
         o.brand_name.toLowerCase() === (selectedBuyer.buyer_name || selectedBuyer.brand_name).toLowerCase()) ||
        (o.buyer_id && o.buyer_id === selectedBuyer.id)
      )
    : localOrders

  const bpoOrdersTotal = matchingBpos.reduce((sum, o) => sum + (Number(o.total_quantity) || 0), 0)
  const totalBpoContractedPieces = selectedBuyer
    ? Math.max(Number(selectedBuyer?.contracted_volume) || 0, bpoOrdersTotal)
    : buyers.reduce((sum, b) => sum + (Number(b.contracted_volume) || 0), 0)
  const articleNum = (selectedBuyer?.linked_article_number || matchingBpos[0]?.style_ref || '').trim().toUpperCase()

  // Match upstream cut pieces
  const matchingCuttingAllocations = cuttingAllocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  const totalCutPieces = matchingCuttingAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_cut) || 0), 0)

  // Match washing allocations
  const matchingAllocations = allocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  const completedWashingPieces = matchingAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_wash) || 0), 0)

  const pendingWashingPieces = matchingAllocations
    .filter(t => t.status !== 'VERIFIED_COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.pieces_to_wash) || 0), 0)

  // In Hand = Total completed upstream pieces minus assigned/completed in washing
  const assignedOrCompletedWashing = matchingAllocations.reduce((sum, curr) => sum + Number(curr.pieces_to_wash || 0), 0)
  const inHandPieces = Math.max(0, (totalCutPieces || totalBpoContractedPieces) - assignedOrCompletedWashing)

  const selectedBuyerDisplayText = selectedBuyer
    ? `${selectedBuyer.buyer_name} (${(totalCutPieces || totalBpoContractedPieces).toLocaleString('en-IN')} Pcs Contracted)`
    : (activeSelectedBuyerId === 'ALL' ? `All Buyers (${allocations.length} Active Lots)` : (buyers.length === 0 ? 'No Active Buyers Contracted' : 'Select Buyer Contract'))

  // Filtered Task Allocations for Spreadsheet Table — dynamically filtered by selected buyer contract
  const filteredTasks = allocations.filter(task => {
    // 1. Dynamic Buyer & Article Filter
    if (selectedBuyer) {
      const selectedBuyerName = (selectedBuyer.buyer_name || selectedBuyer.brand_name || '').trim().toLowerCase()
      const taskBuyerName = (task.buyer_name || '').trim().toLowerCase()
      const taskBuyerId = task.buyer_id || ''
      const taskArticle = (task.article_number || '').trim().toUpperCase()

      const matchesBuyer = (
        (taskBuyerId && taskBuyerId === selectedBuyer.id) ||
        (selectedBuyerName && taskBuyerName && taskBuyerName === selectedBuyerName) ||
        (articleNum && taskArticle && taskArticle === articleNum)
      )

      if (!matchesBuyer) return false
    }

    // 2. Search query filter
    const matchesSearch = 
      (task.task_ref || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.worker_name || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.article_number || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.buyer_name || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.table_number || task.machine_number || '').toLowerCase().includes(taskSearchQuery.toLowerCase())

    // 3. Status filter
    let matchesStatus = true
    if (statusFilter === 'ACTIVE') {
      matchesStatus = task.status !== 'VERIFIED_COMPLETED'
    } else if (statusFilter === 'NEEDS_VERIFY') {
      matchesStatus = task.status === 'WORKER_COMPLETED'
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = task.status === 'VERIFIED_COMPLETED'
    }
    return matchesSearch && matchesStatus
  })

  // Verify & Done Sign-Off Handler
  const handleVerifyAndDone = async (taskId: string, taskRef: string, pieces: number) => {
    const updated = updateWashingTaskStatus(taskId, 'VERIFIED_COMPLETED', { completed_pieces: pieces, completed_at: new Date().toISOString() })
    setAllocations(updated)
    const taskObj = updated.find(t => t.id === taskId || t.task_ref === taskId)
    if (taskObj) {
      await saveWashingTaskAllocationAction(taskObj)
    }
    toast.success(`Task #${taskRef} verified! ${pieces.toLocaleString('en-IN')} pcs washed & dried successfully.`)
  }

  // Delete Task Handler
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      setIsDeletingTask(true)
      const updated = deleteWashingTaskAllocation(taskToDelete.id)
      setAllocations(updated)
      await deleteWashingTaskAllocationAction(taskToDelete.id)
      toast.info(`Task #${taskToDelete.taskRef} removed from allocations.`)
    } catch (err) {
      console.error('Failed to delete task allocation:', err)
      toast.error('Failed to remove task allocation.')
    } finally {
      setIsDeletingTask(false)
      setTaskToDelete(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Navigation Breadcrumb */}
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
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Division 07 • Wet Processing &amp; Laundry
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tumbler &amp; Hydro Sync Active
          </span>
        </div>
      </div>

      {/* Module Title Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Industrial Washing Floor
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                {workers.length} Washers Registered
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Enzyme bio-polishing, silicon softening, 1:5.0 liquor ratio management, and hydro-dryer piece allocations
            </p>
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href="/washing/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
          <Link
            href="/washing/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Division Profile</span>
          </Link>
        </div>
      </div>

      {/* Buyer Selection & Workstation Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Active Buyer Info Pill */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Selected Buyer Contract
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{selectedBuyer ? selectedBuyer.buyer_name : 'No Active Buyers'}</span>
              {selectedBuyer?.linked_article_number && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  Article: {selectedBuyer.linked_article_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Buyer Dropdown + View Worker List + Add Worker Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
          
          {/* Buyer Selector Searchable Dropdown */}
          <div className="relative min-w-[220px] sm:min-w-[260px]">
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
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-black/10 shadow-xl z-30 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
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
                        Show all {allocations.length} floor task allocations
                      </div>
                    </div>
                    {activeSelectedBuyerId === 'ALL' && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>

                  {filteredBuyersList.length === 0 ? (
                    <div className="py-3 px-2 text-center text-xs text-slate-400">
                      No buyers found
                    </div>
                  ) : (
                    filteredBuyersList.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBuyerId(b.id)
                          setIsBuyerMenuOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                          activeSelectedBuyerId === b.id
                            ? 'bg-[#3A3564] text-white font-bold'
                            : 'text-slate-700 hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold">{b.buyer_name}</div>
                          <div className={`text-[10px] font-mono mt-0.5 ${activeSelectedBuyerId === b.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {(Number(b.contracted_volume) || 0).toLocaleString('en-IN')} BPO Pcs {b.linked_article_number ? `• ${b.linked_article_number}` : ''}
                          </div>
                        </div>
                        {activeSelectedBuyerId === b.id && <Check className="w-4 h-4 text-white shrink-0" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Button 1: View Worker List */}
          <button
            type="button"
            onClick={() => setIsWorkerListOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-mono font-bold text-slate-800 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Users className="w-4 h-4 text-[#3A3564]" />
            <span>View Worker List ({workers.length})</span>
          </button>

          {/* Button 2: Add Worker */}
          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Worker</span>
          </button>

          {/* Refresh Sync Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Sync latest live floor updates"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* 3 Summary Metric Cards (Washing 3-box design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* 1. In Hand */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              In Hand
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {inHandPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {inHandPieces > 0
                ? `${inHandPieces.toLocaleString('en-IN')} pcs ready for wash recipe loading`
                : '0 pcs in hand (All cut pieces allocated to washers)'}
            </p>
          </div>
        </div>

        {/* 2. Processing (Pending Washing) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Processing / In Progress
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {pendingWashingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {pendingWashingPieces > 0
                ? `${pendingWashingPieces.toLocaleString('en-IN')} pcs running in wash tumblers & hydro dryers`
                : '0 pcs in active washing cycles'}
            </p>
          </div>
        </div>

        {/* 3. Complete (Verified Washed) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Complete / Verified
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Waves className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {completedWashingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {completedWashingPieces > 0
                ? `${completedWashingPieces.toLocaleString('en-IN')} washed panels verified & moisture tested`
                : '0 washed panels verified'}
            </p>
          </div>
        </div>

      </div>

      {/* SPREADSHEET MATRIX: Washing Floor Task Allocation Layout */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xs overflow-hidden space-y-0">
        
        {/* Spreadsheet Header Bar */}
        <div className="p-5 sm:p-6 border-b border-black/10 bg-[#FAF7F0]/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                <TableProperties className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Washing Floor Task Allocation Matrix
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Distribute garment washing batches, assign hydro-dryers, and set shift completion targets
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Search, Status Filters, Add Task Row */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={e => setTaskSearchQuery(e.target.value)}
                placeholder="Search worker, article, machine..."
                className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-hidden focus:border-[#3A3564] font-mono"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Queue
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('NEEDS_VERIFY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'NEEDS_VERIFY'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Needs Verification
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verified &amp; Done
              </button>
            </div>

            {/* Add Task Row Button */}
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Task Row</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAF7F0]/80 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Task Ref</th>
                <th className="py-3 px-4">Buyer / Brand</th>
                <th className="py-3 px-4">Article No</th>
                <th className="py-3 px-4">Washer Operator</th>
                <th className="py-3 px-4">Machine / Tumbler</th>
                <th className="py-3 px-4 text-right">Target Pcs</th>
                <th className="py-3 px-4 text-right">Completed Pcs</th>
                <th className="py-3 px-4">Wash Recipe</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-mono">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Waves className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <div className="text-sm font-bold text-slate-600">No washing task allocations found</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Click &quot;+ Add Task Row&quot; above to allocate garment batches to washing operators.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      #{task.task_ref}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                      {task.buyer_name}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#3A3564]">
                      {task.article_number}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700">
                      <div className="font-bold">{task.worker_name}</div>
                      {task.worker_phone && (
                        <div className="text-[10px] text-slate-400 font-mono">+91 {task.worker_phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {task.table_number || task.machine_number || 'Washer 01'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {task.pieces_to_wash.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {(task.completed_pieces || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {task.wash_recipe || 'Bio-Enzyme Wash 55°C'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        task.status === 'VERIFIED_COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : task.status === 'WORKER_COMPLETED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'WORKER_COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyAndDone(task.id, task.task_ref, task.pieces_to_wash)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify &amp; Done</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setTaskToDelete({
                            id: task.id,
                            taskRef: task.task_ref,
                            workerName: task.worker_name,
                            buyerName: task.buyer_name,
                            articleNumber: task.article_number,
                            pieces: task.pieces_to_wash,
                            machine: task.table_number || 'Washer 01'
                          })}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete task allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onSuccess={() => {
          refreshFloorData()
        }}
        companyName={companyName}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddModal={() => setIsAddWorkerOpen(true)}
        onWorkersUpdated={() => {
          refreshFloorData()
        }}
      />

      <AddTaskAllocationModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        workers={workers}
        selectedBuyer={selectedBuyer}
        inHandPieces={inHandPieces}
        onSuccess={() => {
          refreshFloorData()
        }}
        onOpenAddWorkerModal={() => setIsAddWorkerOpen(true)}
        companyName={companyName}
      />

      {/* Confirm Delete Task Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Remove Task Allocation?"
        description={`Are you sure you want to remove task #${taskToDelete?.taskRef} (${taskToDelete?.pieces.toLocaleString('en-IN')} pcs of ${taskToDelete?.articleNumber} assigned to ${taskToDelete?.workerName})?`}
        confirmText={isDeletingTask ? 'Removing...' : 'Remove Task'}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingTask}
        onConfirm={handleConfirmDeleteTask}
        onClose={() => setTaskToDelete(null)}
      />

    </div>
  )
}
