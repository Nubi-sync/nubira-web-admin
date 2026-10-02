'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
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
  Plus,
  FileText,
  Zap,
  UserCheck,
  BarChart3,
  PieChart
} from 'lucide-react'
import { TvViewButton } from '@/components/ui/TvViewButton'
import { WorkerAssignmentsTable, type WorkerAssignmentItem } from '@/app/components/WorkerAssignmentsTable'

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
  mending_status?: string | null
  mending_total_counted?: number | null
  mending_supervisor_name?: string | null
  mending_supervisor_id?: string | null
  handed_to_mending_by?: string | null
  handed_to_mending_at?: string | null
  mending_handover_notes?: string | null
  qc_status?: string | null
  qc_total_passed?: number | null
  qc_total_alter?: number | null
  qc_supervisor_name?: string | null
  handed_to_qc_by?: string | null
  handed_to_qc_at?: string | null
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
  lineman?: string
  artNo?: string
  artDesc?: string
  challanNo?: string
  qty?: number
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
  total_pcs?: number
  total_sets?: number
  notes?: string
  created_at: string
}

type DashboardProps = {
  articles: ArticleItem[]
  allotments: AllotmentItem[]
  variants?: any[]
  materials?: any[]
  workerAssignments?: WorkerAssignmentItem[]
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

function cleanCategoryName(raw: string): string {
  const s = raw.trim()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
  if (!s) return 'General'
  return s.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function extractDynamicCategory(art?: any, ch?: any): string {
  if (art?.category && typeof art.category === 'string' && art.category.trim()) {
    return cleanCategoryName(art.category)
  }
  if (art?.size_rates?.category && typeof art.size_rates.category === 'string' && art.size_rates.category.trim()) {
    return cleanCategoryName(art.size_rates.category)
  }

  const desc = cleanDescription(art?.description || '').trim()
  if (desc) {
    const parts = desc.split(/[-•:\/|]/)
    const firstPart = parts[0].trim()
    if (firstPart && !firstPart.match(/^[0-9]+$/) && firstPart.length >= 2) {
      const cleaned = firstPart.replace(/^(art|article|style|no|#)?\s*[0-9A-Z_-]+\s*[-•:]*\s*/i, '').trim()
      if (cleaned.length >= 2 && isNaN(Number(cleaned))) {
        return cleanCategoryName(cleaned)
      }
      if (isNaN(Number(firstPart))) {
        return cleanCategoryName(firstPart)
      }
    }
  }

  if (ch?.fabric_type && typeof ch.fabric_type === 'string' && ch.fabric_type.trim()) {
    return cleanCategoryName(ch.fabric_type)
  }

  return 'General'
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
  workerAssignments = [],
  challans = [],
  rawProduction = [],
  rawQC = [],
  rawStore = [],
  rawDispatch = [],
  recentActivities = [],
}: DashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0]
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customFromDate, setCustomFromDate] = useState<string>(todayStr)
  const [customToDate, setCustomToDate] = useState<string>(todayStr)
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedArticleId, setSelectedArticleId] = useState<string>('ALL')
  const [selectedProductionMonth, setSelectedProductionMonth] = useState<string>('ALL')
  const [isArticleMenuOpen, setIsArticleMenuOpen] = useState(false)
  const [articleSearchQuery, setArticleSearchQuery] = useState('')

  // Visual Analytics Widget Controls
  const [trendMode, setTrendMode] = useState<'monthly' | 'weekly'>('monthly')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL')
  const [categoryMonth, setCategoryMonth] = useState<string>('Aug 2026')

  // Selected Stage Drawer State
  const [activeDrilldownStage, setActiveDrilldownStage] = useState<StageType | null>(null)
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('')
  const [expandedLinemen, setExpandedLinemen] = useState<Record<string, boolean>>({})
  const [articleCardTabs, setArticleCardTabs] = useState<Record<string, 'matrix' | 'workers'>>({})

  // Recent Activity Feed Drawer State
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false)
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'ALLOTMENT' | 'QC' | 'STORE' | 'DISPATCH'>('ALL')
  const [activitySearchQuery, setActivitySearchQuery] = useState('')

  // Real-time live synchronization with mobile floor apps via Supabase WebSockets & Heartbeat Polling
  useEffect(() => {
    const supabase = createClient()
    let hasPendingUpdates = false
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const triggerRefresh = () => {
      if (document.hidden) {
        hasPendingUpdates = true
        return
      }
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        router.refresh()
      }, 300)
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && hasPendingUpdates) {
        hasPendingUpdates = false
        router.refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Periodic heartbeat poll every 8s to guarantee auto-sync with mobile app even if web sockets drop
    const pollInterval = setInterval(() => {
      if (!document.hidden) {
        router.refresh()
      }
    }, 8000)

    const channel = supabase
      .channel('realtime-dashboard-client')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotments' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_assignments' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qc_logs' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_transactions' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'delivery_challans' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_product' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challans' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'truck_inwards' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotment_variants' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allotment_materials' }, triggerRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, triggerRefresh)
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      clearInterval(pollInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      supabase.removeChannel(channel)
    }
  }, [router])

  const handleManualSync = () => {
    setIsSyncing(true)
    router.refresh()
    setTimeout(() => {
      setIsSyncing(false)
    }, 800)
  }

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
        setIsActivityDrawerOpen(false)
        setActivitySearchQuery('')
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

  // Filtered Activities for Live Factory Audit Slide-Over Drawer
  const filteredActivitiesList = useMemo(() => {
    return recentActivities.filter(act => {
      if (activityFilter === 'ALLOTMENT') {
        if (act.type !== 'ALLOTMENT' && act.type !== 'PRODUCTION') return false
      } else if (activityFilter === 'QC') {
        if (act.type !== 'QC' && act.type !== 'QC_PASS' && act.type !== 'QC_REJECT') return false
      } else if (activityFilter === 'STORE') {
        if (act.type !== 'STORE' && act.type !== 'STORE_INWARD') return false
      } else if (activityFilter === 'DISPATCH') {
        if (act.type !== 'DISPATCH') return false
      }

      if (activitySearchQuery.trim()) {
        const q = activitySearchQuery.trim().toLowerCase()
        const titleMatch = (act.title || '').toLowerCase().includes(q)
        const detailsMatch = (act.details || '').toLowerCase().includes(q)
        const locationMatch = (act.location || '').toLowerCase().includes(q)
        return titleMatch || detailsMatch || locationMatch
      }

      return true
    })
  }, [recentActivities, activityFilter, activitySearchQuery])

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
    return ['ALL', ...Array.from(brandsSet), 'DIRECT']
  }, [challans, allotments])

  // Available Months for Total Production & Trend Filtering (Strictly from real DB data)
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>()
    const addDateStr = (dateStr?: string) => {
      if (!dateStr) return
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        monthsSet.add(`${y}-${m}`)
      }
    }

    allotments.forEach(a => addDateStr(a.allotment_date || a.created_at))
    challans.forEach(c => addDateStr(c.created_at))
    rawProduction.forEach(p => addDateStr(p.entry_date || p.created_at))

    return Array.from(monthsSet).sort().reverse().map(ym => {
      const [y, m] = ym.split('-').map(Number)
      const dateObj = new Date(y, m - 1, 1)
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      return { value: ym, label }
    })
  }, [allotments, challans, rawProduction])

  // 2. Filter allotments, production, QC, store, and dispatch based on Brand, Article & Date
  const filteredData = useMemo(() => {
    const matchesArticle = (artId?: string) => {
      if (selectedArticleId === 'ALL') return true
      return artId === selectedArticleId
    }

    const matchesBrand = (chId?: string, chBrand?: string) => {
      if (selectedBrand === 'ALL') return true
      if (selectedBrand === 'DIRECT') return !chId && !chBrand
      const ch = challans.find(c => c.id === chId)
      const brand = ch?.brand?.trim().toUpperCase() || chBrand?.trim().toUpperCase()
      return brand === selectedBrand
    }

    const matchesDate = (dateStr?: string) => {
      if (!dateStr) return true
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return true

      // If specific month is chosen
      if (selectedProductionMonth !== 'ALL') {
        const [y, m] = selectedProductionMonth.split('-').map(Number)
        if (d.getFullYear() !== y || (d.getMonth() + 1) !== m) {
          return false
        }
      }

      if (dateFilter === 'all') return true

      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (dateFilter === 'today') {
        return d >= startOfToday
      }
      if (dateFilter === 'week') {
        const startOfWeek = new Date(startOfToday)
        startOfWeek.setDate(startOfToday.getDate() - 7)
        return d >= startOfWeek
      }
      if (dateFilter === 'month') {
        const startOfMonth = new Date(startOfToday)
        startOfMonth.setDate(startOfToday.getDate() - 30)
        return d >= startOfMonth
      }
      if (dateFilter === 'custom') {
        const from = new Date(customFromDate + 'T00:00:00')
        const to = new Date(customToDate + 'T23:59:59')
        return d >= from && d <= to
      }
      return true
    }

    return {
      challans: challans.filter(c => matchesBrand(c.id, c.brand) && matchesDate(c.created_at || (c as any).challan_date || (c as any).date)),
      allotments: allotments.filter(a => matchesArticle(a.article_id) && matchesBrand(a.challan_id, a.challans?.brand) && matchesDate(a.allotment_date || a.created_at)),
      production: rawProduction.filter(p => matchesArticle(p.article_id) && matchesDate(p.entry_date || p.created_at)),
      qc: rawQC.filter(q => matchesArticle(q.article_id) && matchesDate(q.entry_date || q.created_at)),
      store: rawStore.filter(s => matchesDate(s.entry_date || s.created_at)),
      dispatch: rawDispatch.filter(d => matchesDate(d.created_at)),
      activities: recentActivities.filter(ac => matchesDate(ac.timestamp))
    }
  }, [allotments, rawProduction, rawQC, rawStore, rawDispatch, recentActivities, selectedArticleId, selectedBrand, dateFilter, customFromDate, customToDate, selectedProductionMonth, challans])

  // 3. Compute the 6 Core Factory Lifecycle Numbers
  const metrics = useMemo(() => {
    // 1. Total Target Pieces in Pipeline (Challans / Orders for selected filters)
    const challanTotalPcs = filteredData.challans.reduce((sum, c) => sum + (c.total_pcs || 0), 0)
    const totalAllotmentPcs = filteredData.allotments
      .filter(al => al.status !== 'CANCELLED')
      .reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)
    
    const totalOrderPipeline = Math.max(challanTotalPcs, totalAllotmentPcs)

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

    // Stage 2: Goods In Line (Active floor sewing allotments)
    const floorSewingAllotments = filteredData.allotments.filter(al =>
      al.status !== 'CANCELLED' &&
      (!al.mending_status || al.mending_status === 'PENDING_STITCHING') &&
      al.status !== 'COMPLETED'
    )
    const activeLinemanAllotmentPcs = floorSewingAllotments.reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)

    const stage2_goodsInLine = activeLinemanAllotmentPcs > 0
      ? Math.max(0, activeLinemanAllotmentPcs - totalQCPassed - totalDispatched - totalQCRejected)
      : 0

    // Stage 1: Unallotted Stocks (Pending Pipeline)
    // As items move to Goods In Line, Stage 01 unallotted balance reduces dynamically!
    const stage1_unallottedStocks = Math.max(0, totalOrderPipeline - activeLinemanAllotmentPcs)

    // Stage 3: Goods in Mending & Checking
    const mendingFloorAllotments = filteredData.allotments.filter(al =>
      al.status !== 'CANCELLED' &&
      (al.mending_status === 'PENDING_MENDING' || al.mending_status === 'IN_MENDING' ||
       (al.status === 'COMPLETED' && (!al.qc_status || al.qc_status === 'PENDING_STITCHING')))
    )
    const mendingFloorPcs = mendingFloorAllotments.reduce((sum, al) => sum + (Number(al.target_qty) || 0), 0)

    const stage3_mendingChecking = mendingFloorPcs + totalQCRejected + Math.max(0, totalProduced - totalQCPassed - totalDispatched)

    // Stage 4: Ready Goods
    const stage4_readyGoods = Math.max(0, totalQCPassed - totalDispatched) + storeInward

    // Stage 5: RTO
    const stage5_rto = storeRTO

    // Stage 6: Ready Delivery
    const stage6_readyDelivery = totalDispatched

    // Smart Alteration Rate for Mending & Checking
    const totalChecked = totalQCPassed + totalQCRejected
    const alterationRate = totalChecked > 0 ? ((totalQCRejected / totalChecked) * 100) : 0

    return {
      totalStocks: stage1_unallottedStocks,
      unallottedStocks: stage1_unallottedStocks,
      totalOrderPipeline,
      goodsInLine: stage2_goodsInLine,
      mendingChecking: stage3_mendingChecking,
      mendingFloorPcs,
      mendingFloorCount: mendingFloorAllotments.length,
      mendingAlterationQty: totalQCRejected,
      alterationRate,
      readyGoods: stage4_readyGoods,
      rto: stage5_rto,
      readyDelivery: stage6_readyDelivery,
      totalProduced,
      totalQCPassed,
      totalDispatched
    }
  }, [filteredData, challans, articles, selectedBrand, selectedArticleId])

  // Pipeline Stepper Percentages (Conversion from Total Target)
  const pipelineFlow = useMemo(() => {
    const base = (metrics.totalOrderPipeline || metrics.totalStocks) > 0 ? (metrics.totalOrderPipeline || metrics.totalStocks) : 1
    return {
      inLinePct: Math.min(100, Math.round((metrics.goodsInLine / base) * 100)),
      mendingPct: Math.min(100, Math.round((metrics.mendingChecking / base) * 100)),
      readyPct: Math.min(100, Math.round((metrics.readyGoods / base) * 100)),
      deliveryPct: Math.min(100, Math.round((metrics.readyDelivery / base) * 100)),
    }
  }, [metrics])

  // Consolidated Active Orders / Challans Grouped (Deduplicates slices and showcases all active factory styles)
  const groupedActiveOrders = useMemo(() => {
    const map = new Map<string, {
      key: string
      challanId?: string
      challanNo: string
      brand: string
      fabricType: string
      uniqueArtNos: string[]
      masterDescriptions: string[]
      linemen: string[]
      totalTargetQty: number
      totalCompletedQty: number
      status: string
      mendingStatus?: string | null
      createdAt: string
      allotmentDate: string
      sliceCount: number
    }>()

    filteredData.allotments.forEach(al => {
      if (al.status === 'CANCELLED') return

      const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
      const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
      const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles

      const chNo = (ch?.challan_no || '').trim()
      const groupKey = ch?.id ? `challan-${ch.id}` : `art-${al.article_id || al.id}`
      const cleanChallanDisplay = chNo ? (chNo.toUpperCase().startsWith('CHALLAN') ? chNo : `Challan ${chNo}`) : 'Direct Floor'
      const linemanName = formatLinemanName(lm)
      const targetQty = Number(al.target_qty) || 0

      // Calculate produced/completed pcs from worker assignments
      const allotAssignedWorkers = workerAssignments.filter(w => w.allotment_id === al.id)
      const completedFromWorkers = allotAssignedWorkers.reduce(
        (sum, w) => sum + (Number(w.completed_qty) || (w.status === 'DONE' ? Number(w.assigned_qty) : 0)),
        0
      )

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          challanId: ch?.id,
          challanNo: cleanChallanDisplay,
          brand: ch?.brand || '',
          fabricType: ch?.fabric_type || '',
          uniqueArtNos: [],
          masterDescriptions: [],
          linemen: [],
          totalTargetQty: 0,
          totalCompletedQty: 0,
          status: al.status || 'IN_PROGRESS',
          mendingStatus: al.mending_status,
          createdAt: al.created_at || '',
          allotmentDate: al.allotment_date || al.created_at || '',
          sliceCount: 0
        })
      }

      const entry = map.get(groupKey)!
      entry.totalTargetQty += targetQty
      entry.totalCompletedQty += completedFromWorkers
      entry.sliceCount += 1

      const artNo = (art?.art_no || '').trim()
      if (artNo && !entry.uniqueArtNos.includes(artNo)) {
        entry.uniqueArtNos.push(artNo)
      }

      const desc = cleanDescription(art?.description || '')
      if (desc && !entry.masterDescriptions.includes(desc)) {
        entry.masterDescriptions.push(desc)
      }

      if (linemanName && linemanName !== 'Unassigned' && !entry.linemen.includes(linemanName)) {
        entry.linemen.push(linemanName)
      }
    })

    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(a.allotmentDate || a.createdAt).getTime()
      const timeB = new Date(b.allotmentDate || b.createdAt).getTime()
      return timeB - timeA
    })
  }, [filteredData.allotments, workerAssignments])

  // 4. Pure Live Production Trend Data (Strictly from real DB records)
  const productionTrendData = useMemo(() => {
    if (trendMode === 'monthly') {
      const monthsMap = new Map<string, { label: string; planned: number; production: number; delivered: number; dateVal: number }>()
      
      const getMonthKey = (dStr: string) => {
        const d = new Date(dStr)
        if (isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        return { key: `${y}-${m}`, label, dateVal: new Date(y, d.getMonth(), 1).getTime() }
      }

      challans.forEach(c => {
        if (!c.created_at) return
        const mk = getMonthKey(c.created_at)
        if (!mk) return
        if (!monthsMap.has(mk.key)) {
          monthsMap.set(mk.key, { label: mk.label, planned: 0, production: 0, delivered: 0, dateVal: mk.dateVal })
        }
        monthsMap.get(mk.key)!.planned += (c.total_pcs || 0)
      })

      rawProduction.forEach(p => {
        const dStr = p.entry_date || p.created_at
        if (!dStr) return
        const mk = getMonthKey(dStr)
        if (!mk) return
        if (!monthsMap.has(mk.key)) {
          monthsMap.set(mk.key, { label: mk.label, planned: 0, production: 0, delivered: 0, dateVal: mk.dateVal })
        }
        monthsMap.get(mk.key)!.production += (p.quantity || 0)
      })

      rawDispatch.forEach(dp => {
        if (!dp.created_at) return
        const mk = getMonthKey(dp.created_at)
        if (!mk) return
        if (!monthsMap.has(mk.key)) {
          monthsMap.set(mk.key, { label: mk.label, planned: 0, production: 0, delivered: 0, dateVal: mk.dateVal })
        }
        monthsMap.get(mk.key)!.delivered += (dp.total_pieces || 0)
      })

      // If no past months logged, use current active month
      if (monthsMap.size === 0) {
        const now = new Date()
        const currentLabel = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        monthsMap.set(currentKey, {
          label: currentLabel,
          planned: metrics.totalOrderPipeline,
          production: metrics.totalProduced,
          delivered: metrics.readyDelivery,
          dateVal: now.getTime()
        })
      }

      const result = Array.from(monthsMap.values())
        .sort((a, b) => a.dateVal - b.dateVal)
        .slice(-6)

      const maxValue = Math.max(1, ...result.map(r => Math.max(r.planned, r.production, r.delivered)))
      return { items: result, maxValue }
    } else {
      // Weekly Mode strictly from real DB records
      const weeksMap = new Map<string, { label: string; planned: number; production: number; delivered: number; dateVal: number }>()
      const getWeekKey = (dStr: string) => {
        const d = new Date(dStr)
        if (isNaN(d.getTime())) return null
        const startOfWeek = new Date(d)
        startOfWeek.setDate(d.getDate() - d.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        const label = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        return { key: startOfWeek.toISOString().split('T')[0], label: `Wk of ${label}`, dateVal: startOfWeek.getTime() }
      }

      challans.forEach(c => {
        if (!c.created_at) return
        const wk = getWeekKey(c.created_at)
        if (!wk) return
        if (!weeksMap.has(wk.key)) {
          weeksMap.set(wk.key, { label: wk.label, planned: 0, production: 0, delivered: 0, dateVal: wk.dateVal })
        }
        weeksMap.get(wk.key)!.planned += (c.total_pcs || 0)
      })

      rawProduction.forEach(p => {
        const dStr = p.entry_date || p.created_at
        if (!dStr) return
        const wk = getWeekKey(dStr)
        if (!wk) return
        if (!weeksMap.has(wk.key)) {
          weeksMap.set(wk.key, { label: wk.label, planned: 0, production: 0, delivered: 0, dateVal: wk.dateVal })
        }
        weeksMap.get(wk.key)!.production += (p.quantity || 0)
      })

      rawDispatch.forEach(dp => {
        if (!dp.created_at) return
        const wk = getWeekKey(dp.created_at)
        if (!wk) return
        if (!weeksMap.has(wk.key)) {
          weeksMap.set(wk.key, { label: wk.label, planned: 0, production: 0, delivered: 0, dateVal: wk.dateVal })
        }
        weeksMap.get(wk.key)!.delivered += (dp.total_pieces || 0)
      })

      if (weeksMap.size === 0) {
        const now = new Date()
        const currentLabel = `This Week`
        const currentKey = now.toISOString().split('T')[0]
        weeksMap.set(currentKey, {
          label: currentLabel,
          planned: metrics.totalOrderPipeline,
          production: metrics.totalProduced,
          delivered: metrics.readyDelivery,
          dateVal: now.getTime()
        })
      }

      const result = Array.from(weeksMap.values())
        .sort((a, b) => a.dateVal - b.dateVal)
        .slice(-6)

      const maxValue = Math.max(1, ...result.map(r => Math.max(r.planned, r.production, r.delivered)))
      return { items: result, maxValue }
    }
  }, [challans, rawProduction, rawDispatch, trendMode, metrics.totalOrderPipeline, metrics.totalProduced, metrics.readyDelivery])

  // 5. Order Status Breakdown (Donut Chart Computation)
  const orderStatusData = useMemo(() => {
    const inProduction = metrics.goodsInLine
    const delivered = metrics.readyDelivery
    const mending = metrics.mendingAlterationQty + metrics.mendingFloorPcs
    const checking = metrics.mendingChecking
    const rawPending = metrics.totalStocks - (inProduction + delivered + mending + checking)
    const pending = Math.max(0, rawPending)
    
    const total = inProduction + delivered + mending + checking + pending || metrics.totalStocks || 1

    const segments = [
      { key: 'IN_PROD', label: 'In Production', count: inProduction, color: '#0B1220', pct: Math.round((inProduction / total) * 100) },
      { key: 'DELIVERED', label: 'Delivered', count: delivered, color: '#14C8B4', pct: Math.round((delivered / total) * 100) },
      { key: 'MENDING', label: 'Mending', count: mending, color: '#E11D48', pct: Math.round((mending / total) * 100) },
      { key: 'CHECKING', label: 'Checking', count: checking, color: '#D97706', pct: Math.round((checking / total) * 100) },
      { key: 'PENDING', label: 'Pending Allotment', count: pending, color: '#94A3B8', pct: Math.round((pending / total) * 100) }
    ]

    let accumulatedAngle = 0
    const circumference = 2 * Math.PI * 45 // radius = 45 -> c ≈ 282.74
    const chartSlices = segments.map(seg => {
      const fraction = seg.count / total
      const strokeDasharray = `${Math.max(0, fraction * circumference)} ${circumference}`
      const strokeDashoffset = -accumulatedAngle * circumference
      accumulatedAngle += fraction
      return {
        ...seg,
        strokeDasharray,
        strokeDashoffset
      }
    })

    return {
      total,
      segments,
      chartSlices
    }
  }, [metrics])

  // 6. 100% Dynamic Category Production Breakdown Data (Zero Hardcoding)
  const categoryProductionData = useMemo(() => {
    const palette = [
      '#0B1220', // Obsidian Navy
      '#14C8B4', // Electric Mint
      '#1D4ED8', // Royal Blue
      '#F59E0B', // Amber Orange
      '#EC4899', // Rose Pink
      '#0284C7', // Sky Cyan
      '#8B5CF6', // Purple
      '#10B981', // Emerald Green
    ]

    const catMap = new Map<string, { label: string; count: number }>()

    // Tally target pieces from filtered allotments
    filteredData.allotments.forEach(al => {
      if (al.status === 'CANCELLED') return
      const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
      const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
      const category = extractDynamicCategory(art, ch)
      const targetQty = Number(al.target_qty) || 0

      if (!catMap.has(category)) {
        catMap.set(category, { label: category, count: 0 })
      }
      catMap.get(category)!.count += targetQty
    })

    // Also include any challans not yet allotted
    challans.forEach(ch => {
      const category = extractDynamicCategory(undefined, ch)
      if (category !== 'General') {
        if (!catMap.has(category)) {
          catMap.set(category, { label: category, count: 0 })
        }
        if (catMap.get(category)!.count === 0 && (ch.total_pcs || 0) > 0) {
          catMap.get(category)!.count += (ch.total_pcs || 0)
        }
      }
    })

    // If still empty, check articles list
    if (catMap.size === 0) {
      articles.forEach(art => {
        const category = extractDynamicCategory(art, undefined)
        if (!catMap.has(category)) {
          catMap.set(category, { label: category, count: 0 })
        }
      })
    }

    // Sort by volume descending
    const rawItems = Array.from(catMap.values())
      .filter(item => item.label && item.label !== 'General')
      .sort((a, b) => b.count - a.count)

    // If only General or empty, fallback gracefully
    if (rawItems.length === 0 && catMap.has('General')) {
      rawItems.push(catMap.get('General')!)
    }

    // Take top 6 categories for balanced visual column spacing
    const sliced = rawItems.slice(0, 6)

    const items = sliced.map((item, index) => ({
      ...item,
      color: palette[index % palette.length]
    }))

    const totalCount = items.reduce((sum, item) => sum + item.count, 0)
    const maxCount = Math.max(1, ...items.map(i => i.count))

    // Determine top primary segment
    const topCategory = items.length > 0 ? items[0] : null
    const topPct = (topCategory && totalCount > 0)
      ? Math.round((topCategory.count / totalCount) * 100)
      : 0
    const primarySegmentText = topCategory
      ? `${topCategory.label}${topPct > 0 ? ` (${topPct}%)` : ''}`
      : 'All Items'

    return { items, totalCount, maxCount, primarySegmentText }
  }, [filteredData.allotments, challans, articles])

  // 7. Top Running Styles (Ranking & Dual-Tone Progress)
  const topRunningStyles = useMemo(() => {
    const styleMap = new Map<string, {
      artNo: string
      description: string
      orderQty: number
      producedQty: number
      balanceQty: number
      progressPct: number
    }>()

    articles.forEach(art => {
      const artNo = art.art_no?.trim() || 'Style'
      if (!styleMap.has(artNo)) {
        styleMap.set(artNo, {
          artNo,
          description: cleanDescription(art.description || ''),
          orderQty: 0,
          producedQty: 0,
          balanceQty: 0,
          progressPct: 0
        })
      }
    })

    allotments.forEach(al => {
      if (al.status === 'CANCELLED') return
      const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
      const artNo = (art?.art_no || '').trim() || 'Style'
      const target = Number(al.target_qty) || 0

      if (!styleMap.has(artNo)) {
        styleMap.set(artNo, {
          artNo,
          description: cleanDescription(art?.description || ''),
          orderQty: 0,
          producedQty: 0,
          balanceQty: 0,
          progressPct: 0
        })
      }
      const entry = styleMap.get(artNo)!
      entry.orderQty += target
    })

    workerAssignments.forEach(w => {
      const allot = allotments.find(a => a.id === w.allotment_id)
      const art = Array.isArray(allot?.articles) ? allot?.articles[0] : allot?.articles
      const artNo = (art?.art_no || '').trim()
      if (artNo && styleMap.has(artNo)) {
        const qty = Number(w.completed_qty) || (w.status === 'DONE' ? Number(w.assigned_qty) : 0)
        styleMap.get(artNo)!.producedQty += qty
      }
    })

    return Array.from(styleMap.values())
      .filter(s => s.orderQty > 0 || s.producedQty > 0)
      .map(s => {
        const balanceQty = Math.max(0, s.orderQty - s.producedQty)
        const progressPct = s.orderQty > 0 ? Math.min(100, Math.round((s.producedQty / s.orderQty) * 100)) : 0
        return {
          ...s,
          balanceQty,
          progressPct
        }
      })
      .sort((a, b) => b.orderQty - a.orderQty)
      .slice(0, 5)
  }, [articles, allotments, workerAssignments])

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. FILTER CONTROLS & BRAND TABS                           */}
      {/* ========================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-black/15 shadow-2xs">
        
        {/* Brand Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#0B1220]" /> Brand:
          </span>
          {brandTabs.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                selectedBrand === brand
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'bg-[#F0FDFA] text-slate-700 hover:bg-teal-50 border border-black/15'
              }`}
            >
              {brand === 'ALL' ? 'All Orders' : brand === 'DIRECT' ? 'Direct Floor Lots' : brand}
            </button>
          ))}
        </div>

        {/* Article Dropdown & Date Range Selector */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          
          {/* Searchable Article Filter Combobox */}
          <div className="relative w-full sm:w-64">
            <button
              type="button"
              onClick={() => setIsArticleMenuOpen(!isArticleMenuOpen)}
              className="w-full text-xs font-bold bg-[#F0FDFA] hover:bg-teal-50 border border-black/15 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 cursor-pointer flex items-center justify-between gap-2 shadow-2xs transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#0B1220] shrink-0" />
                <span className="truncate">{selectedArticleDisplayText}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isArticleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {isArticleMenuOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsArticleMenuOpen(false)}
                />

                <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[90vw] bg-white border border-black/15 rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-100">
                  
                  {/* Search Input Box */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={articleSearchQuery}
                      onChange={(e) => setArticleSearchQuery(e.target.value)}
                      placeholder="Search Art No, Color, Style..."
                      className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 text-slate-900 placeholder:text-slate-400 font-semibold"
                    />
                    {articleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setArticleSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    
                    {/* Option: All Articles */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedArticleId('ALL')
                        setIsArticleMenuOpen(false)
                        setArticleSearchQuery('')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedArticleId === 'ALL'
                          ? 'bg-[#F0FDFA] text-[#0B1220] font-extrabold border border-black/15'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>All Article Styles ({articles.length} styles)</span>
                      {selectedArticleId === 'ALL' && <Check className="w-4 h-4 text-[#0B1220] stroke-[2.5]" />}
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
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#F0FDFA] text-[#0B1220] font-extrabold border border-black/15'
                              : 'hover:bg-slate-50 text-slate-700 font-semibold'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-slate-900 block truncate">
                              {art.art_no}
                            </span>
                            {subDesc && (
                              <span className="text-[11px] text-slate-500 block truncate font-medium">
                                {subDesc}
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0B1220] stroke-[2.5] shrink-0 mt-0.5" />}
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

          {/* Month Selector & Date Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Month Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedProductionMonth}
                onChange={e => {
                  setSelectedProductionMonth(e.target.value)
                  if (e.target.value !== 'ALL') {
                    setDateFilter('all')
                  }
                }}
                className="px-3 py-1.5 bg-[#F0FDFA] hover:bg-teal-50 text-[#0B1220] text-xs font-bold rounded-xl border border-black/15 shadow-2xs focus:outline-none cursor-pointer pr-7"
              >
                <option value="ALL">All-Time Period</option>
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-[#F0FDFA] p-1 rounded-xl border border-black/15 shadow-2xs">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDateFilter(tab.id as DateFilter)
                    if (tab.id !== 'all') {
                      setSelectedProductionMonth('ALL')
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    dateFilter === tab.id && selectedProductionMonth === 'ALL'
                      ? 'bg-white text-[#0B1220] shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="p-2.5 rounded-xl border border-black/15 bg-[#F0FDFA] hover:bg-teal-50 text-[#0B1220] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
              title="Sync latest live updates from factory floor"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-[#0B1220] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 6-STAGE FACTORY FLOOR LIFECYCLE KPI CARDS               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* STAGE 1: TOTAL STOCKS (PENDING / UNALLOTTED PIPELINE) */}
        <div 
          onClick={() => setActiveDrilldownStage('TOTAL_STOCKS')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            {/* Top Action Row: Icon on left, Stage indicator on right */}
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Warehouse className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 01
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            {/* Stage Title and Subtitle */}
            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                1. Total Stocks
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Pending Allotment Balance
              </p>
            </div>
          </div>

          {/* Metric Number and Bottom Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {metrics.unallottedStocks.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                Unallotted
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                {metrics.totalOrderPipeline.toLocaleString()} total
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 2: GOODS IN LINE (SEWING WIP) */}
        <div 
          onClick={() => setActiveDrilldownStage('GOODS_IN_LINE')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Activity className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 02
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                On Floor
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 3: MENDING & CHECKING (WITH SMART ALTERATION ALERT) */}
        <div 
          onClick={() => setActiveDrilldownStage('MENDING_CHECKING')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <AlertTriangle className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 03
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                {metrics.mendingAlterationQty > 0 ? `${metrics.mendingAlterationQty} Alter` : 'Finishing Table'}
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 4: READY GOODS (FINISHED STOCK) */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_GOODS')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <PackageCheck className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 04
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                In Godown
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 5: RTO (RETURN TO ORIGIN / REJECTIONS) */}
        <div 
          onClick={() => setActiveDrilldownStage('RTO')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <RotateCcw className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 05
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                Defect / Reject
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 6: READY FOR DELIVERY / DISPATCH */}
        <div 
          onClick={() => setActiveDrilldownStage('READY_DELIVERY')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/15 hover:border-black/25 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs transition-colors">
                <Truck className="w-5 h-5 text-[#0B1220]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#0B1220] transition-colors">
                  STAGE 06
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B1220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider shadow-2xs">
                Dispatched Pcs
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. LIVE VISUAL FLOW PIPELINE STEPPER BAR                   */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/15 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-4 h-4 text-[#0B1220]" />
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
          <div className="bg-white border border-black/15 border-l-4 border-l-[#1D4ED8] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                1. Sewing In-Line
              </span>
              <span className="text-xs font-extrabold font-mono text-[#1D4ED8] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
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
                className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.inLinePct}%` }}
              />
            </div>
          </div>

          {/* Flow 2: Mending & Inspection Table */}
          <div className="bg-white border border-black/15 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
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
          <div className="bg-white border border-black/15 border-l-4 border-l-[#14C8B4] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Ready in Godown
              </span>
              <span className="text-xs font-extrabold font-mono text-teal-800 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-full">
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
                className="bg-[#14C8B4] h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.readyPct}%` }}
              />
            </div>
          </div>

          {/* Flow 4: Gate Pass & Dispatched */}
          <div className="bg-white border border-black/15 border-l-4 border-l-[#0B1220] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                4. Dispatched Out
              </span>
              <span className="text-xs font-extrabold font-mono text-[#0B1220] bg-[#F0FDFA] border border-black/15 px-2 py-0.5 rounded-full shadow-2xs">
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
                className="bg-[#0B1220] h-full rounded-full transition-all duration-500" 
                style={{ width: `${pipelineFlow.deliveryPct}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. EXECUTIVE VISUAL ANALYTICS SUITE                       */}
      {/* ========================================================= */}
      
      {/* ROW 1: 3 VISUAL ANALYTICS CARDS (Trend + Donut + Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Production Trend Card */}
        <div className="bg-white rounded-2xl border border-black/15 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0B1220]" />
                  Production Trend
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly vs planned vs delivered
                </p>
              </div>

              {/* Monthly / Weekly Toggle */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTrendMode('monthly')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    trendMode === 'monthly'
                      ? 'bg-white text-[#0B1220] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setTrendMode('weekly')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    trendMode === 'weekly'
                      ? 'bg-white text-[#0B1220] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-[11px] font-medium text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B1220]" /> Planned
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14C8B4]" /> Production
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Delivered
              </span>
            </div>

            {/* Bar Chart Visualization */}
            <div className="mt-6">
              <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-3 px-2 pt-4 pb-2 bg-slate-50/50 rounded-xl border border-slate-100">
                {productionTrendData.items.map((item, idx) => {
                  const max = productionTrendData.maxValue || 1
                  const plannedH = Math.min(100, Math.max(8, Math.round((item.planned / max) * 100)))
                  const prodH = Math.min(100, Math.max(8, Math.round((item.production / max) * 100)))
                  const delivH = Math.min(100, Math.max(8, Math.round((item.delivered / max) * 100)))

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                        P: {item.planned.toLocaleString()} | Pr: {item.production.toLocaleString()} | D: {item.delivered.toLocaleString()}
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* Planned Bar */}
                        <div 
                          className="w-1/3 max-w-[10px] bg-[#0B1220] rounded-t-sm transition-all duration-500 hover:brightness-110"
                          style={{ height: `${plannedH}%` }}
                        />
                        {/* Production Bar */}
                        <div 
                          className="w-1/3 max-w-[10px] bg-[#14C8B4] rounded-t-sm transition-all duration-500 hover:brightness-110"
                          style={{ height: `${prodH}%` }}
                        />
                        {/* Delivered Bar */}
                        <div 
                          className="w-1/3 max-w-[10px] bg-[#F59E0B] rounded-t-sm transition-all duration-500 hover:brightness-110"
                          style={{ height: `${delivH}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 mt-2 truncate max-w-[45px] text-center">
                        {item.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Period Production Output</span>
            <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {metrics.totalProduced.toLocaleString()} pcs produced
            </span>
          </div>
        </div>

        {/* 2. Order Status Donut Card */}
        <div className="bg-white rounded-2xl border border-black/15 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#0B1220]" />
                  Order Status
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current lifecycle status breakdown
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Live
              </span>
            </div>

            {/* Donut Chart with Center Text */}
            <div className="mt-4 flex flex-col items-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-slate-100"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  {/* Segments */}
                  {orderStatusData.chartSlices.map((slice, i) => (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                  ))}
                </svg>

                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tracking-tight">
                    {orderStatusData.total > 1000 ? `${(orderStatusData.total / 1000).toFixed(0)}k` : orderStatusData.total}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total Pcs
                  </span>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 text-xs">
                {orderStatusData.segments.map(seg => (
                  <div key={seg.key} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-[11px] font-medium text-slate-700 truncate">{seg.label}</span>
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-900 shrink-0 ml-1">{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>In Pipeline</span>
            <span className="font-mono font-bold text-slate-900">{orderStatusData.total.toLocaleString()} pcs</span>
          </div>
        </div>

        {/* 3. Production by Category Card */}
        <div className="bg-white rounded-2xl border border-black/15 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0B1220]" />
                  Production by Category
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Volume across product segments
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                All Time
              </span>
            </div>

            {/* Category Columns */}
            <div className="mt-6 flex items-end justify-around gap-2 sm:gap-3 h-44 px-3 sm:px-4 bg-slate-50/50 rounded-xl border border-slate-100 pt-4 pb-2">
              {categoryProductionData.items.map((cat, idx) => {
                const max = categoryProductionData.maxCount || 1
                const heightPct = Math.min(100, Math.max(15, Math.round((cat.count / max) * 100)))

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[11px] font-mono font-bold text-slate-800 mb-2">
                      {cat.count > 1000 ? `${(cat.count / 1000).toFixed(0)}k` : cat.count}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        className="w-full rounded-t-lg transition-all duration-700 group-hover:brightness-110"
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 mt-2 truncate text-center max-w-[70px]" title={cat.label}>
                      {cat.label}
                    </span>
                  </div>
                )
              })}
              {categoryProductionData.items.length === 0 && (
                <div className="flex items-center justify-center h-full w-full text-xs text-slate-400">
                  No categories in active orders
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Primary Segment</span>
            <span className="font-bold text-[#0B1220]">{categoryProductionData.primarySegmentText}</span>
          </div>
        </div>

      </div>

      {/* ROW 2: 2 OPERATIONAL INSIGHT CARDS (Top Running Styles + Recent Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Top Running Styles (7 Cols / ~60%) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-black/15 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0B1220]" />
                  Top Running Styles
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Styles with highest production volume and progress
                </p>
              </div>
              <Link 
                href="/production-orders"
                className="text-xs font-bold text-[#0B1220] hover:underline inline-flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70">
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Style / Art No.</th>
                    <th className="py-2.5 px-3 text-right">Order Qty</th>
                    <th className="py-2.5 px-3 text-right">Produced</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-left w-36">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topRunningStyles.map((style, idx) => (
                    <tr key={style.artNo} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs font-bold text-slate-400">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm font-mono">
                          Art: {style.artNo}
                        </div>
                        {style.description && (
                          <span className="block text-[11px] font-medium text-slate-500 truncate max-w-[160px] mt-0.5">
                            {style.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800 text-xs sm:text-sm">
                        {style.orderQty.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 text-xs sm:text-sm">
                        {style.producedQty.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-500 text-xs sm:text-sm">
                        {style.balanceQty.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#0B1220] to-[#14C8B4] rounded-full transition-all duration-500"
                              style={{ width: `${style.progressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-700 shrink-0 w-8 text-right">
                            {style.progressPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {topRunningStyles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No running styles recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Tracking active production runs</span>
            <Link href="/allotments" className="font-bold text-[#0B1220] hover:underline inline-flex items-center gap-1">
              Floor Line Allotments <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Activities Feed (5 Cols / ~40%) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-black/15 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0B1220]" />
                  Recent Activities
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time factory floor log events
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsActivityDrawerOpen(true)}
                className="text-xs font-bold text-[#0B1220] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentActivities.slice(0, 5).map(act => {
                const isQC = act.type === 'QC' || act.type === 'QC_PASS'
                const isReject = act.type === 'QC_REJECT'
                const isStore = act.type === 'STORE' || act.type === 'STORE_INWARD'
                const isDispatch = act.type === 'DISPATCH'

                return (
                  <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/70 transition-all">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isQC ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      isReject ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      isStore ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      isDispatch ? 'bg-purple-50 text-purple-600 border-purple-200' :
                      'bg-teal-50 text-[#0B1220] border-teal-200'
                    }`}>
                      {isQC ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isReject ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isStore ? (
                        <Boxes className="w-4 h-4" />
                      ) : isDispatch ? (
                        <Truck className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {act.title}
                        </p>
                        <span className="text-[10.5px] font-mono text-slate-400 shrink-0 font-medium">
                          {act.relativeTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                        {act.details}
                      </p>
                      {act.lineman && act.lineman !== 'Unassigned Floor' && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#0B1220]">
                          <UserCheck className="w-3.5 h-3.5 text-[#0B1220]" />
                          <span>Lineman: {act.lineman}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {recentActivities.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  No recent activities recorded.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4">
            <button 
              type="button"
              onClick={() => setIsActivityDrawerOpen(true)}
              className="text-xs font-bold text-[#0B1220] hover:text-[#162032] inline-flex items-center justify-center gap-1.5 w-full py-2 bg-[#F0FDFA] hover:bg-teal-50 rounded-xl border border-black/15 shadow-2xs transition-all cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#0B1220]" /> Full Factory Audit Logs ({recentActivities.length})
            </button>
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
                  <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
                    {activeDrilldownStage === 'TOTAL_STOCKS' && <Warehouse className="w-5 h-5 text-[#0B1220]" />}
                    {activeDrilldownStage === 'GOODS_IN_LINE' && <Activity className="w-5 h-5 text-[#0B1220]" />}
                    {activeDrilldownStage === 'MENDING_CHECKING' && <AlertTriangle className="w-5 h-5 text-[#0B1220]" />}
                    {activeDrilldownStage === 'READY_GOODS' && <PackageCheck className="w-5 h-5 text-[#0B1220]" />}
                    {activeDrilldownStage === 'RTO' && <RotateCcw className="w-5 h-5 text-[#0B1220]" />}
                    {activeDrilldownStage === 'READY_DELIVERY' && <Truck className="w-5 h-5 text-[#0B1220]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
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
                <div className="p-2.5 rounded-xl bg-white border border-black/15 shadow-2xs">
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

                <div className="p-2.5 rounded-xl bg-white border border-black/15 shadow-2xs">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                    Filter Brand
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-[#0B1220] mt-0.5 truncate">
                    {selectedBrand === 'ALL' ? 'All Brands' : selectedBrand}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-black/15 shadow-2xs">
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
                  className="w-full text-xs pl-8 pr-7 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 text-slate-800 placeholder:text-slate-400 font-medium transition-all"
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
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/15 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 mx-auto flex items-center justify-center shadow-2xs">
                        <Warehouse className="w-6 h-6 text-[#0B1220]" />
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1220] hover:bg-[#162032] transition-all shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#0B1220]" /> + New Production Order
                        </Link>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-black/15 shadow-2xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Pipeline Target Allotments</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                          {filteredDrawerAllotments.length} Active Lots
                        </span>
                      </div>
                      <Link 
                        href="/allotments"
                        className="text-xs font-bold text-[#0B1220] hover:underline inline-flex items-center gap-1"
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
                        <div key={al.id} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all">
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
                                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
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
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/15 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 mx-auto flex items-center justify-center shadow-2xs">
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1220] hover:bg-[#162032] transition-all shadow-xs"
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
                        <Users className="w-3.5 h-3.5 text-[#0B1220]" />
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
                          className="text-[#0B1220] hover:underline cursor-pointer"
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
                        <div key={group.key} className="rounded-xl border border-black/15 bg-white shadow-2xs overflow-hidden transition-all">
                          <button
                            type="button"
                            onClick={() => toggleLineman(group.key)}
                            className="w-full text-left p-3.5 bg-white hover:bg-slate-50/90 flex items-center justify-between gap-3 transition-colors cursor-pointer border-b border-transparent data-[open=true]:border-slate-100"
                            data-open={isExpanded}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
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
                                const lotAssignments = (workerAssignments || []).filter(w => 
                                  w.allotment_id === al.id || (!w.allotment_id && w.article_id === al.article_id && w.lineman_id === al.lineman_id)
                                )
                                const currentTab = articleCardTabs[al.id] || 'matrix'

                                return (
                                  <div key={al.id} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all">
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
                                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
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
                                        {al.mending_status === 'PENDING_MENDING' || al.mending_status === 'IN_MENDING' ? (
                                           <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200" title={`Handed to ${al.mending_supervisor_name || 'Mending'}`}>
                                             AT MENDING ({al.mending_supervisor_name || 'In-Charge'})
                                           </span>
                                         ) : (
                                           <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                             {al.status || 'IN SEWING'}
                                           </span>
                                         )}
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

                                    {/* View Switcher: Matrix vs Tailor Operations */}
                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                                      <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
                                          <button
                                            type="button"
                                            onClick={() => setArticleCardTabs(prev => ({ ...prev, [al.id]: 'matrix' }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                              currentTab === 'matrix'
                                                ? 'bg-white text-slate-900 shadow-2xs border border-black/15'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                          >
                                            <Layers className="w-3.5 h-3.5 text-[#0B1220]" />
                                            <span>Color × Size Matrix</span>
                                            {lotVariants.length > 0 && (
                                              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                {lotVariants.length}
                                              </span>
                                            )}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setArticleCardTabs(prev => ({ ...prev, [al.id]: 'workers' }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                              currentTab === 'workers'
                                                ? 'bg-[#0B1220] text-white shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                          >
                                            <Users className="w-3.5 h-3.5" />
                                            <span>Tailor & Worker Operations</span>
                                            <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                              currentTab === 'workers' 
                                                ? 'bg-white/20 text-white border border-white/20' 
                                                : 'bg-slate-200 text-slate-700'
                                            }`}>
                                              {lotAssignments.length}
                                            </span>
                                          </button>
                                        </div>

                                        {lotAssignments.length > 0 && (
                                          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>
                                              {lotAssignments.filter(a => a.status === 'DONE').length}/{lotAssignments.length} Operations Done
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {currentTab === 'matrix' ? (
                                        <VariantMatrixTable variants={lotVariants} />
                                      ) : (
                                        <div className="pt-1">
                                          <WorkerAssignmentsTable 
                                            assignments={lotAssignments}
                                            stitchingRate={art?.stitching_rate}
                                            targetQty={al.target_qty}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                                      <Link 
                                        href="/allotments"
                                        className="text-[11px] font-bold text-[#0B1220] hover:underline inline-flex items-center gap-1"
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

              {/* STAGE 3: MENDING & CHECKING (MENDING FLOOR RECONCILIATION & QC ALTERATION) */}
              {activeDrilldownStage === 'MENDING_CHECKING' && (() => {
                const mendingFloorLots = filteredData.allotments.filter(al =>
                  al.status !== 'CANCELLED' &&
                  (al.mending_status === 'PENDING_MENDING' || al.mending_status === 'IN_MENDING' ||
                   (al.status === 'COMPLETED' && (!al.qc_status || al.qc_status === 'PENDING_STITCHING')))
                ).filter(al => {
                  if (!drawerSearchQuery.trim()) return true
                  const s = drawerSearchQuery.toLowerCase()
                  const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                  const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                  return (
                    (art?.art_no || '').toLowerCase().includes(s) ||
                    (lm?.username || '').toLowerCase().includes(s) ||
                    (al.mending_supervisor_name || '').toLowerCase().includes(s) ||
                    (al.handed_to_mending_by || '').toLowerCase().includes(s)
                  )
                })

                const qcDefects = filteredData.qc.filter(q => {
                  if (!drawerSearchQuery.trim()) return true
                  const s = drawerSearchQuery.toLowerCase()
                  return (
                    (q.article?.art_no || '').toLowerCase().includes(s) ||
                    (q.defect_type || '').toLowerCase().includes(s)
                  )
                })

                return (
                  <div className="space-y-4">
                    {/* Stage Summary Banner */}
                    <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between shadow-2xs flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700 shadow-2xs">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-indigo-950">Mending & Quality Inspection Department</p>
                          <p className="text-[11px] text-indigo-800 mt-0.5">
                            {metrics.mendingFloorCount} active lot{metrics.mendingFloorCount === 1 ? '' : 's'} in mending ({metrics.mendingFloorPcs.toLocaleString()} pcs) • {metrics.mendingAlterationQty} defect alter pieces
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-950 bg-white px-3 py-1 rounded-full shadow-2xs border border-indigo-200">
                        {metrics.mendingChecking.toLocaleString()} pcs in Stage
                      </span>
                    </div>

                    {/* Section 1: Active Mending Floor Lots */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-[#0B1220]" />
                          <span>Mending Department Floor Lots ({mendingFloorLots.length})</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Piece Counting & 100% Handover
                        </span>
                      </div>

                      {mendingFloorLots.map((al) => {
                        const art = Array.isArray(al.articles) ? al.articles[0] : al.articles
                        const ch = Array.isArray(al.challans) ? al.challans[0] : al.challans
                        const lm = Array.isArray(al.profiles) ? al.profiles[0] : al.profiles
                        const lotVariants = (variants || []).filter(v => v.allotment_id === al.id)
                        const lotAssignments = (workerAssignments || []).filter(w =>
                          w.allotment_id === al.id || (!w.allotment_id && w.article_id === al.article_id && w.lineman_id === al.lineman_id)
                        )
                        const currentTab = articleCardTabs[al.id] || 'matrix'

                        return (
                          <div key={al.id} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all space-y-3">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                                    Art {art?.art_no || 'Style'}
                                  </span>
                                  {ch?.brand && (
                                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                                      {ch.brand}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                    <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>AT MENDING FLOOR</span>
                                  </span>
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
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block mt-1">
                                  100% Stitching Complete
                                </span>
                              </div>
                            </div>

                            {/* Chain of Custody & Handover Details */}
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">From: <strong className="text-slate-900">{al.handed_to_mending_by || lm?.username || 'Lineman'}</strong></span>
                                <span className="text-slate-300">➔</span>
                                <span className="text-slate-500">To: <strong className="text-indigo-900">{al.mending_supervisor_name || 'Mending In-Charge'}</strong></span>
                              </div>
                              {al.handed_to_mending_at && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {al.handed_to_mending_at.split('T')[0]} {al.handed_to_mending_at.split('T')[1]?.slice(0, 5)}
                                </span>
                              )}
                            </div>

                            {/* View Switcher: Matrix vs Tailor Operations */}
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => setArticleCardTabs(prev => ({ ...prev, [al.id]: 'matrix' }))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                      currentTab === 'matrix'
                                        ? 'bg-white text-slate-900 shadow-2xs border border-black/15 font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    <Layers className="w-3.5 h-3.5 text-[#0B1220]" />
                                    <span>Matrix ({lotVariants.length})</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setArticleCardTabs(prev => ({ ...prev, [al.id]: 'workers' }))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                      currentTab === 'workers'
                                        ? 'bg-[#0B1220] text-white shadow-2xs font-extrabold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                    }`}
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Tailor Piece Hisab ({lotAssignments.length})</span>
                                  </button>
                                </div>
                              </div>

                              {currentTab === 'matrix' ? (
                                <VariantMatrixTable variants={lotVariants} />
                              ) : (
                                <div className="pt-1">
                                  <WorkerAssignmentsTable 
                                    assignments={lotAssignments}
                                    stitchingRate={art?.stitching_rate}
                                    targetQty={al.target_qty}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {mendingFloorLots.length === 0 && (
                        <div className="text-center py-6 px-4 bg-slate-50/60 rounded-xl border border-slate-200/80 text-xs text-slate-400 font-medium">
                          No floor lots currently awaiting piece counting at Mending department.
                        </div>
                      )}
                    </div>

                    {/* Section 2: QC Alteration & Defect Logs */}
                    {qcDefects.length > 0 && (
                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            <span>QC Alteration & Defect Table ({qcDefects.length})</span>
                          </span>
                        </div>

                        {qcDefects.map((q, idx) => (
                          <div key={q.id || idx} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all">
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
                      </div>
                    )}
                  </div>
                )
              })()}

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
                    <div key={s.id || idx} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
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
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/15 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 mx-auto flex items-center justify-center shadow-2xs">
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1220] hover:bg-[#162032] transition-all shadow-xs"
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
                    <div key={s.id || idx} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
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
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/15 shadow-2xs space-y-3">
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
                      <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center shrink-0 text-[#0B1220] shadow-2xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Outward Delivery Challans & Gate Passes</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Consignments dispatched from factory to client buyer
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0B1220] bg-[#F0FDFA] px-3 py-1 rounded-full shadow-2xs border border-black/15">
                      {metrics.readyDelivery.toLocaleString()} pcs Dispatched
                    </span>
                  </div>

                  {filteredData.dispatch.map((d, idx) => (
                    <div key={d.id || idx} className="p-4 rounded-xl border border-black/15 bg-white shadow-2xs hover:border-black/25 transition-all flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            Challan #{d.challan_no}
                          </span>
                          <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                            {d.buyer_name || 'Buyer'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dispatched: {d.created_at?.split('T')[0]} • Status: <strong className="text-slate-800">{d.status || 'Delivered'}</strong>
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-[#0B1220] shrink-0 font-[family-name:var(--font-heading)]">
                        {d.total_pieces?.toLocaleString()} pcs
                      </span>
                    </div>
                  ))}

                  {filteredData.dispatch.length === 0 && (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-black/15 shadow-2xs space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 mx-auto flex items-center justify-center shadow-2xs">
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1220] hover:bg-[#162032] transition-all shadow-xs"
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
                className="px-4 py-2 text-xs font-bold bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. LIVE FACTORY ACTIVITIES & AUDIT LOG CENTERED MODAL      */}
      {/* ========================================================= */}
      {isActivityDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          
          {/* Translucent Dimmed & Blurred Backdrop - Click outside to close */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer animate-in fade-in duration-200"
            onClick={() => {
              setIsActivityDrawerOpen(false)
              setActivitySearchQuery('')
              setActivityFilter('ALL')
            }}
          />

          {/* Centered Floating Modal Container */}
          <div className="relative z-10 bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col justify-between border border-black/15 animate-in zoom-in-95 fade-in duration-200 overflow-hidden">

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
                    <Clock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs tracking-wider">
                        Live Feed
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)] truncate">
                        Factory Floor Activity Stream
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {recentActivities.length} real-time operations logged across plant
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsActivityDrawerOpen(false)
                    setActivitySearchQuery('')
                    setActivityFilter('ALL')
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-3.5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search activities by article, lineman, challan, or notes..."
                  value={activitySearchQuery}
                  onChange={e => setActivitySearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 focus:border-[#0B1220] transition-all"
                />
                {activitySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setActivitySearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                {[
                  { key: 'ALL', label: 'All Events', count: recentActivities.length },
                  { key: 'ALLOTMENT', label: 'Allotments', count: recentActivities.filter(a => a.type === 'ALLOTMENT' || a.type === 'PRODUCTION').length },
                  { key: 'QC', label: 'QC & Alter', count: recentActivities.filter(a => a.type === 'QC' || a.type === 'QC_PASS' || a.type === 'QC_REJECT').length },
                  { key: 'STORE', label: 'Store', count: recentActivities.filter(a => a.type === 'STORE' || a.type === 'STORE_INWARD').length },
                  { key: 'DISPATCH', label: 'Dispatch', count: recentActivities.filter(a => a.type === 'DISPATCH').length }
                ].map(chip => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setActivityFilter(chip.key as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activityFilter === chip.key
                        ? 'bg-[#0B1220] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activityFilter === chip.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {chip.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredActivitiesList.map(act => {
                const isQC = act.type === 'QC' || act.type === 'QC_PASS'
                const isReject = act.type === 'QC_REJECT'
                const isStore = act.type === 'STORE' || act.type === 'STORE_INWARD'
                const isDispatch = act.type === 'DISPATCH'
                const isAllot = act.type === 'ALLOTMENT' || act.type === 'PRODUCTION'

                return (
                  <div 
                    key={act.id} 
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-[#0B1220]/30 hover:shadow-xs transition-all flex items-start gap-3.5"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                      isQC ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      isReject ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      isStore ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      isDispatch ? 'bg-purple-50 text-purple-600 border-purple-200' :
                      'bg-indigo-50 text-indigo-600 border-indigo-200'
                    }`}>
                      {isQC ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                      ) : isReject ? (
                        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                      ) : isStore ? (
                        <Boxes className="w-5 h-5 stroke-[2.5]" />
                      ) : isDispatch ? (
                        <Truck className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Zap className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {act.title}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 shrink-0 font-semibold bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
                          {act.relativeTime}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium leading-relaxed">
                        {act.details}
                      </p>

                      {/* Structured Badges Row */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                        {act.lineman && act.lineman !== 'Unassigned Floor' && (
                          <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-[#0B1220] border border-indigo-200 font-mono text-[11px]">
                            <UserCheck className="w-3.5 h-3.5 text-[#0B1220]" />
                            <span>Lineman: {act.lineman}</span>
                          </span>
                        )}
                        {act.artNo && (
                          <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">
                            <Tag className="w-3.5 h-3.5 text-slate-500" />
                            <span>Art: {act.artNo}{act.artDesc ? ` (${act.artDesc})` : ''}</span>
                          </span>
                        )}
                        {act.challanNo && (
                          <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-amber-700" />
                            <span>{act.challanNo}</span>
                          </span>
                        )}
                        {act.qty && (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px]">
                            <span>{act.qty.toLocaleString()} pcs</span>
                          </span>
                        )}
                        {act.location && (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-150 text-[10.5px]">
                            📍 {act.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredActivitiesList.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No matching activities found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try changing your search terms or filter selection.
                  </p>
                  {activitySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setActivitySearchQuery('')}
                      className="mt-3 text-xs font-bold text-[#0B1220] hover:underline cursor-pointer"
                    >
                      Clear Search Query
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/90 shrink-0 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredActivitiesList.length} of {recentActivities.length} logs
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsActivityDrawerOpen(false)
                  setActivitySearchQuery('')
                  setActivityFilter('ALL')
                }}
                className="px-4 py-2 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                Close Feed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
