'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  TrendingUp,
  Store,
  RefreshCw,
  Building2,
  ChevronDown,
  Printer,
  Trash2,
  Activity,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker, StitchingTaskAllocation, StitchingTaskStatus } from '../types/stitching'
import {
  getStitchingWorkers,
  getStitchingTaskAllocations,
  updateStitchingTaskStatus,
  mergeStitchingTaskAllocations,
  deleteStitchingWorker,
  STITCHING_UPDATE_EVENT
} from '../utils/stitchingFloorStorage'
import {
  fetchStitchingWorkersAction,
  fetchStitchingTaskAllocationsAction,
  updateStitchingTaskStatusAction,
  deleteStitchingTaskAllocationAction
} from '../actions'
import { getActiveBuyers, getOrders, MERCHANDISING_UPDATE_EVENT } from '@/app/merchandising/utils/merchandisingStorage'
import { getCuttingTaskAllocations, CUTTING_UPDATE_EVENT } from '@/app/cutting/utils/cuttingStorage'
import { getPrintingTaskAllocations, PRINTING_FLOOR_UPDATE_EVENT } from '@/app/printing/utils/printingFloorStorage'
import { getEmbroideryTaskAllocations, EMBROIDERY_FLOOR_UPDATE_EVENT } from '@/app/embroidery/utils/embroideryFloorStorage'
import {
  resolveArticleRoute,
  calculateStitchingRouteDetails,
  setAndSyncArticleRoute,
  EMBELLISHMENT_ROUTE_CONFIGS,
  ALL_ROUTE_OPTIONS,
  EmbellishmentSequence,
  StitchingRouteDetails
} from '@/utils/manufacturingRouting'
import { AddWorkerModal } from './AddWorkerModal'
import { WorkerListModal } from './WorkerListModal'
import { AddTaskAllocationModal } from './AddTaskAllocationModal'

