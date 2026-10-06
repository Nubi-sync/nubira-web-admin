'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  ShieldCheck,
  Warehouse,
  Truck,
  Layers,
  Users,
  Briefcase,
  Scissors,
  Sparkles,
  Waves,
  Flame,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Phone,
  FilterX
} from 'lucide-react'
import {
  ReportsData,
  ArticleReportRow,
  WorkerPieceLedgerItem,
  BuyerFulfillmentItem,
  DivisionScorePoint
} from '../actions'

type ActiveTab = 'articles' | 'workers' | 'audit'
type DateFilterPreset = 'today' | '7days' | '30days' | 'all'

interface OwnerReportsClientProps {
  initialData: ReportsData
}

const DIVISION_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '/cutting': Scissors,
  'Cutting Floor': Scissors,
  '/stitching-sewing': Layers,
  'Stitching & Sewing': Layers,
  '/printing': Sparkles,
  'Printing Unit': Sparkles,
  '/embroidery': Sparkles,
  'Embroidery Unit': Sparkles,
  '/washing': Waves,
  'Washing Plant': Waves,
  '/iron': Flame,
  'Ironing & Finishing': Flame,
  '/modules': ShieldCheck,
  'QC Audit': ShieldCheck,
  '/store': Warehouse,
  'Warehouse / Godown': Warehouse,
  '/dispatch': Truck,
  'Dispatch Bay': Truck
}

