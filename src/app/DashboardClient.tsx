'use client'

import { useState, useMemo, useEffect } from 'react'
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
  ArrowUpRight,
  Search,
  Check,
  ExternalLink,
  User,
  Tag,
  Plus
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'

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
  type: 'QC_PASS' | 'QC_REJECT' | 'STORE_INWARD' | 'DISPATCH' | 'ALLOTMENT' | 'PRODUCTION' | 'QC' | 'STORE'
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

function formatLinemanName(lm?: { username?: string } | { username?: string }[]) {
  const profile = Array.isArray(lm) ? lm[0] : lm
  if (!profile?.username || profile.username.toLowerCase() === 'admin') {
    return 'Unassigned (Floor Order)'
  }
  return profile.username
}

function VariantMatrixTable({ variants = [] }: { variants?: any[] }) {
  if (!variants || variants.length === 0) return null

  // Collect unique sizes
  const rawSizes = Array.from(new Set(variants.map(v => (v.size || 'STD').trim().toUpperCase())))
  
  const standardLetterOrder: Record<string, number> = {
    '2XS': 1, 'XXS': 1, 'XS': 2, 'S': 3, 'M': 4, 'L': 5, 'XL': 6, '2XL': 7, 'XXL': 7, '3XL': 8, 'XXXL': 8, '4XL': 9, '5XL': 10, 'FREE': 11, 'STD': 12
  }

  const sortedSizes = [...rawSizes].sort((a, b) => {
    const numA = Number(a)
    const numB = Number(b)
    const isNumA = !isNaN(numA) && a.trim() !== ''
    const isNumB = !isNaN(numB) && b.trim() !== ''

    if (isNumA && isNumB) return numA - numB
    if (isNumA && !isNumB) return 1
    if (!isNumA && isNumB) return -1
    
    const rankA = standardLetterOrder[a] ?? 99
    const rankB = standardLetterOrder[b] ?? 99
    if (rankA !== rankB) return rankA - rankB
    return a.localeCompare(b)
  })

  // Group by unique colors
  const colorMap: Record<string, Record<string, number>> = {}
  const colorTotals: Record<string, number> = {}
  const sizeTotals: Record<string, number> = {}
  let grandTotal = 0

  variants.forEach(v => {
    const col = (v.color || 'Standard').trim().toUpperCase()
    const sz = (v.size || 'STD').trim().toUpperCase()
    const qty = Number(v.quantity) || 0

    if (!colorMap[col]) colorMap[col] = {}
    colorMap[col][sz] = (colorMap[col][sz] || 0) + qty
    colorTotals[col] = (colorTotals[col] || 0) + qty
    sizeTotals[sz] = (sizeTotals[sz] || 0) + qty
    grandTotal += qty
  })

  const colors = Object.keys(colorMap)

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
      <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-200/90 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700">
            Colour × Size Matrix
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[var(--steel,#2B4C7E)] border border-blue-200/60">
          {colors.length} {colors.length === 1 ? 'Colour' : 'Colours'} • {sortedSizes.length} Sizes
        </span>
      </div>

      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9.5px] tracking-wider">
              <th className="py-2 px-3 border-r border-slate-200 font-extrabold text-slate-800 whitespace-nowrap min-w-[110px]">
                Colour / Shade
              </th>
              {sortedSizes.map(sz => (
                <th key={sz} className="py-2 px-2.5 text-center border-r border-slate-200/60 whitespace-nowrap min-w-[44px]">
                  {sz}
                </th>
              ))}
              <th className="py-2 px-3 text-right font-extrabold text-slate-900 bg-slate-200/60 whitespace-nowrap min-w-[70px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colors.map(col => {
              const rowTotal = colorTotals[col] || 0
              return (
                <tr key={col} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-200/70 whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--steel,#2B4C7E)] shrink-0" />
                    <span>{col}</span>
                  </td>
                  {sortedSizes.map(sz => {
                    const qty = colorMap[col]?.[sz]
                    return (
                      <td key={sz} className={`py-2 px-2.5 text-center border-r border-slate-100 font-semibold ${qty ? 'text-slate-900' : 'text-slate-300'}`}>
                        {qty ? qty.toLocaleString() : '-'}
                      </td>
                    )
                  })}
                  <td className="py-2 px-3 text-right font-extrabold text-slate-900 bg-slate-50/50">
                    {rowTotal.toLocaleString()} <span className="text-[9.5px] font-normal text-slate-400">pcs</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-200 font-bold text-slate-800 text-[10.5px]">
              <td className="py-2 px-3 border-r border-slate-200 font-extrabold uppercase tracking-wide">
                Total Pcs
              </td>
              {sortedSizes.map(sz => (
                <td key={sz} className="py-2 px-2.5 text-center border-r border-slate-200/60 font-extrabold text-slate-900">
                  {(sizeTotals[sz] || 0).toLocaleString()}
                </td>
              ))}
              <td className="py-2 px-3 text-right font-black text-slate-950 bg-slate-200/80">
                {grandTotal.toLocaleString()} <span className="text-[9.5px] font-medium text-slate-500">pcs</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
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
  const [isArticleMenuOpen, setIsArticleMenuOpen] = useState(false)
  const [articleSearchQuery, setArticleSearchQuery] = useState('')

  // Selected Stage Drawer State
  const [activeDrilldownStage, setActiveDrilldownStage] = useState<StageType | null>(null)
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('')
  const [expandedLinemen, setExpandedLinemen] = useState<Record<string, boolean>>({})

  // Toggle Lineman accordion
  const toggleLineman = (key: string) => {
    setExpandedLinemen(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Close drawer or dropdowns on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDrilldownStage(null)
        setDrawerSearchQuery('')
        setIsArticleMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filtered Articles for Combobox Search
  const filteredArticlesList = useMemo(() => {
    if (!articleSearchQuery.trim()) return articles
    const q = articleSearchQuery.trim().toLowerCase()
    return articles.filter(a => {
      const artNo = (a.art_no || '').toLowerCase()
      const desc = (a.description || '').toLowerCase()
      return artNo.includes(q) || desc.includes(q)
    })
  }, [articles, articleSearchQuery])

  const selectedArticleObj = useMemo(() => {
    return articles.find(a => a.id === selectedArticleId)
  }, [articles, selectedArticleId])

  const selectedArticleDisplayText = useMemo(() => {
    if (selectedArticleId === 'ALL') {
      return `All Article Styles (${articles.length} styles)`
    }
    if (!selectedArticleObj) return 'Select Article'
    const cleanDesc = cleanDescription(selectedArticleObj.description)
    if (!cleanDesc) return selectedArticleObj.art_no
    const stripped = cleanDesc.replace(new RegExp(`^${selectedArticleObj.art_no}\\s*[-•:]*\\s*`, 'i'), '').trim()
    return stripped ? `${selectedArticleObj.art_no} • ${stripped}` : selectedArticleObj.art_no
  }, [selectedArticleId, selectedArticleObj, articles.length])

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs">
        
        {/* Brand Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
            <Filter className="w-4 h-4" /> Brand:
          </span>
          {brandTabs.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                selectedBrand === brand
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {brand === 'ALL' ? 'All Orders' : brand === 'DIRECT' ? 'Direct Floor Lots' : brand}
            </button>
          ))}
        </div>

        {/* Article Dropdown & Date Range Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Searchable Article Filter Combobox */}
          <div className="relative min-w-[240px]">
            <button
              type="button"
              onClick={() => setIsArticleMenuOpen(!isArticleMenuOpen)}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[var(--steel,#2B4C7E)] cursor-pointer flex items-center justify-between gap-2 shadow-2xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedArticleDisplayText}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isArticleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {isArticleMenuOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsArticleMenuOpen(false)}
                />

                <div className="absolute right-0 top-full mt-1 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  
                  {/* Search Input Box */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={articleSearchQuery}
                      onChange={(e) => setArticleSearchQuery(e.target.value)}
                      placeholder="Search Art No, Color, Style..."
                      className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-[var(--steel,#2B4C7E)] text-slate-900 placeholder:text-slate-400 font-medium"
                    />
                    {articleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setArticleSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                    
                    {/* Option: All Articles */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticleId('ALL')
                        setIsArticleMenuOpen(false)
                        setArticleSearchQuery('')
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedArticleId === 'ALL'
                          ? 'bg-[var(--steel-tint,#DBE6F5)] text-[var(--steel-dark,#1F3A63)] font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>All Article Styles ({articles.length} styles)</span>
                      {selectedArticleId === 'ALL' && <Check className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)]" />}
                    </button>

                    {/* Filtered Articles */}
                    {filteredArticlesList.map(art => {
                      const isSelected = selectedArticleId === art.id
                      const cleanDesc = cleanDescription(art.description)
                      const subDesc = cleanDesc ? cleanDesc.replace(new RegExp(`^${art.art_no}\\s*[-•:]*\\s*`, 'i'), '').trim() : ''

                      return (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => {
                            setSelectedArticleId(art.id)
                            setIsArticleMenuOpen(false)
                            setArticleSearchQuery('')
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-[var(--steel-tint,#DBE6F5)] text-[var(--steel-dark,#1F3A63)] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 block truncate">
                              {art.art_no}
                            </span>
                            {subDesc && (
                              <span className="text-[10.5px] text-slate-500 block truncate">
                                {subDesc}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--steel,#2B4C7E)] shrink-0 mt-0.5" />}
                        </button>
                      )
                    })}

                    {filteredArticlesList.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-4">
                        No matching article style found.
                      </p>
                    )}

                  </div>

                </div>
              </>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
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
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    dateFilter === tab.id
                      ? 'bg-white text-[#3A3564] shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 6-STAGE FACTORY FLOOR LIFECYCLE KPI CARDS               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* STAGE 1: TOTAL STOCKS */}
        <div 
          onClick={() => setActiveDrilldownStage('TOTAL_STOCKS')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            {/* Top Action Row: Icon on left, Stage indicator on right */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Warehouse className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 01
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Stage Title and Subtitle - Has full card width without colliding! */}
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                1. Total Stocks
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Order Pipeline Target
              </p>
            </div>
          </div>

          {/* Metric Number and Bottom Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.totalStocks.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                Total Pieces
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 2: GOODS IN LINE (SEWING WIP) */}
        <div 
          onClick={() => setActiveDrilldownStage('GOODS_IN_LINE')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 02
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                2. Goods in Line
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Sewing Machines WIP
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.goodsInLine.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                On Floor
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 3: MENDING & CHECKING (WITH SMART ALTERATION ALERT) */}
        <div 
          onClick={() => setActiveDrilldownStage('MENDING_CHECKING')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 03
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                  3. Mending & Checking
                </span>
                {metrics.alterationRate > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    {metrics.alterationRate.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                QC Inspection & Repairs
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.mendingChecking.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                {metrics.mendingAlterationQty > 0 ? `${metrics.mendingAlterationQty} Alter` : 'Finishing Table'}
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 4: READY GOODS (FINISHED STOCK) */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_GOODS')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 04
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                4. Ready Goods
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                QC Passed & Packed
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.readyGoods.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                In Godown
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 5: RTO (RETURN TO ORIGIN / REJECTIONS) */}
        <div 
          onClick={() => setActiveDrilldownStage('RTO')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 05
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                5. RTO & Rejection
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Return to Origin
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.rto.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                Defect / Reject
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 6: READY FOR DELIVERY / DISPATCH */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_DELIVERY')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 06
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                6. Ready for Delivery
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Gate Pass & Dispatched
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.readyDelivery.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                Dispatched Pcs
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. LIVE VISUAL FLOW PIPELINE STEPPER BAR                   */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Live Factory Conversion Flow
              </h3>
              <p className="text-xs text-slate-500">Order to gate delivery progression</p>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            Total Target: <strong className="text-slate-900 font-mono">{metrics.totalStocks.toLocaleString()} pcs</strong>
          </span>
        </div>

        {/* Clean Outlined Conversion Cards - Zero Rainbow Color Noise */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Flow 1: Sewing Machine Floor */}
          <div className="bg-white border border-black/10 border-l-4 border-l-indigo-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                1. Sewing In-Line
              </span>
              <span className="text-xs font-extrabold font-mono text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                {pipelineFlow.inLinePct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {metrics.goodsInLine.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">On Machines</span>
            </div>
            {/* 4px Subtle Progress Indicator */}
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.inLinePct}%` }}
              />
            </div>
          </div>

          {/* Flow 2: Mending & Inspection Table */}
          <div className="bg-white border border-black/10 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                2. Mending & Checking
              </span>
              <span className="text-xs font-extrabold font-mono text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                {pipelineFlow.mendingPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {metrics.mendingChecking.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">QC Table</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.mendingPct}%` }}
              />
            </div>
          </div>

          {/* Flow 3: Finished Godown Inventory */}
          <div className="bg-white border border-black/10 border-l-4 border-l-emerald-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Ready in Godown
              </span>
              <span className="text-xs font-extrabold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                {pipelineFlow.readyPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {metrics.readyGoods.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">100% Packed</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.readyPct}%` }}
              />
            </div>
          </div>

          {/* Flow 4: Gate Pass & Dispatched */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                4. Dispatched Out
              </span>
              <span className="text-xs font-extrabold font-mono text-[#3A3564] bg-[#FAF7F0] border border-black/10 px-2 py-0.5 rounded-full shadow-2xs">
                {pipelineFlow.deliveryPct}%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {metrics.readyDelivery.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">Gate Pass</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.deliveryPct}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. ACTIVE PRODUCTION LOTS & RECENT ACTIVITY FEED           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Floor Allotments Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Active Production Orders & Floor Allotments
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                Live status of multi-article challans and assigned linemen
              </p>
            </div>
            <Link 
              href="/production-orders"
              className="text-sm font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1.5"
            >
              View All Orders <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
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
                        {formatLinemanName(lm)}
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
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                Floor Activity Stream
              </h3>
              <Clock className="w-[18px] h-[18px] text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                    act.type === 'QC_PASS' ? 'bg-emerald-100 text-emerald-700' :
                    act.type === 'QC_REJECT' ? 'bg-rose-100 text-rose-700' :
                    act.type === 'STORE_INWARD' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {act.type === 'QC_PASS' && <CheckCircle2 className="w-4 h-4" />}
                    {act.type === 'QC_REJECT' && <AlertTriangle className="w-4 h-4" />}
                    {act.type === 'STORE_INWARD' && <Boxes className="w-4 h-4" />}
                    {act.type === 'DISPATCH' && <Truck className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {act.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {act.relativeTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
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
              className="text-sm font-bold text-slate-700 hover:text-slate-900 inline-flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-slate-50 rounded-xl border border-black/15 shadow-2xs transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" /> Full Factory Audit Reports
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. 1-CLICK DEEP DRILLDOWN SLIDE-OVER / MOBILE SHEET DRAWER */}
      {/* ========================================================= */}
      {activeDrilldownStage && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
          
          {/* Dimmed backdrop overlay - click outside to close */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
            onClick={() => {
              setActiveDrilldownStage(null)
              setDrawerSearchQuery('')
            }}
          />

          {/* Modal Container: Bottom Sheet on Mobile, Slide-over on Desktop */}
          <div className="relative z-10 bg-white w-full max-h-[86vh] sm:max-h-full sm:h-full sm:w-[580px] sm:max-w-[90vw] rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-black/10 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 overflow-hidden">
            
            {/* Mobile Drag Handle Bar */}
            <div className="pt-2.5 pb-1 sm:hidden flex justify-center shrink-0 bg-slate-50">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                    {activeDrilldownStage === 'TOTAL_STOCKS' && <Warehouse className="w-5 h-5" />}
                    {activeDrilldownStage === 'GOODS_IN_LINE' && <Activity className="w-5 h-5" />}
                    {activeDrilldownStage === 'MENDING_CHECKING' && <AlertTriangle className="w-5 h-5" />}
                    {activeDrilldownStage === 'READY_GOODS' && <PackageCheck className="w-5 h-5" />}
                    {activeDrilldownStage === 'RTO' && <RotateCcw className="w-5 h-5" />}
                    {activeDrilldownStage === 'READY_DELIVERY' && <Truck className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                        Stage {
                          activeDrilldownStage === 'TOTAL_STOCKS' ? '01' :
                          activeDrilldownStage === 'GOODS_IN_LINE' ? '02' :
                          activeDrilldownStage === 'MENDING_CHECKING' ? '03' :
                          activeDrilldownStage === 'READY_GOODS' ? '04' :
                          activeDrilldownStage === 'RTO' ? '05' : '06'
                        }
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)] truncate">
                        {activeDrilldownStage === 'TOTAL_STOCKS' && 'Total Stocks (Order Pipeline)'}
                        {activeDrilldownStage === 'GOODS_IN_LINE' && 'Goods in Line (Sewing WIP)'}
                        {activeDrilldownStage === 'MENDING_CHECKING' && 'Mending & Checking (QC Table)'}
                        {activeDrilldownStage === 'READY_GOODS' && 'Ready Goods (Godown Stock)'}
                        {activeDrilldownStage === 'RTO' && 'RTO & Supplier Rejections'}
                        {activeDrilldownStage === 'READY_DELIVERY' && 'Ready for Delivery (Dispatch Bay)'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {activeDrilldownStage === 'TOTAL_STOCKS' && 'Committed production orders, buyer challans & floor targets'}
                      {activeDrilldownStage === 'GOODS_IN_LINE' && 'Active sewing machine batches being stitched by linemen'}
                      {activeDrilldownStage === 'MENDING_CHECKING' && 'Defect tagged pieces, alteration logs, and finishing table'}
                      {activeDrilldownStage === 'READY_GOODS' && '100% QC passed finished garments packed in godown storage'}
                      {activeDrilldownStage === 'RTO' && 'Defects returned to origin and supplier rejections'}
                      {activeDrilldownStage === 'READY_DELIVERY' && 'Dispatched consignments, delivery challans & gate passes'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrilldownStage(null)
                    setDrawerSearchQuery('')
                  }}
                  aria-label="Close detail drawer"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/80 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary KPI Ribbon */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-200 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Stage Volume
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 font-[family-name:var(--font-heading)]">
                    {activeDrilldownStage === 'TOTAL_STOCKS' && `${metrics.totalStocks.toLocaleString()} pcs`}
                    {activeDrilldownStage === 'GOODS_IN_LINE' && `${metrics.goodsInLine.toLocaleString()} pcs`}
                    {activeDrilldownStage === 'MENDING_CHECKING' && `${metrics.mendingChecking.toLocaleString()} pcs`}
                    {activeDrilldownStage === 'READY_GOODS' && `${metrics.readyGoods.toLocaleString()} pcs`}
                    {activeDrilldownStage === 'RTO' && `${metrics.rto.toLocaleString()} pcs`}
                    {activeDrilldownStage === 'READY_DELIVERY' && `${metrics.readyDelivery.toLocaleString()} pcs`}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Filter Brand
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-[#3A3564] mt-0.5 truncate">
                    {selectedBrand === 'ALL' ? 'All Brands' : selectedBrand}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Active Records
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                    {activeDrilldownStage === 'TOTAL_STOCKS' && `${filteredData.allotments.length} Orders`}
                    {activeDrilldownStage === 'GOODS_IN_LINE' && `${filteredData.allotments.length} Lots`}
                    {activeDrilldownStage === 'MENDING_CHECKING' && `${filteredData.qc.length} QC Logs`}
                    {activeDrilldownStage === 'READY_GOODS' && `${filteredData.store.filter(s => s.type === 'INWARD').length} Receipts`}
                    {activeDrilldownStage === 'RTO' && `${filteredData.store.filter(s => s.type === 'RTO' || s.type === 'REJECT').length} Returns`}
                    {activeDrilldownStage === 'READY_DELIVERY' && `${filteredData.dispatch.length} Challans`}
                  </p>
                </div>
              </div>

              {/* In-Drawer Quick Search Box */}
              <div className="mt-3 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={drawerSearchQuery}
                  onChange={(e) => setDrawerSearchQuery(e.target.value)}
                  placeholder="Filter by Art No, Lineman, Challan, Batch..."
                  className="w-full text-xs pl-8 pr-7 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 text-slate-800 placeholder:text-slate-400 font-medium transition-all"
                />
                {drawerSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 bg-slate-50/50">
              
              {/* STAGE 1: TOTAL STOCKS (ORDER PIPELINE TARGETS) */}
              {activeDrilldownStage === 'TOTAL_STOCKS' && (() => {
                const filteredDrawerAllotments = filteredData.allotments.filter(al => {
                  if (!drawerSearchQuery.trim()) return true
                  const q = drawerSearchQuery.toLowerCase()
                  const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                  const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                  const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                  return (
                    (art?.art_no || '').toLowerCase().includes(q) ||
                    (art?.description || '').toLowerCase().includes(q) ||
                    (ch?.challan_no || '').toLowerCase().includes(q) ||
                    (ch?.brand || '').toLowerCase().includes(q) ||
                    (lm?.username || '').toLowerCase().includes(q)
                  )
                })

                if (filteredDrawerAllotments.length === 0) {
                  return (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
                        <Warehouse className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Orders in Active Pipeline</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          There are no production orders or buyer challans matching the current filters.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/production-orders"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> + New Production Order
                        </Link>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-black/10 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Pipeline Target Allotments</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {filteredDrawerAllotments.length} Active Lots
                        </span>
                      </div>
                      <Link 
                        href="/allotments"
                        className="text-xs font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1"
                      >
                        Manage Allotments <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {filteredDrawerAllotments.map((al) => {
                      const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                      const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                      const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                      const lotVariants = (variants || []).filter(v => v.allotment_id === al.id)

                      return (
                        <div key={al.id} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                                  Art {art?.art_no || 'Style'}
                                </span>
                                {ch?.challan_no && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    JOB-{ch.challan_no}
                                  </span>
                                )}
                                {ch?.brand && (
                                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                                    {ch.brand}
                                  </span>
                                )}
                              </div>
                              {cleanDescription(art?.description) && (
                                <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-sm">
                                  {cleanDescription(art?.description).replace(new RegExp(`^${art?.art_no}\\s*[-•:]*\\s*`, 'i'), '').trim()}
                                </p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-slate-900 font-[family-name:var(--font-heading)]">
                                {al.target_qty?.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
                              </p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                {al.status || 'SCHEDULED'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Lineman: <strong className="text-slate-800">{formatLinemanName(lm)}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Date: <strong className="text-slate-800">{al.allotment_date || al.created_at?.split('T')[0]}</strong></span>
                            </div>
                          </div>

                          <VariantMatrixTable variants={lotVariants} />
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* STAGE 2: GOODS IN LINE (SEWING WIP FLOOR ACCORDIONS) */}
              {activeDrilldownStage === 'GOODS_IN_LINE' && (() => {
                const filteredDrawerAllotments = filteredData.allotments.filter(al => {
                  if (!drawerSearchQuery.trim()) return true
                  const q = drawerSearchQuery.toLowerCase()
                  const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                  const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                  const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                  return (
                    (art?.art_no || '').toLowerCase().includes(q) ||
                    (art?.description || '').toLowerCase().includes(q) ||
                    (ch?.challan_no || '').toLowerCase().includes(q) ||
                    (ch?.brand || '').toLowerCase().includes(q) ||
                    (lm?.username || '').toLowerCase().includes(q)
                  )
                })

                // Group by Lineman
                const groups: Record<string, {
                  key: string
                  name: string
                  profile: any
                  allotments: typeof filteredDrawerAllotments
                  totalPcs: number
                  totalWage: number
                  articleNumbers: string[]
                }> = {}

                filteredDrawerAllotments.forEach(al => {
                  const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                  const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                  const key = lm?.id || lm?.username || 'unassigned'
                  const name = formatLinemanName(lm)

                  if (!groups[key]) {
                    groups[key] = {
                      key,
                      name,
                      profile: lm,
                      allotments: [],
                      totalPcs: 0,
                      totalWage: 0,
                      articleNumbers: [],
                    }
                  }

                  groups[key].allotments.push(al)
                  const qty = Number(al.target_qty) || 0
                  groups[key].totalPcs += qty

                  const rate = Number(art?.stitching_rate) || 0
                  groups[key].totalWage += (qty * rate)

                  if (art?.art_no && !groups[key].articleNumbers.includes(art.art_no)) {
                    groups[key].articleNumbers.push(art.art_no)
                  }
                })

                const linemanGroups = Object.values(groups).sort((a, b) => b.totalPcs - a.totalPcs)

                if (linemanGroups.length === 0) {
                  return (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Active Sewing Lots on Floor</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          No linemen currently have active sewing allotments running on the factory floor.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/allotments"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs"
                        >
                          Assign Floor Allotments <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    {/* Linemen Toolbar */}
                    <div className="flex items-center justify-between px-1 text-xs">
                      <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#3A3564]" />
                        <span>{linemanGroups.length} {linemanGroups.length === 1 ? 'Lineman Active' : 'Linemen Active'}</span>
                      </span>
                      <div className="flex items-center gap-2 font-bold text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            const allExpanded: Record<string, boolean> = {}
                            linemanGroups.forEach(g => { allExpanded[g.key] = true })
                            setExpandedLinemen(allExpanded)
                          }}
                          className="text-[#3A3564] hover:underline cursor-pointer"
                        >
                          Expand All
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          type="button"
                          onClick={() => setExpandedLinemen({})}
                          className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {/* Lineman Accordion Cards */}
                    {linemanGroups.map((group) => {
                      const isExpanded = expandedLinemen[group.key] ?? false

                      return (
                        <div key={group.key} className="rounded-xl border border-black/10 bg-white shadow-2xs overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => toggleLineman(group.key)}
                            className="w-full text-left p-3.5 bg-white hover:bg-slate-50/90 flex items-center justify-between gap-3 transition-colors cursor-pointer border-b border-transparent data-[open=true]:border-slate-100"
                            data-open={isExpanded}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                                    Lineman: {group.name}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                                    {group.allotments.length} {group.allotments.length === 1 ? 'Lot' : 'Lots'}
                                  </span>
                                  {group.articleNumbers.map(artNo => (
                                    <span key={artNo} className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                      Art {artNo}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-[11.5px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>Active on sewing machines</span>
                                  {group.totalWage > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="font-bold text-emerald-700">Est. Wage: ₹{group.totalWage.toLocaleString()}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-900 font-[family-name:var(--font-heading)]">
                                  {group.totalPcs.toLocaleString()} <span className="text-[10.5px] font-normal text-slate-400">pcs</span>
                                </span>
                                <span className="block text-[9.5px] font-bold uppercase tracking-wider text-emerald-600">
                                  In Sewing
                                </span>
                              </div>
                              <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-slate-700' : ''}`}>
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 space-y-3">
                              {group.allotments.map((al) => {
                                const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                                const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                                const lotVariants = (variants || []).filter(v => v.allotment_id === al.id)

                                return (
                                  <div key={al.id} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                                            Art {art?.art_no || 'Style'}
                                          </span>
                                          {ch?.challan_no && (
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                              JOB-{ch.challan_no}
                                            </span>
                                          )}
                                          {ch?.brand && (
                                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                                              {ch.brand}
                                            </span>
                                          )}
                                        </div>
                                        {cleanDescription(art?.description) && (
                                          <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-sm">
                                            {cleanDescription(art?.description).replace(new RegExp(`^${art?.art_no}\\s*[-•:]*\\s*`, 'i'), '').trim()}
                                          </p>
                                        )}
                                      </div>

                                      <div className="text-right shrink-0">
                                        <p className="text-base font-black text-slate-900 font-[family-name:var(--font-heading)]">
                                          {al.target_qty?.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
                                        </p>
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          {al.status || 'IN SEWING'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Allotment Date: <strong className="text-slate-800">{al.allotment_date || al.created_at?.split('T')[0]}</strong></span>
                                      </div>
                                      {art?.stitching_rate && (
                                        <div className="flex items-center gap-1.5">
                                          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span>Stitching Rate: <strong className="text-slate-800">₹{art.stitching_rate}/pc</strong></span>
                                        </div>
                                      )}
                                    </div>

                                    <VariantMatrixTable variants={lotVariants} />

                                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                                      <Link 
                                        href="/allotments"
                                        className="text-[11px] font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1"
                                      >
                                        Open in Floor Allotments <ExternalLink className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* STAGE 3: MENDING & CHECKING (QC TABLE & DEFECTS) */}
              {activeDrilldownStage === 'MENDING_CHECKING' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center shrink-0 text-amber-700 shadow-2xs">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-amber-950">QC Finishing & Alteration Line</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {metrics.mendingAlterationQty} defect pieces tagged for alteration
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-950 bg-white px-3 py-1 rounded-full shadow-2xs border border-amber-200">
                      {metrics.alterationRate.toFixed(1)}% Alter Rate
                    </span>
                  </div>

                  {filteredData.qc
                    .filter(q => {
                      if (!drawerSearchQuery.trim()) return true
                      const s = drawerSearchQuery.toLowerCase()
                      return (
                        (q.article?.art_no || '').toLowerCase().includes(s) ||
                        (q.defect_type || '').toLowerCase().includes(s)
                      )
                    })
                    .map((q, idx) => (
                      <div key={q.id || idx} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-sm text-slate-900">
                              Art {q.article?.art_no || 'Style'}
                            </span>
                            <p className="text-xs font-semibold text-rose-700 mt-1 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              {q.defect_type || 'Alteration Required (Stitching/Fabric Defect)'}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 block">
                              {q.qty_rejected} pcs Defect
                            </span>
                            <span className="text-[10.5px] text-emerald-700 font-bold mt-1 block">
                              {q.qty_passed} pcs Passed
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>Inspection Date: {q.entry_date || q.created_at?.split('T')[0]}</span>
                          <span className="font-semibold text-slate-600">Stage: {q.stage || 'CHECKING'}</span>
                        </div>
                      </div>
                    ))}
                  
                  {filteredData.qc.length === 0 && (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center shadow-2xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Zero Defect Backlog!</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          100% of checked garments passed inspection. The alteration table is completely clear.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 4: READY GOODS (FINISHED GODOWN INVENTORY) */}
              {activeDrilldownStage === 'READY_GOODS' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-2xs">
                        <PackageCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-950">Finished Goods Godown Stock</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          100% QC Passed, poly-bagged & carton packed
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-950 bg-white px-3 py-1 rounded-full shadow-2xs border border-emerald-200">
                      {metrics.readyGoods.toLocaleString()} pcs Ready
                    </span>
                  </div>

                  {filteredData.store.filter(s => s.type === 'INWARD').map((s, idx) => (
                    <div key={s.id || idx} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {s.article?.art_no || 'Finished Garments'}
                          </span>
                          {s.color && (
                            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {s.color} {s.size && `(${s.size})`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Receipt: <strong className="text-slate-800">{s.party_name || 'Godown Store Inward'}</strong> • {s.entry_date || s.created_at?.split('T')[0]}
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-emerald-700 shrink-0 font-[family-name:var(--font-heading)]">
                        +{s.quantity} pcs
                      </span>
                    </div>
                  ))}

                  {filteredData.store.filter(s => s.type === 'INWARD').length === 0 && (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
                        <PackageCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Godown Receipts Logged</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Finished garments will appear here once QC checking inwards them to godown storage.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/inventory"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs"
                        >
                          Open Godown & Inventory <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 5: RTO (REJECTIONS & RETURN TO ORIGIN) */}
              {activeDrilldownStage === 'RTO' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-rose-200 flex items-center justify-center shrink-0 text-rose-700 shadow-2xs">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-rose-950">Return to Origin (RTO & Rejections)</p>
                        <p className="text-[11px] text-rose-800 mt-0.5">
                          Irreparable defects or returned vendor lots
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-950 bg-white px-3 py-1 rounded-full shadow-2xs border border-rose-200">
                      {metrics.rto.toLocaleString()} pcs RTO
                    </span>
                  </div>

                  {filteredData.store.filter(s => s.type === 'RTO' || s.type === 'REJECT').map((s, idx) => (
                    <div key={s.id || idx} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {s.article?.art_no || 'Defective Consignment'} {s.color && `• ${s.color}`}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Party: {s.party_name || 'Supplier Origin'} • Date: {s.entry_date || s.created_at?.split('T')[0]}
                        </p>
                      </div>
                      <span className="text-sm font-extrabold text-rose-700 font-mono">
                        {s.quantity} pcs
                      </span>
                    </div>
                  ))}

                  {filteredData.store.filter(s => s.type === 'RTO' || s.type === 'REJECT').length === 0 && (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center shadow-2xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Zero RTO Rejections!</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          No lots have been returned to origin. All manufactured consignments accepted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STAGE 6: READY FOR DELIVERY / DISPATCH */}
              {activeDrilldownStage === 'READY_DELIVERY' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center shrink-0 text-[#3A3564] shadow-2xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Outward Delivery Challans & Gate Passes</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Consignments dispatched from factory to client buyer
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-3 py-1 rounded-full shadow-2xs border border-black/10">
                      {metrics.readyDelivery.toLocaleString()} pcs Dispatched
                    </span>
                  </div>

                  {filteredData.dispatch.map((d, idx) => (
                    <div key={d.id || idx} className="p-4 rounded-xl border border-black/10 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            Challan #{d.challan_no}
                          </span>
                          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                            {d.buyer_name || 'Buyer'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dispatched: {d.created_at?.split('T')[0]} • Status: <strong className="text-slate-800">{d.status || 'Delivered'}</strong>
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-[#3A3564] shrink-0 font-[family-name:var(--font-heading)]">
                        {d.total_pieces?.toLocaleString()} pcs
                      </span>
                    </div>
                  ))}

                  {filteredData.dispatch.length === 0 && (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/10 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">No Dispatches Logged</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Gate pass delivery challans generated in Dispatch will appear here.
                        </p>
                      </div>
                      <div className="pt-2">
                        <Link
                          href="/dispatch"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs"
                        >
                          Go to Dispatch Bay <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-slate-500 truncate mr-2">
                Stage breakdown synchronized with live MES database
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveDrilldownStage(null)
                  setDrawerSearchQuery('')
                }}
                className="px-4 py-2 text-xs font-bold bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
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
