'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Layers,
  Scissors,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  FilterX
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'

type DailyProductRow = {
  id: string
  entry_date: string
  quantity: number
  notes?: string | null
  color?: string | null
  size?: string | null
  created_at?: string
  lineman?: { username: string } | null
  article?: { art_no: string; description: string } | null
}

type QCLogRow = {
  id: string
  entry_date: string
  stage: string
  qty_received: number
  qty_passed: number
  qty_rejected: number
  defect_type: string
  remarks?: string | null
  color?: string | null
  size?: string | null
  mending_returned_qty?: number
  mending_scrap_qty?: number
  mending_status?: string | null
  bundle_size?: number
  total_bundles?: number
  sent_to_store?: boolean
  created_at?: string
  lineman?: { username: string } | null
  article?: { art_no: string; description: string } | null
}

type StoreTxRow = {
  id: string
  entry_date?: string
  created_at: string
  type: string
  quantity: number
  party_name?: string | null
  article?: { art_no: string; description: string } | null
}

type WorkerAssignmentRow = {
  id: string
  worker_name?: string | null
  assigned_qty: number
  completed_qty: number
  color?: string | null
  size?: string | null
  status: string
  notes?: string | null
  assigned_at: string
  completed_at?: string | null
  entry_date: string
  lineman?: { username: string } | null
  article?: { art_no: string; description: string } | null
}

interface ReportsClientProps {
  dailyProducts: DailyProductRow[]
  qcLogs: QCLogRow[]
  storeTransactions: StoreTxRow[]
  workerAssignments: WorkerAssignmentRow[]
}

type ReportTab = 'production' | 'workers' | 'qc' | 'inventory'
type DateFilterMode = 'today' | 'this_week' | 'this_month' | 'custom' | 'all'

const TAB_CONFIG: Record<ReportTab, { label: string; icon: any; title: string; subtitle: string; unit: string }> = {
  production: {
    label: 'Daily Sewing Output',
    icon: Scissors,
    title: 'Sewing Floor Output',
    subtitle: 'Stitched garments logged by floor linemen',
    unit: 'pcs'
  },
  workers: {
    label: 'Worker Assignments',
    icon: Users,
    title: 'Worker Piece-Rate Distribution',
    subtitle: 'Cutting bundles and line allotments distributed to tailors',
    unit: 'pcs'
  },
  qc: {
    label: 'QC & Finishing',
    icon: CheckCircle2,
    title: 'QC & Finishing Audits',
    subtitle: 'Bundle quality inspection results, defect logs, and mending status',
    unit: 'inspected'
  },
  inventory: {
    label: 'Store Inventory',
    icon: Package,
    title: 'Store & Inventory Movements',
    subtitle: 'Raw trims consumption and finished goods stock transactions',
    unit: 'units'
  }
}

