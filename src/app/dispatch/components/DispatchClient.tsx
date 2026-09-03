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
  Building2, 
  Calendar, 
  X, 
  Trash2, 
  Eye,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { createDeliveryChallan, recordCountingAudit } from '../actions'

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

  // Sorting state
  const [sortCol, setSortCol] = useState<string>('default')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Modal States
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false)
  const [showCountingModal, setShowCountingModal] = useState(false)
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<DeliveryChallan | null>(null)

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
      
      {/* 1. Page Header Card */}
      <div 
        className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
          >
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Dispatch & Logistics Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Pre-loading physical counting, delivery challans, and truck transport management
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setShowCountingModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-black/15 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <ClipboardCheck className="w-4 h-4 text-slate-500" />
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery Challan</span>
          </button>

          <button 
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-black/15 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <TvViewButton />
        </div>
      </div>

      {/* 2. KPI Overview Banner (Neutral and Semantic Alert Styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Dispatched */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Total Dispatched
            </span>
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block mt-2">
              {totalDeliveredPieces.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        {/* Delivery Challans */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Delivery Challans
            </span>
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block mt-2">
              {totalChallansCount} <span className="text-xs font-normal text-slate-400">issued</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Counted Audits */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:border-black/25 transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Counted Audits
            </span>
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900 block mt-2">
              {totalCountedPieces.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            <ClipboardCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Discrepancies (Semantic Alert State) */}
        <div 
          onClick={() => {
            if (totalDiscrepancies > 0) {
              setActiveTab('challans')
              setStatusFilter('DISCREPANCY')
              setCurrentPage(1)
            }
          }}
          className={`p-5 sm:p-6 rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
            totalDiscrepancies > 0 ? 'cursor-pointer hover:shadow-sm bg-rose-50/50 border-rose-200' : 'bg-white border-black/10 hover:border-black/25'
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: totalDiscrepancies > 0 ? '#B91C1C' : '#64748B' }}>
              Discrepancies
            </span>
            <span className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none block mt-2" style={{ color: totalDiscrepancies > 0 ? '#B91C1C' : '#0F172A' }}>
              {totalDiscrepancies} <span className="text-xs font-normal text-slate-400">mismatches</span>
            </span>
          </div>
          <div 
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
              totalDiscrepancies > 0 
                ? 'bg-rose-100 text-rose-600 border-rose-200' 
                : 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs, Status Filter Chips & Search Toolbar */}
      <div 
        className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs"
      >
        {/* Top Row: Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => handleTabChange('challans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'challans'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Delivery Challans Master ({filteredChallans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('counting')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer outline-none ${
              activeTab === 'counting'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-transparent'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Pre-Loading Counting Audits ({filteredCounting.length})</span>
          </button>
        </div>

        {/* Bottom Row: Status Filter Chips + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          
          {/* Status Filter Chips (For Challans Tab) */}
          {activeTab === 'challans' ? (
            <div className="flex flex-wrap items-center gap-1.5">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer outline-none ${
                      isSelected
                        ? 'bg-[#3A3564] text-white border-transparent shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {labelMap[st]}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-500">
              Physical piece count audits conducted before loading
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search challan, buyer, vehicle..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Main Table / Empty State Area */}
      <div 
        className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
      >
        
        {/* ======================================================== */}
        {/* TAB 1: DELIVERY CHALLANS MASTER (WITH RECONCILIATION)    */}
        {/* ======================================================== */}
        {activeTab === 'challans' && (
          <div>
            {filteredChallans.length === 0 ? (
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                >
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No delivery challans yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Challans you create will show up here, with automatic reconciliation against cut and counted quantities.
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
                  className="px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 mt-2 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Delivery Challan</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Challan No */}
                      <th 
                        onClick={() => handleSort('challan_no')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
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
                        className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
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

                      <th className="px-4 py-3.5 font-bold">Buyer / Consignee</th>
                      <th className="px-4 py-3.5 font-bold">Vehicle / Transporter</th>
                      
                      {/* Reconciliation Quantities */}
                      <th className="px-3 py-3.5 text-right font-bold text-slate-600">Cut Qty</th>
                      <th className="px-3 py-3.5 text-right font-bold text-slate-600">Counted Qty</th>
                      
                      {/* Sortable Dispatched Qty */}
                      <th 
                        onClick={() => handleSort('dispatched')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-[#3A3564]"
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

                      {/* Sortable Reconciliation Badge */}
                      <th 
                        onClick={() => handleSort('reconciliation')}
                        className="px-4 py-3.5 text-center cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
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

                      <th className="px-4 py-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedChallans.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold font-mono text-sm text-[#3A3564]">
                          {row.challan_no}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-600 text-xs whitespace-nowrap">
                          {row.delivery_date || row.created_at.split('T')[0]}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 text-sm">{row.buyer_name}</div>
                          {row.destination && <div className="text-xs text-slate-500 font-normal mt-0.5">{row.destination}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800 text-xs sm:text-[13px]">{row.vehicle_no || '-'}</div>
                          {row.driver_name && <div className="text-xs text-slate-500 mt-0.5">{row.driver_name} {row.driver_phone ? '(' + row.driver_phone + ')' : ''}</div>}
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-600 font-medium text-xs sm:text-[13px]">
                          {row.cutQty.toLocaleString()} pcs
                        </td>
                        <td className="px-3 py-3.5 text-right font-mono text-slate-700 font-medium text-xs sm:text-[13px]">
                          {row.countedQty.toLocaleString()} pcs
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-[#3A3564] text-xs sm:text-[13px]">
                          {row.total_pieces.toLocaleString()} pcs
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {row.reconciliationStatus === 'MATCHED' && (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                          {row.reconciliationStatus === 'DISCREPANCY' && (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                          {row.reconciliationStatus === 'PENDING' && (
                            <span 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>{row.reconciliationLabel}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedChallanForPrint(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-[#FAF7F0] hover:bg-slate-100 text-xs font-bold text-[#3A3564] transition-all shadow-2xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#3A3564]" />
                            <span>Print / View</span>
                          </button>
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
              <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                  <ClipboardCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  No counting audits yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  Physical piece counting reports before truck loading will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCountingModal(true)}
                  className="px-5 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2 mt-2 active:scale-[0.98]"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Record Counting</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                      
                      {/* Sortable Date */}
                      <th 
                        onClick={() => handleSort('date')}
                        className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold"
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

                      <th className="px-4 py-3.5 font-bold">Article No</th>
                      <th className="px-4 py-3.5 font-bold">Color / Size</th>
                      
                      {/* Sortable Counted Qty */}
                      <th 
                        onClick={() => handleSort('counted')}
                        className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors select-none font-bold text-[#3A3564]"
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

                      <th className="px-4 py-3.5 text-right font-bold text-slate-600">Expected Qty</th>
                      <th className="px-4 py-3.5 text-center font-bold">Difference</th>
                      <th className="px-4 py-3.5 font-bold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedCounting.map((row) => {
                      const diff = row.counted_qty - row.expected_qty
                      const isMatch = diff === 0
                      const isShort = diff < 0

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-slate-600 text-xs whitespace-nowrap">
                            {row.entry_date || row.created_at.split('T')[0]}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-sm text-[#3A3564]">
                            {row.article?.art_no || '-'}
                          </td>
                          <td className="px-4 py-3.5">
                            {(row.color || row.size) ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                {row.color} {row.size ? '(' + row.size + ')' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-[#3A3564] text-xs sm:text-[13px]">
                            {row.counted_qty.toLocaleString()} pcs
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-600 text-xs sm:text-[13px]">
                            {row.expected_qty.toLocaleString()} pcs
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span 
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                                isMatch
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isShort
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {diff > 0 ? '+' + diff : diff} pcs
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 text-xs sm:text-[13px]">
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
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, currentListCount)}</span> of <span className="font-bold text-slate-900">{currentListCount}</span> {activeTab === 'challans' ? 'challans' : 'audits'}
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
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE NEW DELIVERY CHALLAN (MULTI-ITEM)         */}
      {/* ======================================================== */}
      {showCreateChallanModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-black/10 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                    Generate Delivery Challan
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                    Issue outward gate pass with multi-item style breakdown
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateChallanModal(false)} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              formData.set('items_json', JSON.stringify(challanRows))
              startTransition(async () => {
                await createDeliveryChallan(formData)
                setShowCreateChallanModal(false)
              })
            }} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Challan Number
                  </label>
                  <input 
                    type="text" 
                    name="challan_no" 
                    defaultValue={'CH-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)} 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#3A3564] shadow-2xs outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Buyer / Consignee Name
                  </label>
                  <input 
                    type="text" 
                    name="buyer_name" 
                    required 
                    placeholder="e.g. Zara Mumbai Hub" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Destination City
                  </label>
                  <input 
                    type="text" 
                    name="destination" 
                    placeholder="Bhiwandi Godown" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Vehicle / Truck No
                  </label>
                  <input 
                    type="text" 
                    name="vehicle_no" 
                    placeholder="MH-04-AB-1234" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Driver Phone
                  </label>
                  <input 
                    type="text" 
                    name="driver_phone" 
                    placeholder="9876543210" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
              </div>

              {/* Multi-Item Table Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Challan Items ({challanRows.reduce((sum, r) => sum + (r.quantity || 0), 0)} pcs)
                  </span>
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
                    className="text-xs sm:text-[13px] font-bold text-[#3A3564] hover:text-[#2A2649] flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg bg-[#FAF7F0] border border-black/10 transition-colors shadow-2xs active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Article Row</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {challanRows.map((row, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 shadow-2xs space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5">
                      <div className="flex-1 min-w-0">
                        <label className="block sm:hidden text-xs font-bold uppercase text-slate-500 font-mono mb-1">Article</label>
                        <select 
                          value={row.article_id}
                          onChange={(e) => {
                            const updated = [...challanRows]
                            updated[idx].article_id = e.target.value
                            setChallanRows(updated)
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 outline-none cursor-pointer shadow-2xs"
                        >
                          {articles.map(art => (
                            <option key={art.id} value={art.id}>{art.art_no} ({art.description})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-12 gap-2 sm:flex sm:items-center sm:gap-2">
                        <div className="col-span-5 sm:w-28">
                          <label className="block sm:hidden text-xs font-bold uppercase text-slate-500 font-mono mb-1">Color</label>
                          <input 
                            type="text" 
                            placeholder="Color"
                            value={row.color}
                            onChange={(e) => {
                              const updated = [...challanRows]
                              updated[idx].color = e.target.value
                              setChallanRows(updated)
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs"
                          />
                        </div>

                        <div className="col-span-3 sm:w-20">
                          <label className="block sm:hidden text-xs font-bold uppercase text-slate-500 font-mono mb-1">Size</label>
                          <input 
                            type="text" 
                            placeholder="Size"
                            value={row.size}
                            onChange={(e) => {
                              const updated = [...challanRows]
                              updated[idx].size = e.target.value
                              setChallanRows(updated)
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs"
                          />
                        </div>

                        <div className="col-span-3 sm:w-24">
                          <label className="block sm:hidden text-xs font-bold uppercase text-slate-500 font-mono mb-1">Qty</label>
                          <input 
                            type="number" 
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) => {
                              const updated = [...challanRows]
                              updated[idx].quantity = parseInt(e.target.value) || 0
                              setChallanRows(updated)
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-1 focus:ring-[#3A3564] rounded-lg px-2.5 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none text-right shadow-2xs"
                          />
                        </div>

                        {challanRows.length > 1 ? (
                          <div className="col-span-1 flex items-end sm:items-center justify-center">
                            <button 
                              type="button"
                              onClick={() => setChallanRows(challanRows.filter((_, i) => i !== idx))}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 text-white rounded-xl font-bold text-sm bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] mt-3"
              >
                <Truck className="w-4 h-4" />
                <span>{isPending ? 'Generating Challan...' : 'Generate & Issue Delivery Challan'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD PRE-LOADING COUNTING AUDIT                */}
      {/* ======================================================== */}
      {showCountingModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl border border-black/10 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                    Record Pre-Loading Counting Audit
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
                    Log physical piece count checks before truck dispatch
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCountingModal(false)} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              startTransition(async () => {
                await recordCountingAudit(formData)
                setShowCountingModal(false)
              })
            }} className="space-y-3.5">
              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Article Style
                </label>
                <select 
                  name="article_id" 
                  required 
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none transition-all cursor-pointer"
                >
                  {articles.map(art => (
                    <option key={art.id} value={art.id}>{art.art_no} ({art.description})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Color
                  </label>
                  <input 
                    type="text" 
                    name="color" 
                    defaultValue="Navy Blue" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Size
                  </label>
                  <input 
                    type="text" 
                    name="size" 
                    defaultValue="L" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Physical Count (pcs)
                  </label>
                  <input 
                    type="number" 
                    name="counted_qty" 
                    required 
                    placeholder="e.g. 500" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Expected Qty (pcs)
                  </label>
                  <input 
                    type="number" 
                    name="expected_qty" 
                    required 
                    placeholder="e.g. 500" 
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-mono font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Auditor Remarks / Notes
                </label>
                <input 
                  type="text" 
                  name="remarks" 
                  placeholder="Verified carton tags & pack count" 
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-2xs outline-none transition-all" 
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 text-white rounded-xl font-bold text-sm bg-[#3A3564] hover:bg-[#2A2649] disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] mt-3"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{isPending ? 'Saving Audit Record...' : 'Save Counting Audit Record'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PRINTABLE DELIVERY CHALLAN GATE PASS INVOICE    */}
      {/* ======================================================== */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10 overflow-y-auto max-h-[95vh] print:p-0 print:border-none print:shadow-none animate-in zoom-in-95 duration-200">
            
            {/* Header / Invoice Branding */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  NUBIRA CREATION
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Garment Manufacturing & Export Division</p>
                <p className="text-xs text-slate-500 mt-0.5">Plot #14, Industrial Area, Surat, Gujarat</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono font-bold text-xs text-[#3A3564] shadow-2xs">
                  {selectedChallanForPrint.challan_no}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">Date: {selectedChallanForPrint.delivery_date}</p>
              </div>
            </div>

            {/* Consignee & Transport Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-[13px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">Buyer / Consignee</span>
                <p className="font-bold text-slate-900 text-sm">{selectedChallanForPrint.buyer_name}</p>
                <p className="text-slate-600 mt-0.5">{selectedChallanForPrint.destination || 'Direct Factory Delivery'}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-1">Transport & Dispatch</span>
                <p className="font-semibold text-slate-800">Vehicle: {selectedChallanForPrint.vehicle_no || 'Standard Freight'}</p>
                <p className="text-slate-600 mt-0.5">Driver: {selectedChallanForPrint.driver_name || 'N/A'} {selectedChallanForPrint.driver_phone ? '(' + selectedChallanForPrint.driver_phone + ')' : ''}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                <thead>
                  <tr className="border-b bg-[#FAF7F0] text-xs font-bold uppercase font-mono tracking-wider text-slate-700">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Article Style</th>
                    <th className="py-2.5 px-3">Color / Variant</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedChallanForPrint.challan_items || []).map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.article?.art_no || 'Standard Article'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.color || '-'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.size || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{item.quantity.toLocaleString()} pcs</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-bold text-sm bg-slate-50">
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-700">Total Dispatched Pieces:</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-[#3A3564]">
                      {selectedChallanForPrint.total_pieces.toLocaleString()} pcs
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs text-slate-600 font-medium">
              <div className="border-t border-slate-300 pt-2">Prepared By (Dispatch)</div>
              <div className="border-t border-slate-300 pt-2">Driver / Transporter</div>
              <div className="border-t border-slate-300 pt-2">Receiver's Signature & Stamp</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button 
                type="button" 
                onClick={() => setSelectedChallanForPrint(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Close
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer bg-[#3A3564] hover:bg-[#2A2649] transition-all active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Challan</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
