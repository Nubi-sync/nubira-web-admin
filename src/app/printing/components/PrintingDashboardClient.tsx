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
  FileCheck2,
  FileText,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents, broadcastFloorEvent } from '@/utils/floorRealtime'
import { getUnreadNotificationCount, FLOOR_NOTIFICATIONS_UPDATE_EVENT } from '@/utils/floorNotificationsStorage'
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
  getCuttingTaskAllocations,
  mergeCuttingTaskAllocations,
  CUTTING_UPDATE_EVENT
} from '@/app/cutting/utils/cuttingStorage'
import {
  getEmbroideryTaskAllocations,
  mergeEmbroideryTaskAllocations,
  EMBROIDERY_FLOOR_UPDATE_EVENT
} from '@/app/embroidery/utils/embroideryFloorStorage'
import { 
  getActiveBuyers, 
  getOrders, 
  MERCHANDISING_UPDATE_EVENT 
} from '@/app/merchandising/utils/merchandisingStorage'
import { 
  resolveArticleRoute, 
  calculatePrintingRouteDetails, 
  setAndSyncArticleRoute, 
  ALL_ROUTE_OPTIONS, 
  EMBELLISHMENT_ROUTE_CONFIGS, 
  EmbellishmentSequence,
  PrintingRouteDetails
} from '@/utils/manufacturingRouting'
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
import { fetchCuttingTaskAllocationsAction } from '@/app/cutting/actions'
import { fetchEmbroideryTaskAllocationsAction } from '@/app/embroidery/actions'

interface PrintingDashboardClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  initialBuyers?: any[]
  initialWorkers?: PrintingWorker[]
  initialAllocations?: PrintingTaskAllocation[]
  initialCuttingAllocations?: any[]
  initialEmbroideryAllocations?: any[]
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
              if (b.embellishment_sequence && !existing.embellishment_sequence) {
                existing.embellishment_sequence = b.embellishment_sequence
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
                embellishment_sequence: ord.embellishment_sequence || 'PRINT_FIRST_THEN_EMBROIDERY',
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
              if (!existing.embellishment_sequence && ord.embellishment_sequence) {
                existing.embellishment_sequence = ord.embellishment_sequence
              }
            }
          }
        })
      }
    } catch (_) {}
  }

  return Array.from(buyerMap.values())
}

