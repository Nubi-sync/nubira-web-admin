'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import React, { useState, useMemo, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateAllotmentStatus, deleteAllotment } from '../actions'
import { 
  Trash2,
  X,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  PhoneCall,
  AlertOctagon,
  Flame,
  Calendar,
  Gauge, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Layers,
  AlertTriangle,
  FileText,
  Users,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import { WorkerAssignmentsTable, type WorkerAssignmentItem } from '@/app/components/WorkerAssignmentsTable'

export type VariantItem = {
  id: string
  allotment_id: string
  color: string
  size: string
  quantity: number
  completed_qty?: number
}

const SIZE_ORDER_MAP: Record<string, number> = {
  '3XS': 1, '2XS': 2, 'XXS': 3, 'XS': 4, 'S': 5, 'M': 6, 'L': 7,
  'XL': 8, 'XXL': 9, '2XL': 9, '3XL': 10, 'XXXL': 10, '4XL': 11, '5XL': 12, '6XL': 13,
  'FREE': 99, 'FS': 99, 'STANDARD': 99
}

function sortSizesNaturally(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const aClean = a.trim().toUpperCase()
    const bClean = b.trim().toUpperCase()
    const aOrder = SIZE_ORDER_MAP[aClean]
    const bOrder = SIZE_ORDER_MAP[bClean]
    if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder
    if (aOrder !== undefined) return -1
    if (bOrder !== undefined) return 1
    const aNum = parseInt(aClean, 10)
    const bNum = parseInt(bClean, 10)
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum
    return aClean.localeCompare(bClean, undefined, { numeric: true, sensitivity: 'base' })
  })
}

export type MaterialItem = {
  id: string
  allotment_id: string
  item_name: string
  required_qty: string
  admin_issued: boolean
  lineman_received: boolean
  lineman_received_at?: string | null
  notes?: string | null
}

export type Allotment = {
  id: string
  lineman_id: string
  article_id: string
  target_qty: number
  achieved_qty?: number
  allotment_date: string
  status: string
  mending_status?: string | null
  mending_total_counted?: number | null
  mending_supervisor_name?: string | null
  mending_supervisor_id?: string | null
  handed_to_mending_by?: string | null
  handed_to_mending_at?: string | null
  mending_handover_notes?: string | null
  qc_status?: string | null
  qc_total_passed?: number | null
  qc_total_alter?: number | null
  qc_supervisor_name?: string | null
  handed_to_qc_by?: string | null
  handed_to_qc_at?: string | null
  production_order_no?: string
  manager_name?: string
  due_date?: string
  target_hours?: number
  priority?: 'NORMAL' | 'RUSH' | 'CRITICAL'
  client_challan_no?: string
  sample_photos?: string[]
  profiles: { username: string }
  articles: { art_no: string; description?: string; stitching_rate?: number | string }
  variants?: VariantItem[]
  materials?: MaterialItem[]
  assignments?: WorkerAssignmentItem[]
}

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type SortField = 'date' | 'progress'
type SortOrder = 'asc' | 'desc'


export type InspectionData = {
  received_qty?: string
  status?: 'PENDING' | 'VERIFIED' | 'SHORTAGE' | 'DEFECTIVE'
  shortage_qty?: string
  supplier_challan_no?: string
  client_challan_no?: string
  source?: 'CLIENT' | 'FACTORY_STORE'
  sample_photos?: string[]
  store_verified?: boolean
  store_verified_at?: string
  store_remarks?: string
}

function parseInspection(notes?: string | null): InspectionData | null {
  if (!notes) return null
  try {
    const data = JSON.parse(notes)
    if (data && (data.store_verified !== undefined || data.status || data.supplier_challan_no)) {
      return data as InspectionData
    }
  } catch (_) {}
  return null
}

function cleanDescription(desc?: string) {
  if (!desc) return 'Garment'
  return desc.replace(/\s*\[.*\]/g, '').trim() || 'Garment'
}


