'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Printer,
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
  Sparkles,
  Flame,
  FileCheck2
} from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/EmptyState'
import { 
  PrintingWorker, 
  PrintingTaskAllocation, 
  PrintingAllocationStatus 
} from '../types/printing'
import {
  getPrintingWorkers,
  savePrintingWorker,
  deletePrintingWorker,
  getPrintingTaskAllocations,
  savePrintingTaskAllocation,
  updatePrintingTaskStatus,
  deletePrintingTaskAllocation,
  mergePrintingTaskAllocations,
  PRINTING_FLOOR_UPDATE_EVENT
} from '../utils/printingFloorStorage'
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
  savePrintingTaskAllocationAction, 
  deletePrintingTaskAllocationAction, 
  fetchPrintingTaskAllocationsAction, 
  fetchPrintingWorkersAction, 
  deletePrintingWorkerAction 
} from '../actions'

interface PrintingDashboardClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  initialBuyers?: any[]
  initialWorkers?: PrintingWorker[]
  initialAllocations?: PrintingTaskAllocation[]
  liveKpis?: any
}

function mergeBuyersFromAllSources(serverBuyers: any[] = []): any[] {
  const buyerMap = new Map<string, any>()

  // 1. Process server buyers
  serverBuyers.forEach(b => {
    if (b && (b.id || b.buyer_name)) {
      const key = (b.buyer_name || b.id).trim().toUpperCase()
      buyerMap.set(key, { ...b })
    }
  })

  // 2. Process localStorage active buyers
  if (typeof window !== 'undefined') {
    try {
      const localBuyers = getActiveBuyers()
      localBuyers.forEach(b => {
        if (b && (b.id || b.buyer_name)) {
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
    } catch {}

    // 3. Process localStorage BPO orders
    try {
      const localOrders = getOrders()
      localOrders.forEach(ord => {
        if (ord && (ord.brand_name || ord.po_number)) {
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
    } catch {}
  }

  return Array.from(buyerMap.values())
}

export function PrintingDashboardClient({ 
  userEmail,
  isSuperAdmin = false,
  initialBuyers,
  initialWorkers = [],
  initialAllocations = [],
  liveKpis
}: PrintingDashboardClientProps) {
  // Workers & Task Allocations State
  const [serverWorkers, setServerWorkers] = useState<PrintingWorker[]>(initialWorkers || [])
  const [serverAllocations, setServerAllocations] = useState<PrintingTaskAllocation[]>(initialAllocations || [])
  const [workers, setWorkers] = useState<PrintingWorker[]>([])
  const [allocations, setAllocations] = useState<PrintingTaskAllocation[]>([])

  // Modal Controls
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  // Active Buyers for Contract Selection
  const [buyers, setBuyers] = useState<any[]>(() => mergeBuyersFromAllSources(initialBuyers))
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Spreadsheet Filters
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'NEEDS_VERIFY' | 'COMPLETED' | 'ALL'>('ACTIVE')

  // Delete Task Modal State
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string
    taskRef: string
    workerName: string
    buyerName: string
    articleNumber: string
    pieces: number
    table: string
  } | null>(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

  // Sync state if props update
  useEffect(() => {
    if (initialWorkers && initialWorkers.length > 0) {
      setServerWorkers(initialWorkers)
    }
  }, [initialWorkers])

  useEffect(() => {
    if (initialAllocations && initialAllocations.length > 0) {
      setServerAllocations(initialAllocations)
    }
  }, [initialAllocations])

  // Load and refresh workers & task allocations
  const refreshFloorData = () => {
    const localWorkers = getPrintingWorkers()
    const workerMap = new Map<string, PrintingWorker>()
    serverWorkers.forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, w) })
    localWorkers.forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, { ...(workerMap.get(w.phone_number || w.id) || {}), ...w }) })
    setWorkers(Array.from(workerMap.values()))

    const localTasks = getPrintingTaskAllocations()
    const mergedTasks = mergePrintingTaskAllocations(serverAllocations, localTasks)
    setAllocations(mergedTasks)

    const merged = mergeBuyersFromAllSources(initialBuyers)
    setBuyers(merged)
  }

  // Delete Worker Handler
  const handleDeleteWorker = async (workerId: string, phone?: string) => {
    const rawDigits = (phone || workerId || '').replace(/\D/g, '')
    const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : ''
    const idClean = workerId.trim().toLowerCase()

    setServerWorkers(prev => prev.filter(w => {
      if (w.id === workerId) return false
      if (w.worker_name && (w.worker_name.toLowerCase() === idClean || idClean.includes(w.worker_name.toLowerCase()))) return false
      if (phone10 && w.phone_number && w.phone_number.includes(phone10)) return false
      return true
    }))

    setWorkers(prev => prev.filter(w => {
      if (w.id === workerId) return false
      if (w.worker_name && (w.worker_name.toLowerCase() === idClean || idClean.includes(w.worker_name.toLowerCase()))) return false
      if (phone10 && w.phone_number && w.phone_number.includes(phone10)) return false
      return true
    }))

    deletePrintingWorker(workerId)
    await deletePrintingWorkerAction(workerId, phone)
  }

  useEffect(() => {
    refreshFloorData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', refreshFloorData)
      window.addEventListener(MERCHANDISING_UPDATE_EVENT, refreshFloorData)
      window.addEventListener(PRINTING_FLOOR_UPDATE_EVENT, refreshFloorData)
      return () => {
        window.removeEventListener('storage', refreshFloorData)
        window.removeEventListener(MERCHANDISING_UPDATE_EVENT, refreshFloorData)
        window.removeEventListener(PRINTING_FLOOR_UPDATE_EVENT, refreshFloorData)
      }
    }
  }, [initialBuyers, serverWorkers, serverAllocations])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const [freshTasks, freshWorkers] = await Promise.all([
        fetchPrintingTaskAllocationsAction(),
        fetchPrintingWorkersAction()
      ])
      setServerWorkers(freshWorkers || [])
      setServerAllocations(freshTasks || [])

      const workerMap = new Map<string, PrintingWorker>()
      freshWorkers.forEach((w: any) => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, w) })
      getPrintingWorkers().forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, { ...(workerMap.get(w.phone_number || w.id) || {}), ...w }) })
      setWorkers(Array.from(workerMap.values()))

      const mergedTasks = mergePrintingTaskAllocations(freshTasks || [], getPrintingTaskAllocations())
      setAllocations(mergedTasks)

      toast.success('Printing floor & worker sync updated from cloud database.')
    } catch {
      refreshFloorData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Determine active selected buyer
  const activeSelectedBuyerId = selectedBuyerId && buyers.some(b => b.id === selectedBuyerId)
    ? selectedBuyerId
    : (buyers[0]?.id || '')

  const selectedBuyer = buyers.find(b => b.id === activeSelectedBuyerId) || (buyers.length > 0 ? buyers[0] : null)

  const filteredBuyersList = buyers.filter(b =>
    (b.buyer_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.buyer_code || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()) ||
    (b.brand_name && b.brand_name.toLowerCase().includes(buyerSearchQuery.toLowerCase())) ||
    (b.linked_article_number && b.linked_article_number.toLowerCase().includes(buyerSearchQuery.toLowerCase()))
  )

  // Piece metrics calculation for the selected buyer & linked article
  const localOrders = typeof window !== 'undefined' ? getOrders() : []
  const matchingBpos = selectedBuyer
    ? localOrders.filter(o => 
        (o.brand_name && (selectedBuyer.buyer_name || selectedBuyer.brand_name) && 
         o.brand_name.toLowerCase() === (selectedBuyer.buyer_name || selectedBuyer.brand_name).toLowerCase()) ||
        (o.buyer_id && o.buyer_id === selectedBuyer.id)
      )
    : []
  const bpoOrdersTotal = matchingBpos.reduce((sum, o) => sum + (Number(o.total_quantity) || 0), 0)
  const totalBpoContractedPieces = Math.max(Number(selectedBuyer?.contracted_volume) || 0, bpoOrdersTotal)
  const articleNum = (selectedBuyer?.linked_article_number || matchingBpos[0]?.style_ref || '').trim().toUpperCase()

  // Match allocations for this buyer/article
  const matchingAllocations = allocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  // 1. COMPLETED PRINTING: Pieces verified and signed off by Head of Dept
  const completedPrintingPieces = matchingAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_print) || 0), 0)

  // 2. PENDING PRINTING: Pieces assigned to worker/table
  const pendingPrintingPieces = matchingAllocations
    .filter(t => t.status !== 'VERIFIED_COMPLETED' && t.status !== 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.pieces_to_print) || 0), 0)

  // 3. IN HAND: Unallocated queue waiting for table assignment
  const inHandPieces = Math.max(0, totalBpoContractedPieces - pendingPrintingPieces - completedPrintingPieces)

  const selectedBuyerDisplayText = selectedBuyer
    ? `${selectedBuyer.buyer_name} (${totalBpoContractedPieces.toLocaleString('en-IN')} Pcs Total)`
    : (buyers.length === 0 ? 'No Active Buyers Contracted' : 'Select Buyer Contract')

  // Filtered Task Allocations for Spreadsheet
  const filteredTasks = allocations.filter(task => {
    const matchesSearch = 
      (task.task_ref || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.worker_name || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.article_number || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.buyer_name || '').toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (task.table_number || '').toLowerCase().includes(taskSearchQuery.toLowerCase())

    let matchesStatus = true
    if (statusFilter === 'ACTIVE') {
      matchesStatus = task.status !== 'VERIFIED_COMPLETED' && task.status !== 'COMPLETED'
    } else if (statusFilter === 'NEEDS_VERIFY') {
      matchesStatus = task.status === 'WORKER_COMPLETED'
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = task.status === 'VERIFIED_COMPLETED' || task.status === 'COMPLETED'
    }
    return matchesSearch && matchesStatus
  })

  // Head of Dept "Verify & Done" Sign-Off Handler
  const handleVerifyAndDone = async (taskId: string, taskRef: string, pieces: number) => {
    const updated = updatePrintingTaskStatus(taskId, 'VERIFIED_COMPLETED', { completed_pieces: pieces, completed_at: new Date().toISOString() })
    setAllocations(updated)
    const taskObj = updated.find(t => t.id === taskId || t.task_ref === taskId)
    if (taskObj) {
      await savePrintingTaskAllocationAction(taskObj)
    }
    toast.success(`Task #${taskRef} verified! ${pieces.toLocaleString('en-IN')} pcs moved from Pending to Completed Printing & Worker Workstation History.`)
  }

  // Delete Task Handler
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return
    try {
      setIsDeletingTask(true)
      const updated = deletePrintingTaskAllocation(taskToDelete.id)
      setAllocations(updated)
      await deletePrintingTaskAllocationAction(taskToDelete.id)
      toast.info(`Task #${taskToDelete.taskRef} removed from allocations.`)
    } catch (err) {
      console.error('Failed to delete task allocation:', err)
      toast.error('Failed to remove task allocation.')
    } finally {
      setIsDeletingTask(false)
      setTaskToDelete(null)
    }
  }

  // Format Due Timeline
  const formatDueTimeline = (isoTime: string, allotedHours: number): { formatted: string; isPast: boolean } => {
    if (!isoTime) return { formatted: `${allotedHours} hrs alloted`, isPast: false }
    try {
      const d = new Date(isoTime)
      const isPast = d.getTime() < Date.now()
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        formatted: `${timeStr}, ${dateStr}`,
        isPast
      }
    } catch {
      return { formatted: `${allotedHours} hrs alloted`, isPast: false }
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <Link
                href="/modules"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Workspace Hub</span>
              </Link>
              <span className="text-slate-400 font-mono text-xs">/</span>
            </>
          )}
          <span className="text-xs font-mono font-bold text-slate-900">Division 04 • Printing Studio</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            Screen &amp; Digital Print Sync Active
          </span>
        </div>
      </div>

      {/* Module Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Screen &amp; Digital Printing Studio
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                {workers.length} Workers Registered
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Screen tables, automatic carousels, DTG stations, shift matrix tracking, and curing sign-offs
            </p>
          </div>
        </div>

        {/* Quick Nav Chips */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Link
            href="/printing/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
          <Link
            href="/printing/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Division Profile</span>
          </Link>
        </div>
      </div>

      {/* Buyer Selection & Worker Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Active Buyer Info Pill */}
        <div className="flex items-center gap-3">
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
                <Users className="w-4 h-4 text-[#3A3564] shrink-0" />
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
                            {(Number(b.contracted_volume) || 0).toLocaleString('en-IN')} Pcs {b.linked_article_number ? `• ${b.linked_article_number}` : '• Pending Link'}
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

      {/* 4 Summary Metric Cards (Printing includes Strike Off) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* 1. In Hand */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              In Hand
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {inHandPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {selectedBuyer ? `${inHandPieces.toLocaleString('en-IN')} unassigned pcs in queue` : 'Unassigned BPO pieces in queue'}
            </p>
          </div>
        </div>

        {/* 2. Pending Printing */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pending Printing
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {pendingPrintingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {pendingPrintingPieces > 0 ? `${pendingPrintingPieces.toLocaleString('en-IN')} pcs assigned on floor` : '0 pcs assigned to table'}
            </p>
          </div>
        </div>

        {/* 3. Completed Printing */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Completed Printing
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              {completedPrintingPieces.toLocaleString('en-IN')}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              {completedPrintingPieces > 0 ? `${completedPrintingPieces.toLocaleString('en-IN')} printed panels verified & cured` : '0 printed panels cured'}
            </p>
          </div>
        </div>

        {/* 4. Strike Off (Static Placeholder Metric Box) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Strike Off
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
              Approved
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Lab color fastness &amp; swatch shade sign-off
            </p>
          </div>
        </div>

      </div>

      {/* SPREADSHEET MATRIX: Worker Shift & Piece Allocation Layout */}
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
                  Printing Floor Task Allocation Matrix
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Distribute article print quotas, assign tables/carousels, and set shift deadline targets
                </p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Add Row Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap justify-end">
            
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={e => setTaskSearchQuery(e.target.value)}
                placeholder="Search worker, article, task..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-hidden focus:border-[#3A3564]"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/10 overflow-x-auto">
              {[
                { id: 'ACTIVE', label: 'Active Queue' },
                { id: 'NEEDS_VERIFY', label: 'Needs Verification' },
                { id: 'COMPLETED', label: 'Verified & Done' },
                { id: 'ALL', label: 'All' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st.id
                      ? 'bg-[#3A3564] text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF7F0]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* + Add Assignment Row Button */}
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Task Row</span>
            </button>

          </div>
        </div>

        {/* Spreadsheet Data Table */}
        <div className="overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center mx-auto text-[#3A3564] mb-3 shadow-2xs">
                <TableProperties className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Matching Printing Tasks</h3>
              <p className="text-xs text-slate-500 font-mono mt-1 max-w-md mx-auto">
                {statusFilter === 'NEEDS_VERIFY'
                  ? 'No tasks currently waiting for Head of Department verification.'
                  : 'Allocate article print piece quotas to registered workers. When assigned, pieces move from In Hand to Pending Printing.'}
              </p>
              {statusFilter === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold shadow-xs cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Task Row</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[11px] tracking-wider border-b border-black/10">
                <tr>
                  <th className="py-3 px-4 font-bold"># Task Ref</th>
                  <th className="py-3 px-4 font-bold">Worker &amp; Contact</th>
                  <th className="py-3 px-4 font-bold">Article &amp; Buyer</th>
                  <th className="py-3 px-4 font-bold">Station / Table</th>
                  <th className="py-3 px-4 font-bold text-right">Pieces to Print</th>
                  <th className="py-3 px-4 font-bold text-center">Alloted Time</th>
                  <th className="py-3 px-4 font-bold">Due Timeline</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {filteredTasks.map(task => {
                  const timeline = formatDueTimeline(task.due_time, task.alloted_hours)
                  const isVerified = task.status === 'VERIFIED_COMPLETED' || task.status === 'COMPLETED'
                  const isWorkerCompleted = task.status === 'WORKER_COMPLETED'
                  const isInProgress = task.status === 'IN_PROGRESS'
                  const isAssigned = task.status === 'ASSIGNED'

                  return (
                    <tr key={task.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      
                      {/* Task Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 text-[#3A3564] font-bold text-xs whitespace-nowrap shadow-2xs">
                          #{task.task_ref}
                        </span>
                      </td>

                      {/* Worker & Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white border border-black/10 flex items-center justify-center font-bold text-xs text-[#3A3564] shadow-2xs shrink-0">
                            {task.worker_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{task.worker_name}</div>
                            {task.worker_phone && (
                              <div className="text-[10px] font-mono text-slate-500">
                                +91 {task.worker_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Article & Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{task.article_number}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {task.buyer_name} • {task.article_name}
                        </div>
                      </td>

                      {/* Table / Station */}
                      <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-bold text-slate-900 shadow-2xs">
                          {task.table_number || 'Print Table 01'}
                        </span>
                      </td>

                      {/* Pieces to Print */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {task.pieces_to_print.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pcs</span>
                        </div>
                      </td>

                      {/* Alloted Timeline */}
                      <td className="py-3.5 px-4 font-mono text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                          <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>{task.alloted_hours} Hrs</span>
                        </div>
                      </td>

                      {/* Due Target Timeline */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {(() => {
                          const due = formatDueTimeline(task.due_time, task.alloted_hours)
                          return (
                            <span className={due.isPast && !isVerified ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'}>
                              {due.formatted}
                            </span>
                          )
                        })()}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isAssigned && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-black/10 text-xs font-mono font-bold">
                            Assigned
                          </span>
                        )}
                        {isInProgress && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-[#3A3564] border border-indigo-200 text-xs font-mono font-bold">
                            <Printer className="w-3.5 h-3.5 text-[#3A3564]" />
                            Printing Live
                          </span>
                        )}
                        {isWorkerCompleted && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-slate-900 border border-black/10 text-xs font-mono font-bold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                            Submitted
                          </span>
                        )}
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-slate-900 border border-black/10 text-xs font-mono font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3A3564]" />
                            Verified &amp; Moved
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isWorkerCompleted && (
                            <button
                              type="button"
                              onClick={() => handleVerifyAndDone(task.id, task.task_ref, task.pieces_to_print)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap"
                              title="Verify work and move pieces from Pending to Completed Printing"
                            >
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>Verify &amp; Done</span>
                            </button>
                          )}

                          {!isWorkerCompleted && !isVerified && (
                            <span className="text-[11px] font-mono text-slate-400 italic pr-1 whitespace-nowrap">
                              {isInProgress ? 'Printing live' : 'Ready on floor'}
                            </span>
                          )}

                          {isVerified && (
                            <span className="text-[11px] font-mono font-bold text-slate-900 pr-1 whitespace-nowrap">
                              ✓ Done
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setTaskToDelete({
                              id: task.id,
                              taskRef: task.task_ref,
                              workerName: task.worker_name || 'Unassigned Worker',
                              buyerName: task.buyer_name || 'General Buyer',
                              articleNumber: task.article_number || 'Style',
                              pieces: Number(task.pieces_to_print) || 0,
                              table: task.table_number || 'Print Table 01'
                            })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete allocation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Spreadsheet Footer Summary */}
        <div className="p-4 bg-slate-50/80 border-t border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 font-mono gap-2">
          <div>
            Showing <strong>{filteredTasks.length}</strong> task allocations across <strong>{workers.length}</strong> registered workers
          </div>
          <div className="flex items-center gap-4">
            <span>In Hand: <strong className="text-slate-900">{inHandPieces.toLocaleString('en-IN')}</strong></span>
            <span>Pending: <strong className="text-slate-900">{pendingPrintingPieces.toLocaleString('en-IN')}</strong></span>
            <span>Completed: <strong className="text-slate-900">{completedPrintingPieces.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

      </div>

      {/* MODALS */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onSuccess={newWorker => {
          refreshFloorData()
        }}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddModal={() => setIsAddWorkerOpen(true)}
        onWorkersUpdated={refreshFloorData}
        onDeleteWorker={handleDeleteWorker}
      />

      <AddTaskAllocationModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        workers={workers}
        selectedBuyer={selectedBuyer}
        availableArticles={buyers.map(b => ({ style_number: b.linked_article_number || 'PRN-101-04', category: 'Garment Print' }))}
        inHandPieces={inHandPieces}
        onOpenAddWorkerModal={() => setIsAddWorkerOpen(true)}
        onSuccess={newTask => {
          refreshFloorData()
        }}
      />

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Remove Task Allocation"
        description={`Are you sure you want to remove Task #${taskToDelete?.taskRef}? Uncompleted pieces will revert back to the In Hand queue.`}
        confirmText="Remove Task"
        cancelText="Keep Task"
        variant="danger"
        isLoading={isDeletingTask}
        onConfirm={handleConfirmDeleteTask}
        onClose={() => {
          if (!isDeletingTask) setTaskToDelete(null)
        }}
      >
        {taskToDelete && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-black/10 text-left space-y-2 mt-2 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-black/5 pb-2">
              <span className="text-slate-500">Task Reference:</span>
              <span className="font-bold text-[#3A3564] bg-white px-2 py-0.5 rounded-md border border-black/10">
                #{taskToDelete.taskRef}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Worker Assigned:</span>
              <span className="font-bold text-slate-800">{taskToDelete.workerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Buyer &amp; Article:</span>
              <span className="font-bold text-slate-800">{taskToDelete.buyerName} ({taskToDelete.articleNumber})</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/5 pt-2">
              <span className="text-slate-500">Pieces to Print:</span>
              <span className="font-bold text-slate-800">{taskToDelete.pieces.toLocaleString('en-IN')} Pcs ({taskToDelete.table})</span>
            </div>
          </div>
        )}
      </ConfirmDialog>

    </div>
  )
}