export function PrintingDashboardClient({ 
  userEmail,
  isSuperAdmin = false,
  initialBuyers,
  initialWorkers = [],
  initialAllocations = [],
  initialCuttingAllocations = [],
  initialEmbroideryAllocations = [],
  initialTechPacks = [],
  liveKpis,
  companyName
}: PrintingDashboardClientProps) {
  // Workers & Task Allocations State
  const [serverWorkers, setServerWorkers] = useState<PrintingWorker[]>(initialWorkers || [])
  const [serverAllocations, setServerAllocations] = useState<PrintingTaskAllocation[]>(initialAllocations || [])
  const [serverCuttingAllocations, setServerCuttingAllocations] = useState<any[]>(initialCuttingAllocations || [])
  const [serverEmbroideryAllocations, setServerEmbroideryAllocations] = useState<any[]>(initialEmbroideryAllocations || [])
  const [techPacks, setTechPacks] = useState<any[]>(initialTechPacks || [])
  
  const [workers, setWorkers] = useState<PrintingWorker[]>([])
  const [allocations, setAllocations] = useState<PrintingTaskAllocation[]>([])
  const [cuttingAllocations, setCuttingAllocations] = useState<any[]>([])
  const [embroideryAllocations, setEmbroideryAllocations] = useState<any[]>([])

  // Modal Controls
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'offline'>('offline')

  // Active Buyers for Contract Selection
  const [buyers, setBuyers] = useState<any[]>(() => mergeBuyersFromAllSources(initialBuyers, companyName))
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState(false)
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
    table: string
  } | null>(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)

  // Sync state if props update
  useEffect(() => {
    if (initialWorkers && initialWorkers.length > 0) setServerWorkers(initialWorkers)
  }, [initialWorkers])

  useEffect(() => {
    if (initialAllocations && initialAllocations.length > 0) setServerAllocations(initialAllocations)
  }, [initialAllocations])

  useEffect(() => {
    if (initialCuttingAllocations && initialCuttingAllocations.length > 0) setServerCuttingAllocations(initialCuttingAllocations)
  }, [initialCuttingAllocations])

  useEffect(() => {
    if (initialEmbroideryAllocations && initialEmbroideryAllocations.length > 0) setServerEmbroideryAllocations(initialEmbroideryAllocations)
  }, [initialEmbroideryAllocations])

  useEffect(() => {
    if (initialTechPacks && initialTechPacks.length > 0) setTechPacks(initialTechPacks)
  }, [initialTechPacks])

  // Load and refresh workers, printing task allocations, cutting handover & embroidery data
  const refreshFloorData = () => {
    const localWorkers = getPrintingWorkers(companyName)
    const workerMap = new Map<string, PrintingWorker>()
    serverWorkers.forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, w) })
    localWorkers.forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, { ...(workerMap.get(w.phone_number || w.id) || {}), ...w }) })
    setWorkers(Array.from(workerMap.values()))

    const localTasks = getPrintingTaskAllocations(companyName)
    const mergedTasks = mergePrintingTaskAllocations(serverAllocations, localTasks, companyName)
    setAllocations(mergedTasks)

    const localCutting = getCuttingTaskAllocations(companyName)
    const mergedCutting = mergeCuttingTaskAllocations(serverCuttingAllocations, localCutting, companyName)
    setCuttingAllocations(mergedCutting)

    const localEmbroidery = getEmbroideryTaskAllocations(companyName)
    const mergedEmbroidery = mergeEmbroideryTaskAllocations(serverEmbroideryAllocations, localEmbroidery, companyName)
    setEmbroideryAllocations(mergedEmbroidery)

    const merged = mergeBuyersFromAllSources(initialBuyers, companyName)
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
      window.addEventListener(CUTTING_UPDATE_EVENT, refreshFloorData)
      window.addEventListener(EMBROIDERY_FLOOR_UPDATE_EVENT, refreshFloorData)
      return () => {
        window.removeEventListener('storage', refreshFloorData)
        window.removeEventListener(MERCHANDISING_UPDATE_EVENT, refreshFloorData)
        window.removeEventListener(PRINTING_FLOOR_UPDATE_EVENT, refreshFloorData)
        window.removeEventListener(CUTTING_UPDATE_EVENT, refreshFloorData)
        window.removeEventListener(EMBROIDERY_FLOOR_UPDATE_EVENT, refreshFloorData)
      }
    }
  }, [initialBuyers, serverWorkers, serverAllocations, serverCuttingAllocations, serverEmbroideryAllocations, companyName])

  // Real-time WebSocket sync & notifications subscription
  useEffect(() => {
    setUnreadCount(getUnreadNotificationCount(companyName, 'printing'))
    const handleNotifUpdate = () => {
      setUnreadCount(getUnreadNotificationCount(companyName, 'printing'))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleNotifUpdate)
    }

    const unsub = subscribeToFloorEvents({
      companyName,
      onStatusChange: (status) => setWsStatus(status),
      onRefresh: () => refreshFloorData(),
      onEvent: (event) => {
        refreshFloorData()
        handleNotifUpdate()
        if (event.sourceModule !== 'printing' || event.eventType === 'PROGRESS_SUBMITTED') {
          toast.info(event.title, { description: event.message })
        }
      }
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleNotifUpdate)
      }
      unsub()
    }
  }, [companyName])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const companyFilter = companyName
      const [freshTasks, freshWorkers, freshCutting, freshEmbroidery] = await Promise.all([
        fetchPrintingTaskAllocationsAction(companyFilter),
        fetchPrintingWorkersAction(companyFilter),
        fetchCuttingTaskAllocationsAction(companyFilter),
        fetchEmbroideryTaskAllocationsAction(companyFilter)
      ])
      setServerWorkers(freshWorkers || [])
      setServerAllocations(freshTasks || [])
      setServerCuttingAllocations(freshCutting || [])
      setServerEmbroideryAllocations(freshEmbroidery || [])

      const workerMap = new Map<string, PrintingWorker>()
      freshWorkers.forEach((w: any) => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, w) })
      getPrintingWorkers(companyName).forEach(w => { if (w?.id || w?.phone_number) workerMap.set(w.phone_number || w.id, { ...(workerMap.get(w.phone_number || w.id) || {}), ...w }) })
      setWorkers(Array.from(workerMap.values()))

      const mergedTasks = mergePrintingTaskAllocations(freshTasks || [], getPrintingTaskAllocations(companyName), companyName)
      setAllocations(mergedTasks)

      const mergedCutting = mergeCuttingTaskAllocations(freshCutting || [], getCuttingTaskAllocations(companyName), companyName)
      setCuttingAllocations(mergedCutting)

      const mergedEmbroidery = mergeEmbroideryTaskAllocations(freshEmbroidery || [], getEmbroideryTaskAllocations(companyName), companyName)
      setEmbroideryAllocations(mergedEmbroidery)

      toast.success('Printing floor, workers, and upstream routing synchronized.')
    } catch {
      refreshFloorData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Determine active selected buyer
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
    : localOrders
  const bpoOrdersTotal = matchingBpos.reduce((sum, o) => sum + (Number(o.total_quantity) || 0), 0)
  const totalBpoContractedPieces = selectedBuyer
    ? Math.max(Number(selectedBuyer?.contracted_volume) || 0, bpoOrdersTotal)
    : buyers.reduce((sum, b) => sum + (Number(b.contracted_volume) || 0), 0)
  const articleNum = (selectedBuyer?.linked_article_number || matchingBpos[0]?.style_ref || '').trim().toUpperCase()

  // 1. Resolve Manufacturing Route Sequence for this Buyer & Article
  const activeRoute = resolveArticleRoute(selectedBuyer, articleNum, techPacks, localOrders)
  const activeRouteConfig = EMBELLISHMENT_ROUTE_CONFIGS[activeRoute] || EMBELLISHMENT_ROUTE_CONFIGS['PRINT_FIRST_THEN_EMBROIDERY']

  // 2. Match upstream cutting allocations
  const matchingCuttingAllocations = cuttingAllocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  const totalCutPiecesFromCutting = matchingCuttingAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_cut) || 0), 0)

  // 3. Match upstream/peer embroidery allocations
  const matchingEmbroideryAllocations = embroideryAllocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  const totalCompletedFromEmbroidery = matchingEmbroideryAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_embroider) || 0), 0)

  // 4. Match printing allocations for this buyer/article
  const matchingAllocations = allocations.filter(t => {
    if (!selectedBuyer && !articleNum) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = articleNum ? (t.article_number || '').trim().toUpperCase() === articleNum : false
    return buyerMatch || articleMatch
  })

  const completedPrintingPieces = matchingAllocations
    .filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_print) || 0), 0)

  const pendingPrintingPieces = matchingAllocations
    .filter(t => t.status !== 'VERIFIED_COMPLETED' && t.status !== 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.pieces_to_print) || 0), 0)

  // 5. Calculate Route Details & Strict In Hand Handover
  const routeDetails: PrintingRouteDetails = calculatePrintingRouteDetails({
    route: activeRoute,
    completedCutPieces: totalCutPiecesFromCutting,
    completedEmbroideryPieces: totalCompletedFromEmbroidery,
    pendingPrintingPieces,
    completedPrintingPieces
  })

  const inHandPieces = routeDetails.inHandPieces

  const selectedBuyerDisplayText = selectedBuyer
    ? `${selectedBuyer.buyer_name} (${totalCutPiecesFromCutting.toLocaleString('en-IN')} Cut / ${totalBpoContractedPieces.toLocaleString('en-IN')} BPO)`
    : (activeSelectedBuyerId === 'ALL' ? `All Buyers (${allocations.length} Active Lots)` : (buyers.length === 0 ? 'No Active Buyers Contracted' : 'Select Buyer Contract'))

  // Handler to switch Route sequence on the fly
  const handleSelectRoute = (newRoute: EmbellishmentSequence) => {
    if (!selectedBuyer) return
    setAndSyncArticleRoute(selectedBuyer.id, selectedBuyer.buyer_name, newRoute)
    setIsRouteMenuOpen(false)
    refreshFloorData()
    toast.success(`Routing rule updated to: ${EMBELLISHMENT_ROUTE_CONFIGS[newRoute].shortLabel}`)
  }

  // Filtered Task Allocations for Spreadsheet — dynamically filtered by selected buyer contract
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
      (task.table_number || '').toLowerCase().includes(taskSearchQuery.toLowerCase())

    // 3. Status filter
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

    // Broadcast over floor WebSockets
    broadcastFloorEvent({
      eventType: 'TASK_VERIFIED',
      sourceModule: 'printing',
      targetModule: activeRoute === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'embroidery' : 'stitching',
      companyName,
      title: 'Printing Verified & Completed',
      message: `Task #${taskRef} verified! ${pieces.toLocaleString('en-IN')} printed panels of Article ${taskObj?.article_number || articleNum} ready for ${activeRoute === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'Embroidery Studio' : 'Stitching & Sewing'}.`,
      articleNumber: taskObj?.article_number || articleNum,
      workerName: taskObj?.worker_name,
      pieces,
      taskRef,
      status: 'VERIFIED_COMPLETED'
    })

    toast.success(`Task #${taskRef} verified! ${pieces.toLocaleString('en-IN')} pcs completed and unlocked for ${activeRoute === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'Embroidery Studio' : 'Stitching & Sewing'}.`)
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Workspace Hub</span>
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Division 04 • Printing Studio
          </span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Screen &amp; Digital Print Sync Active
          </span>
        </div>
      </div>

      {/* Module Title Header Card */}
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

      {/* Buyer Selection & Strict Manufacturing Route Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Active Buyer Info Pill + Interactive Route Selector */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Selected Buyer Contract &amp; Route
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{selectedBuyer ? selectedBuyer.buyer_name : 'No Active Buyers'}</span>
              {selectedBuyer?.linked_article_number && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  Article: {selectedBuyer.linked_article_number}
                </span>
              )}

              {/* Route Pill with Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRouteMenuOpen(!isRouteMenuOpen)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] cursor-pointer transition-all shadow-2xs"
                  title="Click to view or change manufacturing process route"
                >
                  <GitBranch className="w-3 h-3 text-[#3A3564]" />
                  <span>Route: {activeRouteConfig.shortLabel}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({routeDetails.badgeLabel})</span>
                  <ChevronDown className={`w-3 h-3 text-[#3A3564] transition-transform ${isRouteMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRouteMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl border border-black/10 shadow-xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-black/5">
                      Select Manufacturing Route
                    </div>
                    {ALL_ROUTE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectRoute(opt.value)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          activeRoute === opt.value
                            ? 'bg-[#3A3564] text-white font-bold'
                            : 'text-slate-700 hover:bg-[#FAF7F0]'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{opt.shortLabel}</div>
                          <div className={`text-[10px] mt-0.5 font-mono ${activeRoute === opt.value ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {opt.flowDescription}
                          </div>
                        </div>
                        {activeRoute === opt.value && <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                    filteredBuyersList.map(b => {
                      const bMatchingCutting = cuttingAllocations.filter(ct => 
                        (ct.buyer_name && b.buyer_name && ct.buyer_name.toLowerCase() === b.buyer_name.toLowerCase()) ||
                        (b.linked_article_number && ct.article_number && ct.article_number.trim().toUpperCase() === b.linked_article_number.trim().toUpperCase())
                      )
                      const bCut = bMatchingCutting
                        .filter(ct => ct.status === 'VERIFIED_COMPLETED' || ct.status === 'COMPLETED')
                        .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_cut) || 0), 0)

                      return (
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
                              {bCut.toLocaleString('en-IN')} Cut Pcs (of {(Number(b.contracted_volume) || 0).toLocaleString('en-IN')} BPO) {b.linked_article_number ? `• ${b.linked_article_number}` : '• Pending Link'}
                            </div>
                          </div>
                          {activeSelectedBuyerId === b.id && <Check className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      )
                    })
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
        
        {/* 1. In Hand (Strict Route Controlled) */}
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
              {!routeDetails.isActive
                ? `0 pcs in hand (Article bypassed in route: ${activeRouteConfig.shortLabel})`
                : inHandPieces > 0 
                  ? `${inHandPieces.toLocaleString('en-IN')} pcs ready from ${routeDetails.sourceDepartment}`
                  : routeDetails.sourceCompletedPieces > 0
                    ? `0 pcs in hand (${routeDetails.sourceCompletedPieces.toLocaleString('en-IN')} pcs assigned to print tables)`
                    : `0 pcs received from ${routeDetails.sourceDepartment} (Awaiting sign-off)`}
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
              {pendingPrintingPieces > 0 ? `${pendingPrintingPieces.toLocaleString('en-IN')} pcs assigned on print tables` : '0 pcs assigned to table'}
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

        {/* 4. Strike Off (Static Placeholder Box) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Strike Off
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
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

          {/* Controls: Search, Status Filters, Add Task Row */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={e => setTaskSearchQuery(e.target.value)}
                placeholder="Search worker, article, table..."
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
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto shadow-2xs">
                <TableProperties className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-800">
                No Matching Printing Tasks
              </div>
              <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
                Allocate article print piece quotas to registered workers. When assigned, pieces move from In Hand to Pending Printing.
              </p>
              <button
                type="button"
                onClick={() => setIsAddTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Task Row</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono uppercase text-[11px] text-slate-600 font-bold tracking-wider">
                  <th className="py-3.5 px-4">Task #</th>
                  <th className="py-3.5 px-4">Worker &amp; Contact</th>
                  <th className="py-3.5 px-4">Buyer &amp; Article</th>
                  <th className="py-3.5 px-4">Station / Table</th>
                  <th className="py-3.5 px-4 text-right">Quota (Pcs)</th>
                  <th className="py-3.5 px-4">Due Target</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action / Sign-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-sans">
                {filteredTasks.map((task) => {
                  const timeline = formatDueTimeline(task.due_time || '', task.alloted_hours)
                  const isVerified = task.status === 'VERIFIED_COMPLETED' || task.status === 'COMPLETED'
                  const isWorkerDone = task.status === 'WORKER_COMPLETED'

                  return (
                    <tr 
                      key={task.id}
                      className={`hover:bg-[#FAF7F0]/60 transition-colors ${
                        isVerified ? 'bg-slate-50/40 opacity-80' : isWorkerDone ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* 1. Task # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3A3564]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 shadow-2xs">
                          #{task.task_ref}
                        </span>
                      </td>

                      {/* 2. Worker */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{task.worker_name}</div>
                        {task.worker_phone && (
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {task.worker_phone}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Buyer & Article */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{task.buyer_name}</div>
                        <div className="text-[11px] font-mono text-[#3A3564] font-semibold">
                          {task.article_number}
                        </div>
                      </td>

                      {/* 4. Table / Station */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-black/10 font-mono font-bold text-slate-700 shadow-2xs">
                          {task.table_number || 'Print Table 01'}
                        </span>
                      </td>

                      {/* 5. Pieces */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {task.pieces_to_print.toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">pcs</span>
                      </td>

                      {/* 6. Due Timeline */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className={`font-semibold flex items-center gap-1.5 ${timeline.isPast && !isVerified ? 'text-rose-600' : 'text-slate-700'}`}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{timeline.formatted}</span>
                        </div>
                      </td>

                      {/* 7. Status Pill */}
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        ) : isWorkerDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] font-bold animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>NEEDS VERIFY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-mono text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3A3564]" />
                            <span>IN PROGRESS</span>
                          </span>
                        )}
                      </td>

                      {/* 8. Action Controls */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isWorkerDone && (
                            <button
                              type="button"
                              onClick={() => handleVerifyAndDone(task.id, task.task_ref, task.pieces_to_print)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                              title="Sign off cured printed pieces and complete task"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify &amp; Done</span>
                            </button>
                          )}

                          {!isWorkerDone && !isVerified && (
                            <span className="text-[11px] font-mono text-slate-400 italic pr-1 whitespace-nowrap">
                              {task.status === 'IN_PROGRESS' ? 'Printing live' : 'Ready on floor'}
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
                              workerName: task.worker_name,
                              buyerName: task.buyer_name,
                              articleNumber: task.article_number,
                              pieces: task.pieces_to_print,
                              table: task.table_number || 'Print Table 01'
                            })}
                            className="p-1.5 rounded-lg border border-black/10 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs"
                            title="Remove task allocation"
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
        companyName={companyName}
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
        routeDetails={routeDetails}
        companyName={companyName}
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
