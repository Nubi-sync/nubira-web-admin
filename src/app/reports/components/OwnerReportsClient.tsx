'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import {
  Download,
  Printer,
  Search,
  ArrowRight,
  FileSpreadsheet,
  Shirt,
  Info
} from 'lucide-react'
import { ReportsData, ArticleReportRow } from '../actions'

type DateFilterPreset = 'today' | '7days' | '30days' | 'all'

export function OwnerReportsClient({ initialData }: { initialData: ReportsData }) {
  const [data] = useState<ReportsData>(initialData)
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('30days')
  const [searchArticle, setSearchArticle] = useState('')
  const [sortField, setSortField] = useState<keyof ArticleReportRow>('targetPcs')
  const [sortAsc, setSortAsc] = useState(false)
  const [hoveredProdIdx, setHoveredProdIdx] = useState<number | null>(null)
  const [hoveredQcIdx, setHoveredQcIdx] = useState<number | null>(null)

  const maxProdPieces = Math.max(...data.productionTrend.map(d => d.pieces), 1)
  const maxQcTotal = Math.max(...data.qcTrend.map(d => (d.passed + d.rejected)), 1)

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
      {/* 1. TOP HEADER: CONSISTENT PLATFORM STYLE (NO OBSOLETE PILLS/BLINK)  */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <FileSpreadsheet className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Plant <span className="text-[#1D4ED8]">Reports &amp; Analytics</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {data.companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Production trends, quality inspections audit, and exportable ledger.
            </p>
          </div>
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
            <Download className="w-3.5 h-3.5 text-emerald-600" />
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

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B1220] hover:bg-slate-800 active:scale-95 rounded-xl shadow-xs transition-all"
          >
            <span>Live Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SECTION 1: REPORT SUMMARY CARDS (4 KPI CARDS — HEADING & NUMBER)  */}
      {/* (NO DESCRIPTION LINES, NO GREEN DOTS, NO LIVE BLINKS)               */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* KPI 1: Total Pieces Produced */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Total Sewing Output
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.kpis.totalProduced.toLocaleString()}
          </div>
        </div>

        {/* KPI 2: QC Pass Rate % */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            QC Pass Rate
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.kpis.qcPassRate}%
          </div>
        </div>

        {/* KPI 3: Net Warehouse Movement */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Net Godown Stock
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.kpis.netWarehouseStock.toLocaleString()}
          </div>
        </div>

        {/* KPI 4: Total Dispatched */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Dispatched to Buyers
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono mt-1">
            {data.kpis.totalDispatched.toLocaleString()}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 3. SECTION 2: CHARTS ROW (PRODUCTION AREA + QC STACKED BAR)          */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2A: Production Trend SVG Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Production Output Trend (14-Day Trajectory)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Daily stitched pieces • Avg: <strong className="text-slate-800 font-mono">{data.dailyAverage.toLocaleString()} pcs/day</strong>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14C8B4]">
                <span className="w-2.5 h-2.5 rounded bg-[#14C8B4]" />
                Daily Stitched
              </span>
            </div>

            {/* Visual SVG / HTML Bar Chart */}
            <div className="h-[220px] w-full pt-4 pb-2 flex flex-col justify-end">
              <div className="h-[180px] w-full flex items-end justify-between gap-1.5 sm:gap-2 px-1 relative border-b border-slate-200">
                {maxProdPieces > 0 && data.dailyAverage > 0 && (
                  <div
                    className="absolute left-0 right-0 border-b border-dashed border-slate-300 pointer-events-none z-10 flex items-center justify-end pr-2"
                    style={{ bottom: `${Math.min(95, (data.dailyAverage / maxProdPieces) * 100)}%` }}
                  >
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1 -translate-y-2">
                      Avg: {data.dailyAverage}
                    </span>
                  </div>
                )}

                {data.productionTrend.map((entry, idx) => {
                  const heightPct = maxProdPieces > 0 ? Math.max(6, Math.round((entry.pieces / maxProdPieces) * 100)) : 6
                  const isHovered = hoveredProdIdx === idx

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredProdIdx(idx)}
                      onMouseLeave={() => setHoveredProdIdx(null)}
                    >
                      {isHovered && (
                        <div className="absolute -top-10 bg-[#0B1220] text-white px-2 py-1 rounded text-[11px] font-mono shadow-lg whitespace-nowrap z-20 pointer-events-none">
                          {entry.label}: <strong className="text-[#14C8B4]">{entry.pieces.toLocaleString()} pcs</strong>
                        </div>
                      )}

                      <span className="text-[9px] font-mono font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.pieces}
                      </span>

                      <div
                        className="w-full max-w-[28px] bg-[#14C8B4] hover:bg-teal-500 rounded-t-sm transition-all duration-300"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Day Labels below bars */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-1 pt-2">
                {data.productionTrend.map((entry, idx) => (
                  <div key={idx} className="flex-1 text-center text-[10px] font-semibold text-slate-500 truncate">
                    {entry.label.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Throughput ledger</span>
            <span className="font-bold text-slate-700">Verified Factory Output</span>
          </div>
        </div>

        {/* 2B: QC Trend (Stacked Bar: Passed vs Rejected) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  QC Passed vs Rejected
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Daily audit count &amp; rejection breakdown
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

            {/* Visual SVG / HTML Stacked Bar Chart */}
            <div className="h-[220px] w-full pt-4 pb-2 flex flex-col justify-end">
              <div className="h-[180px] w-full flex items-end justify-between gap-2 px-2 relative border-b border-slate-200">
                {data.qcTrend.map((entry, idx) => {
                  const total = entry.passed + entry.rejected
                  const totalHeightPct = maxQcTotal > 0 ? Math.max(6, Math.round((total / maxQcTotal) * 100)) : 6
                  const passedPct = total > 0 ? (entry.passed / total) * 100 : 100
                  const isHovered = hoveredQcIdx === idx

                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredQcIdx(idx)}
                      onMouseLeave={() => setHoveredQcIdx(null)}
                    >
                      {isHovered && (
                        <div className="absolute -top-12 bg-[#0B1220] text-white p-2 rounded text-[11px] font-mono shadow-lg whitespace-nowrap z-20 pointer-events-none space-y-0.5">
                          <div className="font-semibold text-slate-300">{entry.label}</div>
                          <div className="text-emerald-400 font-bold">Passed: {entry.passed.toLocaleString()} pcs</div>
                          <div className="text-rose-400 font-bold">Rejected: {entry.rejected.toLocaleString()} pcs</div>
                        </div>
                      )}

                      <span className="text-[9px] font-mono font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {total}
                      </span>

                      {/* Stacked Bar Container */}
                      <div
                        className="w-full max-w-[32px] rounded-t-sm overflow-hidden flex flex-col-reverse transition-all duration-300"
                        style={{ height: `${totalHeightPct}%` }}
                      >
                        <div
                          className="bg-emerald-500 w-full"
                          style={{ height: `${passedPct}%` }}
                        />
                        {entry.rejected > 0 && (
                          <div
                            className="bg-rose-500 w-full"
                            style={{ height: `${100 - passedPct}%` }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Day Labels below bars */}
              <div className="flex items-center justify-between gap-2 px-2 pt-2">
                {data.qcTrend.map((entry, idx) => (
                  <div key={idx} className="flex-1 text-center text-[10px] font-semibold text-slate-500 truncate">
                    {entry.label.split(' ')[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Quality Audit</span>
            <span className="font-bold text-slate-700 font-mono">{data.kpis.qcPassRate}% Overall Pass</span>
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. SECTION 3: TOP TAILORS & TOP STYLES LEADERBOARDS                  */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3A: Top Tailors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Top Tailors Leaderboard
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ranked by verified stitched pieces output
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.topTailors.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No tailor production entries logged for this period.
              </div>
            ) : (
              data.topTailors.map(tailor => (
                <div key={tailor.rank} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] bg-slate-200 text-slate-700">
                        {tailor.rank}
                      </span>
                      <span className="font-bold text-slate-900">{tailor.name}</span>
                    </div>
                    <span className="font-extrabold text-[#0B1220] font-mono">
                      {tailor.pieces.toLocaleString()} pcs
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${tailor.pctOfMax}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3B: Top Styles by Volume */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Top Garment Styles by Volume
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Highest throughput production designs
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {data.topStyles.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No style production records found for this period.
              </div>
            ) : (
              data.topStyles.map(style => (
                <div key={style.rank} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {style.artNo}
                      </span>
                      <span className="font-medium text-slate-700 truncate">{style.description}</span>
                    </div>
                    <span className="font-extrabold text-[#0B1220] font-mono shrink-0 ml-2">
                      {style.pieces.toLocaleString()} pcs
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#14C8B4] rounded-full transition-all duration-500"
                      style={{ width: `${style.pctOfMax}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 5. SECTION 8: ARTICLE-LEVEL REPORT DATA GRID (SEARCHABLE & SORTABLE) */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/10">
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
                <th className="py-3 px-3.5 text-right">Cut</th>
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
                    No matching garment styles found for this company.
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
                    <td className="py-3 px-3.5 text-right font-extrabold text-[#0B1220] font-mono whitespace-nowrap">
                      {row.targetPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                      {row.cutPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                      {row.stitchedPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-emerald-600 font-mono whitespace-nowrap">
                      {row.qcPassedPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono">
                      {row.qcFailedPcs > 0 ? (
                        <span className="px-1.5 py-0.5 rounded font-bold text-[11px] bg-rose-50 text-rose-700">
                          {row.qcFailedPcs} ({row.qcRejectRatePct}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-amber-700 font-mono">
                      {row.godownPcs.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap font-bold text-purple-700 font-mono">
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
                        <span className="font-extrabold text-[#0B1220] font-mono text-[11px] w-8 text-right">
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
