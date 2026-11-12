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
  FilterX,
  BarChart3
} from 'lucide-react'
import { DashboardSectionHeader } from '@/app/dashboard/components/DashboardSectionHeader'
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
              <span className="text-[10px] sm:text-[11px] font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/40 md:border-black/15 shadow-2xs tracking-wider">
                {data.companyName}
              </span>
            </div>
            <p className="hidden md:block text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Production ledgers, worker piece-rate logs, and article progress traceability.
            </p>
          </div>
        </div>

        {/* Date presets and Export Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Preset Buttons */}
          <div className="flex items-center bg-[#F8FAFC] md:bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-600 overflow-x-auto font-[family-name:var(--font-heading)]">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === 'today'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === '7days'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === '30days'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
                  : 'hover:bg-[#F0FDFA]/60 text-slate-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === 'all'
                  ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
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
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/40 md:border-black/15 transition-all shadow-2xs cursor-pointer font-[family-name:var(--font-heading)]"
              title="Download full 3-sheet Excel workbook"
            >
              <Download className="w-3.5 h-3.5 text-[#0B1220]" />
              <span className="md:hidden">Excel</span>
              <span className="hidden md:inline">Export Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-[#0B1220] bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/40 md:border-black/15 transition-all shadow-2xs cursor-pointer font-[family-name:var(--font-heading)]"
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 md:bg-transparent md:rounded-none md:border-0 md:p-0 md:shadow-none md:space-y-0">
        <div className="md:hidden">
          <DashboardSectionHeader
            icon={BarChart3}
            title="Plant"
            accent="Overview"
            badge={dateFilter === 'today' ? 'Today' : dateFilter === '7days' ? '7 Days' : dateFilter === '30days' ? '30 Days' : 'All Time'}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* KPI 1: Total Produced */}
          <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-[family-name:var(--font-public-sans)]">Total Output</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/10 md:border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B1220]" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono tracking-tight">
                {data.kpis.totalProduced.toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">
                Avg <span className="font-[family-name:var(--font-heading)] tabular-nums md:font-mono text-slate-700 font-bold">{data.dailyAverage.toLocaleString()}</span> / day
              </p>
            </div>
          </div>

          {/* KPI 2: QC Pass Rate */}
          <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-[family-name:var(--font-public-sans)]">QC Pass Rate</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/10 md:border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B1220]" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono tracking-tight">
                {data.kpis.qcPassRate}%
              </div>
              <p className="hidden md:block text-[11px] font-semibold text-emerald-700 mt-1">
                Quality inspection standard
              </p>
            </div>
          </div>

          {/* KPI 3: In Godown Stock */}
          <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-[family-name:var(--font-public-sans)]">Godown Ready</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/10 md:border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                <Warehouse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B1220]" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono tracking-tight">
                {data.kpis.netWarehouseStock.toLocaleString()}
              </div>
              <p className="hidden md:block text-[11px] font-semibold text-slate-500 mt-1">
                Finished goods in inventory
              </p>
            </div>
          </div>

          {/* KPI 4: Dispatched Units */}
          <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider font-[family-name:var(--font-public-sans)]">Dispatched</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/10 md:border-black/15 flex items-center justify-center shadow-2xs shrink-0">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B1220]" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono tracking-tight">
                {data.kpis.totalDispatched.toLocaleString()}
              </div>
              <p className="hidden md:block text-[11px] font-semibold text-slate-500 mt-1">
                Shipped via delivery challans
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. SEGMENTED VIEW SWITCHER (CYAN ACTIVE TAB STYLING)                 */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-3 md:flex items-center gap-1.5 md:gap-2 p-1.5 bg-white md:bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-xs md:shadow-none md:overflow-x-auto font-[family-name:var(--font-heading)]">
        
        {/* Tab 1 Trigger */}
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'articles'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0B1220] shrink-0" />
          <span className="md:hidden truncate">Articles</span>
          <span className="hidden md:inline">Article Lifecycle &amp; Traceability</span>
          <span className={`text-[10px] font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
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
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workers'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0B1220] shrink-0" />
          <span className="md:hidden truncate">Workers</span>
          <span className="hidden md:inline">Worker Piece-Rate Ledger</span>
          <span className={`text-[10px] font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
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
          className={`flex items-center justify-center md:justify-start gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/50 md:border-black/15 shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#0B1220] hover:bg-[#F0FDFA]/60 font-semibold border border-transparent'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0B1220] shrink-0" />
          <span className="md:hidden truncate">PO Audit</span>
          <span className="hidden md:inline">Plant &amp; Buyer PO Audit</span>
          <span className={`text-[10px] font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 md:bg-transparent md:rounded-none md:border-0 md:p-0 md:shadow-none md:space-y-4">
          <div className="md:hidden">
            <DashboardSectionHeader
              icon={Layers}
              title="Article"
              accent="Lifecycle"
              badge={`${filteredArticles.length} styles`}
              action={
                <button
                  onClick={handleExpandAll}
                  className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer font-[family-name:var(--font-heading)]"
                >
                  {expandedArticleIds.size === filteredArticles.length && filteredArticles.length > 0 ? 'Collapse All' : 'Expand All'}
                </button>
              }
            />
          </div>

          {/* Filter Bar */}
          <div className="bg-[#F8FAFC] md:bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5 md:gap-3">
            <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[160px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search article, buyer, PO..."
                  value={articleSearch}
                  onChange={e => setArticleSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
              </div>

              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value)}
                className="px-3 py-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
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

            <div className="hidden md:flex items-center gap-2 justify-end">
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

          {/* Master Table / Mobile Cards */}
          <div className="md:bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-xs overflow-hidden">
            {filteredArticles.length === 0 ? (
              <div className="p-8 md:p-12 text-center bg-[#F8FAFC] md:bg-transparent rounded-xl md:rounded-none border border-slate-200/80 md:border-0">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <FilterX className="w-6 h-6 text-[#0B1220]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">No articles matched your criteria</h3>
                <p className="hidden md:block text-xs text-slate-500 mt-1">Try adjusting your search query or stage filters.</p>
              </div>
            ) : (
              <div className="space-y-2.5 md:space-y-0 md:divide-y md:divide-slate-100">
                {filteredArticles.map(article => {
                  const isExpanded = expandedArticleIds.has(article.id)

                  return (
                    <div
                      key={article.id}
                      className="bg-[#F8FAFC] md:bg-transparent rounded-xl md:rounded-none border border-slate-200/80 md:border-0 overflow-hidden transition-colors md:hover:bg-slate-50/70"
                    >
                      
                      {/* Master Row Header */}
                      <div
                        onClick={() => toggleArticleExpand(article.id)}
                        className="p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4 cursor-pointer"
                      >
                        {/* Article & Buyer Info */}
                        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/40 md:border-black/15 text-[#0B1220] flex items-center justify-center shrink-0 transition-all shadow-2xs mt-0.5 sm:mt-0"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#0B1220]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#0B1220]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm sm:text-base font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono tracking-tight">
                                {article.artNo}
                              </span>
                              <span className="text-[11px] font-bold text-[#0B1220] bg-[#F0FDFA] border border-black/10 md:border-black/15 px-2 py-0.5 rounded-md shadow-2xs truncate max-w-[190px] sm:max-w-none">
                                {article.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 flex-wrap">
                              <span>Buyer: <strong className="text-slate-800">{article.buyerName}</strong></span>
                              <span>PO: <strong className="text-slate-800 font-[family-name:var(--font-heading)] tabular-nums md:font-mono">{article.poNumber}</strong></span>
                              <span>Target: <strong className="text-slate-800 font-[family-name:var(--font-heading)] tabular-nums md:font-mono">{article.targetPcs.toLocaleString()}</strong> pcs</span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Inset Pipeline Snapshot */}
                        <div className="md:hidden bg-white rounded-xl border border-slate-200/80 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-500">Pipeline Progress</span>
                            <span className="font-extrabold text-[#1D4ED8] font-[family-name:var(--font-heading)] tabular-nums">
                              {article.progressPct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${Math.min(100, (article.cutPcs / (article.targetPcs || 1)) * 100)}%` }}
                              className="bg-sky-500 h-full"
                            />
                            <div
                              style={{ width: `${Math.min(100, (article.stitchedPcs / (article.targetPcs || 1)) * 100)}%` }}
                              className="bg-indigo-600 h-full"
                            />
                            <div
                              style={{ width: `${Math.min(100, (article.qcPassedPcs / (article.targetPcs || 1)) * 100)}%` }}
                              className="bg-emerald-500 h-full"
                            />
                            <div
                              style={{ width: `${Math.min(100, (article.godownPcs / (article.targetPcs || 1)) * 100)}%` }}
                              className="bg-amber-500 h-full"
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-1.5 pt-0.5 text-center">
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Cut</div>
                              <div className="text-xs font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">{article.cutPcs}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Stitch</div>
                              <div className="text-xs font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">{article.stitchedPcs}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">QC</div>
                              <div className="text-xs font-extrabold text-emerald-700 font-[family-name:var(--font-heading)] tabular-nums">{article.qcPassedPcs}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Godown</div>
                              <div className="text-xs font-extrabold text-amber-700 font-[family-name:var(--font-heading)] tabular-nums">{article.godownPcs}</div>
                            </div>
                          </div>
                        </div>

                        {/* Pipeline Progress Micro-bar & Badges */}
                        <div className="flex items-center gap-4 sm:gap-6 justify-between lg:justify-end">
                          
                          {/* 7-Stage Micro Flow (Desktop) */}
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
                          <span className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full border shadow-2xs font-[family-name:var(--font-heading)] ${
                            article.stageStatus === 'Dispatched'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : article.stageStatus === 'In Godown'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : article.stageStatus === 'QC Passed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-[#F0FDFA] text-[#0B1220] border-[#14C8B4]/40 md:border-black/15'
                          }`}>
                            {article.stageStatus}
                          </span>

                          <span className="text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1 font-[family-name:var(--font-heading)]">
                            <span>{isExpanded ? 'Hide Traceability' : `Operations (${article.operations.length})`}</span>
                          </span>
                        </div>
                      </div>

                      {/* Expanded Drilldown Sub-Ledger */}
                      {isExpanded && (
                        <div className="bg-white/70 md:bg-slate-50/90 border-t border-slate-200/80 p-3.5 sm:p-6 space-y-3 md:space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h4 className="text-xs font-extrabold text-[#0B1220] uppercase tracking-wider flex items-center gap-2 font-[family-name:var(--font-heading)]">
                              <Users className="w-3.5 h-3.5 text-[#1D4ED8]" />
                              <span>Floor Allocations &amp; Traceability</span>
                            </h4>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {article.operations.length} task logs
                            </span>
                          </div>

                          {article.operations.length === 0 ? (
                            <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-xs font-medium text-slate-600">
                                No floor worker tasks recorded yet for <strong>{article.artNo}</strong>.
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
                            <>
                              {/* Mobile Operations Cards (< md) */}
                              <div className="md:hidden space-y-2">
                                {article.operations.map(op => {
                                  const DivIcon = DIVISION_ICON_MAP[op.divisionRoute] || DIVISION_ICON_MAP[op.division] || Layers
                                  return (
                                    <div key={op.id} className="bg-white rounded-xl border border-slate-200/80 p-3 space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] border border-black/10 flex items-center justify-center shrink-0">
                                            <DivIcon className="w-3.5 h-3.5 text-[#0B1220]" />
                                          </div>
                                          <div className="min-w-0">
                                            <div className="text-xs font-extrabold text-[#0B1220] truncate font-[family-name:var(--font-heading)]">
                                              {op.workerName}
                                            </div>
                                            <div className="text-[11px] font-semibold text-slate-500 truncate">
                                              {op.division} • {op.operation}
                                            </div>
                                          </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-[family-name:var(--font-heading)] ${
                                          op.status === 'COMPLETED' || op.status === 'DONE'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : op.status === 'IN_PROGRESS'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                        }`}>
                                          {op.status}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] rounded-lg p-2 text-center border border-slate-100">
                                        <div>
                                          <div className="text-[10px] font-semibold text-slate-400">Target</div>
                                          <div className="text-xs font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                                            {op.targetPcs.toLocaleString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] font-semibold text-slate-400">Done</div>
                                          <div className="text-xs font-extrabold text-emerald-700 font-[family-name:var(--font-heading)] tabular-nums">
                                            {op.completedPcs.toLocaleString()}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-[10px] font-semibold text-slate-400">Rejected</div>
                                          <div className="text-xs font-extrabold text-rose-600 font-[family-name:var(--font-heading)] tabular-nums">
                                            {op.rejectedPcs > 0 ? op.rejectedPcs.toLocaleString() : '-'}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                                        <span>Station: <strong className="text-slate-700">{op.workstation}</strong></span>
                                        <span className="font-[family-name:var(--font-heading)] tabular-nums">{op.timestamp || 'Today'}</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Desktop Operations Table (md+) */}
                              <div className="hidden md:block bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
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
                            </>
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 md:bg-transparent md:rounded-none md:border-0 md:p-0 md:shadow-none md:space-y-4">
          <div className="md:hidden">
            <DashboardSectionHeader
              icon={Users}
              title="Worker"
              accent="Piece Ledger"
              badge={`${filteredWorkerLedger.length} logs`}
            />
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Operators</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono mt-1">
                {workerStats.activeWorkers}
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 font-semibold mt-0.5">Logged floor pieces</p>
            </div>

            <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pieces Done</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-[family-name:var(--font-heading)] tabular-nums md:font-mono mt-1">
                {workerStats.totalCompleted.toLocaleString()}
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 font-semibold mt-0.5">Sum of finished operations</p>
            </div>

            <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Floor Defect Rate</span>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600 font-[family-name:var(--font-heading)] tabular-nums md:font-mono mt-1">
                {workerStats.defectRatePct}%
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {workerStats.totalRejected} rejected
              </p>
            </div>

            <div className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Contributor</span>
              <div className="text-sm sm:text-base font-extrabold text-[#1D4ED8] truncate mt-1 font-[family-name:var(--font-heading)]">
                {workerStats.topWorkerName}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                <span className="font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold text-slate-700">{workerStats.topWorkerPieces.toLocaleString()}</span> pcs
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#F8FAFC] md:bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2.5 md:gap-3">
            <div className="flex flex-1 items-center gap-2 sm:gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search worker, article, op..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                />
              </div>

              <select
                value={divisionFilter}
                onChange={e => setDivisionFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="ALL">All Divisions</option>
                {uniqueDivisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>

              <select
                value={workerStatusFilter}
                onChange={e => setWorkerStatusFilter(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 bg-white md:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ASSIGNED">Assigned</option>
              </select>
            </div>

            <span className="hidden md:inline text-xs font-semibold text-slate-500">
              Showing <strong className="text-[#0B1220]">{filteredWorkerLedger.length}</strong> piecework records
            </span>
          </div>

          {/* Worker Piecework Ledger (Mobile Cards + Desktop Table) */}
          <div className="md:bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-xs overflow-x-auto">
            {filteredWorkerLedger.length === 0 ? (
              <div className="p-8 md:p-12 text-center bg-[#F8FAFC] md:bg-transparent rounded-xl md:rounded-none border border-slate-200/80 md:border-0">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Users className="w-6 h-6 text-[#0B1220]" />
                </div>
                <h3 className="text-sm font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">No worker piece records found</h3>
                <p className="hidden md:block text-xs text-slate-500 mt-1">Try resetting search filters or assign floor tasks in modules.</p>
              </div>
            ) : (
              <>
                {/* Mobile Worker Ledger Cards (< md) */}
                <div className="md:hidden space-y-2.5">
                  {filteredWorkerLedger.map(item => {
                    const DivIcon = DIVISION_ICON_MAP[item.divisionRoute] || DIVISION_ICON_MAP[item.division] || Layers

                    return (
                      <div key={item.id} className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#14C8B4]/40 flex items-center justify-center shrink-0">
                              <DivIcon className="w-4 h-4 text-[#0B1220]" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-[#0B1220] truncate font-[family-name:var(--font-heading)]">
                                {item.workerName}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500 truncate">
                                {item.division} • {item.role}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 font-[family-name:var(--font-heading)] ${
                            item.status === 'COMPLETED' || item.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                              {item.articleNo}
                            </span>
                            <span className="font-semibold text-slate-600 truncate">
                              {item.operationName}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 text-center">
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Target</div>
                              <div className="text-xs font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                                {item.targetPieces.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Completed</div>
                              <div className="text-xs font-extrabold text-emerald-700 font-[family-name:var(--font-heading)] tabular-nums">
                                {item.completedPieces.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Defects</div>
                              <div className="text-xs font-extrabold text-rose-600 font-[family-name:var(--font-heading)] tabular-nums">
                                {item.rejectedPieces > 0 ? item.rejectedPieces.toLocaleString() : '-'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span className="truncate">Station: <strong className="text-slate-700">{item.workstationRef}</strong></span>
                          <span className="font-[family-name:var(--font-heading)] tabular-nums shrink-0">{item.date}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table (md+) */}
                <table className="hidden md:table w-full text-left text-xs">
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
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. TAB 3: PLANT OPERATIONS & BUYER PO FULFILLMENT AUDIT              */}
      {/* ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-4 md:space-y-6">
          
          {/* Mobile Output & QC Trend Snapshot (md:hidden) */}
          <div className="md:hidden bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <DashboardSectionHeader
              icon={BarChart3}
              title="Output &"
              accent="QC Trend"
              badge={`Avg ${data.dailyAverage.toLocaleString()}/d`}
            />

            {(() => {
              const recentProd = data.productionTrend.slice(-7)
              const maxProd = Math.max(1, ...recentProd.map(p => p.pieces))
              const totalQcPass = data.qcTrend.reduce((acc, q) => acc + q.passed, 0)
              const totalQcReject = data.qcTrend.reduce((acc, q) => acc + q.rejected, 0)

              return (
                <div className="space-y-2.5">
                  <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>7-Day Floor Output</span>
                      <span className="text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                        {recentProd.reduce((s, p) => s + p.pieces, 0).toLocaleString()} pcs
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 items-end h-20 pt-2">
                      {recentProd.map((pt, idx) => {
                        const pct = Math.max(8, Math.round((pt.pieces / maxProd) * 100))
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                            <div className="w-full flex-1 flex items-end">
                              <div
                                style={{ height: `${pct}%` }}
                                className={`w-full rounded-t-md ${pt.pieces > 0 ? 'bg-[#1D4ED8]' : 'bg-slate-200'}`}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 truncate max-w-full font-[family-name:var(--font-heading)]">
                              {pt.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-2.5 text-center">
                      <div className="text-[10px] font-semibold text-slate-500">Pass Rate</div>
                      <div className="text-sm font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums mt-0.5">
                        {data.kpis.qcPassRate}%
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-2.5 text-center">
                      <div className="text-[10px] font-semibold text-slate-500">QC Passed</div>
                      <div className="text-sm font-extrabold text-emerald-700 font-[family-name:var(--font-heading)] tabular-nums mt-0.5">
                        {totalQcPass.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-2.5 text-center">
                      <div className="text-[10px] font-semibold text-slate-500">Rejected</div>
                      <div className="text-sm font-extrabold text-rose-600 font-[family-name:var(--font-heading)] tabular-nums mt-0.5">
                        {totalQcReject.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Division Scorecards Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 md:bg-transparent md:rounded-none md:border-0 md:p-0 md:shadow-none md:space-y-3">
            <div className="md:hidden">
              <DashboardSectionHeader
                icon={Layers}
                title="Division"
                accent="Scorecards"
                badge={`${data.divisionComparison.length} units`}
              />
            </div>

            <div className="hidden md:flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0B1220] uppercase tracking-wider font-[family-name:var(--font-heading)]">
                Plant Division Operational Scorecards
              </h3>
              <span className="text-xs font-semibold text-slate-500">Subscribed manufacturing modules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
              {data.divisionComparison.map(div => {
                const DivIcon = DIVISION_ICON_MAP[div.divisionRoute] || DIVISION_ICON_MAP[div.division] || Layers

                return (
                  <div
                    key={div.division}
                    className="bg-[#F8FAFC] md:bg-white p-3.5 sm:p-5 rounded-xl md:rounded-2xl border border-slate-200/80 md:shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/40 md:border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                            <DivIcon className="w-4 h-4 text-[#0B1220]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-[#0B1220] truncate font-[family-name:var(--font-heading)]">{div.division}</h4>
                            <p className="text-[11px] font-semibold text-slate-500">{div.workerCount} active operators</p>
                          </div>
                        </div>

                        <Link
                          href={div.divisionRoute}
                          className="w-8 h-8 rounded-xl bg-[#F0FDFA] hover:bg-[#E6FAF7] border border-[#14C8B4]/40 md:border-black/15 text-[#0B1220] flex items-center justify-center transition-all shadow-2xs shrink-0"
                          title="Open Module Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#0B1220]" />
                        </Link>
                      </div>

                      <div className="mt-3 md:mt-4">
                        <div className="text-sm md:text-base font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums md:font-mono">
                          {div.metricLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 md:mt-4 pt-2.5 md:pt-3 border-t border-slate-200/80 md:border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">Throughput</span>
                      <span className="font-[family-name:var(--font-heading)] tabular-nums md:font-mono font-bold text-[#1D4ED8]">{div.totalOutput.toLocaleString()} pcs</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Buyer PO Fulfillment Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 md:bg-transparent md:rounded-none md:border-0 md:p-0 md:shadow-none md:space-y-3">
            <div className="md:hidden">
              <DashboardSectionHeader
                icon={Briefcase}
                title="Buyer PO"
                accent="Delivery Ledger"
                badge={`${data.buyerFulfillments.length} contracts`}
              />
            </div>

            <div className="hidden md:flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0B1220] uppercase tracking-wider font-[family-name:var(--font-heading)]">
                Buyer Purchase Order Delivery Ledger
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {data.buyerFulfillments.length} tracked purchase contracts
              </span>
            </div>

            <div className="md:bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-xs overflow-x-auto">
              {data.buyerFulfillments.length === 0 ? (
                <div className="p-8 md:p-12 text-center bg-[#F8FAFC] md:bg-transparent rounded-xl md:rounded-none border border-slate-200/80 md:border-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-black/15 text-[#0B1220] flex items-center justify-center mx-auto shadow-2xs mb-3">
                    <Briefcase className="w-6 h-6 text-[#0B1220]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">No merchandising contracts found</h3>
                  <p className="hidden md:block text-xs text-slate-500 mt-1">Orders created in Merchandising will appear here automatically.</p>
                </div>
              ) : (
                <>
                  {/* Mobile Buyer Fulfillment Cards (< md) */}
                  <div className="md:hidden space-y-2.5">
                    {data.buyerFulfillments.map(b => (
                      <div key={b.poNumber} className="bg-[#F8FAFC] rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                                {b.poNumber}
                              </span>
                              {b.isOverdue && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-[family-name:var(--font-heading)]">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                              {b.buyerName}
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 font-[family-name:var(--font-heading)] ${
                            b.status === 'Fully Shipped'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'Partially Dispatched'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-[#1D4ED8] border-blue-200'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Target</div>
                              <div className="text-xs font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                                {b.targetPieces.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Dispatched</div>
                              <div className="text-xs font-extrabold text-purple-700 font-[family-name:var(--font-heading)] tabular-nums">
                                {b.deliveredPieces.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-slate-400">Godown</div>
                              <div className="text-xs font-extrabold text-amber-700 font-[family-name:var(--font-heading)] tabular-nums">
                                {b.godownPieces.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span>Fulfillment</span>
                              <span className="text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">{b.percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${b.percent}%` }}
                                className={`h-full ${b.percent >= 100 ? 'bg-emerald-500' : 'bg-[#1D4ED8]'}`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
                          <span className="font-[family-name:var(--font-heading)] tabular-nums">Due: {b.deliveryDate}</span>
                          <span className="truncate font-[family-name:var(--font-heading)]">
                            {b.challanNumbers.length > 0 ? b.challanNumbers.join(', ') : 'Pending Challan'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table (md+) */}
                  <table className="hidden md:table w-full text-left text-xs">
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
