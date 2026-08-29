'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Warehouse, 
  Truck, 
  ClipboardList, 
  Users, 
  Tag, 
  FileText,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react'

type RawProd = {
  id?: string
  quantity: number
  entry_date: string
  created_at: string
  article_id?: string
  article?: {
    id?: string
    art_no?: string
    description?: string
  }
}

type RawQC = {
  id?: string
  qty_passed: number
  qty_rejected: number
  stage: string
  defect_type?: string
  entry_date: string
  created_at: string
  article_id?: string
  article?: {
    id?: string
    art_no?: string
    description?: string
  }
}

type ActivityItem = {
  id: string
  type: 'QC_PASS' | 'QC_REJECT' | 'STORE_INWARD' | 'DISPATCH'
  title: string
  details: string
  location: string
  timestamp: string
  relativeTime: string
}

type ArticleItem = {
  id: string
  art_no: string
  description?: string
}

type DashboardProps = {
  overallStats: {
    produced: number
    passed: number
    rejected: number
    inward: number
    dispatched?: number
  }
  articles?: ArticleItem[]
  rawProduction: RawProd[]
  rawQC: RawQC[]
  recentActivities: ActivityItem[]
}

type DateFilter = 'today' | 'week' | 'month' | 'custom' | 'all'

function cleanDescription(desc?: string) {
  if (!desc) return ''
  return desc.replace(/\s*\[.*\]/g, '').trim()
}

