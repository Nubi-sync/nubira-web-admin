'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Warehouse, 
  Activity, 
  AlertTriangle, 
  PackageCheck, 
  RotateCcw, 
  Truck, 
  ChevronRight, 
  X, 
  Layers, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Boxes, 
  Scissors, 
  FileCheck2, 
  ArrowRight, 
  Sparkles,
  Users,
  ChevronDown,
  TrendingUp,
  Clock,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react'

type RawProd = {
  id?: string
  quantity: number
  entry_date: string
  created_at: string
  article_id?: string
  lineman_id?: string
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

type RawStore = {
  id?: string
  type: string
  quantity: number
  color?: string
  size?: string
  party_name?: string
  challan_no?: string
  entry_date: string
  created_at: string
  article?: {
    art_no?: string
    description?: string
  }
}

type RawDispatch = {
  id?: string
  challan_no: string
  buyer_name?: string
  total_pieces: number
  created_at: string
  status?: string
}

type AllotmentItem = {
  id: string
  challan_id?: string
  lineman_id?: string
  article_id?: string
  target_qty: number
  status?: string
  allotment_date?: string
  created_at: string
  profiles?: { id?: string; username?: string } | { id?: string; username?: string }[]
  articles?: { id?: string; art_no?: string; description?: string; size_rates?: any; stitching_rate?: number } | any
  challans?: { id?: string; challan_no?: string; brand?: string; fabric_type?: string } | any
}

type ActivityItem = {
  id: string
  type: 'QC_PASS' | 'QC_REJECT' | 'STORE_INWARD' | 'DISPATCH' | 'ALLOTMENT'
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
  stitching_rate?: number
  size_rates?: any
}

type ChallanItem = {
  id: string
  challan_no: string
  brand?: string
  fabric_type?: string
  created_at: string
}

type DashboardProps = {
  articles: ArticleItem[]
  allotments: AllotmentItem[]
  variants?: any[]
  materials?: any[]
  challans?: ChallanItem[]
  rawProduction: RawProd[]
  rawQC: RawQC[]
  rawStore: RawStore[]
  rawDispatch: RawDispatch[]
  recentActivities: ActivityItem[]
}

type DateFilter = 'today' | 'week' | 'month' | 'custom' | 'all'
type StageType = 'TOTAL_STOCKS' | 'GOODS_IN_LINE' | 'MENDING_CHECKING' | 'READY_GOODS' | 'RTO' | 'READY_DELIVERY'

function cleanDescription(desc?: string) {
  if (!desc) return ''
  return desc.replace(/\s*\[.*\]/g, '').trim()
}

export default function DashboardClient({
  articles = [],
  allotments = [],
  variants = [],
  materials = [],
  challans = [],
  rawProduction = [],
  rawQC = [],
  rawStore = [],
  rawDispatch = [],
  recentActivities = [],
}: DashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customFromDate, setCustomFromDate] = useState<string>(todayStr)
  const [customToDate, setCustomToDate] = useState<string>(todayStr)
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL')

  // Selected Stage Drawer State
  const [activeDrilldownStage, setActiveDrilldownStage] = useState<StageType | null>(null)

  // 1. Extract Unique Brands for Quick Filter Tabs
  const brandTabs = useMemo(() => {
    const brandsSet = new Set<string>()
    challans.forEach(c => {
      if (c.brand && c.brand.trim()) brandsSet.add(c.brand.trim().toUpperCase())
    })
    allotments.forEach(al => {
      const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
      if (ch?.brand && ch.brand.trim()) brandsSet.add(ch.brand.trim().toUpperCase())
    })
    return ['ALL', ...Array.from(brandsSet)]
  }, [challans, allotments])

  // 2. Filter allotments, production, QC, store, and dispatch based on Brand, Article & Date
  const filteredData = useMemo(() => {
    const now = new Date()
    let startStr = ''
    let endStr = new Date().toISOString().split('T')[0]

    if (dateFilter === 'today') {
      startStr = endStr
    } else if (dateFilter === 'week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
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

    const isDateMatch = (dateVal?: string) => {
      if (!dateVal || dateFilter === 'all') return true
      const d = dateVal.split('T')[0]
      return d >= startStr && d <= endStr
    }

    // Filter Allotments
    const matchedAllotments = allotments.filter(al => {
      const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
      const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
      const artId = al.article_id || art?.id

      if (selectedArticleId !== 'ALL' && artId !== selectedArticleId) return false
      if (selectedBrand !== 'ALL') {
        const brandUpper = (ch?.brand || '').trim().toUpperCase()
        if (selectedBrand === 'DIRECT' && al.challan_id) return false
        if (selectedBrand !== 'DIRECT' && brandUpper !== selectedBrand) return false
      }
      return isDateMatch(al.allotment_date || al.created_at)
    })

    // Filter Production Logs
    const matchedProd = rawProduction.filter(p => {
      if (selectedArticleId !== 'ALL' && (p.article_id || p.article?.id) !== selectedArticleId) return false
      return isDateMatch(p.entry_date || p.created_at)
    })

    // Filter QC Logs
    const matchedQC = rawQC.filter(q => {
      if (selectedArticleId !== 'ALL' && (q.article_id || q.article?.id) !== selectedArticleId) return false
      return isDateMatch(q.entry_date || q.created_at)
    })

    // Filter Store Logs
    const matchedStore = rawStore.filter(s => {
      return isDateMatch(s.entry_date || s.created_at)
    })

    // Filter Dispatch
    const matchedDispatch = rawDispatch.filter(d => {
      return isDateMatch(d.created_at)
    })

    return {
      allotments: matchedAllotments,
      production: matchedProd,
      qc: matchedQC,
      store: matchedStore,
      dispatch: matchedDispatch
    }
  }, [allotments, rawProduction, rawQC, rawStore, rawDispatch, dateFilter, customFromDate, customToDate, selectedBrand, selectedArticleId])

  // 3. Compute the 6 Core Factory Lifecycle Numbers
  const metrics = useMemo(() => {
    // 1. Total Stocks (Total Target Pieces in Pipeline)
    const totalStocks = filteredData.allotments.reduce((sum, al) => sum + (al.target_qty || 0), 0)

    // 2. Production / Sewing Counts
    const totalProduced = filteredData.production.reduce((sum, p) => sum + (p.quantity || 0), 0)

    // 3. QC Counts
    let totalQCPassed = 0
    let totalQCRejected = 0
    filteredData.qc.forEach(q => {
      if (q.stage === 'CHECKING' || q.stage === 'BULKING' || !q.stage) {
        totalQCPassed += (q.qty_passed || 0)
        totalQCRejected += (q.qty_rejected || 0)
      }
    })

    // 4. Store Inward & RTO
    let storeInward = 0
    let storeRTO = 0
    filteredData.store.forEach(s => {
      if (s.type === 'INWARD') storeInward += (s.quantity || 0)
      if (s.type === 'RTO' || s.type === 'REJECT' || s.type === 'RETURN') storeRTO += (s.quantity || 0)
    })

    // 5. Dispatch Delivery
    const totalDispatched = filteredData.dispatch.reduce((sum, d) => sum + (d.total_pieces || 0), 0)

    // 6-Stage Specific Allocations
    // Stage 1: Total Stocks (Pipeline Commitment)
    const stage1_totalStocks = Math.max(totalStocks, totalProduced + totalDispatched)

    // Stage 2: Goods In Line (Active Sewing WIP on Karigar Floor)
    const stage2_goodsInLine = Math.max(0, stage1_totalStocks - totalQCPassed - totalDispatched - totalQCRejected)

    // Stage 3: Goods in Mending & Checking (Finishing QC Table + Defect Alteration)
    const stage3_mendingChecking = totalQCRejected + Math.max(0, totalProduced - totalQCPassed - totalDispatched)

    // Stage 4: Ready Goods (100% Passed & Packed in Godown Inventory)
    const stage4_readyGoods = Math.max(0, totalQCPassed - totalDispatched) + storeInward

    // Stage 5: RTO & Rejections (Return to Origin / Supplier Rejects)
    const stage5_rto = storeRTO

    // Stage 6: Ready for Delivery (Staged at Gate / Dispatched)
    const stage6_readyDelivery = totalDispatched

    // Smart Alteration Rate for Mending & Checking
    const totalChecked = totalQCPassed + totalQCRejected
    const alterationRate = totalChecked > 0 ? ((totalQCRejected / totalChecked) * 100) : 0

    return {
      totalStocks: stage1_totalStocks,
      goodsInLine: stage2_goodsInLine,
      mendingChecking: stage3_mendingChecking,
      mendingAlterationQty: totalQCRejected,
      alterationRate,
      readyGoods: stage4_readyGoods,
      rto: stage5_rto,
      readyDelivery: stage6_readyDelivery,
      totalProduced,
      totalQCPassed,
      totalDispatched
    }
  }, [filteredData])

  // Pipeline Stepper Percentages (Conversion from Total Target)
  const pipelineFlow = useMemo(() => {
    const base = metrics.totalStocks > 0 ? metrics.totalStocks : 1
    return {
      inLinePct: Math.min(100, Math.round((metrics.goodsInLine / base) * 100)),
      mendingPct: Math.min(100, Math.round((metrics.mendingChecking / base) * 100)),
      readyPct: Math.min(100, Math.round((metrics.readyGoods / base) * 100)),
      deliveryPct: Math.min(100, Math.round((metrics.readyDelivery / base) * 100)),
    }
  }, [metrics])

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. FILTER CONTROLS & BRAND TABS                           */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Brand Selector Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Brand:
          </span>
          {brandTabs.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBrand === brand
                  ? 'bg-[var(--steel,#2B4C7E)] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {brand === 'ALL' ? 'All Orders' : brand === 'DIRECT' ? 'Direct Floor Lots' : brand}
            </button>
          ))}
        </div>

        {/* Article Dropdown & Date Range Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Article Filter Dropdown */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              aria-label="Filter by Article Style"
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] cursor-pointer pr-8 appearance-none"
            >
              <option value="ALL">All Article Styles ({articles.length} styles)</option>
              {articles.map(art => (
                <option key={art.id} value={art.id}>
                  {art.art_no} {cleanDescription(art.description) ? `• ${cleanDescription(art.description)}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id as DateFilter)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-white text-[var(--steel,#2B4C7E)] shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 6-STAGE FACTORY FLOOR LIFECYCLE KPI CARDS               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* STAGE 1: TOTAL STOCKS */}
        <div 
          onClick={() => setActiveDrilldownStage('TOTAL_STOCKS')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                1. Total Stocks
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF3FA] text-[#2B4C7E] flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Order Pipeline Target</p>
          </div>

          <div className="mt-3">
            <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#1C2733] leading-none">
              {metrics.totalStocks.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#EEF3FA] text-[#2B4C7E] tracking-wider">
                Total Pieces
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#2B4C7E] transition-colors" />
            </div>
          </div>
        </div>

        {/* STAGE 2: GOODS IN LINE (SEWING WIP) */}
        <div 
          onClick={() => setActiveDrilldownStage('GOODS_IN_LINE')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                2. Goods in Line
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Sewing Machines WIP</p>
          </div>

          <div className="mt-3">
            <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#4F46E5] leading-none">
              {metrics.goodsInLine.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] tracking-wider">
                On Floor
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4F46E5] transition-colors" />
            </div>
          </div>
        </div>

        {/* STAGE 3: MENDING & CHECKING (WITH SMART ALTERATION ALERT) */}
        <div 
          onClick={() => setActiveDrilldownStage('MENDING_CHECKING')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                3. Mending & Checking
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">QC Inspection & Repairs</p>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#B45309] leading-none">
                {metrics.mendingChecking.toLocaleString()}
              </h3>
              {metrics.alterationRate > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {metrics.alterationRate.toFixed(1)}% Alter
                </span>
              )}
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FFFBEB] text-[#92400E] tracking-wider">
                {metrics.mendingAlterationQty > 0 ? `${metrics.mendingAlterationQty} Defect/Alter` : 'Finishing Table'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#D97706] transition-colors" />
            </div>
          </div>
        </div>

        {/* STAGE 4: READY GOODS (FINISHED STOCK) */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_GOODS')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                4. Ready Goods
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">QC Passed & Packed</p>
          </div>

          <div className="mt-3">
            <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#059669] leading-none">
              {metrics.readyGoods.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] tracking-wider">
                In Godown
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#059669] transition-colors" />
            </div>
          </div>
        </div>

        {/* STAGE 5: RTO (RETURN TO ORIGIN / REJECTIONS) */}
        <div 
          onClick={() => setActiveDrilldownStage('RTO')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                5. RTO & Rejection
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Return to Origin</p>
          </div>

          <div className="mt-3">
            <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#DC2626] leading-none">
              {metrics.rto.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#FEF2F2] text-[#991B1B] tracking-wider">
                Defect / Reject
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#DC2626] transition-colors" />
            </div>
          </div>
        </div>

        {/* STAGE 6: READY FOR DELIVERY / DISPATCH */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_DELIVERY')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between group relative"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                6. Ready for Delivery
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Gate Pass & Dispatched</p>
          </div>

          <div className="mt-3">
            <h3 className="text-[26px] font-bold font-[family-name:var(--font-heading)] text-[#7C3AED] leading-none">
              {metrics.readyDelivery.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#F5F3FF] text-[#5B21B6] tracking-wider">
                Dispatched Pcs
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#7C3AED] transition-colors" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. LIVE VISUAL FLOW PIPELINE STEPPER BAR                   */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2B4C7E]" />
            <h3 className="text-sm font-bold text-slate-800">
              Live Factory Conversion Flow (Order to Gate)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Target: <strong className="text-slate-900">{metrics.totalStocks.toLocaleString()} pcs</strong>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Flow 1: Sewing Machine Floor */}
          <div className="p-3 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#4338CA] tracking-wider block">
                1. Sewing In-Line
              </span>
              <p className="text-lg font-bold text-[#3730A3] mt-0.5">
                {metrics.goodsInLine.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#4F46E5] bg-white px-2 py-1 rounded shadow-2xs">
              {pipelineFlow.inLinePct}%
            </span>
          </div>

          {/* Flow 2: Mending & Inspection Table */}
          <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#92400E] tracking-wider block">
                2. Mending & Checking
              </span>
              <p className="text-lg font-bold text-[#78350F] mt-0.5">
                {metrics.mendingChecking.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#D97706] bg-white px-2 py-1 rounded shadow-2xs">
              {pipelineFlow.mendingPct}%
            </span>
          </div>

          {/* Flow 3: Finished Godown Inventory */}
          <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#065F46] tracking-wider block">
                3. Ready in Godown
              </span>
              <p className="text-lg font-bold text-[#064E3B] mt-0.5">
                {metrics.readyGoods.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#059669] bg-white px-2 py-1 rounded shadow-2xs">
              {pipelineFlow.readyPct}%
            </span>
          </div>

          {/* Flow 4: Gate Pass & Dispatched */}
          <div className="p-3 rounded-lg bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#5B21B6] tracking-wider block">
                4. Dispatched Out
              </span>
              <p className="text-lg font-bold text-[#4C1D95] mt-0.5">
                {metrics.readyDelivery.toLocaleString()} <span className="text-xs font-medium text-slate-500">pcs</span>
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#7C3AED] bg-white px-2 py-1 rounded shadow-2xs">
              {pipelineFlow.deliveryPct}%
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ACTIVE PRODUCTION LOTS & RECENT ACTIVITY FEED           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Floor Allotments Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Active Production Orders & Floor Allotments
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live status of multi-article challans and assigned linemen
              </p>
            </div>
            <Link 
              href="/production-orders"
              className="text-xs font-bold text-[var(--steel,#2B4C7E)] hover:underline inline-flex items-center gap-1"
            >
              View All Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                  <th className="py-2.5 px-3">Article Style</th>
                  <th className="py-2.5 px-3">Challan / Order</th>
                  <th className="py-2.5 px-3">Lineman</th>
                  <th className="py-2.5 px-3 text-right">Target Pcs</th>
                  <th className="py-2.5 px-3 text-center">Floor Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.allotments.slice(0, 8).map(al => {
                  const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                  const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                  const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles

                  return (
                    <tr key={al.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {art?.art_no || 'Style'}
                        {art?.description && (
                          <span className="block text-[10.5px] font-normal text-slate-400 truncate max-w-[180px]">
                            {cleanDescription(art.description)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-700">
                          {ch?.challan_no ? `JOB-${ch.challan_no}` : 'Direct Floor'}
                        </span>
                        {ch?.brand && (
                          <span className="block text-[10px] font-bold text-indigo-600">
                            {ch.brand}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {lm?.username || 'Unassigned'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                        {al.target_qty?.toLocaleString()} pcs
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {al.status || 'IN PROGRESS'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {filteredData.allotments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      No active allotments found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Recent Activity Feed (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">
                Floor Activity Stream
              </h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    act.type === 'QC_PASS' ? 'bg-emerald-100 text-emerald-700' :
                    act.type === 'QC_REJECT' ? 'bg-rose-100 text-rose-700' :
                    act.type === 'STORE_INWARD' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {act.type === 'QC_PASS' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {act.type === 'QC_REJECT' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {act.type === 'STORE_INWARD' && <Boxes className="w-3.5 h-3.5" />}
                    {act.type === 'DISPATCH' && <Truck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {act.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {act.relativeTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {act.details}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No recent activities recorded.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link 
              href="/reports"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 rounded-lg border border-slate-200"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Full Factory Audit Reports
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. 1-CLICK DEEP DRILLDOWN SLIDE-OVER DRAWER               */}
      {/* ========================================================= */}
      {activeDrilldownStage && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 border-l border-slate-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--steel-tint,#DBE6F5)] text-[var(--steel-dark,#1F3A63)] tracking-wider">
                    Stage Detail
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    {activeDrilldownStage === 'TOTAL_STOCKS' && 'Total Stocks (Order Pipeline)'}
                    {activeDrilldownStage === 'GOODS_IN_LINE' && 'Goods in Line (Sewing WIP Breakdown)'}
                    {activeDrilldownStage === 'MENDING_CHECKING' && 'Mending & Checking (QC Inspection Lots)'}
                    {activeDrilldownStage === 'READY_GOODS' && 'Ready Goods (Finished Godown Stock)'}
                    {activeDrilldownStage === 'RTO' && 'RTO & Supplier Rejections'}
                    {activeDrilldownStage === 'READY_DELIVERY' && 'Ready for Delivery (Gate Pass & Dispatched)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeDrilldownStage === 'TOTAL_STOCKS' && 'Complete list of active buyer challans and floor allotments.'}
                  {activeDrilldownStage === 'GOODS_IN_LINE' && 'Active allotments running on sewing machines by Lineman.'}
                  {activeDrilldownStage === 'MENDING_CHECKING' && 'Defect tagged pieces, alteration logs, and finishing checks.'}
                  {activeDrilldownStage === 'READY_GOODS' && '100% verified finished garments packed and stored.'}
                  {activeDrilldownStage === 'RTO' && 'Defects returned to origin and supplier rejections.'}
                  {activeDrilldownStage === 'READY_DELIVERY' && 'Outward delivery challans and gate pass consignments.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDrilldownStage(null)}
                aria-label="Close detail drawer"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* STAGE: TOTAL STOCKS OR GOODS IN LINE */}
              {(activeDrilldownStage === 'TOTAL_STOCKS' || activeDrilldownStage === 'GOODS_IN_LINE') && (
                <div className="space-y-3">
                  {filteredData.allotments.map((al, idx) => {
                    const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                    const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                    const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles

                    return (
                      <div key={al.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              Art {art?.art_no || 'Style'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {ch?.challan_no ? `JOB-${ch.challan_no}` : 'Floor Lot'}
                            </span>
                            {ch?.brand && (
                              <span className="text-[10px] font-bold text-indigo-600">
                                {ch.brand}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Lineman: <strong className="text-slate-800">{lm?.username || 'Unassigned'}</strong> • Date: {al.allotment_date || al.created_at.split('T')[0]}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-slate-900">
                            {al.target_qty?.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {al.status || 'IN PROGRESS'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {filteredData.allotments.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No allotments found.</p>
                  )}
                </div>
              )}

              {/* STAGE: MENDING & CHECKING */}
              {activeDrilldownStage === 'MENDING_CHECKING' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-900">Alteration & Mending Summary</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Defects caught during checking line inspection
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-900 bg-white px-2.5 py-1 rounded shadow-2xs">
                      {metrics.mendingAlterationQty} pcs Alteration
                    </span>
                  </div>

                  {filteredData.qc.map((q, idx) => (
                    <div key={q.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Art {q.article?.art_no || 'Style'} • {q.defect_type || 'Alteration Required'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Date: {q.entry_date || q.created_at?.split('T')[0]} • Stage: {q.stage || 'CHECKING'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200 block">
                          {q.qty_rejected} Defect
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                          {q.qty_passed} Passed
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredData.qc.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No QC defect logs recorded.</p>
                  )}
                </div>
              )}

              {/* STAGE: READY GOODS */}
              {activeDrilldownStage === 'READY_GOODS' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Finished Goods Godown Stock</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Ready for buyer packaging and gate dispatch
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-900 bg-white px-2.5 py-1 rounded shadow-2xs">
                      {metrics.readyGoods.toLocaleString()} pcs Ready
                    </span>
                  </div>

                  {filteredData.store.filter(s => s.type === 'INWARD').map((s, idx) => (
                    <div key={s.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {s.article?.art_no || 'Finished Garments'} {s.color && `• ${s.color}`} {s.size && `(${s.size})`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Receipt: {s.party_name || 'Godown Receipt'} • Date: {s.entry_date || s.created_at?.split('T')[0]}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-700">
                        +{s.quantity} pcs
                      </span>
                    </div>
                  ))}
                  {filteredData.store.filter(s => s.type === 'INWARD').length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No store inward records found.</p>
                  )}
                </div>
              )}

              {/* STAGE: RTO */}
              {activeDrilldownStage === 'RTO' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-900">Return to Origin (RTO)</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Irreparable defects and supplier returned consignments
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-rose-900 bg-white px-2.5 py-1 rounded shadow-2xs">
                      {metrics.rto.toLocaleString()} pcs RTO
                    </span>
                  </div>

                  {filteredData.store.filter(s => s.type === 'RTO' || s.type === 'REJECT').map((s, idx) => (
                    <div key={s.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {s.article?.art_no || 'Defective Lot'} {s.color && `• ${s.color}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Party: {s.party_name || 'Supplier Origin'} • Date: {s.entry_date || s.created_at?.split('T')[0]}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-rose-700">
                        {s.quantity} pcs
                      </span>
                    </div>
                  ))}
                  {filteredData.store.filter(s => s.type === 'RTO' || s.type === 'REJECT').length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No RTO records found (0 Rejections).</p>
                  )}
                </div>
              )}

              {/* STAGE: READY FOR DELIVERY / DISPATCH */}
              {activeDrilldownStage === 'READY_DELIVERY' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-purple-900">Outward Delivery Challans</p>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Consignments dispatched with gate pass
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-purple-900 bg-white px-2.5 py-1 rounded shadow-2xs">
                      {metrics.readyDelivery.toLocaleString()} pcs Dispatched
                    </span>
                  </div>

                  {filteredData.dispatch.map((d, idx) => (
                    <div key={d.id || idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Challan #{d.challan_no} • Buyer: <strong className="text-purple-900">{d.buyer_name || 'Buyer'}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Dispatched: {d.created_at?.split('T')[0]} • Status: {d.status || 'Delivered'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-purple-700">
                        {d.total_pieces?.toLocaleString()} pcs
                      </span>
                    </div>
                  ))}
                  {filteredData.dispatch.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">No delivery challans generated yet.</p>
                  )}
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Click any row or close to return to main dashboard.
              </span>
              <button
                type="button"
                onClick={() => setActiveDrilldownStage(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