export function AllotmentList({ allotments = [] }: { allotments: Allotment[] }) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)

  // Real-time live synchronization with mobile floor apps
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime-allotments-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotments' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_assignments' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotment_variants' }, () => {
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotment_materials' }, () => {
        router.refresh()
      })
      .subscribe()

    // 15-second background auto-poll fallback
    const interval = setInterval(() => {
      router.refresh()
    }, 15000)

    // Window focus refresh
    const onFocus = () => {
      router.refresh()
    }
    window.addEventListener('focus', onFocus)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [router])

  const handleManualSync = () => {
    setIsSyncing(true)
    router.refresh()
    setTimeout(() => {
      setIsSyncing(false)
    }, 800)
  }

  // Active Floor SOS Alerts Radar
  const [activeAlerts, setActiveAlerts] = useState<Array<{
    id: string
    line: string
    poNo: string
    category: string
    station: string
    time: string
    desc: string
  }>>([])

  const [expandedId, setExpandedId] = useState<string | null>(null)
  type DrawerTab = 'matrix' | 'workers' | 'materials' | 'all'
  const [drawerTabs, setDrawerTabs] = useState<Record<string, DrawerTab>>({})
  const [deletingAllotment, setDeletingAllotment] = useState<Allotment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusDialog, setStatusDialog] = useState<{ isOpen: boolean; allotment: Allotment | null; newStatus: string }>({ isOpen: false, allotment: null, newStatus: '' })
  const [isStatusLoading, setIsStatusLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Functional table controls
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  async function executeStatusChange() {
    if (!statusDialog.allotment) return
    setIsStatusLoading(true)
    try {
      const res = await updateAllotmentStatus(statusDialog.allotment.id, statusDialog.newStatus)
      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        setStatusDialog({ isOpen: false, allotment: null, newStatus: '' })
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to update status')
    } finally {
      setIsStatusLoading(false)
    }
  }

  async function confirmDeleteAllotment() {
    if (!deletingAllotment) return
    setIsDeleting(true)
    try {
      const res = await deleteAllotment(deletingAllotment.id)
      if (res?.error) {
        setErrorMessage(res.error)
      } else {
        setDeletingAllotment(null)
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to delete allotment')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Filtered and Sorted list
  const filteredAllotments = useMemo(() => {
    let list = [...allotments]

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(a => {
        const art = (a.articles?.art_no || '').toLowerCase()
        const desc = (a.articles?.description || '').toLowerCase()
        const lineman = (a.profiles?.username || '').toLowerCase()
        const date = (a.allotment_date || '').toLowerCase()
        const orderNo = (a.production_order_no || '').toLowerCase()
        const variantColors = (a.variants || []).map((v: any) => (v.color || '').toLowerCase()).join(' ')
        return art.includes(q) || desc.includes(q) || lineman.includes(q) || date.includes(q) || orderNo.includes(q) || variantColors.includes(q)
      })
    }

    // 2. Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(a => a.status === statusFilter)
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.allotment_date || 0).getTime()
        const dateB = new Date(b.allotment_date || 0).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortField === 'progress') {
        const progA = ((a.achieved_qty || 0) / (a.target_qty || 1))
        const progB = ((b.achieved_qty || 0) / (b.target_qty || 1))
        return sortOrder === 'asc' ? progA - progB : progB - progA
      }
      return 0
    })

    return list
  }, [allotments, searchQuery, statusFilter, sortField, sortOrder])

  // Pagination calculation
  const totalItems = filteredAllotments.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedAllotments = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAllotments.slice(start, start + pageSize)
  }, [filteredAllotments, currentPage, pageSize])

  return (
    <div 
      className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
    >
      {/* Header with dynamic Count Badge */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 
            className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900"
          >
            Active Allotments & Handover Status
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Tracking size ratios & raw materials issued to lines
          </p>
        </div>

        {/* Dynamic Allotments Count Pill & Live Sync Indicator */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="hidden sm:inline">Live Sync</span>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="Refresh latest factory data"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3A3564]' : ''}`} />
          </button>

          <div 
            className="text-xs font-bold px-3 py-1 rounded-full border border-black/10 bg-[#FAF7F0] text-[#3A3564] max-w-max shadow-2xs"
          >
            {filteredAllotments.length} {filteredAllotments.length === 1 ? 'Allotment' : 'Allotments'}
          </div>
        </div>
      </div>

      {/* Toolbar: Search Box & Status Filter Chips */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by article, lineman, or date..."
            className="w-full pl-10 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as StatusFilter[]).map((st) => {
            const isSelected = statusFilter === st
            const labelMap = { ALL: 'All', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer outline-none ${
                  isSelected
                    ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {labelMap[st]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
          <thead>
            <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
              
              {/* Sortable Date & Lineman */}
              <th 
                onClick={() => handleSort('date')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date & Lineman</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </th>

              <th className="px-4 py-3.5">Article</th>
              <th className="px-4 py-3.5">Size & Color Ratio</th>
              <th className="px-4 py-3.5">Material Handover</th>
              
              {/* Sortable Progress */}
              <th 
                onClick={() => handleSort('progress')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Progress</span>
                  {sortField === 'progress' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                  ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </th>

              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedAllotments.length > 0 ? (
              paginatedAllotments.map((al) => {
                const isExpanded = expandedId === al.id
                const variants = al.variants || []
                const materials = al.materials || []
                const percent = Math.min(100, Math.round(((al.achieved_qty || 0) / (al.target_qty || 1)) * 100))

                return (
                  <Fragment key={al.id}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpanded ? 'bg-slate-50/80 border-b-0' : ''
                      }`}
                    >
                      {/* Date & Lineman */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">
                          {al.profiles?.username || 'Lineman'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {al.allotment_date || 'N/A'}
                        </span>
                      </td>

                      {/* Article & Description */}
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 font-mono">
                          {al.articles?.art_no || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                          {cleanDescription(al.articles?.description)}
                        </div>
                      </td>

                      {/* Size & Color Ratio with Toggle Drawer Button */}
                      <td className="px-4 py-3.5">
                        {variants.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(al.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                            <span>{variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Single Variant</span>
                        )}
                      </td>

                      {/* Material Handover Badge */}
                      <td className="px-4 py-3.5">
                        {materials.length > 0 ? (() => {
                          const allMaterialsReceived = materials.every(m => m.lineman_received)
                          const shortages = materials.filter(m => {
                            const insp = parseInspection(m.notes)
                            return insp?.status === 'SHORTAGE' || insp?.status === 'DEFECTIVE'
                          })
                          const isStoreVerified = materials.some(m => {
                            const insp = parseInspection(m.notes)
                            return insp?.store_verified || m.admin_issued
                          })

                          if (shortages.length > 0) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 animate-pulse"
                                title="Store reported material shortage or defective items"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Shortage ({shortages.length})</span>
                              </span>
                            )
                          }

                          if (allMaterialsReceived) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-800"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>100% Handover Complete</span>
                              </span>
                            )
                          }

                          if (isStoreVerified) {
                            return (
                              <span 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-black/10 bg-[#FAF7F0] text-[#3A3564] shadow-2xs"
                              >
                                <PackageCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                                <span>Store Issued (Ready)</span>
                              </span>
                            )
                          }

                          return (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-800"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Store Inspection</span>
                            </span>
                          )
                        })() : (
                          <span className="text-xs text-slate-400">No BOM Issued</span>
                        )}
                      </td>

                      {/* Progress Column with horizontal bar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-baseline justify-between gap-2 text-xs font-bold font-mono">
                          <span className="text-[#3A3564] font-extrabold">{al.achieved_qty || 0}</span>
                          <span className="text-slate-500 font-normal">/ {al.target_qty} pcs</span>
                        </div>
                        <div 
                          className="w-24 h-2 rounded-full mt-1.5 overflow-hidden bg-slate-100 border border-black/5"
                        >
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: percent >= 100 ? '#059669' : '#3A3564'
                            }}
                          />
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        {al.status === 'IN_PROGRESS' && (
                          <span 
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                          >
                            IN PROGRESS
                          </span>
                        )}
                        {al.status === 'COMPLETED' && (
                          <div className="space-y-1">
                            {al.mending_status === 'PENDING_MENDING' || al.mending_status === 'IN_MENDING' ? (
                              <>
                                <span 
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs"
                                  title={`Handed over to ${al.mending_supervisor_name || 'Mending'} by ${al.handed_to_mending_by || 'Lineman'}`}
                                >
                                  <Sparkles className="w-3 h-3 text-indigo-600" />
                                  <span>AT MENDING</span>
                                </span>
                                {al.mending_supervisor_name && (
                                  <span className="block text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                                    To: <strong className="text-slate-700">{al.mending_supervisor_name}</strong>
                                  </span>
                                )}
                              </>
                            ) : al.qc_status === 'PENDING_QC' || al.qc_status === 'PASSED' ? (
                              <span 
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>AT QC TABLE</span>
                              </span>
                            ) : (
                              <span 
                                className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                COMPLETED
                              </span>
                            )}
                          </div>
                        )}
                        {al.status === 'CANCELLED' && (
                          <span 
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            CANCELLED
                          </span>
                        )}
                      </td>

                      {/* Actions: Done, Cancel & Delete buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {al.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setStatusDialog({ isOpen: true, allotment: al, newStatus: 'COMPLETED' })}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                              >
                                Done
                              </button>
                              <button
                                type="button"
                                onClick={() => setStatusDialog({ isOpen: true, allotment: al, newStatus: 'CANCELLED' })}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeletingAllotment(al)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Permanently delete allotment"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED VARIANT RATIO & MATERIAL DRAWER */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-y border-slate-200 animate-in fade-in duration-200">
                        <td colSpan={7} className="px-6 py-5">
                          <div className="space-y-4">
                            
                            {/* Buyer Golden Sample Reference Photos Gallery */}
                            {al.sample_photos && al.sample_photos.length > 0 && (
                              <div className="p-4 bg-white rounded-xl border border-black/10 shadow-2xs space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#3A3564]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                      Buyer Golden Sample Reference Photos ({al.sample_photos.length} photos)
                                    </span>
                                  </div>
                                  {al.client_challan_no && (
                                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                                      Challan #: {al.client_challan_no}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                  {al.sample_photos.map((photo, idx) => (
                                    <div 
                                      key={idx} 
                                      className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50 shadow-2xs"
                                    >
                                      <img 
                                        src={photo} 
                                        alt={`Sample ${idx + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => window.open(photo, '_blank')}
                                      />
                                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/75 text-xs text-white rounded font-mono font-semibold">
                                        {idx === 0 ? 'Front' : idx === 1 ? 'Back' : idx === 2 ? 'Label' : 'Detail'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Drawer Section Filter Switcher */}
                            {(() => {
                              const currentTab = drawerTabs[al.id] || 'matrix'
                              const isShowMatrix = currentTab === 'matrix' || currentTab === 'all'
                              const isShowWorkers = currentTab === 'workers' || currentTab === 'all'
                              const isShowMaterials = currentTab === 'materials' || currentTab === 'all'

                              return (
                                <div className="space-y-4">
                                  {/* Filter Buttons Toolbar */}
                                  <div className="flex items-center justify-between gap-2.5 flex-wrap bg-white p-2.5 rounded-xl border border-black/10 shadow-2xs">
                                    <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-lg border border-slate-200/80 gap-1 flex-wrap">
                                      {/* Tab 1: Color x Size Matrix */}
                                      <button
                                        type="button"
                                        onClick={() => setDrawerTabs(prev => ({ ...prev, [al.id]: 'matrix' }))}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                          currentTab === 'matrix'
                                            ? 'bg-white text-slate-900 shadow-2xs border border-black/10 font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                      >
                                        <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                                        <span>Color × Size Matrix</span>
                                        {variants.length > 0 && (
                                          <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                            {variants.length}
                                          </span>
                                        )}
                                      </button>

                                      {/* Tab 2: Tailor & Worker Operations */}
                                      <button
                                        type="button"
                                        onClick={() => setDrawerTabs(prev => ({ ...prev, [al.id]: 'workers' }))}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                          currentTab === 'workers'
                                            ? 'bg-[#3A3564] text-white shadow-2xs font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                      >
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Tailor & Worker Operations</span>
                                        <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                          currentTab === 'workers' 
                                            ? 'bg-white/20 text-white border border-white/20' 
                                            : 'bg-slate-200 text-slate-700'
                                        }`}>
                                          {al.assignments?.length || 0}
                                        </span>
                                      </button>

                                      {/* Tab 3: Raw Materials & Inspection */}
                                      <button
                                        type="button"
                                        onClick={() => setDrawerTabs(prev => ({ ...prev, [al.id]: 'materials' }))}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                          currentTab === 'materials'
                                            ? 'bg-white text-slate-900 shadow-2xs border border-black/10 font-extrabold'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                        }`}
                                      >
                                        <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Materials & Handshake</span>
                                        {materials.length > 0 && (
                                          <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                            {materials.length}
                                          </span>
                                        )}
                                      </button>

                                      {/* Tab 4: Show All */}
                                      <button
                                        type="button"
                                        onClick={() => setDrawerTabs(prev => ({ ...prev, [al.id]: 'all' }))}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                          currentTab === 'all'
                                            ? 'bg-slate-800 text-white shadow-2xs font-extrabold'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                                        }`}
                                        title="View all 3 breakdown sections together"
                                      >
                                        <span>Show All</span>
                                      </button>
                                    </div>

                                    {/* Section Context Info on Right */}
                                    <div className="flex items-center gap-2 text-xs font-medium px-1">
                                      {currentTab === 'matrix' && (
                                        <span className="text-slate-500">
                                          Total Order: <strong className="text-slate-900 font-mono">{al.target_qty} pcs</strong>
                                        </span>
                                      )}
                                      {currentTab === 'workers' && (
                                        <span className="text-slate-500">
                                          Total Batches: <strong className="text-slate-900 font-mono">{al.assignments?.length || 0}</strong>
                                        </span>
                                      )}
                                      {currentTab === 'materials' && (
                                        <span className="text-slate-500">
                                          Total BOM Items: <strong className="text-slate-900 font-mono">{materials.length}</strong>
                                        </span>
                                      )}
                                      {currentTab === 'all' && (
                                        <span className="text-slate-500">
                                          Full 3-Section Breakdown
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* 1. Size & Color Matrix Table Section */}
                                  {isShowMatrix && variants.length > 0 && (() => {
                                    const distinctSizes = sortSizesNaturally(
                                      Array.from(new Set(variants.map(v => (v.size || '').trim()).filter(Boolean)))
                                    )

                                    // Group by Color: { [colorName]: { [size]: quantity } }
                                    const colorMatrixMap: Record<string, { total: number; sizes: Record<string, number> }> = {}
                                    
                                    variants.forEach(v => {
                                      const color = (v.color?.trim() || 'Default').toUpperCase()
                                      const size = (v.size?.trim() || 'Free Size')
                                      const qty = v.quantity || 0

                                      if (!colorMatrixMap[color]) {
                                        colorMatrixMap[color] = { total: 0, sizes: {} }
                                      }
                                      colorMatrixMap[color].sizes[size] = (colorMatrixMap[color].sizes[size] || 0) + qty
                                      colorMatrixMap[color].total += qty
                                    })

                                    const totalAllotmentPcs = variants.reduce((s, v) => s + (v.quantity || 0), 0)
                                    const colorList = Object.entries(colorMatrixMap)

                                    return (
                                      <div className="space-y-2.5">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                          <div className="flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-[#3A3564]" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                              Color × Size Production Matrix Table
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2.5 py-0.5 rounded-md border border-black/10 shadow-2xs">
                                              {colorList.length} {colorList.length === 1 ? 'Color' : 'Colors'} • {distinctSizes.length} Sizes
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                              Total: {totalAllotmentPcs.toLocaleString()} pcs
                                            </span>
                                          </div>
                                        </div>

                                        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-2xs">
                                          <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                              <tr className="bg-[#FAF7F0] border-b border-black/10 text-[#3A3564]">
                                                <th className="py-2.5 px-4 font-extrabold uppercase tracking-wider text-slate-700 sticky left-0 bg-[#FAF7F0] z-10 min-w-[160px] border-r border-slate-200/80">
                                                  Color / Variant
                                                </th>
                                                {distinctSizes.map(size => (
                                                  <th 
                                                    key={size} 
                                                    className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-[#3A3564] min-w-[68px] border-r border-slate-200/50"
                                                  >
                                                    {size}
                                                  </th>
                                                ))}
                                                <th className="py-2.5 px-4 text-right font-extrabold uppercase tracking-wider text-[#3A3564] min-w-[100px] border-r border-slate-200/80">
                                                  Total Pcs
                                                </th>
                                                <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-slate-500 min-w-[65px]">
                                                  Share
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {colorList.map(([colorName, colorData]) => {
                                                const ratioPercent = totalAllotmentPcs > 0 
                                                  ? ((colorData.total / totalAllotmentPcs) * 100).toFixed(1) 
                                                  : '0'

                                                return (
                                                  <tr key={colorName} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="py-2.5 px-4 font-bold text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-200/80">
                                                      <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#3A3564] inline-block shadow-2xs ring-1 ring-white shrink-0" />
                                                        <span className="capitalize font-extrabold text-[#3A3564]">{colorName.toLowerCase()}</span>
                                                      </div>
                                                    </td>
                                                    {distinctSizes.map(size => {
                                                      const qty = colorData.sizes[size]
                                                      return (
                                                        <td 
                                                          key={size} 
                                                          className="py-2.5 px-3 text-center font-mono text-xs border-r border-slate-100"
                                                        >
                                                          {qty !== undefined && qty > 0 ? (
                                                            <span className="font-bold text-slate-900 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200 inline-block min-w-[44px]">
                                                              {qty.toLocaleString()}
                                                            </span>
                                                          ) : (
                                                            <span className="text-slate-300 font-semibold">-</span>
                                                          )}
                                                        </td>
                                                      )
                                                    })}
                                                    <td className="py-2.5 px-4 text-right font-mono font-extrabold text-[#3A3564] border-r border-slate-200/80">
                                                      {colorData.total.toLocaleString()} pcs
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500 text-[11px]">
                                                      {ratioPercent}%
                                                    </td>
                                                  </tr>
                                                )
                                              })}
                                            </tbody>
                                            <tfoot>
                                              <tr className="bg-slate-50/90 border-t-2 border-slate-200 font-extrabold text-slate-900">
                                                <td className="py-2.5 px-4 sticky left-0 bg-slate-50/90 z-10 text-slate-800 uppercase tracking-wider text-[11px] border-r border-slate-200">
                                                  Summary Total
                                                </td>
                                                {distinctSizes.map(size => {
                                                  const sizeTotal = colorList.reduce((s, [, d]) => s + (d.sizes[size] || 0), 0)
                                                  return (
                                                    <td 
                                                      key={size} 
                                                      className="py-2.5 px-3 text-center font-mono font-bold text-[#3A3564] border-r border-slate-200/50"
                                                    >
                                                      {sizeTotal > 0 ? (
                                                        <span className="font-black text-slate-900">{sizeTotal.toLocaleString()}</span>
                                                      ) : (
                                                        '-'
                                                      )}
                                                    </td>
                                                  )
                                                })}
                                                <td className="py-2.5 px-4 text-right font-mono font-black text-[#3A3564] text-xs sm:text-[13px] border-r border-slate-200">
                                                  {totalAllotmentPcs.toLocaleString()} pcs
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 text-[11px]">
                                                  100%
                                                </td>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </div>
                                    )
                                  })()}

                                  {/* 2. Live Sewing Floor Tailor Operations & Machine Station Breakdown */}
                                  {isShowWorkers && (
                                    <div className="space-y-2.5">
                                      <WorkerAssignmentsTable 
                                        assignments={al.assignments || []} 
                                        stitchingRate={al.articles?.stitching_rate} 
                                        targetQty={al.target_qty} 
                                      />
                                    </div>
                                  )}

                                  {/* 3. Raw Materials 3-Way Handshake Inspection Section */}
                                  {isShowMaterials && materials.length > 0 && (
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                          <PackageCheck className="w-4 h-4 text-[#3A3564]" />
                                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            3-Way Material Handshake & Inspection Details
                                          </span>
                                        </div>
                                        {(() => {
                                          const firstChallan = materials.map(m => parseInspection(m.notes)?.supplier_challan_no).find(c => Boolean(c))
                                          if (firstChallan) {
                                            return (
                                              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                                <span>Challan: {firstChallan}</span>
                                              </span>
                                            )
                                          }
                                          return null
                                        })()}
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                        {materials.map((mat) => {
                                          const ins = parseInspection(mat.notes)
                                          const isShortage = ins?.status === 'SHORTAGE' || ins?.status === 'DEFECTIVE'
                                          const isStoreDone = ins?.store_verified || mat.admin_issued

                                          return (
                                            <div
                                              key={mat.id}
                                              className={`p-3 rounded-xl border text-xs shadow-2xs space-y-2 ${
                                                isShortage 
                                                  ? 'bg-rose-50/70 border-rose-200' 
                                                  : mat.lineman_received 
                                                    ? 'bg-emerald-50/50 border-emerald-200' 
                                                    : 'bg-white border-black/10'
                                              }`}
                                            >
                                              <div className="flex items-center justify-between gap-1.5">
                                                <span className="font-bold text-sm text-slate-900 truncate">
                                                  {mat.item_name}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                                                  isShortage 
                                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                                    : mat.lineman_received 
                                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                      : isStoreDone 
                                                        ? 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}>
                                                  {isShortage 
                                                    ? 'Shortage Flagged' 
                                                    : mat.lineman_received 
                                                      ? 'Lineman Received' 
                                                      : isStoreDone 
                                                        ? 'Store Issued' 
                                                        : 'Pending Store'}
                                                </span>
                                              </div>

                                              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                                                <span>Required: <strong className="text-slate-900 font-bold">{mat.required_qty}</strong></span>
                                                {ins?.received_qty && (
                                                  <span>Received: <strong className={isShortage ? 'text-rose-700 font-bold' : 'text-slate-900 font-bold'}>{ins.received_qty}</strong></span>
                                                )}
                                              </div>

                                              {/* Shortage details or store remarks */}
                                              {isShortage && ins?.shortage_qty && (
                                                <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5 bg-rose-100/70 px-2.5 py-1 rounded-lg border border-rose-200">
                                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                                                  <span>Shortage: {ins.shortage_qty}</span>
                                                </div>
                                              )}

                                              {ins?.store_remarks && (
                                                <p className="text-xs text-slate-700 italic bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
                                                  "{ins.store_remarks}"
                                                </p>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}

                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs sm:text-[13px]">
                  No allotment records match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
        <div className="text-slate-600 font-medium">
          Showing <span className="font-bold text-slate-900">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold text-slate-900">{totalItems}</span> allotments
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            const isActive = currentPage === pg
            return (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {pg}
              </button>
            )
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Toast Error Alert Banner */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 text-white rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="ml-2 text-white/80 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Professional Status Change Dialog */}
      <ConfirmDialog
        isOpen={statusDialog.isOpen}
        title={statusDialog.newStatus === 'COMPLETED' ? 'Mark Allotment as Done?' : 'Cancel Target Allotment?'}
        description={`Are you sure you want to mark production target for "${statusDialog.allotment?.articles?.art_no || 'this article'}" (${statusDialog.allotment?.profiles?.username || 'Lineman'}) as ${statusDialog.newStatus}?`}
        confirmText={statusDialog.newStatus === 'COMPLETED' ? 'Mark as Completed' : 'Cancel Allotment'}
        variant={statusDialog.newStatus === 'COMPLETED' ? 'success' : 'warning'}
        isLoading={isStatusLoading}
        onConfirm={executeStatusChange}
        onClose={() => setStatusDialog({ isOpen: false, allotment: null, newStatus: '' })}
      />

      {/* ========================================================================= */}
      {/* PREMIUM DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingAllotment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Delete Target Allotment?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                This action is permanent and cannot be undone. All associated variant ratios, BOM material records, and worker assignments will be deleted from the database.
              </p>

              {/* Allotment Details Summary Card */}
              <div className="mt-4 p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Lineman (Floor):</span>
                  <span className="font-bold text-slate-800">{deletingAllotment.profiles?.username || 'Lineman'}</span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Article (Style #):</span>
                  <span className="font-bold text-slate-800">
                    {deletingAllotment.articles?.art_no} ({cleanDescription(deletingAllotment.articles?.description)})
                  </span>
                </div>
                {deletingAllotment.production_order_no && (
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Production Order:</span>
                    <span className="font-bold font-mono text-slate-800">{deletingAllotment.production_order_no}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Target Quantity:</span>
                  <span className="font-bold text-slate-800">{deletingAllotment.target_qty} pcs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Allotment Status:</span>
                  <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                    deletingAllotment.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    deletingAllotment.status === 'CANCELLED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                    'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                  }`}>
                    {deletingAllotment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingAllotment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteAllotment}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-sm shadow-red-200"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}