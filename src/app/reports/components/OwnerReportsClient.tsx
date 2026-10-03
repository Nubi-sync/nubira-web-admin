'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import {
  Download,
  Printer,
  Calendar,
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Shirt,
  Scissors,
  Layers,
  ShieldCheck,
  Warehouse,
  Truck,
  Flame,
  Award,
  Clock,
  Filter
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts'
import { ReportsData, ArticleReportRow } from '../actions'

type DateFilterPreset = 'today' | '7days' | '30days' | 'all'

export function OwnerReportsClient({ initialData }: { initialData: ReportsData }) {
  const [data] = useState<ReportsData>(initialData)
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('30days')
  const [searchArticle, setSearchArticle] = useState('')
  const [sortField, setSortField] = useState<keyof ArticleReportRow>('targetPcs')
  const [sortAsc, setSortAsc] = useState(false)

  // Filtered and sorted article reports table
  const filteredArticles = useMemo(() => {
    let result = [...data.articlesReport]
    if (searchArticle.trim()) {
      const q = searchArticle.toLowerCase()
      result = result.filter(
        a => a.artNo.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA))
    })

    return result
  }, [data.articlesReport, searchArticle, sortField, sortAsc])

  // Export Article Level Report to Excel
  const handleExportExcel = () => {
    const sheetData = filteredArticles.map(a => ({
      'Style No': a.artNo,
      'Description': a.description,
      'Target Pieces': a.targetPcs,
      'Cut Pieces': a.cutPcs,
      'Stitched Pieces': a.stitchedPcs,
      'QC Passed': a.qcPassedPcs,
      'QC Failed': a.qcFailedPcs,
      'QC Reject Rate %': `${a.qcRejectRatePct}%`,
      'Ready in Godown': a.godownPcs,
      'Dispatched': a.dispatchedPcs,
      'Overall Progress %': `${a.progressPct}%`
    }))

    const worksheet = XLSX.utils.json_to_sheet(sheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Production_Report')
    
    const fileName = `Zigza_Plant_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  // Handle Print PDF
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleSort = (field: keyof ArticleReportRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-[family-name:var(--font-public-sans)] select-none">
      
      {/* ==================================================================== */}
      {/* HEADER CONTROLS BAR: DATE FILTER + EXPORT BUTTONS */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] tracking-tight">
              Reports & Executive Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Verified Production Ledger
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Cross-department performance trends, quality audits & dispatch metrics for <span className="font-semibold text-slate-700">{data.companyName}</span>
          </p>
        </div>

        {/* Date presets and Export actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Preset Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === 'today' ? 'bg-white text-[#0B1220] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === '7days' ? 'bg-white text-[#0B1220] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === '30days' ? 'bg-white text-[#0B1220] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                dateFilter === 'all' ? 'bg-white text-[#0B1220] shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export to Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-200 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>

          {/* Jump to live dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#0B1220] hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all"
          >
            <span>Live Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: REPORT SUMMARY CARDS (4 KPI CARDS) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Pieces Produced */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sewing Output</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#14C8B4]">
              <Scissors className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            {data.kpis.totalProduced.toLocaleString()} <span className="text-sm font-semibold text-slate-400">pcs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{data.kpis.producedTrendPct}% vs previous cycle</span>
          </div>
        </div>

        {/* KPI 2: QC Pass Rate % */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">QC Pass Rate</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            {data.kpis.qcPassRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{data.kpis.qcPassTrendPct}% quality improvement</span>
          </div>
        </div>

        {/* KPI 3: Net Warehouse Movement */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Godown Stock</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Warehouse className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            {data.kpis.netWarehouseStock.toLocaleString()} <span className="text-sm font-semibold text-slate-400">pcs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Available for dispatch</span>
          </div>
        </div>

        {/* KPI 4: Total Dispatched */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dispatched to Buyers</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0B1220] tracking-tight">
            {data.kpis.totalDispatched.toLocaleString()} <span className="text-sm font-semibold text-slate-400">pcs</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-purple-600">
            <TrendingUp className="w-4 h-4" />
            <span>+{data.kpis.dispatchTrendPct}% delivery pace</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 2: CHARTS ROW (PRODUCTION AREA TREND + QC STACKED BAR) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2A: Production Trend AreaChart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Production Output Trend (14-Day Trajectory)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Daily stitched pieces with moving average • Avg: <strong className="text-slate-800">{data.dailyAverage.toLocaleString()} pcs/day</strong>
                </p>
              </div>
              <span className="text-xs font-bold text-[#14C8B4] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Smooth Flow
              </span>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.productionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14C8B4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14C8B4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
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
                    cursor={{ stroke: '#CBD5E1', strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-[#0B1220] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-0.5">
                            <div className="font-semibold text-slate-300">{item.label}</div>
                            <div className="font-bold text-base text-[#14C8B4]">
                              {Number(item.pieces).toLocaleString()} pieces
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <ReferenceLine
                    y={data.dailyAverage}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    label={{ value: 'Avg', position: 'insideTopRight', fill: '#64748B', fontSize: 10 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pieces"
                    stroke="#14C8B4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#prodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Highest Day: 1,490 pcs</span>
            <span className="font-bold text-emerald-600">Stable line throughput</span>
          </div>
        </div>

        {/* 2B: QC Trend (Stacked Bar: Passed vs Rejected) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  QC Passed vs Rejected
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Daily audit count & rejection breakdown
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded bg-emerald-500" />
                  Pass
                </span>
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <span className="w-2 h-2 rounded bg-rose-500" />
                  Fail
                </span>
              </div>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.qcTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
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
                    cursor={{ fill: '#F8FAFC' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-[#0B1220] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-semibold text-slate-300">{item.label}</div>
                            <div className="text-emerald-400 font-bold">Passed: {item.passed.toLocaleString()} pcs</div>
                            <div className="text-rose-400 font-bold">Rejected: {item.rejected.toLocaleString()} pcs</div>
                            <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-700">
                              Pass Rate: {item.passRate}%
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="passed" stackId="qc" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejected" stackId="qc" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overall Rejection: <strong className="text-rose-600">4.6%</strong></span>
            <span className="font-bold text-emerald-600">95.4% Pass Standard</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 3: TOP 5 TAILORS & TOP 5 STYLES LEADERBOARDS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3A: Top 5 Tailors */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Top Tailors Leaderboard
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ranked by verified stitched pieces output
              </p>
            </div>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3">
            {data.topTailors.map(tailor => (
              <div key={tailor.rank} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      tailor.rank === 1
                        ? 'bg-amber-400 text-slate-900'
                        : tailor.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : tailor.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tailor.rank}
                    </span>
                    <span className="font-bold text-slate-900">{tailor.name}</span>
                  </div>
                  <span className="font-extrabold text-[#0B1220]">
                    {tailor.pieces.toLocaleString()} pcs
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${tailor.pctOfMax}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3B: Top 5 Styles by Volume */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Top Garment Styles by Volume
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Highest throughput production designs
              </p>
            </div>
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#14C8B4]">
              <Shirt className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-3">
            {data.topStyles.map(style => (
              <div key={style.rank} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {style.artNo}
                    </span>
                    <span className="font-medium text-slate-700 truncate">{style.description}</span>
                  </div>
                  <span className="font-extrabold text-[#0B1220] shrink-0 ml-2">
                    {style.pieces.toLocaleString()} pcs
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#14C8B4] rounded-full transition-all duration-500"
                    style={{ width: `${style.pctOfMax}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 4 & 5: WAREHOUSE FLOW & BUYER GANTT FULFILLMENT */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 4: Warehouse Movement AreaChart */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Godown Movement (Inward vs Outward)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Stock accumulation vs dispatches over time
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded bg-emerald-500" />
                  Inward
                </span>
                <span className="inline-flex items-center gap-1 text-purple-700">
                  <span className="w-2 h-2 rounded bg-purple-500" />
                  Outward
                </span>
              </div>
            </div>

            <div className="h-[240px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.warehouseMovement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inwardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="outwardGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload
                        return (
                          <div className="bg-[#0B1220] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <div className="font-semibold text-slate-300">{item.label}</div>
                            <div className="text-emerald-400 font-bold">Inward: +{item.inward} pcs</div>
                            <div className="text-purple-400 font-bold">Outward: -{item.outward} pcs</div>
                            <div className="text-slate-300 text-[10px] pt-1 border-t border-slate-700">
                              Net Flow: {item.net > 0 ? `+${item.net}` : item.net} pcs
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="inward" stroke="#10B981" strokeWidth={2} fill="url(#inwardGrad)" />
                  <Area type="monotone" dataKey="outward" stroke="#A855F7" strokeWidth={2} fill="url(#outwardGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Warehouse capacity utilization: 68%</span>
            <span className="font-bold text-emerald-600">Optimal buffer stock</span>
          </div>
        </div>

        {/* 5: Buyer Delivery Fulfillment (Gantt-Style Timeline) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Buyer Delivery Fulfillment Timeline
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Commercial contract delivery deadlines & completion
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Gantt Monitor
              </span>
            </div>

            <div className="space-y-3.5">
              {data.buyerFulfillments.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.buyerName}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {item.poNumber}
                      </span>
                    </div>
                    {item.isOverdue ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        Action Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">
                        Due: {item.deliveryDate}
                      </span>
                    )}
                  </div>

                  {/* Gantt Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.percent >= 70 ? 'bg-emerald-500' : item.percent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Delivered: <strong>{item.deliveredPieces.toLocaleString()}</strong> / {item.targetPieces.toLocaleString()} pcs</span>
                    <span className="font-extrabold text-[#0B1220]">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>On-time dispatch rate: <strong>92%</strong></span>
            <Link href="/buyers-vendors" className="text-xs font-bold text-[#14C8B4] hover:underline">
              Buyer Portal →
            </Link>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 6 & 7: FABRIC USAGE VS STOCK & DIVISION COMPARISON */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 6: Fabric Usage vs Stock */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Fabric Consumption vs Godown Balance
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Meters cut vs meters currently in store rolls
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1 text-[#14C8B4]">
                <span className="w-2 h-2 rounded bg-[#14C8B4]" />
                Remaining
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="w-2 h-2 rounded bg-slate-400" />
                Consumed
              </span>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fabricComparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="fabricType" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload
                      return (
                        <div className="bg-[#0B1220] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-slate-300">{item.fabricType}</div>
                          <div className="text-[#14C8B4] font-bold">In Store: {item.remainingMeters.toLocaleString()} m</div>
                          <div className="text-slate-400 font-semibold">Consumed: {item.consumedMeters.toLocaleString()} m</div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="remainingMeters" fill="#14C8B4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumedMeters" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7: Division Scorecard */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                  Division Operational Index
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Normalized activity & efficiency benchmarks
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                High Health
              </span>
            </div>

            <div className="space-y-3">
              {data.divisionComparison.map(div => (
                <div key={div.division} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{div.division}</span>
                    <span className="text-slate-500 font-normal">{div.metricLabel} — <strong className="text-slate-900">{div.score}%</strong></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        div.score >= 90 ? 'bg-emerald-500' : div.score >= 80 ? 'bg-[#14C8B4]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${div.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Benchmark basis: Factory 30-Day Mean</span>
            <span className="font-bold text-slate-700">Score: 89.2</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* SECTION 8: ARTICLE-LEVEL REPORT DATA GRID (SEARCHABLE & FILTERABLE) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        
        {/* Table header controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-[#14C8B4]">
                <Shirt className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                Article Production Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive piece-level reconciliation across every style and production phase
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search style or description..."
                value={searchArticle}
                onChange={e => setSearchArticle(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#14C8B4] w-56 sm:w-64"
              />
            </div>

            {/* Quick Export Table */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Visual Data Grid Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 cursor-pointer hover:text-slate-900" onClick={() => handleSort('artNo')}>
                  Style No.
                </th>
                <th className="py-3 px-3.5">Description</th>
                <th className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('targetPcs')}>
                  Target
                </th>
                <th className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('cutPcs')}>
                  Cut
                </th>
                <th className="py-3 px-3.5 text-right cursor-pointer hover:text-slate-900" onClick={() => handleSort('stitchedPcs')}>
                  Stitched
                </th>
                <th className="py-3 px-3.5 text-right text-emerald-700">QC Pass</th>
                <th className="py-3 px-3.5 text-right text-rose-700">QC Fail</th>
                <th className="py-3 px-3.5 text-right">In Godown</th>
                <th className="py-3 px-3.5 text-right">Dispatched</th>
                <th className="py-3 px-3.5 text-center cursor-pointer hover:text-slate-900" onClick={() => handleSort('progressPct')}>
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No matching garment styles found.
                  </td>
                </tr>
              ) : (
                filteredArticles.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {row.artNo}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {row.description}
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-[#0B1220] whitespace-nowrap">
                      {row.targetPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {row.cutPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                      {row.stitchedPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {row.qcPassedPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[11px] ${
                        row.qcRejectRatePct < 4
                          ? 'bg-emerald-50 text-emerald-700'
                          : row.qcRejectRatePct <= 6
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {row.qcFailedPcs} ({row.qcRejectRatePct}%)
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-amber-700">
                      {row.godownPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-purple-700">
                      {row.dispatchedPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#14C8B4] rounded-full"
                            style={{ width: `${row.progressPct}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#0B1220] text-[11px] w-8 text-right">
                          {row.progressPct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Showing {filteredArticles.length} of {data.articlesReport.length} active styles</span>
          <span>Click column headers to sort</span>
        </div>

      </div>

    </div>
  )
}
