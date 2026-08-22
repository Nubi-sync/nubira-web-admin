'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Package, 
  TrendingUp, 
  Users, 
  Layers,
  ArrowLeft,
  Inbox,
  Wrench,
  Sparkles,
  ClipboardList
} from 'lucide-react'

type DailyProductRow = {
  id: string
  entry_date: string
  quantity: number
  notes?: string | null
  color?: string | null
  size?: string | null
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

export function ReportsClient({
  dailyProducts,
  qcLogs,
  storeTransactions,
  workerAssignments,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'production' | 'qc' | 'inventory' | 'employee' | 'workers'>('production')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('today')
  const [searchTerm, setSearchTerm] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]

  // Date filtering logic
  const filterByDate = (dateStr?: string | null) => {
    if (!dateStr) return false
    if (dateFilter === 'all') return true

    const rowDate = new Date(dateStr)
    const today = new Date()

    if (dateFilter === 'today') {
      return dateStr === todayStr
    }

    if (dateFilter === 'this_week') {
      const firstDayOfWeek = new Date(today)
      firstDayOfWeek.setDate(today.getDate() - today.getDay())
      firstDayOfWeek.setHours(0, 0, 0, 0)
      return rowDate >= firstDayOfWeek
    }

    if (dateFilter === 'this_month') {
      return (
        rowDate.getMonth() === today.getMonth() &&
        rowDate.getFullYear() === today.getFullYear()
      )
    }

    return true
  }

  // 1. Filtered Daily Production
  const filteredProduction = useMemo(() => {
    return dailyProducts.filter(item => {
      const matchesDate = filterByDate(item.entry_date)
      const matchesSearch =
        !searchTerm ||
        item.lineman?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.article?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [dailyProducts, dateFilter, searchTerm])

  const totalProducedQty = filteredProduction.reduce((sum, r) => sum + r.quantity, 0)

  // 2. Filtered QC Logs
  const filteredQC = useMemo(() => {
    return qcLogs.filter(item => {
      const matchesDate = filterByDate(item.entry_date)
      const matchesSearch =
        !searchTerm ||
        item.stage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lineman?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.defect_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [qcLogs, dateFilter, searchTerm])

  const qcStats = useMemo(() => {
    let rec = 0
    let checked = 0
    let passed = 0
    let inMending = 0
    let packed = 0

    filteredQC.forEach(r => {
      const stage = r.stage || ''
      if (stage === 'RECEIVING') {
        rec += r.qty_received || 0
      } else if (stage === 'CHECKING') {
        checked += (r.qty_passed || 0) + (r.qty_rejected || 0)
        passed += r.qty_passed || 0
      } else if (stage === 'MENDING') {
        if (r.mending_status === 'WITH_LINEMAN_FOR_REPAIR') {
          inMending += r.qty_rejected || 0
        } else if (r.mending_status === 'REPAIR_COMPLETED') {
          passed += r.mending_returned_qty || 0
        }
      } else if (stage === 'BULKING') {
        packed += (r.bundle_size || 0) * (r.total_bundles || 0)
      }
    })

    const passRate = checked > 0 ? ((passed / checked) * 100).toFixed(1) : '100.0'

    return { rec, checked, passed, inMending, packed, passRate }
  }, [filteredQC])

  // 3. Filtered Inventory (Grouped by Article)
  const inventoryReport = useMemo(() => {
    const map: Record<string, {
      art_no: string
      description: string
      totalInward: number
      totalOutward: number
      balance: number
      lastDate: string
    }> = {}

    storeTransactions.forEach(tx => {
      const artNo = tx.article?.art_no || 'Unknown'
      const desc = tx.article?.description || '-'
      if (!map[artNo]) {
        map[artNo] = {
          art_no: artNo,
          description: desc,
          totalInward: 0,
          totalOutward: 0,
          balance: 0,
          lastDate: tx.entry_date || tx.created_at?.split('T')[0] || '-'
        }
      }

      if (tx.type === 'INWARD') {
        map[artNo].totalInward += tx.quantity
        map[artNo].balance += tx.quantity
      } else if (tx.type === 'OUTWARD') {
        map[artNo].totalOutward += tx.quantity
        map[artNo].balance -= tx.quantity
      }
    })

    return Object.values(map).filter(item => {
      if (!searchTerm) return true
      return item.art_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [storeTransactions, searchTerm])

  // 4. Employee Performance Breakdown
  const employeePerformance = useMemo(() => {
    const map: Record<string, {
      username: string
      totalPieces: number
      daysActive: Set<string>
      articlesMap: Record<string, number>
    }> = {}

    filteredProduction.forEach(row => {
      const username = row.lineman?.username || 'Unknown'
      if (!map[username]) {
        map[username] = {
          username,
          totalPieces: 0,
          daysActive: new Set(),
          articlesMap: {}
        }
      }
      map[username].totalPieces += row.quantity
      if (row.entry_date) map[username].daysActive.add(row.entry_date)
      
      const artNo = row.article?.art_no || 'Unknown'
      map[username].articlesMap[artNo] = (map[username].articlesMap[artNo] || 0) + row.quantity
    })

    return Object.values(map).map(e => ({
      username: e.username,
      totalPieces: e.totalPieces,
      daysCount: e.daysActive.size || 1,
      avgPerDay: Math.round(e.totalPieces / (e.daysActive.size || 1)),
      topArticle: Object.entries(e.articlesMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
    }))
  }, [filteredProduction])

  // 5. Filtered Worker Assignments
  const filteredAssignments = useMemo(() => {
    return workerAssignments.filter(item => {
      const matchesDate = filterByDate(item.entry_date)
      const matchesSearch =
        !searchTerm ||
        item.lineman?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [workerAssignments, dateFilter, searchTerm])

  const totalAssignedQty = filteredAssignments.reduce((sum, r) => sum + r.assigned_qty, 0)
  const totalDoneQty = filteredAssignments.filter(r => r.status === 'DONE').reduce((sum, r) => sum + (r.completed_qty || r.assigned_qty), 0)

  // Export CSV Helper
  const handleExportCSV = () => {
    let headers: string[] = []
    let rows: (string | number)[][] = []
    let filename = `report_${activeTab}_${todayStr}.csv`

    if (activeTab === 'production') {
      headers = ['Date', 'Lineman', 'Article No', 'Color', 'Size', 'Description', 'Quantity', 'Notes']
      rows = filteredProduction.map(r => [
        r.entry_date,
        r.lineman?.username || '-',
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.article?.description || '-',
        r.quantity,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ])
    } else if (activeTab === 'qc') {
      headers = ['Date', 'Stage', 'Article No', 'Color', 'Size', 'Lineman', 'Qty Received', 'Qty Passed', 'Qty Rejected', 'Mending Fixed', 'Mending Scrap', 'Bundle Size', 'Total Bundles', 'Defect Type', 'Remarks']
      rows = filteredQC.map(r => [
        r.entry_date,
        r.stage,
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.lineman?.username || '-',
        r.qty_received || 0,
        r.qty_passed || 0,
        r.qty_rejected || 0,
        r.mending_returned_qty || 0,
        r.mending_scrap_qty || 0,
        r.bundle_size || 0,
        r.total_bundles || 0,
        r.defect_type || 'NONE',
        `"${(r.remarks || '').replace(/"/g, '""')}"`
      ])
    } else if (activeTab === 'inventory') {
      headers = ['Article No', 'Description', 'Total Inward (QC)', 'Total Outward (Dispatch)', 'Current Godown Balance']
      rows = inventoryReport.map(r => [
        r.art_no,
        r.description,
        r.totalInward,
        r.totalOutward,
        r.balance
      ])
    } else if (activeTab === 'employee') {
      headers = ['Lineman', 'Total Pieces Produced', 'Days Active', 'Avg Pieces / Day', 'Top Produced Article']
      rows = employeePerformance.map(r => [
        r.username,
        r.totalPieces,
        r.daysCount,
        r.avgPerDay,
        r.topArticle
      ])
    } else if (activeTab === 'workers') {
      headers = ['Date', 'Lineman', 'Worker Name', 'Article No', 'Color', 'Size', 'Assigned Qty', 'Given Time', 'Completed Time', 'Status', 'Notes']
      rows = filteredAssignments.map(r => [
        r.entry_date,
        r.lineman?.username || '-',
        r.worker_name || 'Worker',
        r.article?.art_no || '-',
        r.color || '-',
        r.size || '-',
        r.assigned_qty,
        r.assigned_at ? new Date(r.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        r.completed_at ? new Date(r.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
        r.status,
        `"${(r.notes || '').replace(/"/g, '""')}"`
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Factory Reports & Analytics
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 ml-11">
            Real-time multi-department production, QC audit, tailor assignments, and store logs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0">
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'production'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Daily Sewing Output ({filteredProduction.length})
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'workers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Worker Assignments ({filteredAssignments.length})
          </button>

          <button
            onClick={() => setActiveTab('qc')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'qc'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            QC & Finishing ({filteredQC.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'inventory'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Store Inventory ({inventoryReport.length})
          </button>

          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'employee'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Lineman Leaderboard
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('this_week')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'this_week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'this_month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* TAB 1: DAILY PRODUCTION REPORT */}
        {activeTab === 'production' && (
          <div>
            <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sewing Floor Output</h3>
                <p className="text-xs text-slate-500">Stitched garments logged by floor linemen</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Output</span>
                <p className="text-xl font-black text-blue-600">{totalProducedQty.toLocaleString()} pcs</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Lineman</th>
                    <th className="px-6 py-4 font-bold">Article No</th>
                    <th className="px-6 py-4 font-bold">Variant (Color / Size)</th>
                    <th className="px-6 py-4 font-bold">Description</th>
                    <th className="px-6 py-4 font-bold text-right">Quantity</th>
                    <th className="px-6 py-4 font-bold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProduction.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No production entries match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProduction.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                          {row.entry_date}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase">
                              {row.lineman?.username?.[0] || 'L'}
                            </div>
                            {row.lineman?.username || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-blue-600">
                          {row.article?.art_no || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {(row.color || row.size) ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {row.color || ''} {row.size ? `(${row.size})` : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {row.article?.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                          {row.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {row.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: WORKER ASSIGNMENTS */}
        {activeTab === 'workers' && (
          <div>
            <div className="p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lineman to Worker Distribution</h3>
                <p className="text-xs text-slate-500">Live tailor-wise piece tracking and completion timestamps</p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assigned</span>
                  <p className="text-lg font-black text-indigo-600">{totalAssignedQty.toLocaleString()} pcs</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                  <p className="text-lg font-black text-emerald-600">{totalDoneQty.toLocaleString()} pcs</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Lineman</th>
                    <th className="px-6 py-4 font-bold">Worker Name (Tailor)</th>
                    <th className="px-6 py-4 font-bold">Article No</th>
                    <th className="px-6 py-4 font-bold">Color / Size</th>
                    <th className="px-6 py-4 font-bold text-right">Assigned Qty</th>
                    <th className="px-6 py-4 font-bold">Given Time</th>
                    <th className="px-6 py-4 font-bold">Done Time</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                        No worker assignments found for selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((row) => {
                      const isDone = row.status === 'DONE'
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                            {row.entry_date}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {row.lineman?.username || '-'}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-indigo-700">
                            {row.worker_name || 'Worker'}
                          </td>
                          <td className="px-6 py-4 font-bold text-blue-600">
                            {row.article?.art_no || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {(row.color || row.size) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                                {row.color} {row.size ? `(${row.size})` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {row.assigned_qty} pcs
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.assigned_at ? new Date(row.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.completed_at ? new Date(row.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isDone ? 'Done âœ…' : 'In Progress â³'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QC & FINISHING DASHBOARD */}
        {activeTab === 'qc' && (
          <div>
            {/* Top QC Summary Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">QC Inspection & Finishing Floor Overview</h3>
                  <p className="text-xs text-slate-500">Live quality metrics, alteration recovery, and store transfers</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Received</span>
                    <p className="text-base font-black text-blue-600">{qcStats.rec} pcs</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Passed</span>
                    <p className="text-base font-black text-emerald-600">{qcStats.passed} pcs</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">In Mending</span>
                    <p className="text-base font-black text-amber-600">{qcStats.inMending} pcs</p>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Packed to Store</span>
                    <p className="text-base font-black text-purple-600">{qcStats.packed} pcs</p>
                  </div>
                  <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-center shadow-md shadow-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">Pass Rate</span>
                    <span className="text-sm font-black">{qcStats.passRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Date</th>
                    <th className="px-6 py-4 font-bold">Stage</th>
                    <th className="px-6 py-4 font-bold">Article No</th>
                    <th className="px-6 py-4 font-bold">Color / Size</th>
                    <th className="px-6 py-4 font-bold">From Lineman</th>
                    <th className="px-6 py-4 font-bold">Activity Details</th>
                    <th className="px-6 py-4 font-bold">Defect Type</th>
                    <th className="px-6 py-4 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredQC.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No quality check logs match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredQC.map((row) => {
                      const stage = row.stage || ''
                      let stageBadge = <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{stage}</span>
                      let details = ''

                      if (stage === 'RECEIVING') {
                        stageBadge = <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">ðŸ“¥ Receiving</span>
                        details = `Received ${row.qty_received} pcs from sewing line`
                      } else if (stage === 'CHECKING') {
                        stageBadge = <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">âœ… Checking</span>
                        details = `${row.qty_passed} Passed â€¢ ${row.qty_rejected} Defect`
                      } else if (stage === 'MENDING') {
                        stageBadge = <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">ðŸ”§ Mending</span>
                        if (row.mending_status === 'REPAIR_COMPLETED') {
                          details = `Repaired: ${row.mending_returned_qty} Fixed âœ… â€¢ ${row.mending_scrap_qty} Scrap âŒ`
                        } else {
                          details = `Sent ${row.qty_rejected} pcs to Lineman for repair â³`
                        }
                      } else if (stage === 'BULKING') {
                        stageBadge = <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">ðŸ“¦ Bulking</span>
                        details = `Packed ${(row.bundle_size || 0) * (row.total_bundles || 0)} pcs (${row.total_bundles} bundles x ${row.bundle_size} pcs) âž” Store Inward`
                      }

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                            {row.entry_date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {stageBadge}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-blue-600">
                            {row.article?.art_no || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {(row.color || row.size) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                                {row.color} {row.size ? `(${row.size})` : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-800">
                            {row.lineman?.username || '-'}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700 text-xs">
                            {details}
                          </td>
                          <td className="px-6 py-4">
                            {row.defect_type && row.defect_type !== 'NONE' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                {row.defect_type}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {row.remarks || '-'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STORE INVENTORY REPORT */}
        {activeTab === 'inventory' && (
          <div>
            <div className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Finished Goods Godown Stock</h3>
                <p className="text-xs text-slate-500">Live balance derived from Finishing Inward and Dispatch Outward</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Article No</th>
                    <th className="px-6 py-4 font-bold">Description</th>
                    <th className="px-6 py-4 font-bold text-right text-emerald-600">Total Inward (QC)</th>
                    <th className="px-6 py-4 font-bold text-right text-indigo-600">Total Outward (Dispatch)</th>
                    <th className="px-6 py-4 font-bold text-right text-purple-600">Godown Balance</th>
                    <th className="px-6 py-4 font-bold text-right">Last Movement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inventoryReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No store transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    inventoryReport.map((row) => (
                      <tr key={row.art_no} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-blue-600">
                          {row.art_no}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {row.description}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                          +{row.totalInward.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-indigo-600 text-base">
                          -{row.totalOutward.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-black ${
                            row.balance > 0 
                              ? 'bg-purple-100 text-purple-800' 
                              : row.balance === 0 
                                ? 'bg-slate-100 text-slate-700' 
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {row.balance.toLocaleString()} pcs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 text-xs whitespace-nowrap">
                          {row.lastDate}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: LINEMAN LEADERBOARD */}
        {activeTab === 'employee' && (
          <div>
            <div className="p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lineman Performance Leaderboard</h3>
                <p className="text-xs text-slate-500">Floor supervisor productivity and daily averages</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Rank</th>
                    <th className="px-6 py-4 font-bold">Lineman</th>
                    <th className="px-6 py-4 font-bold text-right">Total Output</th>
                    <th className="px-6 py-4 font-bold text-right">Active Days</th>
                    <th className="px-6 py-4 font-bold text-right text-blue-600">Daily Average</th>
                    <th className="px-6 py-4 font-bold">Top Article</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {employeePerformance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No production records found for the selected time range.
                      </td>
                    </tr>
                  ) : (
                    employeePerformance
                      .sort((a, b) => b.totalPieces - a.totalPieces)
                      .map((emp, index) => (
                        <tr key={emp.username} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-black text-slate-400 text-base">
                            {index === 0 ? 'ðŸ¥‡' : index === 1 ? 'ðŸ¥ˆ' : index === 2 ? 'ðŸ¥‰' : `#${index + 1}`}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {emp.username[0]?.toUpperCase()}
                              </div>
                              {emp.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                            {emp.totalPieces.toLocaleString()} pcs
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600 font-semibold">
                            {emp.daysCount} days
                          </td>
                          <td className="px-6 py-4 text-right font-black text-blue-600 text-base">
                            ~{emp.avgPerDay.toLocaleString()} / day
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                              {emp.topArticle}
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}