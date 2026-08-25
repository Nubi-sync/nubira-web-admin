'use client'

import { useState, useMemo } from 'react'
import { updateAllotmentStatus } from '../actions'
import { 
  CheckCircle2, 
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
  Layers
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
}

export type Allotment = {
  id: string
  lineman_id: string
  article_id: string
  target_qty: number
  achieved_qty?: number
  allotment_date: string
  status: string
  profiles: { username: string }
  articles: { art_no: string; description?: string }
  variants?: VariantItem[]
  materials?: MaterialItem[]
}

type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
type SortField = 'date' | 'progress'
type SortOrder = 'asc' | 'desc'

export function AllotmentList({ allotments = [] }: { allotments: Allotment[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // Functional table controls
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  async function handleStatusChange(id: string, newStatus: string) {
    if (confirm(`Are you sure you want to mark this target as ${newStatus}?`)) {
      await updateAllotmentStatus(id, newStatus)
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
        return art.includes(q) || desc.includes(q) || lineman.includes(q) || date.includes(q)
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
      className="bg-white rounded-[11px] border shadow-xs overflow-hidden"
      style={{ borderColor: 'var(--border, #E2E8F0)' }}
    >
      {/* Header with dynamic Count Badge */}
      <div className="p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
        <div>
          <h3 
            className="text-[17px] font-bold font-[family-name:var(--font-heading)]"
            style={{ color: 'var(--ink, #1C2733)' }}
          >
            Active Allotments & Handover Status
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
            Tracking size ratios & raw materials issued to lines
          </p>
        </div>

        {/* Dynamic Allotments Count Pill */}
        <div 
          className="text-xs font-semibold px-3 py-1 rounded-full border max-w-max"
          style={{
            backgroundColor: 'var(--steel-tint, #DBE6F5)',
            borderColor: 'var(--border, #E2E8F0)',
            color: 'var(--steel-dark, #1F3A63)'
          }}
        >
          {filteredAllotments.length} {filteredAllotments.length === 1 ? 'Allotment' : 'Allotments'}
        </div>
      </div>

      {/* Toolbar: Search Box & Status Filter Chips */}
      <div className="p-4 border-b bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by article, lineman, or date..."
            className="w-full pl-9 pr-3 py-2 bg-white border rounded-[7px] text-xs outline-none transition-colors"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
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
                className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold border transition-colors outline-none ${
                  isSelected
                    ? 'bg-[var(--steel-mist,#EEF3FA)] border-[var(--steel,#2B4C7E)] text-[var(--steel,#2B4C7E)]'
                    : 'bg-white border-[var(--border,#E2E8F0)] text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)]'
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
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b text-[11px] uppercase tracking-wider font-bold" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}>
              
              {/* Sortable Date & Lineman */}
              <th 
                onClick={() => handleSort('date')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date & Lineman</span>
                  {sortField === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" /> : <ArrowDown className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
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
                    sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" /> : <ArrowDown className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
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
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-xs">
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
                  <tr key={al.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Date & Lineman */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{al.profiles?.username || 'Lineman'}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{al.allotment_date}</div>
                    </td>

                    {/* Article Style */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[var(--steel,#2B4C7E)]">{al.articles?.art_no}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{al.articles?.description || 'Garment'}</div>
                    </td>

                    {/* Size & Color Ratio Summary */}
                    <td className="px-4 py-3.5">
                      {variants.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(al.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>{variants.length} Variants</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Bulk ({al.target_qty} pcs)</span>
                      )}
                    </td>

                    {/* Material Handover Badge */}
                    <td className="px-4 py-3.5">
                      {materials.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {allMaterialsReceived ? (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-semibold"
                              style={{ backgroundColor: 'var(--green-mist, #E6F6EE)', color: 'var(--green, #1F9D63)' }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified ({materials.length})</span>
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-semibold"
                              style={{ backgroundColor: 'var(--amber-mist, #FBF0E1)', color: 'var(--amber, #C8802B)' }}
                            >
                              <Clock className="w-3 h-3" />
                              <span>Pending ({materials.filter(m => !m.lineman_received).length})</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">No BOM Issued</span>
                      )}
                    </td>

                    {/* Progress Column with horizontal bar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-baseline justify-between gap-2 text-xs font-bold font-mono">
                        <span style={{ color: 'var(--steel, #2B4C7E)' }}>{al.achieved_qty || 0}</span>
                        <span className="text-slate-400 font-normal">/ {al.target_qty} pcs</span>
                      </div>
                      <div 
                        className="w-24 h-1.5 rounded-full mt-1.5 overflow-hidden"
                        style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)' }}
                      >
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: percent >= 100 ? 'var(--green, #1F9D63)' : 'var(--steel, #2B4C7E)'
                          }}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      {al.status === 'IN_PROGRESS' && (
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                          style={{ backgroundColor: 'var(--steel-tint, #DBE6F5)', color: 'var(--steel-dark, #1F3A63)' }}
                        >
                          IN PROGRESS
                        </span>
                      )}
                      {al.status === 'COMPLETED' && (
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                          style={{ backgroundColor: 'var(--green-mist, #E6F6EE)', color: 'var(--green, #1F9D63)' }}
                        >
                          COMPLETED
                        </span>
                      )}
                      {al.status === 'CANCELLED' && (
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold"
                          style={{ backgroundColor: 'var(--red-mist, #FBEAE8)', color: 'var(--red, #C0392B)' }}
                        >
                          CANCELLED
                        </span>
                      )}
                    </td>

                    {/* Actions: Done & Cancel buttons */}
                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {al.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(al.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors border"
                            style={{
                              backgroundColor: 'var(--green-mist, #E6F6EE)',
                              borderColor: 'var(--green, #1F9D63)',
                              color: 'var(--green, #1F9D63)'
                            }}
                          >
                            Done
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(al.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-colors border"
                            style={{
                              backgroundColor: 'var(--red-mist, #FBEAE8)',
                              borderColor: 'var(--red, #C0392B)',
                              color: 'var(--red, #C0392B)'
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="p-4 border-t bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
        <div style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
          Showing <span className="font-semibold">{totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span>–<span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> allotments
        </div>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="p-1.5 rounded-[6px] border bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
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
                className={`w-7 h-7 rounded-[6px] text-xs font-semibold border transition-colors ${
                  isActive
                    ? 'text-white border-transparent'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-[var(--border,#E2E8F0)]'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--steel, #2B4C7E)' : '#FFFFFF'
                }}
              >
                {pg}
              </button>
            )
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="p-1.5 rounded-[6px] border bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  )
}