export function OwnerReportsClient({ initialData }: OwnerReportsClientProps) {
  const [data] = useState<ReportsData>(initialData)
  const [activeTab, setActiveTab] = useState<ActiveTab>('articles')
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('30days')

  // Expanded Accordion State for Articles (Tab 1)
  const [expandedArticleIds, setExpandedArticleIds] = useState<Set<string>>(() => new Set())

  // Tab 1 Filters
  const [articleSearch, setArticleSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')

  // Tab 2 Filters
  const [workerSearch, setWorkerSearch] = useState('')
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL')
  const [workerStatusFilter, setWorkerStatusFilter] = useState<string>('ALL')

  // Toggle Accordion
  const toggleArticleExpand = (id: string) => {
    setExpandedArticleIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Expand All / Collapse All
  const handleExpandAll = () => {
    if (expandedArticleIds.size === filteredArticles.length) {
      setExpandedArticleIds(new Set())
    } else {
      setExpandedArticleIds(new Set(filteredArticles.map(a => a.id)))
    }
  }

  // Filtered Articles (Tab 1)
  const filteredArticles = useMemo(() => {
    let list = [...data.articlesReport]
    if (articleSearch.trim()) {
      const q = articleSearch.toLowerCase()
      list = list.filter(
        a =>
          a.artNo.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.buyerName.toLowerCase().includes(q) ||
          a.poNumber.toLowerCase().includes(q)
      )
    }
    if (stageFilter !== 'ALL') {
      list = list.filter(a => a.stageStatus.toLowerCase() === stageFilter.toLowerCase())
    }
    return list
  }, [data.articlesReport, articleSearch, stageFilter])

  // Filtered Worker Ledger (Tab 2)
  const filteredWorkerLedger = useMemo(() => {
    let list = [...data.workerLedger]
    if (workerSearch.trim()) {
      const q = workerSearch.toLowerCase()
      list = list.filter(
        w =>
          w.workerName.toLowerCase().includes(q) ||
          (w.workerPhone && w.workerPhone.includes(q)) ||
          w.articleNo.toLowerCase().includes(q) ||
          w.operationName.toLowerCase().includes(q)
      )
    }
    if (divisionFilter !== 'ALL') {
      list = list.filter(w => w.division.toLowerCase() === divisionFilter.toLowerCase())
    }
    if (workerStatusFilter !== 'ALL') {
      list = list.filter(w => w.status.toLowerCase() === workerStatusFilter.toLowerCase())
    }
    return list
  }, [data.workerLedger, workerSearch, divisionFilter, workerStatusFilter])

  // Worker Statistics (Tab 2 Summary Strip)
  const workerStats = useMemo(() => {
    const activeWorkers = new Set(filteredWorkerLedger.map(w => w.workerName)).size
    const totalCompleted = filteredWorkerLedger.reduce((s, w) => s + w.completedPieces, 0)
    const totalRejected = filteredWorkerLedger.reduce((s, w) => s + w.rejectedPieces, 0)
    const totalProcessed = totalCompleted + totalRejected
    const defectRatePct = totalProcessed > 0 ? Number(((totalRejected / totalProcessed) * 100).toFixed(1)) : 0

    // Find top contributor
    const workerTotalsMap = new Map<string, number>()
    filteredWorkerLedger.forEach(w => {
      workerTotalsMap.set(w.workerName, (workerTotalsMap.get(w.workerName) || 0) + w.completedPieces)
    })
    let topName = 'None'
    let topMax = 0
    workerTotalsMap.forEach((qty, name) => {
      if (qty > topMax) {
        topMax = qty
        topName = name
      }
    })

    return {
      activeWorkers,
      totalCompleted,
      totalRejected,
      defectRatePct,
      topWorkerName: topName,
      topWorkerPieces: topMax
    }
  }, [filteredWorkerLedger])

  // Unique Divisions for Filter Dropdown
  const uniqueDivisions = useMemo(() => {
    const set = new Set<string>()
    data.workerLedger.forEach(w => {
      if (w.division) set.add(w.division)
    })
    return Array.from(set)
  }, [data.workerLedger])

  // Export Comprehensive Multi-Sheet Excel Workbook
  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Articles Progress
    const articlesSheetData = data.articlesReport.map(a => ({
      'Style / Article No': a.artNo,
      'Description': a.description,
      'Buyer Name': a.buyerName,
      'PO Number': a.poNumber,
      'Target Quantity (Pcs)': a.targetPcs,
      'Cut (Pcs)': a.cutPcs,
      'Print / Emb (Pcs)': a.printEmbPcs,
      'Stitched (Pcs)': a.stitchedPcs,
      'Washed (Pcs)': a.washedPcs,
      'Ironed (Pcs)': a.ironedPcs,
      'QC Passed (Pcs)': a.qcPassedPcs,
      'QC Rejected (Pcs)': a.qcFailedPcs,
      'QC Reject Rate %': `${a.qcRejectRatePct}%`,
      'Ready in Godown (Pcs)': a.godownPcs,
      'Dispatched (Pcs)': a.dispatchedPcs,
      'Completion %': `${a.progressPct}%`,
      'Stage Status': a.stageStatus
    }))
    const ws1 = XLSX.utils.json_to_sheet(articlesSheetData)
    XLSX.utils.book_append_sheet(workbook, ws1, 'Articles_Progress')

    // Sheet 2: Worker Piecework Ledger
    const workerSheetData = data.workerLedger.map(w => ({
      'Date': w.date,
      'Worker Name': w.workerName,
      'Phone': w.workerPhone || 'N/A',
      'Role': w.role,
      'Division / Module': w.division,
      'Article / Style': w.articleNo,
      'Operation / Task': w.operationName,
      'Workstation / Machine': w.workstationRef,
      'Target Pieces': w.targetPieces,
      'Completed Pieces': w.completedPieces,
      'Rejected Pieces': w.rejectedPieces,
      'Status': w.status
    }))
    const ws2 = XLSX.utils.json_to_sheet(workerSheetData)
    XLSX.utils.book_append_sheet(workbook, ws2, 'Worker_Piece_Ledger')

    // Sheet 3: Buyer Deliveries
    const buyerSheetData = data.buyerFulfillments.map(b => ({
      'Buyer Name': b.buyerName,
      'PO Number': b.poNumber,
      'Order Date': b.orderDate,
      'Delivery Target': b.deliveryDate,
      'Target Pieces': b.targetPieces,
      'Dispatched Pieces': b.deliveredPieces,
      'Balance Remaining': b.godownPieces,
      'Delivery Challans': b.challanNumbers.join(', '),
      'Fulfillment %': `${b.percent}%`,
      'Status': b.status
    }))
    const ws3 = XLSX.utils.json_to_sheet(buyerSheetData)
    XLSX.utils.book_append_sheet(workbook, ws3, 'Buyer_PO_Deliveries')

    const dateStr = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `Zigza_Plant_Comprehensive_Report_${dateStr}.xlsx`)
  }

  // Print PDF Handler
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-5 max-w-[1536px] w-full mx-auto select-none text-[#0B1220] font-[family-name:var(--font-public-sans)]">
      
      {/* ==================================================================== */}
      {/* 1. TOP HEADER CARD: MATCHING SIGNATURE CYAN DESIGN SYSTEM            */}
      {/* ==================================================================== */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15 mt-0.5 sm:mt-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Plant <span className="text-[#1D4ED8]">Reports &amp; Analytics</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                {data.companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Production ledgers, worker piece-rate logs, and article progress traceability.
            </p>
          </div>
        </div>

        {/* Date presets and Export Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold text-slate-600 overflow-x-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === 'today'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === '7days'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === '30days'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === 'all'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-black/15 transition-all shadow-2xs cursor-pointer"
              title="Download full 3-sheet Excel workbook"
            >
              <Download className="w-3.5 h-3.5 text-[#0B1220]" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-black/15 transition-all shadow-2xs cursor-pointer"
              title="Print report or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#0B1220]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP EXECUTIVE PULSE KPIS (4 CYAN CARDS)                           */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Total Produced */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Output</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
              <Package className="w-4 h-4 text-[#0B1220]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono tracking-tight">
              {data.kpis.totalProduced.toLocaleString()}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Avg <span className="font-mono text-slate-700 font-bold">{data.dailyAverage.toLocaleString()}</span> pcs / day
            </p>
          </div>
        </div>

        {/* KPI 2: QC Pass Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">QC Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0B1220]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono tracking-tight">
              {data.kpis.qcPassRate}%
            </div>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1">
              Quality inspection standard
            </p>
          </div>
        </div>

        {/* KPI 3: In Godown Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Godown Ready</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
              <Warehouse className="w-4 h-4 text-[#0B1220]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono tracking-tight">
              {data.kpis.netWarehouseStock.toLocaleString()}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Finished goods in inventory
            </p>
          </div>
        </div>

        {/* KPI 4: Dispatched Units */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched</span>
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shadow-2xs shrink-0">
              <Truck className="w-4 h-4 text-[#0B1220]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono tracking-tight">
              {data.kpis.totalDispatched.toLocaleString()}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              Shipped via delivery challans
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. SEGMENTED VIEW SWITCHER (CYAN ACTIVE TAB STYLING)                 */}
      {/* ==================================================================== */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto">
        
        {/* Tab 1 Trigger */}
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'articles'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-[#0B1220]" />
          <span>Article Lifecycle &amp; Traceability</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'articles'
              ? 'bg-[#0B1220] text-white shadow-2xs'
              : 'bg-slate-200/80 text-slate-700'
          }`}>
            {data.articlesReport.length}
          </span>
        </button>

        {/* Tab 2 Trigger */}
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workers'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Users className="w-4 h-4 text-[#0B1220]" />
          <span>Worker Piece-Rate Ledger</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'workers'
              ? 'bg-[#0B1220] text-white shadow-2xs'
              : 'bg-slate-200/80 text-slate-700'
          }`}>
            {data.workerLedger.length}
          </span>
        </button>

        {/* Tab 3 Trigger */}
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Briefcase className="w-4 h-4 text-[#0B1220]" />
          <span>Plant &amp; Buyer PO Audit</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
            activeTab === 'audit'
              ? 'bg-[#0B1220] text-white shadow-2xs'
              : 'bg-slate-200/80 text-slate-700'
          }`}>
            {data.buyerFulfillments.length}
          </span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 4. TAB 1: ARTICLE LIFECYCLE & WORKER TRACEABILITY                    */}
      {/* ==================================================================== */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by article, buyer, or PO..."
                  value={articleSearch}
                  onChange={e => setArticleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
              </div>

              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                <option value="In Cutting">In Cutting</option>
                <option value="In Embellishment">In Embellishment</option>
                <option value="In Stitching">In Stitching</option>
                <option value="In Washing">In Washing</option>
                <option value="In Ironing">In Ironing</option>
                <option value="QC Passed">QC Passed</option>
                <option value="In Godown">In Godown</option>
                <option value="Dispatched">Dispatched</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-between md:justify-end">
              <span className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-[#0B1220]">{filteredArticles.length}</strong> styles
              </span>
              <button
                onClick={handleExpandAll}
                className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer px-2 py-1"
              >
                {expandedArticleIds.size === filteredArticles.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <FilterX className="w-6 h-6 text-[#0B1220]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1220]">No articles matched your criteria</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or stage filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredArticles.map(article => {
                  const isExpanded = expandedArticleIds.has(article.id)

                  return (
                    <div key={article.id} className="transition-colors hover:bg-slate-50/70">
                      
                      {/* Master Row Header */}
                      <div
                        onClick={() => toggleArticleExpand(article.id)}
                        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                      >
                        {/* Article & Buyer Info */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-black/15 text-[#0B1220] flex items-center justify-center shrink-0 transition-all shadow-2xs mt-0.5 sm:mt-0"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#0B1220]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#0B1220]" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm sm:text-base font-extrabold text-[#0B1220] font-mono tracking-tight">
                                {article.artNo}
                              </span>
                              <span className="text-[11px] font-bold text-[#0B1220] bg-[#F0FDFA] border border-black/15 px-2 py-0.5 rounded-md shadow-2xs">
                                {article.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                              <span>Buyer: <strong className="text-slate-800">{article.buyerName}</strong></span>
                              <span>PO: <strong className="text-slate-800 font-mono">{article.poNumber}</strong></span>
                              <span>Target: <strong className="text-slate-800 font-mono">{article.targetPcs.toLocaleString()}</strong> pcs</span>
                            </div>
                          </div>
                        </div>

                        {/* Pipeline Progress Micro-bar & Badges */}
                        <div className="flex items-center gap-4 sm:gap-6 justify-between lg:justify-end">
                          
                          {/* 7-Stage Micro Flow */}
                          <div className="hidden md:flex flex-col gap-1 w-44">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Pipeline Flow</span>
                              <span className="font-mono text-[#1D4ED8]">{article.progressPct}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${Math.min(100, (article.cutPcs / (article.targetPcs || 1)) * 100)}%` }}
                                className="bg-sky-500 h-full"
                                title={`Cut: ${article.cutPcs} pcs`}
                              />
                              <div
                                style={{ width: `${Math.min(100, (article.stitchedPcs / (article.targetPcs || 1)) * 100)}%` }}
                                className="bg-indigo-600 h-full"
                                title={`Stitched: ${article.stitchedPcs} pcs`}
                              />
                              <div
                                style={{ width: `${Math.min(100, (article.qcPassedPcs / (article.targetPcs || 1)) * 100)}%` }}
                                className="bg-emerald-500 h-full"
                                title={`QC Pass: ${article.qcPassedPcs} pcs`}
                              />
                              <div
                                style={{ width: `${Math.min(100, (article.godownPcs / (article.targetPcs || 1)) * 100)}%` }}
                                className="bg-amber-500 h-full"
                                title={`In Godown: ${article.godownPcs} pcs`}
                              />
                            </div>
                          </div>

                          {/* Stage Status Badge */}
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                            article.stageStatus === 'Dispatched'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : article.stageStatus === 'In Godown'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : article.stageStatus === 'QC Passed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-[#F0FDFA] text-[#0B1220] border-black/15'
                          }`}>
                            {article.stageStatus}
                          </span>

                          <span className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1">
                            <span>{isExpanded ? 'Hide Traceability' : 'View Operations'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Expanded Drilldown Sub-Ledger */}
                      {isExpanded && (
                        <div className="bg-slate-50/90 border-t border-slate-200/80 p-4 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-xs font-extrabold text-[#0B1220] uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span>Floor Worker Allocations &amp; Module Traceability</span>
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {article.operations.length} registered task allocations
                            </span>
                          </div>

                          {article.operations.length === 0 ? (
                            <div className="bg-white p-5 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-xs font-medium text-slate-600">
                                No individual floor worker tasks recorded yet for style <strong>{article.artNo}</strong>.
                              </p>
                              <div className="flex items-center justify-center gap-3 mt-3">
                                <Link
                                  href="/stitching-sewing"
                                  className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1"
                                >
                                  <span>Assign in Stitching</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                                <span className="text-slate-300">|</span>
                                <Link
                                  href="/cutting"
                                  className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1"
                                >
                                  <span>Assign in Cutting</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                                    <th className="p-3">Module / Division</th>
                                    <th className="p-3">Assigned Worker</th>
                                    <th className="p-3">Operation / Task</th>
                                    <th className="p-3">Station / Machine</th>
                                    <th className="p-3 text-right">Target</th>
                                    <th className="p-3 text-right">Completed</th>
                                    <th className="p-3 text-right">Rejected</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-right">Timestamp</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                  {article.operations.map(op => {
                                    const DivIcon = DIVISION_ICON_MAP[op.divisionRoute] || DIVISION_ICON_MAP[op.division] || Layers

                                    return (
                                      <tr key={op.id} className="hover:bg-slate-50/80">
                                        <td className="p-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                                              <DivIcon className="w-3.5 h-3.5 text-[#0B1220]" />
                                            </div>
                                            <span className="font-bold text-[#0B1220]">{op.division}</span>
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <div className="font-bold text-slate-900">{op.workerName}</div>
                                          {op.workerPhone && (
                                            <div className="text-[10px] text-slate-500 font-mono">{op.workerPhone}</div>
                                          )}
                                        </td>
                                        <td className="p-3 font-semibold text-slate-700">{op.operation}</td>
                                        <td className="p-3 font-mono text-[11px] text-slate-600">{op.workstation}</td>
                                        <td className="p-3 text-right font-mono font-bold">{op.targetPcs.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono font-bold text-emerald-700">{op.completedPcs.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono font-bold text-rose-600">
                                          {op.rejectedPcs > 0 ? op.rejectedPcs.toLocaleString() : '-'}
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                                            op.status === 'COMPLETED' || op.status === 'DONE'
                                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                              : op.status === 'IN_PROGRESS'
                                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                                              : 'bg-slate-100 text-slate-700 border-slate-200'
                                          }`}>
                                            {op.status}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right text-[11px] font-mono text-slate-500">{op.timestamp || 'Today'}</td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. TAB 2: WORKER PIECE-RATE LEDGER & FLOOR LOG                       */}
      {/* ==================================================================== */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Operators</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono mt-1">
                {workerStats.activeWorkers}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Logged floor pieces</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pieces Done</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono mt-1">
                {workerStats.totalCompleted.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sum of finished operations</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Floor Defect Rate</span>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600 font-mono mt-1">
                {workerStats.defectRatePct}%
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {workerStats.totalRejected} rejected pieces
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Floor Contributor</span>
              <div className="text-sm sm:text-base font-extrabold text-[#1D4ED8] truncate mt-1">
                {workerStats.topWorkerName}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                <span className="font-mono font-bold text-slate-700">{workerStats.topWorkerPieces.toLocaleString()}</span> pcs completed
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-1 items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search worker name, article, operation..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
              </div>

              <select
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="ALL">All Divisions</option>
                {uniqueDivisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>

              <select
                value={workerStatusFilter}
                onChange={e => setWorkerStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ASSIGNED">Assigned</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-[#0B1220]">{filteredWorkerLedger.length}</strong> piecework records
            </span>
          </div>

          {/* Worker Piecework Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
            {filteredWorkerLedger.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Users className="w-6 h-6 text-[#0B1220]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1220]">No worker piece records found</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting search filters or assign floor tasks in modules.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5">Worker Name</th>
                    <th className="p-3.5">Division / Module</th>
                    <th className="p-3.5">Article / Style</th>
                    <th className="p-3.5">Operation Performed</th>
                    <th className="p-3.5">Workstation Ref</th>
                    <th className="p-3.5 text-right">Target Pcs</th>
                    <th className="p-3.5 text-right">Completed Pcs</th>
                    <th className="p-3.5 text-right">Defects</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredWorkerLedger.map(item => {
                    const DivIcon = DIVISION_ICON_MAP[item.divisionRoute] || DIVISION_ICON_MAP[item.division] || Layers

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="font-extrabold text-[#0B1220]">{item.workerName}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="font-semibold">{item.role}</span>
                            {item.workerPhone && <span>• {item.workerPhone}</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                              <DivIcon className="w-3.5 h-3.5 text-[#0B1220]" />
                            </div>
                            <span className="font-bold text-slate-800">{item.division}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-extrabold text-[#0B1220]">
                          {item.articleNo}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          {item.operationName}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {item.workstationRef}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-700">
                          {item.targetPieces.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-emerald-700">
                          {item.completedPieces.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-rose-600">
                          {item.rejectedPieces > 0 ? item.rejectedPieces.toLocaleString() : '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                            item.status === 'COMPLETED' || item.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-[11px] font-mono text-slate-500">
                          {item.date}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. TAB 3: PLANT OPERATIONS & BUYER PO FULFILLMENT AUDIT              */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          
          {/* Division Scorecards Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0B1220] uppercase tracking-wider font-[family-name:var(--font-heading)]">
                Plant Division Operational Scorecards
              </h3>
              <span className="text-xs font-semibold text-slate-500">Subscribed manufacturing modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.divisionComparison.map(div => {
                const DivIcon = DIVISION_ICON_MAP[div.divisionRoute] || DIVISION_ICON_MAP[div.division] || Layers

                return (
                  <div
                    key={div.division}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Signature Cyan Icon Wrapper with Black Border & Icon */}
                          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                            <DivIcon className="w-4 h-4 text-[#0B1220]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-[#0B1220]">{div.division}</h4>
                            <p className="text-[11px] font-semibold text-slate-500">{div.workerCount} active operators</p>
                          </div>
                        </div>

                        {/* Signature Cyan Shortcut Button with Black Outline */}
                        <Link
                          href={div.divisionRoute}
                          className="w-8 h-8 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-black/15 text-[#0B1220] flex items-center justify-center transition-all shadow-2xs shrink-0"
                          title="Open Module Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#0B1220]" />
                        </Link>
                      </div>

                      <div className="mt-4">
                        <div className="text-base font-extrabold text-[#0B1220] font-mono">
                          {div.metricLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">Throughput Level</span>
                      <span className="font-mono font-bold text-[#1D4ED8]">{div.totalOutput.toLocaleString()} pcs</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Buyer PO Fulfillment Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0B1220] uppercase tracking-wider font-[family-name:var(--font-heading)]">
                Buyer Purchase Order Delivery Ledger
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {data.buyerFulfillments.length} tracked purchase contracts
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
              {data.buyerFulfillments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto shadow-2xs mb-3">
                    <Briefcase className="w-6 h-6 text-[#0B1220]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0B1220]">No merchandising contracts found</h3>
                  <p className="text-xs text-slate-500 mt-1">Orders created in Merchandising will appear here automatically.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3.5">PO Number</th>
                      <th className="p-3.5">Buyer / Brand</th>
                      <th className="p-3.5">Delivery Due Date</th>
                      <th className="p-3.5 text-right">Target Order</th>
                      <th className="p-3.5 text-right">Dispatched</th>
                      <th className="p-3.5 text-right">Balance In Godown</th>
                      <th className="p-3.5">Delivery Challans</th>
                      <th className="p-3.5 text-center">Fulfillment</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {data.buyerFulfillments.map(b => (
                      <tr key={b.poNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-extrabold text-[#0B1220]">
                          {b.poNumber}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {b.buyerName}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span>{b.deliveryDate}</span>
                            {b.isOverdue && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                          {b.targetPieces.toLocaleString()} pcs
                        </td>
                        <td className="p-3.5 text-right font-mono font-extrabold text-purple-700">
                          {b.deliveredPieces.toLocaleString()} pcs
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-amber-700">
                          {b.godownPieces.toLocaleString()} pcs
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {b.challanNumbers.length > 0 ? b.challanNumbers.join(', ') : 'Pending Challan'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono font-bold text-slate-800 text-[11px]">{b.percent}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${b.percent}%` }}
                                className={`h-full ${b.percent >= 100 ? 'bg-emerald-500' : 'bg-[#1D4ED8]'}`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                            b.status === 'Fully Shipped'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'Partially Dispatched'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-[#1D4ED8] border-blue-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
