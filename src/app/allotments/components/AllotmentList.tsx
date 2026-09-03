'use client'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import React, { useState, useMemo, Fragment } from 'react'
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
  Users
} from 'lucide-react'

export type VariantItem = {
  id: string
  allotment_id: string
  color: string
  size: string
  quantity: number
  completed_qty?: number
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
  production_order_no?: string
  manager_name?: string
  due_date?: string
  target_hours?: number
  priority?: 'NORMAL' | 'RUSH' | 'CRITICAL'
  client_challan_no?: string
  sample_photos?: string[]
  profiles: { username: string }
  articles: { art_no: string; description?: string }
  variants?: VariantItem[]
  materials?: MaterialItem[]
  assignments?: Array<{
    id: string
    worker_name: string
    assigned_qty: number
    completed_qty?: number
    color?: string
    size?: string
    status: string
    notes?: string
    assigned_at?: string
  }>
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

        {/* Dynamic Allotments Count Pill */}
        <div 
          className="text-xs font-bold px-3 py-1 rounded-full border border-black/10 bg-[#FAF7F0] text-[#3A3564] max-w-max shadow-2xs"
        >
          {filteredAllotments.length} {filteredAllotments.length === 1 ? 'Allotment' : 'Allotments'}
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
          <tbody className="divide-y divide-slate-100">
            {paginatedAllotments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs sm:text-[13px]">
                  No allotment records match your search or filter.
                </td>
              </tr>
            ) : (
              paginatedAllotments.map((al) => {
                const isExpanded = expandedId === al.id
                const variants = al.variants || []
                const materials = al.materials || []
                const allMaterialsReceived = materials.length > 0 && materials.every(m => m.lineman_received)
                const percent = Math.min(Math.round(((al.achieved_qty || 0) / (al.target_qty || 1)) * 100), 100)

                return (
                  <Fragment key={al.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      
                      {/* Date & Lineman */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-sm text-slate-900">{al.profiles?.username || 'Lineman'}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">{al.allotment_date}</div>
                      </td>

                      {/* Article Style & Assigned Color Line */}
                      {(() => {
                        const distinctColors = Array.from(new Set((variants || []).map(v => v.color?.trim()).filter(Boolean)))
                        const colorLabel = distinctColors.length === 1 
                          ? `${distinctColors[0]} LINE`
                          : distinctColors.length > 1
                          ? `${distinctColors.join(', ')}`
                          : al.production_order_no
                          ? al.production_order_no
                          : cleanDescription(al.articles?.description)

                        return (
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-sm text-[#3A3564] flex items-center gap-1.5 flex-wrap">
                              <span>{al.articles?.art_no}</span>
                              {distinctColors.length === 1 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                                  {distinctColors[0]}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 font-medium truncate max-w-[170px] mt-0.5" title={colorLabel}>
                              {colorLabel}
                            </div>
                          </td>
                        )
                      })()}

                      {/* Size & Color Ratio Summary */}
                      <td className="px-4 py-3.5">
                        {variants.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(al.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#FAF7F0] text-[#3A3564] border border-black/10 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#3A3564]" />
                            <span>{variants.length} Variants</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-[#3A3564]" /> : <ChevronDown className="w-3 h-3 text-[#3A3564]" />}
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-slate-500">Bulk ({al.target_qty} pcs)</span>
                        )}
                      </td>

                      {/* 3-WAY MATERIAL HANDSHAKE BADGE */}
                      <td className="px-4 py-3.5">
                        {materials.length > 0 ? (() => {
                          const inspections = materials.map(m => parseInspection(m.notes))
                          const shortages = inspections.filter(ins => ins?.status === 'SHORTAGE' || ins?.status === 'DEFECTIVE')
                          const isStoreVerified = materials.every(m => {
                            const ins = parseInspection(m.notes)
                            return ins?.store_verified || m.admin_issued
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
                          <span 
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            COMPLETED
                          </span>
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

                            {/* Size & Color Matrix Section */}
                            {variants.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2.5">
                                  <Layers className="w-4 h-4 text-[#3A3564]" />
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Color & Size Ratio Breakdown ({variants.reduce((s, v) => s + (v.quantity || 0), 0)} pcs total)
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {Object.entries(
                                    variants.reduce<Record<string, VariantItem[]>>((acc, v) => {
                                      const color = v.color || 'Default'
                                      if (!acc[color]) acc[color] = []
                                      acc[color].push(v)
                                      return acc
                                    }, {})
                                  ).map(([colorName, vList]) => {
                                    const totalColorQty = vList.reduce((s, item) => s + (item.quantity || 0), 0)
                                    return (
                                      <div 
                                        key={colorName} 
                                        className="p-3.5 bg-white rounded-xl border border-black/10 shadow-2xs space-y-2"
                                      >
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-[#3A3564] inline-block shadow-2xs ring-1 ring-white" />
                                            <span className="font-extrabold text-xs sm:text-[13px] text-slate-900 capitalize">{colorName}</span>
                                          </div>
                                          <span className="font-mono text-xs sm:text-[13px] font-extrabold text-[#3A3564] px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-black/10">
                                            {totalColorQty} pcs
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                          {vList.map((item) => (
                                            <span
                                              key={item.id || item.size}
                                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700"
                                            >
                                              <span className="font-bold text-slate-900">{item.size}:</span>
                                              <span className="font-bold text-[#3A3564]">{item.quantity} pcs</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Live Sewing Floor Tailor Allocations (Machine Stations & Borrowed Workers) */}
                            {al.assignments && al.assignments.length > 0 && (
                              <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#3A3564]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                      Live Floor Tailor Allocations ({al.assignments.length} batches assigned)
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                  {al.assignments.map((ass) => {
                                    const notesStr = ass.notes || ''
                                    let station = 'STITCHING'
                                    let isBorrowed = false
                                    let borrowedFrom = ''

                                    if (notesStr.includes('[OVERLOCK]')) station = 'OVERLOCK'
                                    if (notesStr.includes('[FIVE_THREAD]')) station = '5-THREAD SAFETY'
                                    if (notesStr.includes('[FLATLOCK]')) station = 'FLATLOCK / RIB'
                                    if (notesStr.includes('[LOCKING]')) station = 'LOCKING / SINGLE'

                                    if (notesStr.includes('[BORROWED:')) {
                                      isBorrowed = true
                                      const match = notesStr.match(/\[BORROWED:\s*(.*?)\]/)
                                      if (match && match[1]) borrowedFrom = match[1]
                                    }

                                    return (
                                      <div 
                                        key={ass.id}
                                        className="p-3 bg-white rounded-xl border border-black/10 text-xs space-y-2 shadow-2xs"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-sm text-slate-900">{ass.worker_name}</span>
                                          <span className="font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2.5 py-0.5 rounded-lg border border-black/10 text-xs shadow-2xs">
                                            {ass.assigned_qty} pcs
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                          {/* Machine Operation Badge */}
                                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                            {station}
                                          </span>

                                          {/* Color & Size Variant */}
                                          {(ass.color || ass.size) && (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 font-mono border border-slate-200">
                                              {ass.color || ''} {ass.size ? `(${ass.size})` : ''}
                                            </span>
                                          )}

                                          {/* Borrowed Worker Badge */}
                                          {isBorrowed && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-300">
                                              ⇄ Borrowed from {borrowedFrom || 'Other Line'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Raw Materials 3-Way Handshake Inspection Section */}
                            {materials.length > 0 && (
                              <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })
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