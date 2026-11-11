'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Layers,
  ShieldCheck,
  Flame,
  Box,
  Warehouse,
  Truck,
  Palette,
  FileCheck,
  Sparkles,
  Cpu,
  Droplets,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shirt,
  LayoutDashboard,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
  BarChart3,
  ShoppingBag
} from 'lucide-react'
import {
  OwnerDashboardData,
  ProductionPipelineStage,
  BuyerOrderStatusItem
} from '../actions'
import { OwnerLoginActivitySection } from './OwnerLoginActivitySection'
import { DashboardSectionHeader } from './DashboardSectionHeader'

const DIVISION_ICONS: Record<string, React.ElementType> = {
  Scissors,
  Layers,
  ShieldCheck,
  Flame,
  Box,
  Warehouse,
  Truck,
  Palette,
  FileCheck,
  Sparkles,
  Cpu,
  Droplets
}

const numFormatter = new Intl.NumberFormat('en-IN')
function formatNum(num: number | string | undefined | null): string {
  if (num === null || num === undefined) return '0'
  const val = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(val)) return '0'
  return numFormatter.format(val)
}

export function OwnerDashboardClient({ initialData }: { initialData: OwnerDashboardData }) {
  const [data] = useState<OwnerDashboardData>(initialData)
  
  // Article Dropdown Filter State: 'ALL' by default, or specific article id
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL')
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Pagination States (Desktop: 2 per row x 5 rows = 10; Mobile: 1 per row x 5 rows = 5)
  const [articlesPage, setArticlesPage] = useState<number>(1)
  const [ordersPage, setOrdersPage] = useState<number>(1)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isSoloMode = selectedArticleId !== 'ALL'

  // Selected article object when in Solo mode
  const selectedArticle = useMemo(() => {
    if (!isSoloMode) return null
    return data.articlesCatalog.find(a => a.id === selectedArticleId) || null
  }, [data.articlesCatalog, selectedArticleId, isSoloMode])

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // 1. Dynamic Pulse KPIs (Solo vs Aggregate)
  const pulse = useMemo(() => {
    if (isSoloMode && selectedArticle) {
      return {
        activeStyles: 1,
        runningOrders: 1,
        targetPieces: selectedArticle.buyerPoTarget,
        todayOutput: selectedArticle.todayOutput,
        todayTrendPct: 8,
        godownStock: selectedArticle.godownPieces,
        dispatchedPieces: selectedArticle.dispatchedPieces
      }
    }
    return data.pulse
  }, [isSoloMode, selectedArticle, data.pulse])

  // 2. Dynamic Pipeline Stages (Solo vs Aggregate)
  const pipeline = useMemo(() => {
    if (isSoloMode && selectedArticle) {
      const cutPcs = selectedArticle.cutPieces
      const stitchPcs = selectedArticle.stitchedPieces
      const qcPcs = selectedArticle.qcPassedPieces
      const ironPcs = Math.round(qcPcs * 0.95)
      const packPcs = Math.round(qcPcs * 0.90)
      const godownPcs = selectedArticle.godownPieces
      const dispatchPcs = selectedArticle.dispatchedPieces

      return [
        { id: 'cut', label: 'CUT', count: cutPcs, unit: 'pcs', status: cutPcs > 0 ? 'active' : 'idle' },
        { id: 'stitch', label: 'STITCH', count: stitchPcs, unit: 'pcs', status: stitchPcs > 0 ? 'active' : 'idle' },
        { id: 'qc', label: 'QC PASS', count: qcPcs, unit: 'pcs', status: qcPcs > 0 ? 'active' : 'idle' },
        { id: 'iron', label: 'IRON', count: ironPcs, unit: 'pcs', status: ironPcs > 0 ? 'active' : 'idle' },
        { id: 'pack', label: 'PACK', count: packPcs, unit: 'pcs', status: packPcs > 0 ? 'active' : 'idle' },
        { id: 'godown', label: 'GODOWN', count: godownPcs, unit: 'pcs', status: godownPcs > 0 ? 'active' : 'idle' },
        { id: 'dispatch', label: 'DISPATCH', count: dispatchPcs, unit: 'pcs', status: dispatchPcs > 0 ? 'completed' : 'idle' }
      ] as ProductionPipelineStage[]
    }
    return data.pipeline
  }, [isSoloMode, selectedArticle, data.pipeline])

  // 3. Dynamic 7-Day Trend (Solo vs Aggregate)
  const outputTrend = useMemo(() => {
    if (isSoloMode && selectedArticle) {
      return selectedArticle.dailyTrend
    }
    return data.outputTrend
  }, [isSoloMode, selectedArticle, data.outputTrend])

  const maxTrendPieces = Math.max(...outputTrend.map(d => d.pieces), 1)
  const dailyAverage = Math.round(outputTrend.reduce((s, d) => s + d.pieces, 0) / Math.max(1, outputTrend.length))

  // 4. Dynamic QC Metrics (Solo vs Aggregate)
  const qc = useMemo(() => {
    if (isSoloMode && selectedArticle) {
      return {
        totalPassed: selectedArticle.qcPassedPieces,
        totalRejected: selectedArticle.qcRejectedPieces,
        passRatePct: selectedArticle.qcPassRatePct,
        topDefects: selectedArticle.topDefects
      }
    }
    return data.qc
  }, [isSoloMode, selectedArticle, data.qc])

  const donutRadius = 52
  const donutCircumference = 2 * Math.PI * donutRadius
  const passStrokeDash = (qc.passRatePct / 100) * donutCircumference

  // 5. Dynamic Buyer Orders (Solo vs Aggregate)
  const buyerOrders = useMemo(() => {
    if (isSoloMode && selectedArticle) {
      return [
        {
          buyerName: selectedArticle.buyerName,
          poNumber: selectedArticle.poNumber,
          targetPieces: selectedArticle.buyerPoTarget,
          deliveredPieces: selectedArticle.dispatchedPieces,
          percent: selectedArticle.overallProgressPct,
          status: selectedArticle.overallProgressPct >= 70 ? 'on_track' : selectedArticle.overallProgressPct >= 35 ? 'caution' : 'behind'
        }
      ] as BuyerOrderStatusItem[]
    }
    return data.buyerOrders
  }, [isSoloMode, selectedArticle, data.buyerOrders])

  // Articles Pagination (Desktop: 2 cols x 5 rows = 10; Mobile: 1 col x 5 rows = 5)
  const articlesPerPage = isMobile ? 5 : 10
  const totalArticlePages = Math.max(1, Math.ceil(data.articlesCatalog.length / articlesPerPage))
  const paginatedArticles = useMemo(() => {
    const start = (articlesPage - 1) * articlesPerPage
    return data.articlesCatalog.slice(start, start + articlesPerPage)
  }, [data.articlesCatalog, articlesPage, articlesPerPage])

  // Buyer Orders Pagination (Desktop: 2 cols x 5 rows = 10; Mobile: 1 col x 5 rows = 5)
  const ordersPerPage = isMobile ? 5 : 10
  const totalOrderPages = Math.max(1, Math.ceil(buyerOrders.length / ordersPerPage))
  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage
    return buyerOrders.slice(start, start + ordersPerPage)
  }, [buyerOrders, ordersPage, ordersPerPage])

  useEffect(() => {
    if (articlesPage > totalArticlePages) {
      setArticlesPage(1)
    }
  }, [articlesPage, totalArticlePages])

  useEffect(() => {
    if (ordersPage > totalOrderPages) {
      setOrdersPage(1)
    }
  }, [ordersPage, totalOrderPages])

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220] font-[family-name:var(--font-public-sans)]">
      
      {/* 1. TOP HEADER CARD WITH ARTICLE FILTER DROPDOWN */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3.5 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <LayoutDashboard className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Plant <span className="text-[#1D4ED8]">Operations</span>
              </h1>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
                {data.companyName}
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls: Article Selector Dropdown + Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full lg:w-auto flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          <div className="relative flex-1 sm:flex-initial min-w-[200px] sm:min-w-[260px]">
            <div className="relative flex items-center">
              <Shirt className="w-4 h-4 text-[#1D4ED8] absolute left-3 pointer-events-none" />
              <select
                aria-label="Filter Dashboard by Article"
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-white text-xs sm:text-sm font-bold font-[family-name:var(--font-heading)] text-slate-800 border border-slate-300 rounded-xl appearance-none shadow-2xs hover:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] outline-none transition-all cursor-pointer truncate"
              >
                <option value="ALL">All Articles</option>
                {data.articlesCatalog.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.artNo} — {art.category || art.description} ({formatNum(art.buyerPoTarget)} pcs)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold font-[family-name:var(--font-heading)] text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/reports"
            className="min-h-[38px] sm:min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-[family-name:var(--font-heading)] bg-[#1D4ED8] text-white shadow-sm shadow-blue-500/20 hover:bg-[#1E40AF] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>

      {/* 2. SOLO ARTICLE ACTIVE BANNER */}
      {isSoloMode && selectedArticle && (
        <div className="bg-[#F0FDFA] border border-[#14C8B4]/40 rounded-2xl p-3.5 sm:p-4 text-[#0B1220] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#14C8B4]/30 flex items-center justify-center shrink-0 text-[#0B1220]">
              <Shirt className="w-4 h-4 text-[#0B1220]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-white text-[#0B1220] border border-[#14C8B4]/40">
                  Active Style
                </span>
                <span className="text-sm sm:text-base font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tracking-tight truncate">
                  {selectedArticle.artNo}
                </span>
                {selectedArticle.category && (
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {selectedArticle.category}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                Buyer: <strong className="text-[#0B1220] font-semibold">{selectedArticle.buyerName}</strong> ({selectedArticle.poNumber})
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0 pt-1 sm:pt-0">
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Target</div>
              <div className="text-sm sm:text-base font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                {formatNum(selectedArticle.buyerPoTarget)} pcs <span className="text-xs font-bold text-[#1D4ED8]">({selectedArticle.overallProgressPct}%)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedArticleId('ALL')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0B1220] border border-slate-200/90 rounded-xl text-xs font-bold font-[family-name:var(--font-heading)] transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SECTION 1: FACTORY PULSE (6 KPI CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {[
          { label: isSoloMode ? 'Selected Style' : 'Active Styles', value: pulse.activeStyles },
          { label: 'Running Orders', value: pulse.runningOrders },
          { label: 'Target Pieces', value: pulse.targetPieces },
          { label: "Today's Output", value: pulse.todayOutput },
          { label: 'In Godown', value: pulse.godownStock },
          { label: 'Dispatched', value: pulse.dispatchedPieces },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {kpi.label}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums mt-1">
              {formatNum(kpi.value)}
            </div>
          </div>
        ))}
      </div>

      {/* 4. SECTION 2: LIVE PRODUCTION FLOW */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <DashboardSectionHeader
          icon={Layers}
          title="Live Production"
          accent="Flow"
          badge={isSoloMode && selectedArticle ? selectedArticle.artNo : '7 Stages'}
        />

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[740px] flex items-center justify-between gap-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
            {pipeline.map((stage, index) => {
              const isLast = index === pipeline.length - 1
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center group hover:border-[#14C8B4] transition-all">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#14C8B4] transition-colors">
                      {stage.label}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums mt-1">
                      {formatNum(stage.count)}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {stage.unit}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex items-center justify-center shrink-0 px-0.5 text-slate-300">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* 5. SECTION 3: PRODUCTION TRENDS & QUALITY CONTROL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 3A: 7-Day Output Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <DashboardSectionHeader
            icon={BarChart3}
            title="7-Day"
            accent="Output Trend"
            badge={`Avg ${formatNum(dailyAverage)} pcs/d`}
          />

          <div className="h-44 sm:h-52 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-1">
            {outputTrend.map((item, idx) => {
              const heightPct = Math.max(12, Math.round((item.pieces / maxTrendPieces) * 100))
              const isHovered = hoveredBarIndex === idx

              return (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-10 px-2 py-1 bg-slate-900 text-white text-[11px] font-bold tabular-nums rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                      {formatNum(item.pieces)} pcs
                    </div>
                  )}

                  <div className="w-full h-32 sm:h-36 flex items-end justify-center">
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                        item.isToday
                          ? 'bg-[#1D4ED8] hover:bg-[#1E40AF]'
                          : 'bg-slate-200 group-hover:bg-[#14C8B4]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors truncate">
                    {item.dayName.split(' ')[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3B: Quality Control Donut & Top Defects */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <DashboardSectionHeader
            icon={ShieldCheck}
            title="Quality"
            accent="Compliance"
            badge="AQL 2.5"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Donut SVG */}
            <div className="flex items-center justify-center relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  stroke="#F1F5F9"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={donutCircumference}
                  strokeDashoffset={donutCircumference - passStrokeDash}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#0B1220] font-[family-name:var(--font-heading)] tabular-nums">
                  {qc.passRatePct}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pass Rate
                </span>
              </div>
            </div>

            {/* Top Defects List */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Top Defects
              </div>
              {qc.topDefects.length === 0 ? (
                <div className="text-xs text-slate-400">No defects recorded</div>
              ) : (
                qc.topDefects.map((defect, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{defect.name}</span>
                      <span className="font-bold tabular-nums text-slate-900">{defect.count} pcs ({defect.pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${defect.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 6. SOLO ARTICLE TECHNICAL SPECS */}
      {isSoloMode && selectedArticle && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <DashboardSectionHeader
            icon={Palette}
            title="Tech-Pack &"
            accent="Specs"
            badge={selectedArticle.artNo}
            action={(
              <div className="flex items-center gap-2">
                <Link
                  href="/all-designs"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-all"
                >
                  <span>Design Studio</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
                <Link
                  href="/buyers-vendors"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition-all"
                >
                  <span>Buyer Order</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fabric</span>
              <div className="text-sm font-extrabold font-[family-name:var(--font-heading)] text-[#0B1220]">
                {selectedArticle.fabricType}
              </div>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {selectedArticle.targetGsm} GSM
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Embellishment</span>
              <div className="text-sm font-extrabold font-[family-name:var(--font-heading)] text-[#0B1220]">
                {selectedArticle.embellishmentSequence}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved
              </span>
            </div>

            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contract Volume</span>
              <div className="text-sm font-extrabold font-[family-name:var(--font-heading)] text-[#0B1220] tabular-nums">
                {formatNum(selectedArticle.buyerPoTarget)} pcs
              </div>
              <span className="text-[11px] text-[#1D4ED8] font-bold tabular-nums">
                {selectedArticle.overallProgressPct}% complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-1">
            {[
              { step: '1. Tech-Pack', value: 'READY', active: false },
              { step: '2. Buyer PO', value: formatNum(selectedArticle.buyerPoTarget), active: false },
              { step: '3. Fabric', value: `${formatNum(selectedArticle.fabricMetersInStore)} m`, active: false },
              { step: '4. Cutting', value: formatNum(selectedArticle.cutPieces), active: false },
              { step: '5. Stitching', value: formatNum(selectedArticle.stitchedPieces), active: true },
              { step: '6. QC Passed', value: formatNum(selectedArticle.qcPassedPieces), active: false },
              { step: '7. Godown', value: formatNum(selectedArticle.godownPieces), active: false },
              { step: '8. Dispatch', value: formatNum(selectedArticle.dispatchedPieces), active: false },
            ].map(item => (
              <div
                key={item.step}
                className={`p-3 rounded-xl border text-center ${
                  item.active
                    ? 'bg-teal-50 border-teal-200 ring-1 ring-[#14C8B4]/40'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  item.active ? 'text-[#0e7490]' : 'text-slate-500'
                }`}>
                  {item.step}
                </div>
                <div className={`mt-1 text-sm font-extrabold font-[family-name:var(--font-heading)] tabular-nums ${
                  item.active ? 'text-[#0B1220]' : 'text-slate-800'
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SECTION 4: BUYER ORDERS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <DashboardSectionHeader
          icon={ShoppingBag}
          title="Buyer"
          accent="Orders"
          badge={`${buyerOrders.length} ${buyerOrders.length === 1 ? 'Order' : 'Orders'}`}
          action={(
            <Link
              href="/buyers-vendors"
              className="text-xs font-bold font-[family-name:var(--font-heading)] text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Buyers Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        />

        {buyerOrders.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No active buyer purchase orders found for this company.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {paginatedOrders.map((bo, idx) => {
                const barColor = bo.percent >= 70 ? 'bg-emerald-500' : bo.percent >= 35 ? 'bg-amber-500' : 'bg-rose-500'

                return (
                  <div key={idx} className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 shadow-2xs transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 truncate">{bo.buyerName}</span>
                        <span className="text-[10px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                          {bo.poNumber}
                        </span>
                      </div>
                      <span className="font-extrabold font-[family-name:var(--font-heading)] tabular-nums text-[#0B1220] shrink-0 ml-2">
                        {bo.percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-1">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${bo.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5 tabular-nums">
                      <span>Delivered <strong className="text-slate-700">{formatNum(bo.deliveredPieces)}</strong> / {formatNum(bo.targetPieces)} pcs</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Orders Pagination Controls */}
            {totalOrderPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <div className="tabular-nums">
                  <span className="font-bold text-slate-800">{(ordersPage - 1) * ordersPerPage + 1}</span>–<span className="font-bold text-slate-800">{Math.min(ordersPage * ordersPerPage, buyerOrders.length)}</span> of <span className="font-bold text-slate-800">{buyerOrders.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                    disabled={ordersPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalOrderPages }).map((_, i) => {
                      const pageNum = i + 1
                      const isActive = pageNum === ordersPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setOrdersPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#1D4ED8] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                    disabled={ordersPage === totalOrderPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 8. SECTION 5: COMPANY ARTICLES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <DashboardSectionHeader
          icon={Shirt}
          title="Company"
          accent="Articles"
          badge={`${data.articlesCatalog.length} ${data.articlesCatalog.length === 1 ? 'Style' : 'Styles'}`}
          action={isSoloMode ? (
            <button
              type="button"
              onClick={() => setSelectedArticleId('ALL')}
              className="text-xs font-bold font-[family-name:var(--font-heading)] text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Show All →
            </button>
          ) : undefined}
        />

        {data.articlesCatalog.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/60">
            <Info className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-700">No garment articles found</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {paginatedArticles.map(art => {
                const isSelected = selectedArticleId === art.id

                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/50 border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 shadow-xs'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold font-[family-name:var(--font-heading)] px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200">
                            {art.artNo}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 truncate">
                            {art.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 truncate">
                          Buyer: <strong className="text-slate-700">{art.buyerName}</strong>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isSelected
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        {isSelected ? 'Active' : 'Inspect'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 tabular-nums">
                        <span>Target: <strong className="text-slate-800">{formatNum(art.buyerPoTarget)} pcs</strong></span>
                        <span className="text-[#1D4ED8] font-bold">{art.overallProgressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full transition-all duration-300"
                          style={{ width: `${art.overallProgressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Articles Pagination Controls */}
            {totalArticlePages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                <div className="tabular-nums">
                  <span className="font-bold text-slate-800">{(articlesPage - 1) * articlesPerPage + 1}</span>–<span className="font-bold text-slate-800">{Math.min(articlesPage * articlesPerPage, data.articlesCatalog.length)}</span> of <span className="font-bold text-slate-800">{data.articlesCatalog.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setArticlesPage(p => Math.max(1, p - 1))}
                    disabled={articlesPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalArticlePages }).map((_, i) => {
                      const pageNum = i + 1
                      const isActive = pageNum === articlesPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setArticlesPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#1D4ED8] text-white shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setArticlesPage(p => Math.min(totalArticlePages, p + 1))}
                    disabled={articlesPage === totalArticlePages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 9. SECTION 6: PORTAL USAGE */}
      {data.loginActivity && (
        <OwnerLoginActivitySection activityData={data.loginActivity} />
      )}

      {/* 10. SECTION 7: DIVISION HEARTBEAT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <DashboardSectionHeader
          icon={Layers}
          title="Division"
          accent="Heartbeat"
          badge={`${data.divisionHeartbeat.length} ${data.divisionHeartbeat.length === 1 ? 'Unit' : 'Units'}`}
          action={(
            <Link
              href="/modules"
              className="text-xs font-bold font-[family-name:var(--font-heading)] text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Modules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.divisionHeartbeat.map(div => {
            const IconComp = DIVISION_ICONS[div.iconName] || Layers
            const isIdle = div.status === 'IDLE'

            return (
              <Link
                key={div.id}
                href={div.route}
                className="group bg-slate-50/60 hover:bg-white rounded-xl border border-slate-200 p-3.5 hover:border-[#14C8B4] hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200/80 group-hover:bg-[#F0FDFA] text-slate-700 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isIdle ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-xs font-extrabold font-[family-name:var(--font-heading)] text-[#0B1220] group-hover:text-[#1D4ED8] transition-colors line-clamp-1">
                    {div.name}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium tabular-nums">
                  <span className="truncate">{div.metric}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