export function ReportsClient({
  dailyProducts,
  qcLogs,
  storeTransactions,
  workerAssignments,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>('production')
  const [dateFilter, setDateFilter] = useState<DateFilterMode>('today')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Date range helpers
  const getDateRangeBounds = (mode: DateFilterMode) => {
    const now = new Date()
    let start = new Date(now)
    let end = new Date(now)
    let prevStart = new Date(now)
    let prevEnd = new Date(now)

    if (mode === 'today') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      // previous day
      prevStart.setDate(prevStart.getDate() - 1)
      prevStart.setHours(0, 0, 0, 0)
      prevEnd.setDate(prevEnd.getDate() - 1)
      prevEnd.setHours(23, 59, 59, 999)
    } else if (mode === 'this_week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      // previous week
      prevStart.setDate(start.getDate() - 7)
      prevStart.setHours(0, 0, 0, 0)
      prevEnd.setDate(start.getDate() - 1)
      prevEnd.setHours(23, 59, 59, 999)
    } else if (mode === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      // previous month
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    } else if (mode === 'custom' && customStartDate && customEndDate) {
      start = new Date(customStartDate + 'T00:00:00')
      end = new Date(customEndDate + 'T23:59:59')
      const durationMs = end.getTime() - start.getTime()
      prevEnd = new Date(start.getTime() - 1)
      prevStart = new Date(prevEnd.getTime() - durationMs)
    } else {
      // all
      start = new Date(2000, 0, 1)
      end = new Date(2100, 0, 1)
      prevStart = new Date(1990, 0, 1)
      prevEnd = new Date(1999, 11, 31)
    }

    return { start, end, prevStart, prevEnd }
  }

  const dateBounds = useMemo(() => getDateRangeBounds(dateFilter), [dateFilter, customStartDate, customEndDate])

  const isDateInRange = (dateStr: string | undefined | null, start: Date, end: Date) => {
    if (!dateStr) return false
    const d = new Date(dateStr.length === 10 ? dateStr + 'T12:00:00' : dateStr)
    return d >= start && d <= end
  }

  // 1. Filtered Datasets based on active tab, date, and search
  const currentTabRawData = useMemo(() => {
    switch (activeTab) {
      case 'production': return dailyProducts
      case 'workers': return workerAssignments
      case 'qc': return qcLogs
      case 'inventory': return storeTransactions
      default: return []
    }
  }, [activeTab, dailyProducts, workerAssignments, qcLogs, storeTransactions])

  const getDateField = (item: any) => {
    return item.entry_date || item.assigned_at || item.created_at
  }

  const getMetricValue = (item: any, tab: ReportTab): number => {
    switch (tab) {
      case 'production': return item.quantity || 0
      case 'workers': return item.assigned_qty || 0
      case 'qc': return (item.qty_passed || 0) + (item.qty_rejected || 0) || item.qty_received || 0
      case 'inventory': return Math.abs(item.quantity || 0)
      default: return 0
    }
  }

  // Filtered rows for the current period
  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()

    return currentTabRawData.filter((item: any) => {
      // Date Check
      const dateStr = getDateField(item)
      if (dateFilter !== 'all' && !isDateInRange(dateStr, dateBounds.start, dateBounds.end)) {
        return false
      }

      // Search Check
      if (!q) return true

      if (activeTab === 'production') {
        return (
          item.lineman?.username?.toLowerCase().includes(q) ||
          item.article?.art_no?.toLowerCase().includes(q) ||
          item.article?.description?.toLowerCase().includes(q) ||
          item.color?.toLowerCase().includes(q) ||
          item.size?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
        )
      } else if (activeTab === 'workers') {
        return (
          item.worker_name?.toLowerCase().includes(q) ||
          item.lineman?.username?.toLowerCase().includes(q) ||
          item.article?.art_no?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q) ||
          item.color?.toLowerCase().includes(q)
        )
      } else if (activeTab === 'qc') {
        return (
          item.defect_type?.toLowerCase().includes(q) ||
          item.stage?.toLowerCase().includes(q) ||
          item.remarks?.toLowerCase().includes(q) ||
          item.article?.art_no?.toLowerCase().includes(q) ||
          item.lineman?.username?.toLowerCase().includes(q)
        )
      } else if (activeTab === 'inventory') {
        return (
          item.party_name?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q) ||
          item.article?.art_no?.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [currentTabRawData, activeTab, dateFilter, dateBounds, searchTerm])

  // Summary Metrics Computation
  const currentPeriodAggregate = useMemo(() => {
    return filteredRows.reduce((sum, item) => sum + getMetricValue(item, activeTab), 0)
  }, [filteredRows, activeTab])

  // Previous Period Aggregate Calculation
  const { prevPeriodAggregate, hasPriorData } = useMemo(() => {
    if (dateFilter === 'all') {
      return { prevPeriodAggregate: 0, hasPriorData: false }
    }

    let count = 0
    let sum = 0

    currentTabRawData.forEach((item: any) => {
      const dateStr = getDateField(item)
      if (isDateInRange(dateStr, dateBounds.prevStart, dateBounds.prevEnd)) {
        count++
        sum += getMetricValue(item, activeTab)
      }
    })

    return { prevPeriodAggregate: sum, hasPriorData: count > 0 }
  }, [currentTabRawData, activeTab, dateFilter, dateBounds])

  // Trend Comparison Computation
  const trendComparison = useMemo(() => {
    if (!hasPriorData) {
      return { status: 'no_data', label: 'No prior data', diffPct: 0 }
    }

    if (prevPeriodAggregate === 0) {
      if (currentPeriodAggregate > 0) {
        return { status: 'up', label: '+100%', diffPct: 100 }
      }
      return { status: 'flat', label: '0%', diffPct: 0 }
    }

    const diff = currentPeriodAggregate - prevPeriodAggregate
    const pct = Math.round((diff / prevPeriodAggregate) * 100)

    if (pct > 0) {
      return { status: 'up', label: `+${pct}%`, diffPct: pct }
    } else if (pct < 0) {
      return { status: 'down', label: `${pct}%`, diffPct: pct }
    } else {
      return { status: 'flat', label: '0%', diffPct: 0 }
    }
  }, [currentPeriodAggregate, prevPeriodAggregate, hasPriorData])

  // Sparkline data points (last 7 data points from filteredRows sorted by date)
  const sparklinePoints = useMemo(() => {
    if (filteredRows.length < 2) return []

    // Group sums by date
    const dateMap: Record<string, number> = {}
    filteredRows.forEach(item => {
      const d = (getDateField(item) || '').split('T')[0]
      if (d) {
        dateMap[d] = (dateMap[d] || 0) + getMetricValue(item, activeTab)
      }
    })

    const sortedDates = Object.keys(dateMap).sort()
    const points = sortedDates.slice(-7).map(d => dateMap[d])
    return points.length >= 2 ? points : []
  }, [filteredRows, activeTab])

  // Sparkline SVG Path generator
  const sparklineSvgPath = useMemo(() => {
    if (sparklinePoints.length < 2) return ''
    const min = Math.min(...sparklinePoints)
    const max = Math.max(...sparklinePoints)
    const range = max - min || 1
    const width = 110
    const height = 36
    const padding = 4

    const coords = sparklinePoints.map((val, idx) => {
      const x = padding + (idx / (sparklinePoints.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((val - min) / range) * (height - 2 * padding)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })

    return coords.join(' ')
  }, [sparklinePoints])

  // Pagination
  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, currentPage, pageSize])

  // Label for Selected Date Range
  const rangeLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today': return 'Today'
      case 'this_week': return 'This Week'
      case 'this_month': return 'This Month'
      case 'custom': return `${customStartDate} to ${customEndDate}`
      case 'all': return 'All Time'
    }
  }, [dateFilter, customStartDate, customEndDate])

  const prevPeriodLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today': return 'yesterday'
      case 'this_week': return 'last week'
      case 'this_month': return 'last month'
      case 'custom': return 'prior period'
      default: return 'previous period'
    }
  }, [dateFilter])

  // Print Handler
  const handlePrint = () => {
    window.print()
  }

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredRows.length === 0) return

    let headers: string[] = []
    let rows: any[][] = []

    if (activeTab === 'production') {
      headers = ['Entry Date', 'Lineman', 'Art No', 'Description', 'Color', 'Size', 'Quantity', 'Notes']
      rows = (filteredRows as DailyProductRow[]).map(r => [
        r.entry_date,
        r.lineman?.username || '',
        r.article?.art_no || '',
        '"' + (r.article?.description || '').replace(/"/g, '""') + '"',
        r.color || '',
        r.size || '',
        r.quantity,
        '"' + (r.notes || '').replace(/"/g, '""') + '"'
      ])
    } else if (activeTab === 'workers') {
      headers = ['Entry Date', 'Tailor Worker', 'Lineman', 'Art No', 'Color', 'Size', 'Assigned Qty', 'Completed Qty', 'Status', 'Assigned At']
      rows = (filteredRows as WorkerAssignmentRow[]).map(r => [
        r.entry_date,
        r.worker_name || '',
        r.lineman?.username || '',
        r.article?.art_no || '',
        r.color || '',
        r.size || '',
        r.assigned_qty,
        r.completed_qty,
        r.status,
        r.assigned_at
      ])
    } else if (activeTab === 'qc') {
      headers = ['Entry Date', 'Stage', 'Lineman', 'Art No', 'Color', 'Size', 'Qty Passed', 'Qty Rejected', 'Defect Type', 'Remarks']
      rows = (filteredRows as QCLogRow[]).map(r => [
        r.entry_date,
        r.stage,
        r.lineman?.username || '',
        r.article?.art_no || '',
        r.color || '',
        r.size || '',
        r.qty_passed,
        r.qty_rejected,
        r.defect_type,
        '"' + (r.remarks || '').replace(/"/g, '""') + '"'
      ])
    } else if (activeTab === 'inventory') {
      headers = ['Date', 'Type', 'Party Name', 'Art No', 'Quantity']
      rows = (filteredRows as StoreTxRow[]).map(r => [
        (r.entry_date || r.created_at).split('T')[0],
        r.type,
        r.party_name || '',
        r.article?.art_no || '',
        r.quantity
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset Filters Handler
  const handleClearFilters = () => {
    setSearchTerm('')
    setDateFilter('this_week')
    setCustomStartDate('')
    setCustomEndDate('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Page Header Card */}
      <div 
        className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
      >
        {/* Left: Badge + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Factory Reports & Analytics
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Real-time multi-department production, QC audit, tailor assignments, and store logs
            </p>
          </div>
        </div>

        {/* Right: Print, Export CSV & TV View */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <TvViewButton />

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-black/15 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-xs cursor-pointer bg-[#3A3564] hover:bg-[#2A2649] focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Report Type Tabs */}
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {(['production', 'workers', 'qc', 'inventory'] as ReportTab[]).map((tabKey) => {
          const cfg = TAB_CONFIG[tabKey]
          const TabIcon = cfg.icon
          const isActive = activeTab === tabKey
          
          let count = 0
          if (tabKey === 'production') count = dailyProducts.length
          else if (tabKey === 'workers') count = workerAssignments.length
          else if (tabKey === 'qc') count = qcLogs.length
          else if (tabKey === 'inventory') count = storeTransactions.length

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                setActiveTab(tabKey)
                setCurrentPage(1)
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border cursor-pointer focus:outline-none focus:ring-2 ${
                isActive
                  ? 'bg-[#3A3564] text-white shadow-xs border-transparent'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{cfg.label}</span>
              <span 
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        
        {/* Left Side: Segmented Date Pills + Custom Range Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Segmented Button Group */}
          <div 
            className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs"
          >
            {(['today', 'this_week', 'this_month'] as DateFilterMode[]).map((mode) => {
              const isActive = dateFilter === mode
              const labelMap: Record<string, string> = {
                today: 'Today',
                this_week: 'This Week',
                this_month: 'This Month'
              }
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setDateFilter(mode)
                    setCurrentPage(1)
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#3A3564] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labelMap[mode]}
                </button>
              )
            })}
          </div>

          {/* Custom Range Button */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer shadow-2xs ${
              dateFilter === 'custom'
                ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{dateFilter === 'custom' && customStartDate ? `${customStartDate} ~ ${customEndDate}` : 'Custom Range'}</span>
          </button>
        </div>

        {/* Right Side: Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keyword..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* 4. NEW — Summary Strip Above Table (Diagonal Gradient Card) */}
      <div 
        className="p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all bg-gradient-to-br from-[#FAF7F0] to-white"
      >
        <div className="space-y-1">
          <div 
            className="text-xs font-bold uppercase tracking-wider text-[#3A3564]"
          >
            Total Output — {rangeLabel}
          </div>
          <div className="flex items-baseline gap-3">
            <span 
              className="text-[28px] sm:text-[30px] font-bold font-[family-name:var(--font-heading)] leading-none text-slate-900"
            >
              {currentPeriodAggregate.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {TAB_CONFIG[activeTab].unit}
            </span>

            {/* vs. Previous Period Badge */}
            {dateFilter !== 'all' && (
              <div className="inline-flex items-center gap-1.5 ml-2">
                {trendComparison.status === 'no_data' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-600">
                    No prior data
                  </span>
                ) : trendComparison.status === 'up' ? (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{trendComparison.label} vs {prevPeriodLabel}</span>
                  </span>
                ) : trendComparison.status === 'down' ? (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{trendComparison.label} vs {prevPeriodLabel}</span>
                  </span>
                ) : (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>0% vs {prevPeriodLabel}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real SVG Polyline Sparkline (Only if >= 2 points) */}
        {sparklinePoints.length >= 2 && (
          <div className="flex flex-col items-end gap-1 shrink-0 self-end sm:self-auto">
            <div className="text-[10px] font-semibold font-mono text-slate-400">
              7-Day Activity Trend
            </div>
            <svg width="110" height="36" className="overflow-visible">
              <polyline
                fill="none"
                stroke="#3A3564"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklineSvgPath}
              />
            </svg>
          </div>
        )}
      </div>

      {/* 5. Main Data Table Card */}
      <div 
        className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden"
      >
        
        {/* Section Header */}
        <div 
          className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50"
        >
          <div>
            <h3 
              className="text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)]"
            >
              {TAB_CONFIG[activeTab].title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {TAB_CONFIG[activeTab].subtitle}
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F0] font-bold text-[#3A3564] border border-black/10 shadow-2xs">
            {filteredRows.length} entries
          </span>
        </div>

        {/* Table / Empty State */}
        {filteredRows.length === 0 ? (
          /* Smart Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
            >
              <FilterX className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 
                className="text-base font-bold font-[family-name:var(--font-heading)] text-slate-900"
              >
                No {TAB_CONFIG[activeTab].label} entries for {rangeLabel}
              </h4>
              <p className="text-xs text-slate-500">
                {searchTerm 
                  ? `No records match the search keyword "${searchTerm}".`
                  : 'No logs were registered for this specific date range.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                Clear Filters
              </button>
              {dateFilter === 'today' && (
                <button
                  type="button"
                  onClick={() => setDateFilter('this_week')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer bg-[#3A3564] hover:bg-[#2A2649]"
                >
                  Try This Week
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
              <thead>
                <tr 
                  className="bg-[#FAF7F0] border-b border-black/10 text-xs font-mono uppercase tracking-wider font-bold text-slate-700" 
                >
                  {activeTab === 'production' && (
                    <>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Lineman</th>
                      <th className="px-4 py-3.5">Article No</th>
                      <th className="px-4 py-3.5">Variant (Color/Size)</th>
                      <th className="px-4 py-3.5">Description</th>
                      <th className="px-4 py-3.5 font-bold">Quantity</th>
                      <th className="px-5 py-3.5">Notes</th>
                    </>
                  )}

                  {activeTab === 'workers' && (
                    <>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Tailor Worker</th>
                      <th className="px-4 py-3.5">Assigned By</th>
                      <th className="px-4 py-3.5">Article No</th>
                      <th className="px-4 py-3.5">Variant</th>
                      <th className="px-4 py-3.5 font-bold">Assigned / Done</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </>
                  )}

                  {activeTab === 'qc' && (
                    <>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Stage</th>
                      <th className="px-4 py-3.5">Lineman</th>
                      <th className="px-4 py-3.5">Article No</th>
                      <th className="px-4 py-3.5">Passed / Rejected</th>
                      <th className="px-4 py-3.5">Defect Type</th>
                      <th className="px-5 py-3.5">Remarks</th>
                    </>
                  )}

                  {activeTab === 'inventory' && (
                    <>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Transaction Type</th>
                      <th className="px-4 py-3.5">Party / Source</th>
                      <th className="px-4 py-3.5">Article No</th>
                      <th className="px-5 py-3.5 font-bold">Quantity</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* TAB 1: DAILY PRODUCTION */}
                    {activeTab === 'production' && (
                      <>
                        <td className="px-5 py-3 font-medium text-slate-900 font-mono text-xs">
                          {row.entry_date}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#3A3564]">
                          {row.lineman?.username || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.color || row.size ? `${row.color || '-'} / ${row.size || '-'}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {row.article?.description || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold font-mono text-slate-900 text-sm">
                          {row.quantity} pcs
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {row.notes || '-'}
                        </td>
                      </>
                    )}

                    {/* TAB 2: WORKER ASSIGNMENTS */}
                    {activeTab === 'workers' && (
                      <>
                        <td className="px-5 py-3 font-medium text-slate-900 font-mono text-xs">
                          {row.entry_date || (row.assigned_at ? row.assigned_at.split('T')[0] : '-')}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {row.worker_name || 'Floor Worker'}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#3A3564]">
                          {row.lineman?.username || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold font-mono text-slate-900">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.color || row.size ? `${row.color || '-'} / ${row.size || '-'}` : '-'}
                        </td>
                        <td className="px-4 py-3 font-bold font-mono">
                          <span className="text-emerald-700">{row.completed_qty || 0}</span>
                          <span className="text-slate-400 font-normal"> / </span>
                          <span className="text-slate-900">{row.assigned_qty} pcs</span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              row.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* TAB 3: QC & FINISHING */}
                    {activeTab === 'qc' && (
                      <>
                        <td className="px-5 py-3 font-medium text-slate-900 font-mono text-xs">
                          {row.entry_date}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 border border-slate-200 shadow-2xs">
                            {row.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#3A3564]">
                          {row.lineman?.username || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold font-mono text-slate-900">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold">
                          <span className="text-emerald-700 font-bold">{row.qty_passed} pass</span>
                          <span className="text-slate-300"> • </span>
                          <span className={row.qty_rejected > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {row.qty_rejected} rej
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {row.defect_type || '-'}
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {row.remarks || '-'}
                        </td>
                      </>
                    )}

                    {/* TAB 4: STORE INVENTORY */}
                    {activeTab === 'inventory' && (
                      <>
                        <td className="px-5 py-3 font-medium text-slate-900 font-mono text-xs">
                          {(row.entry_date || row.created_at).split('T')[0]}
                        </td>
                        <td className="px-4 py-3">
                          <span 
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                              row.type === 'INWARD'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">
                          {row.party_name || '-'}
                        </td>
                        <td className="px-4 py-3 font-bold font-mono text-slate-900">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-5 py-3 font-bold font-mono text-slate-900 text-sm">
                          {row.quantity} units
                        </td>
                      </>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {totalItems > 0 && (
          <div 
            className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]" 
          >
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span>–<span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="font-bold text-slate-900">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
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
                    className={`w-8 h-8 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                      isActive
                        ? 'bg-[#3A3564] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
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
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* CUSTOM RANGE PICKER MODAL                                */}
      {/* ======================================================== */}
      {showCustomModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCustomModal(false)
          }}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-black/10 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-slate-900">
                  Custom Date Range
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-[13px]">
              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 text-sm font-semibold outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/70 text-sm font-semibold outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateFilter('custom')
                    setShowCustomModal(false)
                    setCurrentPage(1)
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className="py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs bg-[#3A3564] hover:bg-[#2A2649] active:scale-[0.98]"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