interface StitchingDashboardClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  companyName?: string
  initialBuyers?: any[]
  initialWorkers?: StitchingWorker[]
  initialTasks?: StitchingTaskAllocation[]
  initialCuttingAllocations?: any[]
  initialPrintingAllocations?: any[]
  initialEmbroideryAllocations?: any[]
  initialTechPacks?: any[]
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

    // 3. Process localStorage BPO orders
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

            if (!existing) {
              buyerMap.set(key, {
                id: ord.buyer_id || `byr-${key.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                buyer_name: buyerName,
                buyer_code: ord.buyer_code || buyerName.slice(0, 4).toUpperCase(),
                brand_name: buyerName,
                contact_person: 'Procurement Lead',
                contracted_volume: qty,
                linked_article_id: ord.tech_pack_id,
                linked_article_number: ord.style_ref,
                linked_article_name: ord.style_name,
                embellishment_sequence: ord.embellishment_sequence || 'NONE',
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

export function StitchingDashboardClient({
  companyName,
  initialBuyers = [],
  initialWorkers = [],
  initialTasks = [],
  initialCuttingAllocations = [],
  initialPrintingAllocations = [],
  initialEmbroideryAllocations = [],
  initialTechPacks = []
}: StitchingDashboardClientProps) {
  const [workers, setWorkers] = useState<StitchingWorker[]>(initialWorkers)
  const [tasks, setTasks] = useState<StitchingTaskAllocation[]>(initialTasks)
  const [cuttingAllocations, setCuttingAllocations] = useState<any[]>(initialCuttingAllocations)
  const [printingAllocations, setPrintingAllocations] = useState<any[]>(initialPrintingAllocations)
  const [embroideryAllocations, setEmbroideryAllocations] = useState<any[]>(initialEmbroideryAllocations)
  const [techPacks, setTechPacks] = useState<any[]>(initialTechPacks)

  // Active Buyers & Contract Selector
  const [buyers, setBuyers] = useState<any[]>(() => mergeBuyersFromAllSources(initialBuyers, companyName))
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('')
  const [isBuyerMenuOpen, setIsBuyerMenuOpen] = useState(false)
  const [isRouteMenuOpen, setIsRouteMenuOpen] = useState(false)
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('')

  // Filters & Modals
  const [statusFilter, setStatusFilter] = useState<'ALL' | StitchingTaskStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const reloadData = () => {
    const localWorkers = getStitchingWorkers(companyName)
    const localTasks = getStitchingTaskAllocations(companyName)
    const localCutting = getCuttingTaskAllocations(companyName)
    const localPrinting = getPrintingTaskAllocations(companyName)
    const localEmbroidery = getEmbroideryTaskAllocations(companyName)
    const mergedBuyers = mergeBuyersFromAllSources(initialBuyers, companyName)

    // Merge workers
    const workerMap = new Map<string, StitchingWorker>()
    initialWorkers.forEach(w => workerMap.set(w.id, w))
    localWorkers.forEach(w => workerMap.set(w.id, w))
    setWorkers(Array.from(workerMap.values()))

    // Merge tasks
    const merged = mergeStitchingTaskAllocations(initialTasks, localTasks, companyName)
    setTasks(merged)

    setCuttingAllocations(localCutting.length > 0 ? localCutting : initialCuttingAllocations)
    setPrintingAllocations(localPrinting.length > 0 ? localPrinting : initialPrintingAllocations)
    setEmbroideryAllocations(localEmbroidery.length > 0 ? localEmbroidery : initialEmbroideryAllocations)
    setBuyers(mergedBuyers)
  }

  useEffect(() => {
    reloadData()
    if (typeof window !== 'undefined') {
      window.addEventListener(STITCHING_UPDATE_EVENT, reloadData)
      window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
      window.addEventListener(CUTTING_UPDATE_EVENT, reloadData)
      window.addEventListener(PRINTING_FLOOR_UPDATE_EVENT, reloadData)
      window.addEventListener(EMBROIDERY_FLOOR_UPDATE_EVENT, reloadData)
      window.addEventListener('storage', reloadData)
      return () => {
        window.removeEventListener(STITCHING_UPDATE_EVENT, reloadData)
        window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
        window.removeEventListener(CUTTING_UPDATE_EVENT, reloadData)
        window.removeEventListener(PRINTING_FLOOR_UPDATE_EVENT, reloadData)
        window.removeEventListener(EMBROIDERY_FLOOR_UPDATE_EVENT, reloadData)
        window.removeEventListener('storage', reloadData)
      }
    }
  }, [initialWorkers, initialTasks, companyName])

  // Select default buyer
  useEffect(() => {
    if (buyers.length > 0 && !selectedBuyerId) {
      setSelectedBuyerId(buyers[0].id)
    }
  }, [buyers, selectedBuyerId])

  const handleManualRefresh = async () => {
    setIsSyncing(true)
    try {
      const [serverWorkers, serverTasks] = await Promise.all([
        fetchStitchingWorkersAction(companyName),
        fetchStitchingTaskAllocationsAction(companyName)
      ])
      const localWorkers = getStitchingWorkers(companyName)
      const localTasks = getStitchingTaskAllocations(companyName)

      const workerMap = new Map<string, StitchingWorker>()
      ;(serverWorkers || []).forEach(w => workerMap.set(w.id, w))
      localWorkers.forEach(w => workerMap.set(w.id, w))
      setWorkers(Array.from(workerMap.values()))

      const merged = mergeStitchingTaskAllocations(serverTasks || [], localTasks, companyName)
      setTasks(merged)
      toast.success('Stitching floor synchronized with database.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: StitchingTaskStatus) => {
    try {
      updateStitchingTaskStatus(taskId, newStatus, undefined, undefined, companyName)
      await updateStitchingTaskStatusAction(taskId, newStatus)
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}.`)
      reloadData()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this sewing allocation?')) return
    try {
      await deleteStitchingTaskAllocationAction(taskId)
      toast.success('Task allocation removed.')
      reloadData()
    } catch {
      toast.error('Failed to delete task.')
    }
  }

  // ---------------------------------------------------------------------------
  // UPSTREAM ROUTE & IN-HAND READY PIECES RESOLUTION
  // ---------------------------------------------------------------------------
  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId) || (buyers.length > 0 ? buyers[0] : null)
  const activeStyleRef = selectedBuyer?.linked_article_number || selectedBuyer?.buyer_code || ''
  const activeRoute: EmbellishmentSequence = resolveArticleRoute(selectedBuyer, activeStyleRef, techPacks)

  // Calculate completed cut pieces from cutting floor
  const matchingCutting = cuttingAllocations.filter(c => {
    if (!selectedBuyer && !activeStyleRef) return true
    const buyerMatch = selectedBuyer ? (c.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = activeStyleRef ? (c.article_number || '').trim().toUpperCase() === activeStyleRef.trim().toUpperCase() : false
    return buyerMatch || articleMatch
  })
  const totalCutPiecesFromCutting = matchingCutting
    .filter(c => c.status === 'VERIFIED_COMPLETED' || c.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_cut || curr.pieces) || 0), 0)

  // Calculate completed printed panels from printing studio
  const matchingPrinting = printingAllocations.filter(p => {
    if (!selectedBuyer && !activeStyleRef) return true
    const buyerMatch = selectedBuyer ? (p.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = activeStyleRef ? (p.article_number || '').trim().toUpperCase() === activeStyleRef.trim().toUpperCase() : false
    return buyerMatch || articleMatch
  })
  const totalCompletedFromPrinting = matchingPrinting
    .filter(p => p.status === 'VERIFIED_COMPLETED' || p.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_print) || 0), 0)

  // Calculate completed embroidery panels from embroidery studio
  const matchingEmbroidery = embroideryAllocations.filter(e => {
    if (!selectedBuyer && !activeStyleRef) return true
    const buyerMatch = selectedBuyer ? (e.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = activeStyleRef ? (e.article_number || '').trim().toUpperCase() === activeStyleRef.trim().toUpperCase() : false
    return buyerMatch || articleMatch
  })
  const totalCompletedFromEmbroidery = matchingEmbroidery
    .filter(e => e.status === 'VERIFIED_COMPLETED' || e.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_pieces || curr.pieces_to_embroider) || 0), 0)

  // Calculate stitching allocations for active buyer/style
  const matchingStitching = tasks.filter(t => {
    if (!selectedBuyer && !activeStyleRef) return true
    const buyerMatch = selectedBuyer ? (t.buyer_name || '').toLowerCase() === (selectedBuyer.buyer_name || '').toLowerCase() : false
    const articleMatch = activeStyleRef ? (t.article_name || '').trim().toUpperCase() === activeStyleRef.trim().toUpperCase() : false
    return buyerMatch || articleMatch
  })
  const completedStitchingPieces = matchingStitching
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.completed_quantity || curr.target_quantity) || 0), 0)
  const pendingStitchingPieces = matchingStitching
    .filter(t => t.status !== 'COMPLETED')
    .reduce((sum, curr) => sum + (Number(curr.target_quantity) || 0), 0)

  // Compute Stitching Route Details
  const routeDetails: StitchingRouteDetails = calculateStitchingRouteDetails({
    route: activeRoute,
    completedCutPieces: totalCutPiecesFromCutting,
    completedPrintingPieces: totalCompletedFromPrinting,
    completedEmbroideryPieces: totalCompletedFromEmbroidery,
    pendingStitchingPieces,
    completedStitchingPieces
  })

  const inHandPieces = routeDetails.inHandPieces

  // Handler to switch Route sequence on the fly
  const handleSelectRoute = (newRoute: EmbellishmentSequence) => {
    if (!selectedBuyer) return
    setAndSyncArticleRoute(selectedBuyer.id, selectedBuyer.buyer_name, newRoute)
    setIsRouteMenuOpen(false)
    reloadData()
    toast.success(`Routing rule updated to: ${EMBELLISHMENT_ROUTE_CONFIGS[newRoute].shortLabel}`)
  }

  // Derived Metrics
  const totalTargetPieces = tasks.reduce((sum, t) => sum + (t.target_quantity || 0), 0)
  const totalCompletedPieces = tasks.reduce((sum, t) => sum + (t.completed_quantity || 0), 0)
  const activeTailorsCount = workers.filter(w => w.status === 'ACTIVE').length
  const completionRate = totalTargetPieces > 0 ? Math.round((totalCompletedPieces / totalTargetPieces) * 100) : 0

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.task_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.article_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.worker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.buyer_name && t.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false
    if (statusFilter === 'ALL') return true
    return t.status === statusFilter
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
            Workspace Hub
          </Link>
          <span>/</span>
          <span>Division 06</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Stitching & Sewing Assembly Floor</span>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3A3564]' : ''}`} />
          <span className="text-[11px] font-semibold">{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Stitching & Sewing Floor
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Division 06 • Standard Floor
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              Live sewing line assembly & operator allotments directly connected to tech pack routing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => setIsWorkerListOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Manage Tailors ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddTaskOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Sewing Task</span>
          </button>
        </div>
      </div>

      {/* 3. Upstream Tech Pack Handover & Contract Selector Banner */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Buyer & Style Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBuyerMenuOpen(!isBuyerMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs w-full sm:w-auto justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-[#3A3564]" />
                <span className="truncate">
                  {selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : 'All Contracts / Buyers'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isBuyerMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-2 animate-in fade-in zoom-in-95">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search brand or contract..."
                    value={buyerSearchQuery}
                    onChange={(e) => setBuyerSearchQuery(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {buyers
                    .filter(b => (b.buyer_name || b.brand_name || '').toLowerCase().includes(buyerSearchQuery.toLowerCase()))
                    .map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setSelectedBuyerId(b.id)
                          setIsBuyerMenuOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                          selectedBuyerId === b.id ? 'bg-[#FAF7F0] font-bold text-[#3A3564]' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{b.buyer_name || b.brand_name}</span>
                        {b.linked_article_number && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-500">
                            {b.linked_article_number}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Linked Article Ref */}
          {activeStyleRef && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-400 font-medium">Style:</span>
              <span className="font-mono font-bold text-slate-900">{activeStyleRef}</span>
            </div>
          )}
        </div>

        {/* Dynamic Route Info */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          
          {/* Route Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRouteMenuOpen(!isRouteMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
            >
              <span>{routeDetails.badgeLabel}</span>
              <ChevronDown className="w-3 h-3 text-[#3A3564]" />
            </button>

            {isRouteMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-2 animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Change Manufacturing Route
                </div>
                <div className="space-y-1">
                  {ALL_ROUTE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectRoute(opt.value)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeRoute === opt.value
                          ? 'bg-[#3A3564] text-white font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{opt.shortLabel}</div>
                      <div className={`text-[10px] truncate ${activeRoute === opt.value ? 'text-white/80' : 'text-slate-400'}`}>
                        {opt.flowDescription}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* In-Hand Available Stock Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <span className="font-medium">Ready in Hand:</span>
            <span className="font-mono font-bold">{inHandPieces.toLocaleString('en-IN')} pcs</span>
          </div>
        </div>

      </div>

      {/* 4. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Tasks in Queue */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Floor Allocations</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Lots & Tasks
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {tasks.length}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>In-Progress: {tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
            <span>Pending: {tasks.filter(t => t.status === 'PENDING').length}</span>
          </div>
        </div>

        {/* Metric 2: Active Tailors */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Floor Roster</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Tailors
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {activeTailorsCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            {workers.length} tailors on floor roster
          </div>
        </div>

        {/* Metric 3: Output Pieces */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{completionRate}% Completed</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assembled Output
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {totalCompletedPieces.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-400">/ {totalTargetPieces.toLocaleString('en-IN')} pcs</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#3A3564] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Floor Efficiency */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Floor Efficiency</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sewing Completion Rate
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono text-[#3A3564]">
              {completionRate}%
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Across {totalCompletedPieces.toLocaleString('en-IN')} assembled garments
          </div>
        </div>

      </div>

      {/* 5. Main Tasks & Queue Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(tab => {
              const label = tab === 'ALL' ? 'All Allocations' : tab.replace('_', ' ')
              const count = tab === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab).length
              const active = statusFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lot, article, tailor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                <th className="py-3 px-4">Lot / Task Ref</th>
                <th className="py-3 px-4">Article & Brand</th>
                <th className="py-3 px-4">Upstream Source</th>
                <th className="py-3 px-4">Assigned Tailor</th>
                <th className="py-3 px-4">Progress Quota</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto mb-3">
                      <Scissors className="w-6 h-6 text-[#3A3564]" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-heading)]">
                      {searchQuery ? 'No allocations match your filter' : 'No Sewing Tasks Allocated Yet'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click &quot;Assign Sewing Task&quot; above to allocate garment bundles directly to your tailors.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddTaskOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#3A3564] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#2A2649] transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Assign First Sewing Task</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const pct = task.target_quantity > 0
                    ? Math.round(((task.completed_quantity || 0) / task.target_quantity) * 100)
                    : 0

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Lot Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{task.task_ref}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{task.lot_number}</div>
                      </td>

                      {/* Article & Brand */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{task.article_name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{task.buyer_name || 'Direct Production'}</div>
                      </td>

                      {/* Upstream Source */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {task.source_department || 'Cutting Floor'}
                        </span>
                      </td>

                      {/* Tailor */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{task.worker_name}</div>
                        {task.worker_phone && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">+91 {task.worker_phone}</div>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-slate-900">{task.completed_quantity || 0}</span>
                          <span className="text-slate-400 font-mono">/ {task.target_quantity} pcs ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct >= 100 ? 'bg-emerald-500' : 'bg-[#3A3564]'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as StitchingTaskStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 6. Modals */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onSuccess={() => {
          reloadData()
        }}
        companyName={companyName}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddWorker={() => setIsAddWorkerOpen(true)}
        onWorkerDeleted={() => {
          reloadData()
        }}
        companyName={companyName}
      />

      <AddTaskAllocationModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        workers={workers}
        selectedBuyer={selectedBuyer}
        availableBuyers={buyers}
        inHandPieces={inHandPieces}
        sourceDepartment={routeDetails.sourceDepartment}
        routeBadge={routeDetails.badgeLabel}
        onOpenAddWorkerModal={() => setIsAddWorkerOpen(true)}
        onSuccess={() => {
          reloadData()
        }}
        companyName={companyName}
      />

    </div>
  )
}
