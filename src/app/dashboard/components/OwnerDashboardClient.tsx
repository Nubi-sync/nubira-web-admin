'use client'

import React, { useState, useMemo } from 'react'
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
  RefreshCw,
  Shirt,
  LayoutDashboard,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Target
} from 'lucide-react'
import {
  OwnerDashboardData,
  ProductionPipelineStage,
  BuyerOrderStatusItem
} from '../actions'

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

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220] font-[family-name:var(--font-public-sans)]">
      
      {/* ==================================================================== */}
      {/* 1. TOP HEADER CARD WITH ARTICLE FILTER DROPDOWN                      */}
      {/* ==================================================================== */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15 mt-0.5 sm:mt-0">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Plant <span className="text-[#1D4ED8]">Operations Dashboard</span>
              </h1>
              <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase px-2 py-0.5 sm:px-2.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {data.companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Real-time throughput, floor stage reconciliation, and per-article solo lifecycle analytics.
            </p>
          </div>
        </div>

        {/* Top Controls: Article Selector Dropdown + Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto flex-wrap sm:flex-nowrap justify-between lg:justify-end">
          
          {/* ARTICLE FILTER DROPDOWN */}
          <div className="relative flex-1 sm:flex-initial min-w-[220px] sm:min-w-[290px]">
            <div className="relative flex items-center">
              <Shirt className="w-4 h-4 text-[#1D4ED8] absolute left-3 pointer-events-none" />
              <select
                aria-label="Filter Dashboard by Article"
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-slate-50 hover:bg-white text-xs sm:text-sm font-bold text-slate-800 border border-slate-300 rounded-xl appearance-none shadow-2xs hover:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] outline-none transition-all cursor-pointer truncate"
              >
                <option value="ALL">✨ All Articles (Factory Aggregate)</option>
                {data.articlesCatalog.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.artNo} — {art.category || art.description} ({formatNum(art.buyerPoTarget)} pcs)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
            </div>
          </div>

          <div className="text-right hidden xl:block">
            <div className="text-[10px] text-slate-400 font-medium">Synced at</div>
            <div className="text-xs font-bold text-slate-700 font-mono">{data.lastUpdated}</div>
          </div>

          <button
            onClick={handleRefresh}
            className="min-h-[38px] sm:min-h-[42px] px-3 sm:px-3.5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/reports"
            className="min-h-[38px] sm:min-h-[42px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4.5 py-1.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1D4ED8] text-white shadow-sm shadow-blue-500/20 hover:bg-[#1E40AF] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SOLO ARTICLE ACTIVE BANNER (ONLY SHOWN IN SOLO MODE)             */}
      {/* ==================================================================== */}
      {isSoloMode && selectedArticle && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-900/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0">
              <Shirt className="w-6 h-6 text-[#14C8B4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-[#14C8B4] text-[#0B1220] shadow-xs">
                  SOLO ARTICLE VIEW
                </span>
                <span className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                  {selectedArticle.artNo}
                </span>
                <span className="text-xs font-bold text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  {selectedArticle.category}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  Buyer: <strong className="text-white">{selectedArticle.buyerName}</strong> ({selectedArticle.poNumber})
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Displaying isolated manufacturing throughput, QC pass rate, and floor pipeline exclusively for style #{selectedArticle.artNo}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider">Style Target</div>
              <div className="text-lg font-extrabold text-[#14C8B4] font-mono">
                {formatNum(selectedArticle.buyerPoTarget)} pcs ({selectedArticle.overallProgressPct}%)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedArticleId('ALL')}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset to All Articles</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. SECTION 1: FACTORY PULSE (6 KPI CARDS — DYNAMIC)                  */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        
        {/* Card 1: Active Styles */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            {isSoloMode ? 'Selected Style' : 'Active Styles'}
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.activeStyles)}
          </div>
        </div>

        {/* Card 2: Running Orders */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Running Orders
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.runningOrders)}
          </div>
        </div>

        {/* Card 3: Target Pieces */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Target Pieces
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.targetPieces)}
          </div>
        </div>

        {/* Card 4: Today's Output */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Today&apos;s Output
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.todayOutput)}
          </div>
        </div>

        {/* Card 5: In Godown */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            In Godown
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.godownStock)}
          </div>
        </div>

        {/* Card 6: Dispatched */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Dispatched
          </span>
          <div className="text-xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-0.5 sm:mt-1">
            {formatNum(pulse.dispatchedPieces)}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. SECTION 2: LIVE PRODUCTION FLOW (HORIZONTAL PIPELINE)             */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span>Live Production Flow</span>
              {isSoloMode && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedArticle?.artNo}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isSoloMode 
                ? `Current manufacturing station inventory for ${selectedArticle?.artNo}`
                : 'Current pieces across all manufacturing stages for all factory articles'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            7 Stages Active
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[780px] flex items-center justify-between gap-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            {pipeline.map((stage, index) => {
              const isLast = index === pipeline.length - 1
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center group hover:border-[#14C8B4] transition-all">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#14C8B4] transition-colors">
                      {stage.label}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-mono mt-1">
                      {formatNum(stage.count)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {stage.unit}
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex items-center justify-center shrink-0 px-1 text-slate-300">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. SECTION 3: PRODUCTION TRENDS & QUALITY CONTROL (2 COLUMNS)        */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 3A: 7-Day Output Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                7-Day Daily Output Trend
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isSoloMode 
                  ? `Stitching & assembly output for ${selectedArticle?.artNo}`
                  : 'Total finished garments passing inline assembly'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Daily Average</div>
              <div className="text-base sm:text-lg font-extrabold text-[#0B1220] font-mono">
                {formatNum(dailyAverage)} pcs
              </div>
            </div>
          </div>

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
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-10 px-2 py-1 bg-slate-900 text-white text-[11px] font-mono font-bold rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Quality Compliance &amp; Defects
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isSoloMode 
                  ? `Inspection metrics for ${selectedArticle?.artNo}`
                  : 'AQL 2.5 inline floor auditing and defect breakdown'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AQL 2.5 Standard
            </span>
          </div>

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
                <span className="text-2xl font-extrabold text-[#0B1220] font-mono">
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
                Top Defect Categories
              </div>
              {qc.topDefects.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No defects recorded</div>
              ) : (
                qc.topDefects.map((defect, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{defect.name}</span>
                      <span className="font-mono font-bold text-slate-900">{defect.count} pcs ({defect.pct}%)</span>
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

      {/* ==================================================================== */}
      {/* 6. SOLO ARTICLE TECHNICAL STUDIO & CAD PREVIEW (ONLY IN SOLO MODE)   */}
      {/* ==================================================================== */}
      {isSoloMode && selectedArticle && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0B1220] flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#1D4ED8]" />
                Technical Tech-Pack &amp; Production Specs
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Style #{selectedArticle.artNo} • Category: {selectedArticle.category} • Buyer: {selectedArticle.buyerName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/all-designs"
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <span>View Design Studio</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/buyers-vendors"
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <span>View Buyer Order</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spec Box 1: Fabric Spec */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabric Specification</span>
              <div className="text-sm sm:text-base font-bold text-[#0B1220]">
                {selectedArticle.fabricType}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Target Weight: {selectedArticle.targetGsm} GSM
              </span>
            </div>

            {/* Spec Box 2: Embellishment Sequence */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Embellishment Flow</span>
              <div className="text-sm sm:text-base font-bold text-[#0B1220]">
                {selectedArticle.embellishmentSequence}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Floor Spec Approved
              </span>
            </div>

            {/* Spec Box 3: Production Target */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Contract Volume</span>
              <div className="text-sm sm:text-base font-bold text-[#0B1220] font-mono">
                {formatNum(selectedArticle.buyerPoTarget)} pcs
              </div>
              <span className="text-[11px] text-[#1D4ED8] font-bold">
                Overall Progress: {selectedArticle.overallProgressPct}%
              </span>
            </div>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Tech-Pack</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800">READY</div>
              <div className="text-[10px] text-slate-400 mt-0.5">CAD &amp; Specs</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Buyer PO</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.buyerPoTarget)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target pieces</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Raw Fabric</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.fabricMetersInStore)} m</div>
              <div className="text-[10px] text-slate-400 mt-0.5">In Godown</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. Cutting</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.cutPieces)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bundles cut</div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center ring-1 ring-[#14C8B4]/40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e7490]">5. Stitching</div>
              <div className="mt-1 text-sm font-extrabold text-[#0B1220] font-mono">{formatNum(selectedArticle.stitchedPieces)}</div>
              <div className="text-[10px] font-bold text-[#0e7490] mt-0.5">Sewing active</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. QC Passed</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.qcPassedPieces)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Cleared</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">7. Godown</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.godownPieces)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Finished stock</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">8. Dispatch</div>
              <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{formatNum(selectedArticle.dispatchedPieces)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Shipped</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. SECTION 4: BUYER ORDERS & FABRIC STOCK (2 COLUMNS)                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 4A: Buyer Purchase Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Buyer Purchase Orders &amp; Fulfillment
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isSoloMode 
                  ? `Contract fulfillment for ${selectedArticle?.artNo}`
                  : 'Active contracts sorted by delivery progress'}
              </p>
            </div>
            <Link
              href="/buyers-vendors"
              className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Buyers Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {buyerOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No active buyer purchase orders found for this company.
              </div>
            ) : (
              buyerOrders.map((bo, idx) => {
                const barColor = bo.percent >= 70 ? 'bg-emerald-500' : bo.percent >= 35 ? 'bg-amber-500' : 'bg-rose-500'

                return (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{bo.buyerName}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {bo.poNumber}
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-[#0B1220]">
                        {bo.percent}% Fulfilled
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${bo.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
                      <span>Delivered: <strong className="font-mono text-slate-700">{formatNum(bo.deliveredPieces)}</strong> pcs</span>
                      <span>Target: <strong className="font-mono text-slate-700">{formatNum(bo.targetPieces)}</strong> pcs</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 4B: Fabric Stock in Godown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Fabric Stock in Godown
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Raw material classification and meter count on floor
              </p>
            </div>
            <Link
              href="/fabric-store"
              className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Store Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.fabricStock.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No fabric rolls logged in godown for this company.
              </div>
            ) : (
              data.fabricStock.map((fab, idx) => {
                const maxMeters = Math.max(...data.fabricStock.map(f => f.meters), 1)
                const pct = Math.round((fab.meters / maxMeters) * 100)

                return (
                  <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate max-w-[240px]">
                        {fab.fabricType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {fab.rolls} Rolls
                        </span>
                        <span className="font-extrabold text-[#0B1220] font-mono">
                          {formatNum(fab.meters)} m
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#14C8B4] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      Color: {fab.color}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 8. SECTION 5: ARTICLE DIRECTORY & QUICK SELECTOR                     */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#F0FDFA] text-[#0B1220] rounded-lg border border-black/10">
                <Shirt className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                Company Articles Directory ({data.articlesCatalog.length} Style{data.articlesCatalog.length === 1 ? '' : 's'})
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any article below or use the top dropdown to view its isolated solo dashboard
            </p>
          </div>

          {isSoloMode && (
            <button
              type="button"
              onClick={() => setSelectedArticleId('ALL')}
              className="text-xs font-bold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Switch Back to All Articles →
            </button>
          )}
        </div>

        {data.articlesCatalog.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <Info className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-700">No garment articles found for this company.</div>
            <div>Create styles in Design &amp; Tech-Pack Studio or Merchandising to track live floor throughput.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {data.articlesCatalog.map(art => {
              const isSelected = selectedArticleId === art.id

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/50 border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 shadow-2xs">
                          {art.artNo}
                        </span>
                        <span className="text-xs font-bold text-slate-700 truncate">
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
                      {isSelected ? 'Active Solo' : 'Select Solo'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Contract: <strong className="font-mono text-slate-800">{formatNum(art.buyerPoTarget)} pcs</strong></span>
                      <span>Progress: <strong className="text-[#1D4ED8]">{art.overallProgressPct}%</strong></span>
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
        )}
      </div>

      {/* ==================================================================== */}
      {/* 9. SECTION 6: DIVISION HEARTBEAT                                     */}
      {/* ==================================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Division Heartbeat ({data.divisionHeartbeat.length} Subscribed Operational Unit{data.divisionHeartbeat.length === 1 ? '' : 's'})
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live status and single-click access to authorized factory floor departments
            </p>
          </div>
          <Link
            href="/modules"
            className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
          >
            <span>All {data.divisionHeartbeat.length} Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.divisionHeartbeat.map(div => {
            const IconComp = DIVISION_ICONS[div.iconName] || Layers
            const isIdle = div.status === 'IDLE'

            return (
              <Link
                key={div.id}
                href={div.route}
                className="group bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-[#14C8B4] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-[#F0FDFA] group-hover:text-[#0B1220] text-slate-600 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isIdle ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#14C8B4] transition-colors line-clamp-1">
                    {div.name}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
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
