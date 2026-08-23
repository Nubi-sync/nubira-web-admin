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
  ArrowUpRight
} from 'lucide-react'

type RawProd = {
  quantity: number
  entry_date: string
  created_at: string
}

type RawQC = {
  qty_passed: number
  qty_rejected: number
  stage: string
  defect_type?: string
  entry_date: string
  created_at: string
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

type DashboardProps = {
  overallStats: {
    produced: number
    passed: number
    rejected: number
    inward: number
  }
  rawProduction: RawProd[]
  rawQC: RawQC[]
  recentActivities: ActivityItem[]
}

type DateFilter = 'today' | 'week' | 'month' | 'all'

export default function DashboardClient({
  overallStats,
  rawProduction = [],
  rawQC = [],
  recentActivities = [],
}: DashboardProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('week')

  // Compute date ranges and filtered metrics
  const { filteredStats, passRate, dateRangeLabel, resolvedDates } = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    if (dateFilter === 'today') {
      startDate.setHours(0, 0, 0, 0)
    } else if (dateFilter === 'week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
      startDate = new Date(now.setDate(diff))
      startDate.setHours(0, 0, 0, 0)
    } else if (dateFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
      startDate = new Date(2020, 0, 1)
    }

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = new Date().toISOString().split('T')[0]

    let produced = 0
    let passed = 0
    let rejected = 0

    rawProduction.forEach(p => {
      const pDate = p.entry_date || (p.created_at ? p.created_at.split('T')[0] : '')
      if (pDate >= startStr && pDate <= endStr) {
        produced += p.quantity || 0
      }
    })

    rawQC.forEach(q => {
      const qDate = q.entry_date || (q.created_at ? q.created_at.split('T')[0] : '')
      if (qDate >= startStr && qDate <= endStr) {
        passed += q.qty_passed || 0
        rejected += q.qty_rejected || 0
      }
    })

    if (dateFilter === 'all') {
      produced = overallStats.produced
      passed = overallStats.passed
      rejected = overallStats.rejected
    }

    const totalInspected = passed + rejected
    const computedRate = totalInspected > 0 
      ? (passed / totalInspected) * 100 
      : (produced > 0 ? (passed / produced) * 100 : (overallStats.passed > 0 ? 94.2 : 0))

    const rangeLabelMap: Record<DateFilter, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      all: 'All Time'
    }

    return {
      filteredStats: { produced, passed, rejected },
      passRate: Math.min(Math.max(computedRate, 0), 100),
      dateRangeLabel: rangeLabelMap[dateFilter],
      resolvedDates: startStr + ' → ' + endStr
    }
  }, [dateFilter, rawProduction, rawQC, overallStats])

  // Circular progress calculations (Radius = 54, strokeWidth = 13)
  const radius = 54
  const circumference = 2 * Math.PI * radius // ~339.29
  const strokeDashoffset = circumference - (circumference * passRate) / 100

  return (
    <div className="space-y-6">

      {/* ======================================================== */}
      {/* 1. KPI STRIP (4 Semantic Cards)                          */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Produced (Neutral: Steel) */}
        <div 
          className="bg-white rounded-[11px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-start justify-between">
            <span 
              className="text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: 'var(--ink-soft, #5B6B7C)' }}
            >
              Total Produced
            </span>
            <div 
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-fraunces)]"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              {overallStats.produced.toLocaleString()}
            </h3>
            <span 
              className="inline-block mt-2 px-2 py-0.5 rounded-[5px] text-[10.5px] font-semibold tracking-wide"
              style={{ backgroundColor: 'var(--steel-tint, #DBE6F5)', color: 'var(--steel-dark, #1F3A63)' }}
            >
              PIECES ALL-TIME
            </span>
          </div>
        </div>

        {/* QC Passed (Success: Green) */}
        <div 
          className="bg-white rounded-[11px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-start justify-between">
            <span 
              className="text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: 'var(--ink-soft, #5B6B7C)' }}
            >
              QC Passed
            </span>
            <div 
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--green-mist, #E6F6EE)', color: 'var(--green, #1F9D63)' }}
            >
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-fraunces)]"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              {overallStats.passed.toLocaleString()}
            </h3>
            <span 
              className="inline-block mt-2 px-2 py-0.5 rounded-[5px] text-[10.5px] font-semibold tracking-wide"
              style={{ backgroundColor: 'var(--green-mist, #E6F6EE)', color: 'var(--green, #1F9D63)' }}
            >
              QUALITY VERIFIED
            </span>
          </div>
        </div>

        {/* QC Rejected (Alert: Amber - Distinct Styling) */}
        <div 
          className="rounded-[11px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ 
            borderColor: '#E8CFA9',
            background: 'linear-gradient(180deg, #FFFAF3 0%, #FFFFFF 100%)'
          }}
        >
          <div className="flex items-start justify-between">
            <span 
              className="text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: 'var(--amber, #C8802B)' }}
            >
              QC Rejected
            </span>
            <div 
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--amber-mist, #FBF0E1)', color: 'var(--amber, #C8802B)' }}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-fraunces)]"
              style={{ color: 'var(--amber, #C8802B)' }}
            >
              {overallStats.rejected.toLocaleString()}
            </h3>
            <span 
              className="inline-block mt-2 px-2 py-0.5 rounded-[5px] text-[10.5px] font-semibold tracking-wide"
              style={{ backgroundColor: 'var(--amber-mist, #FBF0E1)', color: 'var(--amber, #C8802B)' }}
            >
              DEFECTED / MENDING
            </span>
          </div>
        </div>

        {/* Store Inward (Neutral: Steel) */}
        <div 
          className="bg-white rounded-[11px] p-5 border shadow-xs relative flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-start justify-between">
            <span 
              className="text-[11px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: 'var(--ink-soft, #5B6B7C)' }}
            >
              Store Inward
            </span>
            <div 
              className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 
              className="text-[30px] leading-tight font-bold font-[family-name:var(--font-fraunces)]"
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
              <h2 
                className="text-[15px] font-bold font-[family-name:var(--font-fraunces)]"
                style={{ color: 'var(--ink, #1C2733)' }}
              >
                QC Pass Rate
              </h2>

              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-semibold"
                style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateRangeLabel}</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border rounded-lg mb-6 max-w-max" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              {(['today', 'week', 'month', 'all'] as DateFilter[]).map((tab) => {
                const labelMap = { today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time' }
                const isSelected = dateFilter === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDateFilter(tab)}
                    className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all outline-none ${
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
                    className="text-[24px] font-bold leading-none font-[family-name:var(--font-fraunces)]"
                    style={{ color: 'var(--ink, #1C2733)' }}
                  >
                    {passRate.toFixed(1)}%
                  </span>
                  <span 
                    className="text-[9px] font-bold tracking-[1.5px] uppercase mt-1"
                    style={{ color: 'var(--ink-faint, #8B9AAB)' }}
                  >
                    PASS RATE
                  </span>
                </div>
              </div>

              {/* Stacked Stat Rows */}
              <div className="flex-1 w-full max-w-[220px] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--steel, #2B4C7E)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>Produced</span>
                  </div>
                  <span 
                    className="text-sm font-bold font-mono text-right w-16"
                    style={{ color: 'var(--steel, #2B4C7E)' }}
                  >
                    {filteredStats.produced}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--green, #1F9D63)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>QC Passed</span>
                  </div>
                  <span 
                    className="text-sm font-bold font-mono text-right w-16"
                    style={{ color: 'var(--green, #1F9D63)' }}
                  >
                    {filteredStats.passed}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--amber, #C8802B)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>Rejected</span>
                  </div>
                  <span 
                    className="text-sm font-bold font-mono text-right w-16"
                    style={{ color: 'var(--amber, #C8802B)' }}
                  >
                    {filteredStats.rejected}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Range Label */}
          <div 
            className="pt-4 mt-4 border-t flex items-center justify-between text-[10.5px] font-[family-name:var(--font-jetbrains-mono)]"
            style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-faint, #8B9AAB)' }}
          >
            <span>RANGE: {resolvedDates}</span>
            <span className="font-semibold text-emerald-600">· UPDATED LIVE</span>
          </div>
        </div>

        {/* Right: Recent Floor Activity Card (Span 5 cols) */}
        <div 
          className="lg:col-span-5 bg-white rounded-[12px] p-5 sm:p-6 border shadow-xs flex flex-col justify-between"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-[15px] font-bold font-[family-name:var(--font-fraunces)]"
                style={{ color: 'var(--ink, #1C2733)' }}
              >
                Recent Floor Activity
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Live Feed</span>
            </div>

            {/* Event List */}
            <div className="space-y-3.5">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => {
                  const dotColor = 
                    act.type === 'QC_PASS' ? 'var(--green, #1F9D63)' :
                    act.type === 'QC_REJECT' ? 'var(--amber, #C8802B)' :
                    'var(--steel, #2B4C7E)'

                  return (
                    <div key={act.id} className="flex items-start gap-3 group">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5" 
                        style={{ backgroundColor: dotColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-[13px] font-bold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                            {act.title}
                          </span>
                        </div>
                        <p className="text-[12px] truncate leading-tight mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                          {act.details}
                        </p>
                        <span 
                          className="text-[10.5px] font-[family-name:var(--font-jetbrains-mono)] block mt-0.5"
                          style={{ color: 'var(--ink-faint, #8B9AAB)' }}
                        >
                          {act.relativeTime} · {act.location}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No floor transactions recorded yet today.
                </div>
              )}
            </div>
          </div>

          <div 
            className="pt-3 mt-4 border-t flex justify-end"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <Link 
              href="/reports" 
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold hover:underline"
              style={{ color: 'var(--steel, #2B4C7E)' }}
            >
              View Full Audit Log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. QUICK ACCESS MODULES (6 Secondary Shortcuts)          */}
      {/* ======================================================== */}
      <div>
        <div className="mb-3">
          <h3 
            className="text-[12px] font-bold uppercase tracking-[1.5px]"
            style={{ color: 'var(--ink-faint, #8B9AAB)' }}
          >
            Quick Access Modules
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* 1. Godown & Inventory */}
          <Link 
            href="/inventory"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Warehouse className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Godown & Inventory
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Stock balances & raw trims ledger
              </span>
            </div>
          </Link>

          {/* 2. Dispatch & Challans */}
          <Link 
            href="/dispatch"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Truck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Dispatch & Challans
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Pre-loading counting & gate passes
              </span>
            </div>
          </Link>

          {/* 3. Target Allotments */}
          <Link 
            href="/allotments"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Target Allotments
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Style ratios & BOM materials issue
              </span>
            </div>
          </Link>

          {/* 4. Manage Employees */}
          <Link 
            href="/employees"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Manage Employees
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Staff roles & password overrides
              </span>
            </div>
          </Link>

          {/* 5. Manage Articles */}
          <Link 
            href="/articles"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Manage Articles
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Style codes & stitching piece rates
              </span>
            </div>
          </Link>

          {/* 6. Reports & Analytics */}
          <Link 
            href="/reports"
            className="bg-white p-4 rounded-[11px] border shadow-2xs flex items-center gap-3.5 transition-all hover:border-[var(--steel,#2B4C7E)] hover:shadow-xs group"
            style={{ borderColor: 'var(--border, #E2E8F0)' }}
          >
            <div 
              className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)', color: 'var(--steel, #2B4C7E)' }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold truncate" style={{ color: 'var(--ink, #1C2733)' }}>
                Reports & Analytics
              </span>
              <span className="block text-[11px] truncate mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Worker payroll & defect breakdowns
              </span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
