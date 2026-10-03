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
  Info
} from 'lucide-react'
import { OwnerDashboardData } from '../actions'

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
  const [data] = useState<OwnerDashboardData>(initialData)
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialData.articlesCatalog[0]?.id || ''
  )
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Selected article for deep dive
  const selectedArticle = useMemo(() => {
    return (
      data.articlesCatalog.find(a => a.id === selectedArticleId) ||
      data.articlesCatalog[0] ||
      null
    )
  }, [data.articlesCatalog, selectedArticleId])

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // 7-Day Trend Chart Calculations
  const maxTrendPieces = Math.max(...data.outputTrend.map(d => d.pieces), 1)

  // QC Donut Chart Calculations (Circumference of r=52 is ~326.7)
  const donutRadius = 52
  const donutCircumference = 2 * Math.PI * donutRadius
  const passStrokeDash = (data.qc.passRatePct / 100) * donutCircumference
  const rejectStrokeDash = donutCircumference - passStrokeDash

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220] font-[family-name:var(--font-public-sans)]">
      
      {/* ==================================================================== */}
      {/* 1. TOP HEADER CARD: MATCHING ALL MODULES LAYOUT & SIZE               */}
      {/* ==================================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <LayoutDashboard className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Plant <span className="text-[#1D4ED8]">Operations Dashboard</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {data.companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Real-time manufacturing throughput, multi-stage floor reconciliation, and executive metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400 font-medium">Synced at</div>
            <div className="text-xs font-bold text-slate-700 font-mono">{data.lastUpdated}</div>
          </div>
          <button
            onClick={handleRefresh}
            className="min-h-[40px] sm:min-h-[42px] flex items-center gap-2 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/reports"
            className="min-h-[40px] sm:min-h-[42px] inline-flex items-center justify-center gap-2 px-4.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1D4ED8] text-white shadow-sm shadow-blue-500/20 hover:bg-[#1E40AF] hover:shadow-md hover:shadow-blue-500/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Reports &amp; Analytics</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SECTION 1: FACTORY PULSE (6 KPI CARDS — HEADING & NUMBER ONLY)    */}
      {/* (NO DESCRIPTION LINES, NO GREEN DOTS, NO LIVE BLINKS)               */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* Card 1: Active Styles */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Active Styles
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.activeStyles.toLocaleString()}
          </div>
        </div>

        {/* Card 2: Running Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Running Orders
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.runningOrders.toLocaleString()}
          </div>
        </div>

        {/* Card 3: Target Pieces */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Target Pieces
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.targetPieces.toLocaleString()}
          </div>
        </div>

        {/* Card 4: Today's Output */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Today&apos;s Output
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.todayOutput.toLocaleString()}
          </div>
        </div>

        {/* Card 5: In Godown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            In Godown
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.godownStock.toLocaleString()}
          </div>
        </div>

        {/* Card 6: Dispatched */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Dispatched
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.pulse.dispatchedPieces.toLocaleString()}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 3. SECTION 2: LIVE PRODUCTION FLOW (HORIZONTAL PIPELINE)             */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Live Production Flow
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Current pieces across all manufacturing stages
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            7 Stages Active
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[780px] flex items-center justify-between gap-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
            {data.pipeline.map((stage, index) => {
              const isLast = index === data.pipeline.length - 1
              return (
                <React.Fragment key={stage.id}>
                  <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-xs text-center group hover:border-[#14C8B4] transition-all">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#14C8B4] transition-colors">
                      {stage.label}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0B1220] font-mono mt-1">
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
      {/* 4. SECTION 3: VISUAL CHARTS (ZERO-DEPENDENCY SVG RENDERING)          */}
      {/* GUARANTEED VISIBLE ON FIRST FRAME — NO BLANK BOXES EVER             */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 3A: Daily Sewing Output (7-Day Bar Chart) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Daily Sewing Output (7-Day Trend)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Stitched pieces per day • Avg: <span className="font-bold text-slate-800">{data.dailyAverage.toLocaleString()} pcs/day</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded bg-[#14C8B4]" />
                  Stitched
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400" />
                  Today
                </span>
              </div>
            </div>

            {/* Robust Visual SVG / HTML Bar Chart */}
            <div className="h-[220px] w-full pt-4 pb-2 flex flex-col justify-end">
              <div className="h-[180px] w-full flex items-end justify-between gap-2 sm:gap-4 px-2 relative border-b border-slate-200">
                
                {/* Horizontal reference average line */}
                {maxTrendPieces > 0 && data.dailyAverage > 0 && (
                  <div
                    className="absolute left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none z-10 flex items-center justify-end pr-2"
                    style={{ bottom: `${Math.min(95, (data.dailyAverage / maxTrendPieces) * 100)}%` }}
                  >
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1 -translate-y-2">
                      Avg: {data.dailyAverage}
                    </span>
                  </div>
                )}

                {data.outputTrend.map((entry, idx) => {
                  const heightPct = maxTrendPieces > 0 ? Math.max(6, Math.round((entry.pieces / maxTrendPieces) * 100)) : 6
                  const isHovered = hoveredBarIndex === idx
                  const barColor = entry.isToday ? 'bg-amber-400 hover:bg-amber-500' : 'bg-[#14C8B4] hover:bg-teal-500'

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-[#0B1220] text-white px-2 py-1 rounded text-[11px] font-mono shadow-lg whitespace-nowrap z-20 pointer-events-none">
                          {entry.dayName}: <strong className="text-[#14C8B4]">{entry.pieces.toLocaleString()} pcs</strong>
                        </div>
                      )}

                      {/* Bar Value above bar */}
                      <span className="text-[10px] font-mono font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.pieces}
                      </span>

                      {/* The Bar */}
                      <div
                        className={`w-full max-w-[42px] ${barColor} rounded-t-md transition-all duration-300`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Day Labels below bars */}
              <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-2">
                {data.outputTrend.map((entry, idx) => (
                  <div key={idx} className="flex-1 text-center text-[11px] font-semibold text-slate-600 truncate">
                    {entry.dayName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Production throughput</span>
            <span className="font-bold text-slate-700">7-Day Continuous Flow</span>
          </div>
        </div>

        {/* 3B: Quality Control Rate (SVG Donut Chart + Defect Breakdown) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Quality Control Rate
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  3-Stage QC inspection pass vs scrap
                </p>
              </div>
              <span className="text-xs font-bold text-[#0B1220] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                QC Standard
              </span>
            </div>

            {/* Donut and breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-4">
              
              {/* Reliable Pure SVG Donut Chart */}
              <div className="sm:col-span-5 flex items-center justify-center relative">
                <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                  {/* Background Circle (Rejected) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#F43F5E"
                    strokeWidth="16"
                  />
                  {/* Foreground Circle (Passed) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="16"
                    strokeDasharray={`${passStrokeDash} ${rejectStrokeDash}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#0B1220] font-mono leading-none">
                    {data.qc.passRatePct}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Pass
                  </span>
                </div>
              </div>

              {/* Defect Breakdown Bars */}
              <div className="sm:col-span-7 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Top Defects Recorded
                </div>
                {data.qc.topDefects.length === 0 ? (
                  <div className="text-xs text-slate-400 py-2">
                    No quality defects recorded for this tenant.
                  </div>
                ) : (
                  data.qc.topDefects.map((defect, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>{defect.name}</span>
                        <span className="font-bold text-slate-900 font-mono">{defect.count} pcs ({defect.pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, defect.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Passed: <strong className="text-emerald-600 font-mono">{data.qc.totalPassed.toLocaleString()}</strong> pcs</span>
            <span>Rejected: <strong className="text-rose-600 font-mono">{data.qc.totalRejected.toLocaleString()}</strong> pcs</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 5. SECTION 4: BUYER ORDERS & FABRIC STOCK                            */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4A: Buyer Order Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Buyer Orders Fulfillment
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Delivered vs target pieces by active buyer contract
              </p>
            </div>
            <Link
              href="/buyers-vendors"
              className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
            >
              <span>Manage POs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.buyerOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No active buyer contracts booked for this company yet.
              </div>
            ) : (
              data.buyerOrders.map((bo, idx) => {
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
                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {bo.poNumber}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase tracking-wider ${badgeBg}`}>
                        {bo.percent}% fulfilled
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${bo.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-0.5">
                      <span>Delivered: <strong className="font-mono text-slate-700">{bo.deliveredPieces.toLocaleString()}</strong> pcs</span>
                      <span>Target: <strong className="font-mono text-slate-700">{bo.targetPieces.toLocaleString()}</strong> pcs</span>
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
                Meters on hand by raw material classification
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
                          {fab.meters.toLocaleString()} m
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
      {/* 6. SECTION 5: ARTICLE DEEP-DIVE (STRICTLY ISOLATED TO TENANT)        */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#F0FDFA] text-[#0B1220] rounded-lg border border-black/10">
                <Shirt className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                Article Deep-Dive Journey
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Select any garment style to view its lifecycle progress across factory divisions
            </p>
          </div>

          {/* Article Dropdown Picker */}
          {data.articlesCatalog.length > 0 && (
            <div className="relative min-w-[280px]">
              <select
                aria-label="Select Garment Style"
                value={selectedArticleId}
                onChange={e => setSelectedArticleId(e.target.value)}
                className="w-full pl-3 pr-9 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              >
                {data.articlesCatalog.map(art => (
                  <option key={art.id} value={art.id}>
                    {art.artNo} — {art.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}
        </div>

        {data.articlesCatalog.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
            <Info className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <div className="font-bold text-slate-700">No garment articles found for this company.</div>
            <div>Create styles in All Designs or Production Orders to track live throughput.</div>
          </div>
        ) : selectedArticle ? (
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
                <div className="text-xs text-slate-300 mt-1 font-mono">
                  Contract Target: <strong className="text-white">{selectedArticle.buyerPoTarget.toLocaleString()} pieces</strong>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-300">Overall Progress</div>
                  <div className="text-xl font-extrabold text-[#14C8B4] font-mono">
                    {selectedArticle.overallProgressPct}%
                  </div>
                </div>
                <div className="w-24 h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#14C8B4] rounded-full"
                    style={{ width: `${selectedArticle.overallProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">1. Tech-Pack</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800">READY</div>
                <div className="text-[10px] text-slate-400 mt-0.5">CAD &amp; Specs</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">2. Buyer PO</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.buyerPoTarget.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target pieces</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">3. Raw Fabric</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.fabricMetersInStore.toLocaleString()} m</div>
                <div className="text-[10px] text-slate-400 mt-0.5">In Godown</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">4. Cutting</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.cutPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bundles cut</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center ring-1 ring-[#14C8B4]/40">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0e7490]">5. Stitching</div>
                <div className="mt-1 text-sm font-extrabold text-[#0B1220] font-mono">{selectedArticle.stitchedPieces.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-[#0e7490] mt-0.5">Sewing active</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">6. QC Passed</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.qcPassedPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Cleared</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">7. Godown</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.godownPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Finished stock</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">8. Dispatch</div>
                <div className="mt-1 text-sm font-extrabold text-slate-800 font-mono">{selectedArticle.dispatchedPieces.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Shipped</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ==================================================================== */}
      {/* 7. SECTION 6: DIVISION HEARTBEAT (REAL COUNTS ONLY — NO DUMMY DATA)  */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Division Heartbeat (12 Operational Departments)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Verified active department status and direct navigation
            </p>
          </div>
          <Link
            href="/modules"
            className="text-xs font-bold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline flex items-center gap-1"
          >
            <span>All 12 Modules</span>
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
