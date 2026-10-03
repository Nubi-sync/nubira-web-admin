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
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Activity,
  Layers as LayersIcon,
  Shirt,
  Calendar,
  ExternalLink
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts'
import { OwnerDashboardData, ArticleJourneyItem } from '../actions'

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

export function OwnerDashboardClient({ initialData }: { initialData: OwnerDashboardData }) {
  const [data, setData] = useState<OwnerDashboardData>(initialData)
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialData.articlesCatalog[0]?.id || ''
  )
  const [articleSearchQuery, setArticleSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Selected article for deep dive
  const selectedArticle = useMemo(() => {
    return (
      data.articlesCatalog.find(a => a.id === selectedArticleId) ||
      data.articlesCatalog[0] ||
      null
    )
  }, [data.articlesCatalog, selectedArticleId])

  // Filtered articles list for dropdown
  const filteredArticles = useMemo(() => {
    if (!articleSearchQuery.trim()) return data.articlesCatalog
    const q = articleSearchQuery.toLowerCase()
    return data.articlesCatalog.filter(
      a => a.artNo.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    )
  }, [data.articlesCatalog, articleSearchQuery])

  // Recharts Donut data for QC
  const qcDonutData = useMemo(() => {
    return [
      { name: 'Passed', value: data.qc.totalPassed, color: '#10B981' },
      { name: 'Rejected', value: data.qc.totalRejected, color: '#F43F5E' }
    ]
  }, [data.qc])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-[family-name:var(--font-public-sans)] select-none">
      
      {/* ==================================================================== */}
      {/* TOP HEADER CONTROLS BAR */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              Factory Control Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Real-time multi-stage operations overview for <span className="font-semibold text-slate-700">{data.companyName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400 font-medium">Last synced</div>
            <div className="text-xs font-bold text-slate-700">{data.lastUpdated}</div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B1220] hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all"
          >
            <span>Analytics & Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: FACTORY PULSE (6 KPI CARDS IN A ROW) */}
      {/* ==================================================================== */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          
          {/* Card 1: Active Styles */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Styles</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.activeStyles}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <Shirt className="w-3.5 h-3.5" />
              <span>In production catalog</span>
            </div>
          </div>

          {/* Card 2: Running Orders */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Running Orders</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.runningOrders}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Active challan orders</span>
            </div>
          </div>

          {/* Card 3: Target Pieces */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Pieces</span>
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.targetPieces.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <LayersIcon className="w-3.5 h-3.5" />
              <span>Total booked volume</span>
            </div>
          </div>

          {/* Card 4: Today's Output */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#14C8B4]/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Output</span>
              <span className="w-2 h-2 rounded-full bg-[#14C8B4]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.todayOutput.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{data.pulse.todayTrendPct}% vs yesterday</span>
            </div>
          </div>

          {/* Card 5: Ready in Godown */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Godown</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.godownStock.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <Warehouse className="w-3.5 h-3.5" />
              <span>Net ready inventory</span>
            </div>
          </div>

          {/* Card 6: Dispatched */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dispatched</span>
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              {data.pulse.dispatchedPieces.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-purple-600">
              <Truck className="w-3.5 h-3.5" />
              <span>Delivered to buyers</span>
            </div>
          </div>

        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: LIVE PRODUCTION FLOW (HORIZONTAL PIPELINE) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Live Production Flow
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Current pieces across all manufacturing stages
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
            7 Stages Active
          </span>
        </div>

        {/* Horizontal Pipeline Visual */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[780px] flex items-center justify-between gap-2 bg-gradient-to-r from-slate-50 via-teal-50/20 to-slate-50 p-4 rounded-xl border border-slate-200/60">
            {data.pipeline.map((stage, index) => {
              const isLast = index === data.pipeline.length - 1
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-xs hover:shadow-md transition-all text-center group">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#14C8B4] transition-colors">
                      {stage.label}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0B1220] mt-1">
                      {stage.count.toLocaleString()}
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
      {/* SECTION 3: CHARTS ROW (DAILY OUTPUT BAR + QC PASS DONUT) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3A: Daily Output (7-Day Trend) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Daily Sewing Output (7-Day Trend)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Stitched pieces per day • Avg: <span className="font-bold text-slate-800">{data.dailyAverage.toLocaleString()} pcs/day</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded bg-[#14C8B4]" />
                  Stitched
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  Today
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-[240px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.outputTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="dayName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9', radius: 6 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-[#0B1220] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5">
                            <div className="font-semibold text-slate-300">{item.dayName}</div>
                            <div className="font-bold text-base text-[#14C8B4]">
                              {Number(item.pieces).toLocaleString()} pcs
                            </div>
                            {item.isToday && (
                              <div className="text-[10px] text-amber-400 font-semibold">Today's active line</div>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine
                    y={data.dailyAverage}
                    stroke="#CBD5E1"
                    strokeDasharray="4 4"
                    label={{ value: 'Daily Avg', position: 'insideTopRight', fill: '#94A3B8', fontSize: 10 }}
                  />
                  <Bar
                    dataKey="pieces"
                    radius={[6, 6, 0, 0]}
                  >
                    {data.outputTrend.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isToday ? '#F59E0B' : '#14C8B4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak capacity target: 1,800 pcs/day</span>
            <span className="font-bold text-emerald-600">89% line efficiency</span>
          </div>
        </div>

        {/* 3B: QC Pass Rate (Donut + Top Defects) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Quality Control Rate
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  3-Stage QC inspection pass vs scrap
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                Grade A
              </span>
            </div>

            {/* Donut and breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-2">
              {/* Donut with center text */}
              <div className="sm:col-span-5 h-[160px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qcDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {qcDonutData.map((entry, index) => (
                        <Cell key={`qc-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-[#0B1220]">
                    {data.qc.passRatePct}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pass
                  </span>
                </div>
              </div>

              {/* Defect Breakdown Bars */}
              <div className="sm:col-span-7 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Top 3 Defects Recorded
                </div>
                {data.qc.topDefects.map((defect, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{defect.name}</span>
                      <span className="font-bold text-slate-900">{defect.count} pcs ({defect.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, defect.pct * 1.8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Passed: <strong className="text-emerald-600">{data.qc.totalPassed.toLocaleString()}</strong> pcs</span>
            <span>Rejected: <strong className="text-rose-600">{data.qc.totalRejected.toLocaleString()}</strong> pcs</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 4: BUYER ORDER PROGRESS & FABRIC INVENTORY */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4A: Buyer Order Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Buyer Orders Fulfillment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Delivered vs target pieces by active buyer contract
              </p>
            </div>
            <Link
              href="/buyers-vendors"
              className="text-xs font-bold text-[#14C8B4] hover:underline flex items-center gap-1"
            >
              <span>Manage POs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {data.buyerOrders.map((bo, idx) => {
              const barColor =
                bo.status === 'on_track'
                  ? 'bg-emerald-500'
                  : bo.status === 'caution'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              const badgeBg =
                bo.status === 'on_track'
                  ? 'bg-emerald-50 text-emerald-700'
                  : bo.status === 'caution'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{bo.buyerName}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {bo.poNumber}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${badgeBg}`}>
                      {bo.percent}% fulfilled
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${bo.percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
                    <span>Delivered: <strong>{bo.deliveredPieces.toLocaleString()}</strong> pcs</span>
                    <span>Target: <strong>{bo.targetPieces.toLocaleString()}</strong> pcs</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4B: Fabric Stock Meters in Godown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Fabric Stock in Godown
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Meters on hand by raw material classification
              </p>
            </div>
            <Link
              href="/fabric-store"
              className="text-xs font-bold text-[#14C8B4] hover:underline flex items-center gap-1"
            >
              <span>Store Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {data.fabricStock.map((fab, idx) => {
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
                      <span className="font-extrabold text-[#0B1220]">
                        {fab.meters.toLocaleString()} m
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14C8B4] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium">
                    Shades: {fab.color}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 5: ARTICLE DEEP-DIVE (DROPDOWN -> PER-ARTICLE STATUS JOURNEY) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-50 text-[#14C8B4] rounded-lg">
                <Shirt className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                Article Deep-Dive Journey
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select any garment style to view its lifecycle progress across all factory divisions
            </p>
          </div>

          {/* Article Dropdown Picker */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[280px]">
              <select
                aria-label="Select Garment Style"
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#14C8B4]"
              >
                {filteredArticles.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.artNo} — {art.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Selected Article Detailed Journey Stepper */}
        {selectedArticle && (
          <div className="space-y-4">
            {/* Header summary of selected article */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white">
                    {selectedArticle.artNo}
                  </span>
                  <span className="text-sm font-bold">{selectedArticle.description}</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Contract Target: <strong className="text-white">{selectedArticle.buyerPoTarget.toLocaleString()} pieces</strong>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-300">Overall Progress</div>
                  <div className="text-xl font-extrabold text-[#14C8B4]">
                    {selectedArticle.overallProgressPct}%
                  </div>
                </div>
                <div className="w-24 h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#14C8B4] rounded-full"
                    style={{ width: `${selectedArticle.overallProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              
              {/* Step 1: Design Tech Pack */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">1. Tech-Pack</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-900">APPROVED</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">CAD & Specs ready</div>
              </div>

              {/* Step 2: Buyer PO */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">2. Buyer PO</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-900">{selectedArticle.buyerPoTarget.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Target pieces</div>
              </div>

              {/* Step 3: Fabric in Store */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">3. Raw Fabric</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-900">{selectedArticle.fabricMetersInStore.toLocaleString()} m</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">In Godown rolls</div>
              </div>

              {/* Step 4: Cutting */}
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">4. Cutting</div>
                <div className="mt-1 text-sm font-extrabold text-emerald-900">{selectedArticle.cutPieces.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Bundles cut</div>
              </div>

              {/* Step 5: Stitching */}
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center ring-2 ring-[#14C8B4]/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e7490]">5. Stitching</div>
                <div className="mt-1 text-sm font-extrabold text-[#0B1220]">{selectedArticle.stitchedPieces.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-[#0e7490] mt-0.5">Sewing active</div>
              </div>

              {/* Step 6: QC Passed */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. QC Passed</div>
                <div className="mt-1 text-sm font-extrabold text-slate-900">{selectedArticle.qcPassedPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Defects cleared</div>
              </div>

              {/* Step 7: In Godown */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">7. Godown</div>
                <div className="mt-1 text-sm font-extrabold text-slate-900">{selectedArticle.godownPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Finished stock</div>
              </div>

              {/* Step 8: Dispatched */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">8. Dispatch</div>
                <div className="mt-1 text-sm font-extrabold text-slate-900">{selectedArticle.dispatchedPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Shipped to buyer</div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* SECTION 6: DIVISION HEARTBEAT (12 OPERATIONAL DIVISIONS MINI-GRID) */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Division Heartbeat (12 Operational Departments)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Click any department to jump directly into its operational control desk
            </p>
          </div>
          <Link
            href="/modules"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>All 12 Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.divisionHeartbeat.map(div => {
            const IconComp = DIVISION_ICONS[div.iconName] || Layers
            const statusDot =
              div.status === 'ACTIVE'
                ? 'bg-emerald-500 ring-2 ring-emerald-200'
                : div.status === 'LOW'
                ? 'bg-amber-500 ring-2 ring-amber-200'
                : 'bg-slate-300'

            return (
              <Link
                key={div.id}
                href={div.route}
                className="group bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-[#14C8B4] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-teal-50 group-hover:text-[#14C8B4] text-slate-600 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </span>
                    <span className={`w-2 h-2 rounded-full ${statusDot}`} />
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
