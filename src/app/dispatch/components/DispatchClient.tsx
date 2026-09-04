'use client'

import { useState, useMemo, useTransition } from 'react'
import { 
  Truck, 
  Download, 
  Printer, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ClipboardCheck,
  Calendar, 
  X, 
  Trash2, 
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Package,
  ShieldCheck
} from 'lucide-react'
import { createDeliveryChallan, recordCountingAudit, approveDeliveryChallan } from '../actions'
import { SubtleDialog, SubtleDialogProps } from '@/components/ui/SubtleDialog'

type Article = {
  id: string
  art_no: string
  description?: string | null
}

type ChallanItem = {
  id: string
  article_id: string
  color?: string | null
  size?: string | null
  quantity: number
  category?: string | null
  product_type?: string | null
  order_qty?: number
  delivery_qty?: number
  balance_qty?: number
  article?: Article | null
}

type DeliveryChallan = {
  id: string
  challan_no: string
  buyer_name: string
  destination?: string | null
  vehicle_no?: string | null
  driver_name?: string | null
  driver_phone?: string | null
  total_pieces: number
  delivery_date: string
  created_at: string
  status: string
  notes?: string | null
  spot_notes?: string | null
  billed_to_name?: string | null
  billed_to_address?: string | null
  billed_to_gstin?: string | null
  shipping_to_name?: string | null
  shipping_to_address?: string | null
  total_bags?: number
  total_order_qty?: number
  total_delivery_qty?: number
  total_balance_qty?: number
  challan_items?: ChallanItem[]
}

type CountingReport = {
  id: string
  article_id: string
  color?: string | null
  size?: string | null
  counted_qty: number
  expected_qty: number
  remarks?: string | null
  entry_date: string
  created_at: string
  article?: Article | null
}

type Allotment = {
  id: string
  article_id: string
  target_qty: number
  allotment_date?: string | null
  article?: Article | null
}

interface DispatchClientProps {
  articles: Article[]
  deliveryChallans: DeliveryChallan[]
  countingReports: CountingReport[]
  allotments?: Allotment[]
}

type TabKey = 'challans' | 'counting'
type ReconciliationStatus = 'ALL' | 'MATCHED' | 'DISCREPANCY' | 'PENDING'
type SortOrder = 'asc' | 'desc'