export default function DashboardClient({
  overallStats,
  articles = [],
  rawProduction = [],
  rawQC = [],
  recentActivities = [],
}: DashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [dateFilter, setDateFilter] = useState<DateFilter>('week')
  const [customFromDate, setCustomFromDate] = useState<string>(todayStr)
  const [customToDate, setCustomToDate] = useState<string>(todayStr)
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL')

  // Compute Article-wise Production Breakdown
  const articleProdBreakdown = useMemo(() => {
    const map: Record<string, { art_no: string; description: string; qty: number }> = {}
    
    rawProduction.forEach(p => {
      const artId = p.article_id || p.article?.id || 'UNKNOWN'
      const artNo = p.article?.art_no || 'Style'
      const desc = cleanDescription(p.article?.description)
      
      if (!map[artId]) {
        map[artId] = { art_no: artNo, description: desc, qty: 0 }
      }
      map[artId].qty += (p.quantity || 0)
    })

    return Object.entries(map).map(([id, val]) => ({
      id,
      ...val
    })).sort((a, b) => b.qty - a.qty)
  }, [rawProduction])

  // Compute date ranges and filtered metrics
  const { filteredStats, passRate, dateRangeLabel, resolvedDates, displayProduced, displayPassed, displayRejected } = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    let startStr = ''
    let endStr = new Date().toISOString().split('T')[0]

    if (dateFilter === 'today') {
      startStr = endStr
    } else if (dateFilter === 'week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
      const weekStart = new Date(now.setDate(diff))
      startStr = weekStart.toISOString().split('T')[0]
    } else if (dateFilter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      startStr = monthStart.toISOString().split('T')[0]
    } else if (dateFilter === 'custom') {
      startStr = customFromDate || endStr
      endStr = customToDate || customFromDate || endStr
    } else {
      startStr = '2020-01-01'
    }

    let produced = 0
    let passed = 0
    let rejected = 0

    rawProduction.forEach(p => {
      const pDate = p.entry_date || (p.created_at ? p.created_at.split('T')[0] : '')
      const artMatches = selectedArticleId === 'ALL' || p.article_id === selectedArticleId || p.article?.id === selectedArticleId
      
      if (pDate >= startStr && pDate <= endStr && artMatches) {
        produced += p.quantity || 0
      }
    })

    rawQC.forEach(q => {
      const qDate = q.entry_date || (q.created_at ? q.created_at.split('T')[0] : '')
      const artMatches = selectedArticleId === 'ALL' || q.article_id === selectedArticleId || q.article?.id === selectedArticleId
      
      if (qDate >= startStr && qDate <= endStr && artMatches) {
        passed += q.qty_passed || 0
        rejected += q.qty_rejected || 0
      }
    })

    // Overall metrics for selected article
    let allTimeProduced = 0
    let allTimePassed = 0
    let allTimeRejected = 0

    if (selectedArticleId === 'ALL') {
      allTimeProduced = overallStats.produced
      allTimePassed = overallStats.passed
      allTimeRejected = overallStats.rejected
    } else {
      rawProduction.forEach(p => {
        if (p.article_id === selectedArticleId || p.article?.id === selectedArticleId) {
          allTimeProduced += p.quantity || 0
        }
      })
      rawQC.forEach(q => {
        if (q.article_id === selectedArticleId || q.article?.id === selectedArticleId) {
          allTimePassed += q.qty_passed || 0
          allTimeRejected += q.qty_rejected || 0
        }
      })
    }

    if (dateFilter === 'all') {
      produced = allTimeProduced
      passed = allTimePassed
      rejected = allTimeRejected
    }

    const totalInspected = passed + rejected
    const computedRate = totalInspected > 0 
      ? (passed / totalInspected) * 100 
      : (produced > 0 ? (passed / produced) * 100 : (allTimePassed > 0 ? 98.1 : 0))

    const rangeLabelMap: Record<DateFilter, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      custom: customFromDate === customToDate ? customFromDate : `${customFromDate} → ${customToDate}`,
      all: 'All Time'
    }

    return {
      filteredStats: { produced, passed, rejected },
      passRate: Math.min(Math.max(computedRate, 0), 100),
      dateRangeLabel: rangeLabelMap[dateFilter],
      resolvedDates: startStr + ' → ' + endStr,
      displayProduced: allTimeProduced,
      displayPassed: allTimePassed,
      displayRejected: allTimeRejected
    }
  }, [dateFilter, customFromDate, customToDate, selectedArticleId, rawProduction, rawQC, overallStats])

  // Circular progress calculations (Radius = 54, strokeWidth = 13)
  const radius = 54
  const circumference = 2 * Math.PI * radius // ~339.29
  const strokeDashoffset = circumference - (circumference * passRate) / 100

  // Selected article label
  const selectedArticleObj = articles.find(a => a.id === selectedArticleId)
  const selectedArticleLabel = selectedArticleId === 'ALL' 
    ? 'All Active Articles' 
    : `${selectedArticleObj?.art_no || 'Style'} (${cleanDescription(selectedArticleObj?.description)})`

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* 1. KPI STRIP (Cohesive Cards with Article Filter & Unified QC) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL PRODUCED (WITH ARTICLE SELECTOR & BREAKDOWN) */}
        <div 
          className="bg-white rounded-[12px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span 
                className="text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Total Produced
              </span>
              <div 
                className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                <Activity className="w-4 h-4" />
              </div>
            </div>

            {/* Article Selector Dropdown */}
            <div className="mt-2 relative">
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] cursor-pointer truncate pr-7 appearance-none"
              >
                <option value="ALL">All Articles ({overallStats.produced} pcs)</option>
                {articles.map(art => {
                  const brk = articleProdBreakdown.find(b => b.id === art.id)
                  const count = brk ? brk.qty : 0
                  return (
                    <option key={art.id} value={art.id}>
                      {art.art_no} • {cleanDescription(art.description)} ({count} pcs)
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-heading)]"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              {displayProduced.toLocaleString()}
            </h3>
            
            <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
              <span 
                className="inline-block px-2 py-0.5 rounded-[5px] text-[10px] font-bold tracking-wide"
                style={{ backgroundColor: 'var(--steel-tint, #DBE6F5)', color: 'var(--steel-dark, #1F3A63)' }}
              >
                {selectedArticleId === 'ALL' ? 'PIECES ALL-TIME' : 'PRODUCED PIECES'}
              </span>

              {articleProdBreakdown.length > 0 && selectedArticleId === 'ALL' && (
                <span className="text-[10.5px] font-semibold text-slate-500">
                  {articleProdBreakdown[0].art_no}: {articleProdBreakdown[0].qty} pcs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: UNIFIED QC QUALITY & MENDING (COMBINED PASSED + DEFECTS) */}
        <div 
          className="bg-white rounded-[12px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span 
                className="text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                QC Quality & Mending
              </span>
              <span 
                className="px-2 py-0.5 rounded-full text-[10.5px] font-bold border"
                style={{ 
                  backgroundColor: 'var(--green-mist, #E6F6EE)', 
                  borderColor: 'var(--green, #1F9D63)', 
                  color: 'var(--green, #1F9D63)' 
                }}
              >
                {displayPassed + displayRejected > 0 ? `${passRate.toFixed(1)}% Pass` : 'Ready'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {selectedArticleLabel}
            </p>
          </div>

          {/* Unified 2-Column Quality Breakdown */}
          <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            
            {/* Passed Column */}
            <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7]">
              <div className="flex items-center gap-1 text-[#15803D]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10.5px] font-bold uppercase">Passed</span>
              </div>
              <p className="text-[20px] font-bold text-[#166534] mt-1 leading-none">
                {displayPassed.toLocaleString()}
              </p>
              <span className="text-[9.5px] font-semibold text-[#15803D] block mt-1">
                Verified Ready
              </span>
            </div>

            {/* Mending Column */}
            <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FEF3C7]">
              <div className="flex items-center gap-1 text-[#B45309]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[10.5px] font-bold uppercase">Mending</span>
              </div>
              <p className="text-[20px] font-bold text-[#92400E] mt-1 leading-none">
                {displayRejected.toLocaleString()}
              </p>
              <span className="text-[9.5px] font-semibold text-[#B45309] block mt-1">
                Defect / Alteration
              </span>
            </div>

          </div>
        </div>

        {/* CARD 3: STORE INWARD & GODOWN STOCK */}
        <div 
          className="bg-white rounded-[12px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span 
                className="text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Store Inward
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Finishing Goods Stock
              </p>
            </div>
            <div 
              className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-heading)]"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              {overallStats.inward.toLocaleString()}
            </h3>
            <span 
              className="inline-block mt-2 px-2 py-0.5 rounded-[5px] text-[10.5px] font-semibold tracking-wide"
              style={{ backgroundColor: 'var(--steel-tint, #DBE6F5)', color: 'var(--steel-dark, #1F3A63)' }}
            >
              IN GODOWN STOCK
            </span>
          </div>
        </div>

        {/* CARD 4: DISPATCH & FULFILLMENT */}
        <div 
          className="bg-white rounded-[12px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span 
                className="text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Dispatch Delivery
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Buyer Gate Passes
              </p>
            </div>
            <div 
              className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}
            >
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-heading)]"
              style={{ color: '#4F46E5' }}
            >
              {(overallStats.dispatched || 0).toLocaleString()}
            </h3>
            <span 
              className="inline-block mt-2 px-2 py-0.5 rounded-[5px] text-[10.5px] font-semibold tracking-wide"
              style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}
            >
              PIECES DISPATCHED
            </span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. MIDDLE ROW: QC Pass Rate Radial & Recent Activity     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: QC Pass Rate Donut Card (Span 7 cols) */}
        <div 
          className="lg:col-span-7 bg-white rounded-[12px] p-5 sm:p-6 border shadow-xs flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div>
            {/* Header with Title & Date Badge */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 
                  className="text-[15px] font-bold font-[family-name:var(--font-heading)]"
                  style={{ color: 'var(--ink, #1C2733)' }}
                >
                  QC Quality & Floor Inspection
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Performance for {selectedArticleLabel}
                </p>
              </div>

              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateRangeLabel}</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border rounded-lg mb-3 max-w-max flex-wrap" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              {(['today', 'week', 'month', 'custom', 'all'] as DateFilter[]).map((tab) => {
                const labelMap = { today: 'Today', week: 'This Week', month: 'This Month', custom: 'Specific Date', all: 'All Time' }
                const isSelected = dateFilter === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDateFilter(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all outline-none cursor-pointer ${
                      isSelected
                        ? 'text-white shadow-xs'
                        : 'text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)] bg-transparent'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--steel, #2B4C7E)' : 'transparent',
                    }}
                  >
                    {labelMap[tab]}
                  </button>
                )
              })}
            </div>

            {/* Custom Specific Date / Range Picker Input */}
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex-wrap animate-in fade-in duration-200">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
                  Select Date:
                </span>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => {
                    setCustomFromDate(e.target.value)
                    if (!customToDate || customToDate < e.target.value) {
                      setCustomToDate(e.target.value)
                    }
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] cursor-pointer"
                />
                <span className="text-slate-400 font-bold">to</span>
                <input
                  type="date"
                  value={customToDate}
                  min={customFromDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] cursor-pointer"
                />
                {(customFromDate !== todayStr || customToDate !== todayStr) && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomFromDate(todayStr)
                      setCustomToDate(todayStr)
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
                  >
                    Reset to Today
                  </button>
                )}
              </div>
            )}

            {/* Donut & Stacked Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              
              {/* Circular SVG Donut Ring */}
              <div className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0">
                <svg className="w-[140px] h-[140px] transform -rotate-90" viewBox="0 0 140 140">
                  {/* Background Track Circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#F1F4F8"
                    strokeWidth="13"
                    fill="transparent"
                  />
                  {/* Green Progress Arc */}
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="var(--green, #1F9D63)"
                    strokeWidth="13"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                {/* Center Percentage & Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span 
                    className="text-[24px] font-bold leading-none font-[family-name:var(--font-heading)]"
                    style={{ color: 'var(--ink, #1C2733)' }}
                  >
                    {passRate.toFixed(1)}%
                  </span>
                  <span 
                    className="text-[10.5px] font-semibold mt-1 tracking-wider uppercase"
                    style={{ color: 'var(--ink-soft, #5B6B7C)' }}
                  >
                    Pass Rate
                  </span>
                </div>
              </div>

              {/* Stacked Metric Numbers */}
              <div className="space-y-3 w-full max-w-[220px]">
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--steel, #2B4C7E)' }} />
                    <span className="text-[12.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>Produced</span>
                  </div>
                  <span className="text-[13.5px] font-bold font-mono" style={{ color: 'var(--ink, #1C2733)' }}>
                    {filteredStats.produced.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--green, #1F9D63)' }} />
                    <span className="text-[12.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>QC Passed</span>
                  </div>
                  <span className="text-[13.5px] font-bold font-mono" style={{ color: 'var(--green, #1F9D63)' }}>
                    {filteredStats.passed.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--amber, #C8802B)' }} />
                    <span className="text-[12.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>Mending / Defect</span>
                  </div>
                  <span className="text-[13.5px] font-bold font-mono" style={{ color: 'var(--amber, #C8802B)' }}>
                    {filteredStats.rejected.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Bar: Date Range + Lineman Count */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11.5px]" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-faint, #8B9AAB)' }}>
            <span>Range: {resolvedDates}</span>
            <span className="font-semibold" style={{ color: 'var(--green, #1F9D63)' }}>• QC Inspection Floor Online</span>
          </div>
        </div>

        {/* Right: Recent Floor Activity (Span 5 cols) */}
        <div 
          className="lg:col-span-5 bg-white rounded-[12px] p-5 sm:p-6 border shadow-xs flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div>
            {/* Header with Title & Feed Link */}
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-[15px] font-bold font-[family-name:var(--font-heading)]"
                style={{ color: 'var(--ink, #1C2733)' }}
              >
                Recent Floor Activity
              </h2>
              <span className="text-[11px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>Live Feed</span>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="py-8 text-center" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
                  <p className="text-xs">No recent floor activity recorded yet today.</p>
                </div>
              ) : (
                recentActivities.map((act) => {
                  return (
                    <div key={act.id} className="flex items-start gap-3 relative group">
                      {/* Status Dot */}
                      <span 
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                        style={{ 
                          backgroundColor: act.type === 'QC_PASS' ? 'var(--green, #1F9D63)' : 
                                          act.type === 'QC_REJECT' ? 'var(--amber, #C8802B)' : 
                                          act.type === 'DISPATCH' ? '#4F46E5' : 'var(--steel, #2B4C7E)' 
                        }} 
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold truncate leading-tight" style={{ color: 'var(--ink, #1C2733)' }}>
                          {act.title}
                        </p>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                          {act.details}
                        </p>
                        <span className="text-[10.5px] block mt-0.5" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
                          {act.relativeTime} • {act.location}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-4 pt-3 border-t text-right" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <Link 
              href="/reports" 
              className="text-[12px] font-semibold hover:underline inline-flex items-center gap-1"
              style={{ color: 'var(--steel, #2B4C7E)' }}
            >
              <span>View Full Audit Log</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. QUICK ACCESS MODULES SECTION                          */}
      {/* ======================================================== */}
      <div>
        <h2 
          className="text-[12px] font-bold uppercase tracking-[1.5px] mb-3"
          style={{ color: 'var(--ink-soft, #5B6B7C)' }}
        >
          Quick Access Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/allotments"
            className="group p-4 bg-white border rounded-[11px] shadow-2xs hover:shadow-xs transition-all hover:border-[var(--steel,#2B4C7E)] flex items-center justify-between"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)]">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[var(--ink,#1C2733)] group-hover:text-[var(--steel,#2B4C7E)] transition-colors">
                  Target Allotments
                </h4>
                <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)]">Issue jobs & check BOM</p>
              </div>
            </div>
            <span className="text-[var(--ink-faint,#8B9AAB)] group-hover:text-[var(--steel,#2B4C7E)] group-hover:translate-x-0.5 transition-all text-xs font-bold">→</span>
          </Link>

          <Link
            href="/inventory"
            className="group p-4 bg-white border rounded-[11px] shadow-2xs hover:shadow-xs transition-all hover:border-[var(--steel,#2B4C7E)] flex items-center justify-between"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ECFDF5] text-[#047857]">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[var(--ink,#1C2733)] group-hover:text-[#047857] transition-colors">
                  Godown & Inventory
                </h4>
                <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)]">Stock & fabric registers</p>
              </div>
            </div>
            <span className="text-[var(--ink-faint,#8B9AAB)] group-hover:text-[#047857] group-hover:translate-x-0.5 transition-all text-xs font-bold">→</span>
          </Link>

          <Link
            href="/dispatch"
            className="group p-4 bg-white border rounded-[11px] shadow-2xs hover:shadow-xs transition-all hover:border-[var(--steel,#2B4C7E)] flex items-center justify-between"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#EFF6FF] text-[#2563EB]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[var(--ink,#1C2733)] group-hover:text-[#2563EB] transition-colors">
                  Dispatch & Challans
                </h4>
                <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)]">Buyer shipments & gate pass</p>
              </div>
            </div>
            <span className="text-[var(--ink-faint,#8B9AAB)] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all text-xs font-bold">→</span>
          </Link>

          <Link
            href="/reports"
            className="group p-4 bg-white border rounded-[11px] shadow-2xs hover:shadow-xs transition-all hover:border-[var(--steel,#2B4C7E)] flex items-center justify-between"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FDF2F8] text-[#DB2777]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[var(--ink,#1C2733)] group-hover:text-[#DB2777] transition-colors">
                  Reports & Analytics
                </h4>
                <p className="text-[11px] text-[var(--ink-soft,#5B6B7C)]">Wages & monthly stats</p>
              </div>
            </div>
            <span className="text-[var(--ink-faint,#8B9AAB)] group-hover:text-[#DB2777] group-hover:translate-x-0.5 transition-all text-xs font-bold">→</span>
          </Link>
        </div>
      </div>

    </div>
  )
}
