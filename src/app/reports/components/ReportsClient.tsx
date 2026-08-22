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
  ArrowLeft
} from 'lucide-react'

type DailyProductRow = {
  id: string
  entry_date: string
  quantity: number
  notes?: string | null
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
  assigned_qty: number
  completed_qty: number
  status: string
  notes?: string | null
  assigned_at: string
  completed_at?: string | null
  entry_date: string
  lineman?: { username: string } | null
  worker_name?: string | null
  article?: { art_no: string; description: string } | null
}

type Props = {
  dailyProducts: DailyProductRow[]
  qcLogs: QCLogRow[]
  storeTransactions: StoreTxRow[]
  workerAssignments: WorkerAssignmentRow[]
}

export function ReportsClient({ dailyProducts, qcLogs, storeTransactions, workerAssignments }: Props) {
  const [activeTab, setActiveTab] = useState<'production' | 'qc' | 'inventory' | 'employee' | 'assignments'>('production')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'last7' | 'month'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const last7Str = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }, [])
  const monthStr = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  }, [])

  // Filter helper
  const filterByDate = (dateVal: string | undefined) => {
    if (!dateVal) return true
    if (dateFilter === 'today') return dateVal === todayStr
    if (dateFilter === 'last7') return dateVal >= last7Str
    if (dateFilter === 'month') return dateVal >= monthStr
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
        item.article?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [dailyProducts, dateFilter, searchTerm])

  // 2. Filtered QC Logs
  const filteredQC = useMemo(() => {
    return qcLogs.filter(item => {
      const matchesDate = filterByDate(item.entry_date)
      const matchesSearch = 
        !searchTerm || 
        item.lineman?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.article?.art_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.defect_type?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesDate && matchesSearch
    })
  }, [qcLogs, dateFilter, searchTerm])

  // 3. Inventory Stock Calculation (Group by Article)
  const inventoryReport = useMemo(() => {
    const map: Record<string, {
      art_no: string
      description: string
      inward: number
      outward: number
      balance: number
      lastDate: string
    }> = {}

    storeTransactions.forEach(tx => {
      const artNo = tx.article?.art_no || 'UNKNOWN'
      const desc = tx.article?.description || '-'
      const date = tx.entry_date || tx.created_at.split('T')[0]

      if (!map[artNo]) {
        map[artNo] = {
          art_no: artNo,
          description: desc,
          inward: 0,
          outward: 0,
          balance: 0,
          lastDate: date
        }
      }

      if (tx.type === 'INWARD') {
        map[artNo].inward += tx.quantity
        map[artNo].balance += tx.quantity
      } else if (tx.type === 'OUTWARD') {
        map[artNo].outward += tx.quantity
        map[artNo].balance -= tx.quantity
      }

      if (date > map[artNo].lastDate) {
        map[artNo].lastDate = date
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
      headers = ['Date', 'Lineman', 'Article No', 'Description', 'Quantity', 'Notes']
      rows = filteredProduction.map(r => [
        r.entry_date,
        r.lineman?.username || '-',
        r.article?.art_no || '-',
        r.article?.description || '-',
        r.quantity,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ])
    } else if (activeTab === 'qc') {
      headers = ['Date', 'Stage', 'Article No', 'Lineman', 'Qty Received', 'Qty Passed', 'Qty Rejected', 'Defect Type', 'Remarks']
      rows = filteredQC.map(r => [
        r.entry_date,
        r.stage,
        r.article?.art_no || '-',
        r.lineman?.username || '-',
        r.qty_received,
        r.qty_passed,
        r.qty_rejected,
        r.defect_type,
        `"${(r.remarks || '').replace(/"/g, '""')}"`
      ])
    } else if (activeTab === 'inventory') {
      headers = ['Article No', 'Description', 'Total Inward', 'Total Outward', 'Current Balance', 'Last Activity']
      rows = inventoryReport.map(r => [
        r.art_no,
        r.description,
        r.inward,
        r.outward,
        r.balance,
        r.lastDate
      ])
    } else if (activeTab === 'employee') {
      headers = ['Employee / Lineman', 'Total Produced', 'Days Active', 'Avg Pieces/Day', 'Top Article']
      rows = employeePerformance.map(r => [
        r.username,
        r.totalPieces,
        r.daysCount,
        r.avgPerDay,
        r.topArticle
      ])
    } else if (activeTab === 'assignments') {
      headers = ['Date', 'Lineman', 'Worker', 'Article No', 'Assigned Qty', 'Status', 'Assigned At', 'Done At', 'Notes']
      rows = filteredAssignments.map(r => [
        r.entry_date,
        r.lineman?.username || '-',
        r.worker_name || '-',
        r.article?.art_no || '-',
        r.assigned_qty,
        r.status,
        r.assigned_at ? new Date(r.assigned_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
        r.completed_at ? new Date(r.completed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-',
        r.notes || '-'
      ])
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  // Aggregate Metrics for Header Cards
  const totalProductionCount = filteredProduction.reduce((sum, r) => sum + r.quantity, 0)
  const totalQCPassed = filteredQC.reduce((sum, r) => sum + r.qty_passed, 0)
  const totalQCRejected = filteredQC.reduce((sum, r) => sum + r.qty_rejected, 0)
  const qcPassRate = (totalQCPassed + totalQCRejected) > 0 
    ? Math.round((totalQCPassed / (totalQCPassed + totalQCRejected)) * 100) 
    : 100
  const totalStockInGodown = inventoryReport.reduce((sum, r) => sum + r.balance, 0)

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Factory Reports & Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Comprehensive audit logs, quality control & stock summary</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-xl text-sm transition-all border border-emerald-200 shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Production (Filtered)</div>
          <div className="text-2xl font-black text-slate-800 flex items-center gap-2">
            {totalProductionCount.toLocaleString()}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">QC Pass Rate</div>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
            {qcPassRate}%
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{totalQCPassed} Passed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Defects / Rejections</div>
          <div className="text-2xl font-black text-rose-600 flex items-center gap-2">
            {totalQCRejected}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">Pcs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Godown Stock</div>
          <div className="text-2xl font-black text-purple-600 flex items-center gap-2">
            {totalStockInGodown.toLocaleString()}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Balance</span>
          </div>
        </div>
      </div>

      {/* Tabs & Controls Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('production')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'production'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Daily Production ({filteredProduction.length})
          </button>

          <button
            onClick={() => setActiveTab('qc')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'qc'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            QC Summary ({filteredQC.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="h-4 w-4" />
            Store Inventory ({inventoryReport.length})
          </button>

          <button
            onClick={() => setActiveTab('employee')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'employee'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Worker Performance ({employeePerformance.length})
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            Worker Assignments ({filteredAssignments.length})
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Date Filter Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'today' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('last7')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'last7' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Art No / Worker..."
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Lineman</th>
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">Description</th>
                  <th className="px-6 py-4 font-bold text-right">Quantity</th>
                  <th className="px-6 py-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProduction.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
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
        )}

        {/* TAB 2: QC SUMMARY REPORT */}
        {activeTab === 'qc' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Stage</th>
                  <th className="px-6 py-4 font-bold">Article No</th>
                  <th className="px-6 py-4 font-bold">From Lineman</th>
                  <th className="px-6 py-4 font-bold text-right text-emerald-600">Passed</th>
                  <th className="px-6 py-4 font-bold text-right text-rose-600">Rejected</th>
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
                  filteredQC.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">
                        {row.entry_date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {row.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-600">
                        {row.article?.art_no || '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {row.lineman?.username || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600 text-base">
                        +{row.qty_passed}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-rose-600 text-base">
                        {row.qty_rejected > 0 ? `-${row.qty_rejected}` : '0'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          row.defect_type === 'NONE' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-rose-50 text-rose-700 font-semibold'
                        }`}>
                          {row.defect_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {row.remarks || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: STORE INVENTORY REPORT */}
        {activeTab === 'inventory' && (
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
                      <td className="px-6 py-4 font-black text-blue-600 text-base">
                        {row.art_no}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {row.description}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        {row.inward.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                        {row.outward.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 text-right font-black text-purple-700 text-lg">
                        {row.balance.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-medium">
                        {row.lastDate}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: WORKER PERFORMANCE */}
        {activeTab === 'employee' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Worker / Lineman</th>
                  <th className="px-6 py-4 font-bold text-right">Total Production</th>
                  <th className="px-6 py-4 font-bold text-right">Days Logged</th>
                  <th className="px-6 py-4 font-bold text-right">Avg Output / Day</th>
                  <th className="px-6 py-4 font-bold">Top Article</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {employeePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No worker performance records found.
                    </td>
                  </tr>
                ) : (
                  employeePerformance.map((row) => (
                    <tr key={row.username} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                            {row.username[0]}
                          </div>
                          {row.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600 text-base">
                        {row.totalPieces.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-600">
                        {row.daysCount} days
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-600 text-base">
                        ~{row.avgPerDay.toLocaleString()} pcs/day
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                          {row.topArticle}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: WORKER ASSIGNMENTS (Lineman -> Worker distribution) */}
        {activeTab === 'assignments' && (
          <div className="overflow-x-auto">
            <div className="flex flex-wrap items-center gap-6 px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
              <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Summary</div>
              <div className="text-sm font-bold text-slate-700">Total Assigned: <span className="text-blue-600">{totalAssignedQty.toLocaleString()} pcs</span></div>
              <div className="text-sm font-bold text-slate-700">Done: <span className="text-emerald-600">{totalDoneQty.toLocaleString()} pcs</span></div>
              <div className="text-sm font-bold text-slate-700">Pending: <span className="text-orange-600">{(totalAssignedQty - totalDoneQty).toLocaleString()} pcs</span></div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Lineman</th>
                  <th className="px-6 py-4 font-bold">Worker</th>
                  <th className="px-6 py-4 font-bold">Art No.</th>
                  <th className="px-6 py-4 font-bold text-right">Assigned Qty</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                  <th className="px-6 py-4 font-bold">Assigned At</th>
                  <th className="px-6 py-4 font-bold">Done At</th>
                  <th className="px-6 py-4 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                      No worker assignments found. Lineman assigns work via mobile app.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-600 whitespace-nowrap">{row.entry_date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold uppercase">{row.lineman?.username?.[0] || 'L'}</div>
                          {row.lineman?.username || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold uppercase">{row.worker_name?.[0] || 'W'}</div>
                          {row.worker_name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-blue-600">{row.article?.art_no || '-'}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-800 text-base">{row.assigned_qty.toLocaleString()} pcs</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.status === 'DONE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {row.status === 'DONE' ? 'Done' : row.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {row.assigned_at ? new Date(row.assigned_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {row.completed_at ? (
                          <span className="text-emerald-600 font-semibold">{new Date(row.completed_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{row.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