export function DispatchClient({
  articles,
  deliveryChallans,
  countingReports,
  allotments = [],
}: DispatchClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('challans')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const [isPending, startTransition] = useTransition()

  // Subtle Dialog State (replaces browser window.alert)
  const [dialogState, setDialogState] = useState<Omit<SubtleDialogProps, 'onClose'>>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'error',
    confirmText: 'Understood'
  })

  const showDialog = (title: string, description: string, variant: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setDialogState({
      isOpen: true,
      title,
      description,
      variant,
      confirmText: 'Understood'
    })
  }

  // Sorting state
  const [sortCol, setSortCol] = useState<string>('default')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Modal States
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false)
  const [showCountingModal, setShowCountingModal] = useState(false)
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<DeliveryChallan | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const handleApproveChallan = async (challanId: string) => {
    setApprovingId(challanId)
    try {
      await approveDeliveryChallan(challanId)
      showDialog('Dispatch Approved', 'Delivery challan has been authorized for dispatch and factory gate out.', 'success')
    } catch (err: any) {
      showDialog('Approval Failed', err.message || 'Failed to approve delivery challan.', 'error')
    } finally {
      setApprovingId(null)
    }
  }

  // Multi-row items state for Create Challan Modal
  const [challanRows, setChallanRows] = useState<Array<{
    article_id: string
    color: string
    size: string
    quantity: number
  }>>([
    {
      article_id: articles.length > 0 ? articles[0].id : '',
      color: 'Navy Blue',
      size: 'L',
      quantity: 200,
    }
  ])

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setStatusFilter('ALL')
    setSortCol('default')
    setSortOrder('desc')
  }

  const handleSort = (column: string) => {
    if (sortCol === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(column)
      setSortOrder('desc')
    }
  }

  // 1. Calculate Reconciliation Data for Delivery Challans
  const reconciledChallans = useMemo(() => {
    return deliveryChallans.map(ch => {
      // Find linked article IDs from items
      const coveredArticleIds = (ch.challan_items || []).map(i => i.article_id)
      
      // Calculate Cut Qty (from allotments matching covered articles)
      let cutQty = 0
      if (coveredArticleIds.length > 0) {
        cutQty = allotments
          .filter(a => coveredArticleIds.includes(a.article_id))
          .reduce((sum, a) => sum + (a.target_qty || 0), 0)
      }
      if (cutQty === 0) {
        cutQty = ch.total_pieces // fallback if no specific allotment is matched
      }

      // Calculate Counted Qty (from counting reports matching covered articles)
      let countedQty = 0
      if (coveredArticleIds.length > 0) {
        countedQty = countingReports
          .filter(c => coveredArticleIds.includes(c.article_id))
          .reduce((sum, c) => sum + (c.counted_qty || 0), 0)
      }
      if (countedQty === 0) {
        countedQty = ch.total_pieces // fallback
      }

      const dispatchedQty = ch.total_pieces || 0

      // Determine Reconciliation Status & Label
      let status: 'MATCHED' | 'DISCREPANCY' | 'PENDING' = 'MATCHED'
      let label = 'Matches lot'
      let shortPcs = 0

      if (dispatchedQty === 0 && countedQty > 0) {
        status = 'PENDING'
        label = 'Pending dispatch'
      } else if (dispatchedQty < cutQty || dispatchedQty < countedQty) {
        status = 'DISCREPANCY'
        const benchmark = Math.max(cutQty, countedQty)
        shortPcs = benchmark - dispatchedQty
        label = shortPcs + ' pcs short'
      } else {
        status = 'MATCHED'
        label = 'Matches lot'
      }

      return {
        ...ch,
        cutQty,
        countedQty,
        dispatchedQty,
        reconciliationStatus: status,
        reconciliationLabel: label,
        shortPcs
      }
    })
  }, [deliveryChallans, allotments, countingReports])

  // 2. Filtered & Sorted Challans
  const filteredChallans = useMemo(() => {
    let list = reconciledChallans

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(ch => 
        ch.challan_no.toLowerCase().includes(q) ||
        ch.buyer_name.toLowerCase().includes(q) ||
        (ch.destination && ch.destination.toLowerCase().includes(q)) ||
        (ch.vehicle_no && ch.vehicle_no.toLowerCase().includes(q)) ||
        (ch.driver_name && ch.driver_name.toLowerCase().includes(q)) ||
        (ch.challan_items && ch.challan_items.some(i => i.article?.art_no.toLowerCase().includes(q)))
      )
    }

    // Filter by Reconciliation Status Chip
    if (statusFilter !== 'ALL') {
      list = list.filter(ch => ch.reconciliationStatus === statusFilter)
    }

    // Sort
    if (sortCol === 'challan_no') {
      list.sort((a, b) => sortOrder === 'asc' ? a.challan_no.localeCompare(b.challan_no) : b.challan_no.localeCompare(a.challan_no))
    } else if (sortCol === 'date') {
      list.sort((a, b) => {
        const dA = new Date(a.delivery_date || a.created_at).getTime()
        const dB = new Date(b.delivery_date || b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      })
    } else if (sortCol === 'dispatched') {
      list.sort((a, b) => sortOrder === 'asc' ? a.total_pieces - b.total_pieces : b.total_pieces - a.total_pieces)
    } else if (sortCol === 'reconciliation') {
      list.sort((a, b) => sortOrder === 'asc' ? a.reconciliationStatus.localeCompare(b.reconciliationStatus) : b.reconciliationStatus.localeCompare(a.reconciliationStatus))
    }

    return list
  }, [reconciledChallans, searchTerm, statusFilter, sortCol, sortOrder])

  // 3. Filtered & Sorted Counting Audits
  const filteredCounting = useMemo(() => {
    let list = countingReports

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      list = list.filter(c => 
        (c.article?.art_no && c.article.art_no.toLowerCase().includes(q)) ||
        (c.color && c.color.toLowerCase().includes(q)) ||
        (c.size && c.size.toLowerCase().includes(q)) ||
        (c.remarks && c.remarks.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sortCol === 'date') {
      list.sort((a, b) => {
        const dA = new Date(a.entry_date || a.created_at).getTime()
        const dB = new Date(b.entry_date || b.created_at).getTime()
        return sortOrder === 'asc' ? dA - dB : dB - dA
      })
    } else if (sortCol === 'counted') {
      list.sort((a, b) => sortOrder === 'asc' ? a.counted_qty - b.counted_qty : b.counted_qty - a.counted_qty)
    }

    return list
  }, [countingReports, searchTerm, sortCol, sortOrder])

  // Overall KPIs
  const totalDeliveredPieces = deliveryChallans.reduce((sum, c) => sum + (c.total_pieces || 0), 0)
  const totalChallansCount = deliveryChallans.length
  const totalCountedPieces = countingReports.reduce((sum, c) => sum + (c.counted_qty || 0), 0)
  const totalDiscrepancies = reconciledChallans.filter(c => c.reconciliationStatus === 'DISCREPANCY').length

  // Pagination Slices
  const currentListCount = activeTab === 'challans' ? filteredChallans.length : filteredCounting.length
  const totalPages = Math.max(1, Math.ceil(currentListCount / pageSize))

  const paginatedChallans = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredChallans.slice(start, start + pageSize)
  }, [filteredChallans, currentPage, pageSize])

  const paginatedCounting = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCounting.slice(start, start + pageSize)
  }, [filteredCounting, currentPage, pageSize])

  // CSV Export Helper
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    const filename = 'dispatch_' + activeTab + '_' + new Date().toISOString().split('T')[0] + '.csv'

    if (activeTab === 'challans') {
      headers = ['Challan No', 'Date', 'Buyer Name', 'Destination', 'Vehicle No', 'Cut Qty', 'Counted Qty', 'Dispatched Qty', 'Reconciliation', 'Status']
      rows = filteredChallans.map(r => [
        r.challan_no,
        r.delivery_date,
        r.buyer_name,
        r.destination || '-',
        r.vehicle_no || '-',
        r.cutQty,
        r.countedQty,
        r.total_pieces,
        r.reconciliationLabel,
        r.status
      ])
    } else {
      headers = ['Date', 'Article No', 'Color', 'Size', 'Counted Qty', 'Expected Qty', 'Difference', 'Remarks']
      rows = filteredCounting.map(r => [
        r.entry_date,
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.counted_qty,
        r.expected_qty,
        r.counted_qty - r.expected_qty,
        '"' + (r.remarks || '').replace(/"/g, '""') + '"'
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header (Zigza Executive Aesthetic) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dispatch & Logistics Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pre-loading physical counting, delivery challans, and transport tracking
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setShowCountingModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 shadow-2xs transition-all cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Record Counting</span>
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setChallanRows([{
                article_id: articles.length > 0 ? articles[0].id : '',
                color: 'Navy Blue',
                size: 'L',
                quantity: 200,
              }])
              setShowCreateChallanModal(true)
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery Challan</span>
          </button>

          <button 
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Export current tab records as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Dispatched */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Total Dispatched
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {totalDeliveredPieces.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {/* Delivery Challans */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Delivery Challans
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {totalChallansCount} <span className="text-xs font-medium text-slate-500">issued</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Counted Audits */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Counted Audits
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 block">
              {totalCountedPieces.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <ClipboardCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Discrepancies */}
        <div 
          onClick={() => {
            if (totalDiscrepancies > 0) {
              setActiveTab('challans')
              setStatusFilter('DISCREPANCY')
              setCurrentPage(1)
            }
          }}
          className={`p-4 sm:p-5 rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
            totalDiscrepancies > 0 
              ? 'bg-rose-50/40 border-rose-200/80 cursor-pointer hover:border-rose-300' 
              : 'bg-white border-black/10'
          }`}
        >
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Discrepancies
            </span>
            <span className={`text-xl sm:text-2xl font-black font-mono mt-1 block ${
              totalDiscrepancies > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {totalDiscrepancies} <span className="text-xs font-medium text-slate-500">mismatches</span>
            </span>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
            totalDiscrepancies > 0
              ? 'bg-rose-100 text-rose-700 border border-rose-200'
              : 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs, Status Filter Chips & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        {/* Top Row: Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100">
          <button
            type="button"
            onClick={() => handleTabChange('challans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'challans'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Delivery Challans Master ({filteredChallans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('counting')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'counting'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Pre-Loading Counting Audits ({filteredCounting.length})</span>
          </button>
        </div>

        {/* Bottom Row: Filter Chips + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Filter Chips (For Challans Tab) */}
          {activeTab === 'challans' ? (
            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'MATCHED', 'DISCREPANCY', 'PENDING'] as ReconciliationStatus[]).map((st) => {
                const isSelected = statusFilter === st
                const labelMap: Record<ReconciliationStatus, string> = {
                  ALL: 'All',
                  MATCHED: 'Matched',
                  DISCREPANCY: 'Discrepancy',
                  PENDING: 'Pending dispatch'
                }
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st)
                      setCurrentPage(1)
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-[#3A3564] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    {labelMap[st]}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-500">
              Physical carton and piece count audits conducted before gate dispatch
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search challan, buyer, vehicle..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. Main Table / Empty State Area */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* ======================================================== */}
        {/* TAB 1: DELIVERY CHALLANS MASTER                          */}
        {/* ======================================================== */}
        {activeTab === 'challans' && (
          <div>
            {filteredChallans.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  No delivery challans found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                  Created delivery challans will show up here, with automatic reconciliation against cutting and counted quantities.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChallanRows([{
                      article_id: articles.length > 0 ? articles[0].id : '',
                      color: 'Navy Blue',
                      size: 'L',
                      quantity: 200,
                    }])
                    setShowCreateChallanModal(true)
                  }}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Challan</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                      
                      {/* Sortable Challan No */}
                      <th 
                        onClick={() => handleSort('challan_no')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Challan No</span>
                          {sortCol === 'challan_no' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      {/* Sortable Date */}
                      <th 
                        onClick={() => handleSort('date')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          {sortCol === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4">Buyer / Consignee</th>
                      <th className="py-3.5 px-4">Vehicle / Transporter</th>
                      
                      {/* Reconciliation Quantities */}
                      <th className="py-3.5 px-3 text-right text-slate-500">Cut Qty</th>
                      <th className="py-3.5 px-3 text-right text-slate-500">Counted Qty</th>
                      
                      {/* Sortable Dispatched Qty */}
                      <th 
                        onClick={() => handleSort('dispatched')}
                        className="py-3.5 px-4 text-right cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none text-[#3A3564]"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Dispatched Qty</span>
                          {sortCol === 'dispatched' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      {/* Reconciliation Status */}
                      <th 
                        onClick={() => handleSort('reconciliation')}
                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Reconciliation</span>
                          {sortCol === 'reconciliation' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {paginatedChallans.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#3A3564]">
                          {row.challan_no}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {row.delivery_date || row.created_at.split('T')[0]}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{row.buyer_name}</div>
                          {row.destination && <div className="text-[11px] text-slate-500 font-normal">{row.destination}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="font-mono font-medium text-slate-800">{row.vehicle_no || '-'}</div>
                          {row.driver_name && <div className="text-[11px] text-slate-400">{row.driver_name} {row.driver_phone ? '(' + row.driver_phone + ')' : ''}</div>}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-500 font-medium">
                          {row.cutQty.toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 font-medium">
                          {row.countedQty.toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                          {row.total_pieces.toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {row.reconciliationStatus === 'MATCHED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                          {row.reconciliationStatus === 'DISCREPANCY' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                          {row.reconciliationStatus === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {row.status === 'PENDING_ADMIN_APPROVAL' ? (
                              <button
                                type="button"
                                disabled={approvingId === row.id}
                                onClick={() => handleApproveChallan(row.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{approvingId === row.id ? 'Approving...' : 'Approve Dispatch'}</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono shadow-2xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Approved
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedChallanForPrint(row)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs font-bold text-[#3A3564] transition-colors shadow-2xs cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print / View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRE-LOADING COUNTING AUDITS                      */}
        {/* ======================================================== */}
        {activeTab === 'counting' && (
          <div>
            {filteredCounting.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  No counting audits recorded yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
                  Physical piece counting reports logged before truck gate-out will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCountingModal(true)}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record First Counting</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                      
                      {/* Sortable Date */}
                      <th 
                        onClick={() => handleSort('date')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          {sortCol === 'date' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4">Article No</th>
                      <th className="py-3.5 px-4">Color / Size</th>
                      
                      {/* Sortable Counted Qty */}
                      <th 
                        onClick={() => handleSort('counted')}
                        className="py-3.5 px-4 text-right cursor-pointer hover:bg-[#F2ECE1] transition-colors select-none text-[#3A3564]"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Counted Qty</span>
                          {sortCol === 'counted' ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#3A3564]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#3A3564]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </th>

                      <th className="py-3.5 px-4 text-right text-slate-500">Expected Qty</th>
                      <th className="py-3.5 px-4 text-center">Difference</th>
                      <th className="py-3.5 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {paginatedCounting.map((row) => {
                      const diff = row.counted_qty - row.expected_qty
                      const isMatch = diff === 0
                      const isShort = diff < 0

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {row.entry_date || row.created_at.split('T')[0]}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-[#3A3564] font-mono">
                            {row.article?.art_no || '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            {(row.color || row.size) ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                {row.color} {row.size ? '(' + row.size + ')' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                            {row.counted_qty.toLocaleString()} pcs
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500 font-medium">
                            {row.expected_qty.toLocaleString()} pcs
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                                isMatch 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                  : isShort 
                                    ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {diff > 0 ? '+' + diff : diff} pcs
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {row.remarks || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Pagination Controls Footer */}
        {currentListCount > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, currentListCount)}</span> of <span className="font-bold text-slate-800">{currentListCount}</span> {activeTab === 'challans' ? 'challans' : 'audits'}
            </div>

            {/* Page Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
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
                    className={`w-8 h-8 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#3A3564] text-white border-[#3A3564] shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
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
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW DELIVERY CHALLAN (MULTI-ITEM)         */}
      {/* ======================================================== */}
      {showCreateChallanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-black/10 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    Generate Delivery Challan
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Create official goods delivery pass for buyer gate-out
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateChallanModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('items_json', JSON.stringify(challanRows))
              startTransition(async () => {
                try {
                  await createDeliveryChallan(formData)
                  setShowCreateChallanModal(false)
                  showDialog('Challan Issued', 'Delivery challan has been generated and logged into the master register.', 'success')
                } catch (err: any) {
                  showDialog('Generation Error', err.message || 'Failed to create delivery challan', 'error')
                }
              })
            }} className="flex flex-col flex-1">
              
              {/* Form Scrollable Body */}
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overflow-x-hidden max-h-[calc(88vh-140px)]">
                
                {/* Section 1: Basic Identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Challan Number *
                    </label>
                    <input 
                      type="text" 
                      name="challan_no" 
                      defaultValue={'CH-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Buyer / Consignee Name *
                    </label>
                    <input 
                      type="text" 
                      name="buyer_name" 
                      required 
                      placeholder="e.g. Zara Mumbai Hub" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all" 
                    />
                  </div>
                </div>

                {/* Section 2: Logistics Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Destination City
                    </label>
                    <input 
                      type="text" 
                      name="destination" 
                      placeholder="Bhiwandi Godown" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Vehicle / Truck No
                    </label>
                    <input 
                      type="text" 
                      name="vehicle_no" 
                      placeholder="WB-04-AB-1234" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Driver Phone
                    </label>
                    <input 
                      type="text" 
                      name="driver_phone" 
                      placeholder="9876543210" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] transition-all" 
                    />
                  </div>
                </div>

                {/* Section 3: Multi-Item Garment Lines Cards */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 block">
                        Challan Garment Lines
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Total: <strong className="text-slate-900 font-mono font-bold">{challanRows.reduce((sum, r) => sum + (r.quantity || 0), 0)} pcs</strong> across {challanRows.length} {challanRows.length === 1 ? 'line' : 'lines'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChallanRows([...challanRows, {
                          article_id: articles.length > 0 ? articles[0].id : '',
                          color: 'Standard',
                          size: 'L',
                          quantity: 100,
                        }])
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Article Line</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {challanRows.map((row, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5 shadow-2xs">
                        {/* Line Header: Article Selector + Remove Button */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                              Article Master Style *
                            </label>
                            <select 
                              value={row.article_id}
                              onChange={(e) => {
                                const updated = [...challanRows]
                                updated[idx].article_id = e.target.value
                                setChallanRows(updated)
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 truncate"
                            >
                              {articles.map(art => (
                                <option key={art.id} value={art.id}>Art #{art.art_no} {art.description ? `• ${art.description}` : ''}</option>
                              ))}
                            </select>
                          </div>

                          {challanRows.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => setChallanRows(challanRows.filter((_, i) => i !== idx))}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer self-end mb-0.5"
                              title="Remove article line"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Line Details: Color, Size, Quantity in 3 Columns */}
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Color / Pattern
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Navy Blue"
                              value={row.color}
                              onChange={(e) => {
                                const updated = [...challanRows]
                                updated[idx].color = e.target.value
                                setChallanRows(updated)
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1 text-center">
                              Size
                            </label>
                            <input 
                              type="text" 
                              placeholder="L / 32"
                              value={row.size}
                              onChange={(e) => {
                                const updated = [...challanRows]
                                updated[idx].size = e.target.value
                                setChallanRows(updated)
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1 text-right">
                              Quantity (pcs) *
                            </label>
                            <input 
                              type="number" 
                              placeholder="200"
                              value={row.quantity}
                              onChange={(e) => {
                                const updated = [...challanRows]
                                updated[idx].quantity = parseInt(e.target.value) || 0
                                setChallanRows(updated)
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono font-black text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-black/10 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-slate-500 font-mono hidden sm:block">
                  Ready for Dispatch Registration
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateChallanModal(false)}
                    disabled={isPending}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isPending ? 'Generating Challan...' : 'Generate & Issue Delivery Challan'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD PRE-LOADING COUNTING AUDIT                */}
      {/* ======================================================== */}
      {showCountingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-black/10 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    Record Pre-Loading Count
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">Physical piece verification before gate-out</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCountingModal(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                try {
                  await recordCountingAudit(formData)
                  setShowCountingModal(false)
                  showDialog('Audit Saved', 'Pre-loading counting report has been verified and saved.', 'success')
                } catch (err: any) {
                  showDialog('Error', err.message || 'Failed to record audit', 'error')
                }
              })
            }} className="flex flex-col flex-1">
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(88vh-140px)]">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Article Style *
                  </label>
                  <select 
                    name="article_id" 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                  >
                    {articles.map(art => (
                      <option key={art.id} value={art.id}>Art #{art.art_no} {art.description ? `• ${art.description}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Color
                    </label>
                    <input 
                      type="text" 
                      name="color" 
                      defaultValue="Navy Blue" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Size
                    </label>
                    <input 
                      type="text" 
                      name="size" 
                      defaultValue="L" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 text-center" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Physical Count (pcs) *
                    </label>
                    <input 
                      type="number" 
                      name="counted_qty" 
                      required 
                      placeholder="e.g. 500" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 text-right" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Expected Qty (pcs)
                    </label>
                    <input 
                      type="number" 
                      name="expected_qty" 
                      required 
                      placeholder="e.g. 500" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 text-right" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Auditor Remarks / Notes
                  </label>
                  <input 
                    type="text" 
                    name="remarks" 
                    placeholder="Verified carton tags & pack count" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20" 
                  />
                </div>
              </div>

              <div className="p-4 sm:p-5 border-t border-black/10 bg-slate-50/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCountingModal(false)}
                  disabled={isPending}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isPending ? 'Saving...' : 'Save Counting Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PRINTABLE DELIVERY CHALLAN GATE PASS INVOICE    */}
      {/* ======================================================== */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10 overflow-y-auto max-h-[94vh] my-auto print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-200">
            
            {/* Header / Invoice Branding */}
            <div className="flex items-start justify-between pb-4 border-b border-black/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  NUBIRA CREATION
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Garment Manufacturing & Apparel Unit</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Rafi Ahmed Kidwai Road, Kolkata 700055, West Bengal</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono font-extrabold text-xs text-[#3A3564] shadow-2xs">
                  {selectedChallanForPrint.challan_no}
                </span>
                <p className="text-xs text-slate-500 font-mono mt-1">Date: {selectedChallanForPrint.delivery_date}</p>
              </div>
            </div>

            {/* Consignee & Transport Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {selectedChallanForPrint.billed_to_name ? 'Billed To' : 'Buyer / Consignee'}
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {selectedChallanForPrint.billed_to_name || selectedChallanForPrint.buyer_name}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {selectedChallanForPrint.billed_to_address || selectedChallanForPrint.destination || 'Direct Factory Delivery'}
                </p>
                {selectedChallanForPrint.billed_to_gstin && (
                  <p className="font-mono text-xs font-bold text-slate-800 mt-1">
                    GSTIN: {selectedChallanForPrint.billed_to_gstin}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  {selectedChallanForPrint.shipping_to_name ? 'Shipping To / Delivery' : 'Transport & Dispatch'}
                </span>
                <p className="font-bold text-slate-800">
                  {selectedChallanForPrint.shipping_to_name || `Vehicle: ${selectedChallanForPrint.vehicle_no || 'Standard Freight'}`}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {selectedChallanForPrint.shipping_to_address || `Driver: ${selectedChallanForPrint.driver_name || 'N/A'}`}
                </p>
                <p className="font-mono font-bold text-slate-900 mt-1">
                  Vehicle: {selectedChallanForPrint.vehicle_no || '-'}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-black/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Art No</th>
                    <th className="py-2.5 px-3">Color</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-right">Order Qty</th>
                    <th className="py-2.5 px-3 text-right">Delivery</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedChallanForPrint.challan_items || []).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900 font-mono">{item.article?.art_no || '5223'}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.color || '-'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.size || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {(item.order_qty ?? item.quantity).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                        {(item.delivery_qty ?? item.quantity).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                        {(item.balance_qty ?? 0) === 0 ? '0' : (item.balance_qty! > 0 ? `+${item.balance_qty}` : item.balance_qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/10 font-bold text-xs bg-slate-50">
                    <td colSpan={4} className="py-2.5 px-3 text-right font-mono">
                      {selectedChallanForPrint.total_bags ? `Total Bags: ${selectedChallanForPrint.total_bags} | Total Dispatched:` : 'Total Dispatched Pieces:'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {(selectedChallanForPrint.total_order_qty || selectedChallanForPrint.total_pieces).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#3A3564] font-black">
                      {(selectedChallanForPrint.total_delivery_qty || selectedChallanForPrint.total_pieces).toLocaleString()} pcs
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {(selectedChallanForPrint.total_balance_qty || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Spot / Notes Box */}
            {selectedChallanForPrint.spot_notes && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
                  Spot / Floor Remarks & Notes
                </span>
                <p className="text-amber-950 whitespace-pre-line font-medium leading-relaxed">
                  {selectedChallanForPrint.spot_notes}
                </p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs text-slate-500">
              <div className="border-t border-slate-200 pt-2 font-medium">Prepared By (QC / Dispatch)</div>
              <div className="border-t border-slate-200 pt-2 font-medium">Driver / Transporter</div>
              <div className="border-t border-slate-200 pt-2 font-bold text-slate-900">
                Authorised Signatory
                <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{selectedChallanForPrint.status === 'APPROVED_FOR_DISPATCH' ? 'Digitally Approved by Admin' : 'Pending Admin Signoff'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
              <button 
                type="button" 
                onClick={() => setSelectedChallanForPrint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold bg-[#3A3564] hover:bg-[#2A2649] shadow-xs cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Challan</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Subtle Error / Confirmation Dialog */}
      <SubtleDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        title={dialogState.title}
        description={dialogState.description}
        variant={dialogState.variant}
        confirmText={dialogState.confirmText}
      />

    </div>
  )
}
