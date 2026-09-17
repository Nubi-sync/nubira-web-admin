'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Briefcase, 
  TrendingUp, 
  PackageCheck, 
  Ship, 
  ArrowUpRight, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ChevronRight,
  ChevronDown,
  Calendar,
  Layers,
  Truck,
  RotateCcw,
  Check,
  X,
  FileSpreadsheet,
  Boxes,
  Users,
  Building2
} from 'lucide-react'
import { 
  MerchandisingOrder, 
  OrderStatus, 
  BomCosting, 
  TnaMilestone, 
  ExportShipment, 
  SourcingRequisition,
  ActiveBuyer
} from '../types/merchandising'
import { 
  getOrders, 
  getBomCostings, 
  getTnaMilestones, 
  getSourcingRequisitions, 
  getShipments, 
  getActiveBuyers,
  getAvailableTechPackArticles,
  AvailableTechPackArticle,
  MERCHANDISING_UPDATE_EVENT 
} from '../utils/merchandisingStorage'
import { CreateOrderModal } from '../orders/components/CreateOrderModal'
import { EmptyState } from '@/components/ui/EmptyState'

type DateFilter = 'today' | 'week' | 'month' | 'all'

interface ActivityItem {
  id: string
  type: 'PO' | 'LAB_DIP' | 'BOM' | 'TRIM' | 'CONTAINER' | 'AQL'
  title: string
  details: string
  location: string
  timestamp: string
  relativeTime: string
}

interface MerchandisingDashboardClientProps {
  initialOrders?: MerchandisingOrder[]
  initialBomCostings?: BomCosting[]
  initialMilestones?: TnaMilestone[]
  initialShipments?: ExportShipment[]
}

export function MerchandisingDashboardClient({
  initialOrders,
  initialBomCostings,
  initialMilestones,
  initialShipments
}: MerchandisingDashboardClientProps = {}) {
  const [orders, setOrders] = useState<MerchandisingOrder[]>(() => {
    if (initialOrders && initialOrders.length > 0) return initialOrders
    return []
  })
  const [costings, setCostings] = useState<BomCosting[]>(() => {
    if (initialBomCostings && initialBomCostings.length > 0) return initialBomCostings
    return []
  })
  const [milestones, setMilestones] = useState<TnaMilestone[]>(() => {
    if (initialMilestones && initialMilestones.length > 0) return initialMilestones
    return []
  })
  const [shipments, setShipments] = useState<ExportShipment[]>(() => {
    if (initialShipments && initialShipments.length > 0) return initialShipments
    return []
  })
  const [sourcingPrs, setSourcingPrs] = useState<SourcingRequisition[]>([])
  const [buyers, setBuyers] = useState<ActiveBuyer[]>([])
  const [techPackArticles, setTechPackArticles] = useState<AvailableTechPackArticle[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedStyleId, setSelectedStyleId] = useState<string>('ALL')
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)
  const [styleSearchQuery, setStyleSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const reloadData = () => {
    const localOrders = getOrders()
    const localCostings = getBomCostings()
    const localMilestones = getTnaMilestones()
    const localShipments = getShipments()
    const localSourcing = getSourcingRequisitions()
    const localBuyers = getActiveBuyers()
    const localArticles = getAvailableTechPackArticles()

    setOrders(localOrders && localOrders.length > 0 ? localOrders : (initialOrders || []))
    setCostings(localCostings && localCostings.length > 0 ? localCostings : (initialBomCostings || []))
    setMilestones(localMilestones && localMilestones.length > 0 ? localMilestones : (initialMilestones || []))
    setShipments(localShipments && localShipments.length > 0 ? localShipments : (initialShipments || []))
    setSourcingPrs(localSourcing || [])
    setBuyers(localBuyers || [])
    setTechPackArticles(localArticles || [])
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    window.addEventListener('zigza_tech_packs_updated', reloadData)
    return () => {
      window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
      window.removeEventListener('zigza_tech_packs_updated', reloadData)
    }
  }, [initialOrders, initialBomCostings, initialMilestones, initialShipments])

  const handleManualSync = () => {
    setIsSyncing(true)
    reloadData()
    setTimeout(() => {
      setIsSyncing(false)
    }, 600)
  }

  // Extract unique brands
  const uniqueBrands = ['ALL', ...Array.from(new Set(orders.map(o => o.brand_name)))]

  // Filter orders by brand, style, and status
  const filteredOrders = orders.filter(ord => {
    const matchesBrand = selectedBrand === 'ALL' || ord.brand_name === selectedBrand
    const matchesStyle = selectedStyleId === 'ALL' || ord.id === selectedStyleId
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter
    return matchesBrand && matchesStyle && matchesStatus
  })

  // Styles list for searchable combobox
  const availableStyles = selectedBrand === 'ALL' 
    ? orders 
    : orders.filter(o => o.brand_name === selectedBrand)

  const filteredStylesList = availableStyles.filter(o => 
    o.style_ref.toLowerCase().includes(styleSearchQuery.toLowerCase()) ||
    o.style_name.toLowerCase().includes(styleSearchQuery.toLowerCase()) ||
    o.po_number.toLowerCase().includes(styleSearchQuery.toLowerCase())
  )

  const selectedStyleDisplayText = selectedStyleId === 'ALL'
    ? `All Buyer Styles (${availableStyles.length} styles)`
    : orders.find(o => o.id === selectedStyleId)?.style_ref || 'Selected Style'

  // Dynamic calculations
  const totalBookedPcs = orders.reduce((acc, curr) => acc + curr.total_quantity, 0)
  const activeOrdersCount = orders.filter(o => o.status !== 'CLOSED' && o.status !== 'DISPATCHED').length
  const hasOrders = orders.length > 0

  // Tech Pack Active Articles count
  const activeArticlesCount = techPackArticles.length

  // Contracted In-Order pieces from linked Active Buyers
  const linkedBuyers = buyers.filter(b => Boolean(b.linked_article_number))
  const totalInOrderPieces = linkedBuyers.reduce((sum, b) => sum + (Number(b.contracted_volume) || 0), 0)

  // Dynamic Costing metrics
  const hasCostings = costings.length > 0
  const meanTargetMargin = hasCostings
    ? (costings.reduce((sum, c) => sum + (c.target_margin_percent || 15), 0) / costings.length).toFixed(1)
    : '0.0'
  const meanVariance = hasCostings
    ? (costings.reduce((sum, c) => sum + Math.abs(c.variance_percent || 0), 0) / costings.length).toFixed(1)
    : '0.0'

  // Dynamic Trim In-House metrics
  const hasSourcing = sourcingPrs.length > 0
  const inHousePrsCount = sourcingPrs.filter(p => p.fulfillment_status === 'STORE_RECEIVED').length
  const trimInHousePct = hasSourcing ? Math.round((inHousePrsCount / sourcingPrs.length) * 100) : 0

  // Dynamic Critical Path SLA (T&A)
  const totalGates = milestones.length
  const clearedGates = milestones.filter(m => m.status === 'COMPLETED').length
  const slaPct = totalGates > 0 ? ((clearedGates / totalGates) * 100).toFixed(1) : '0.0'

  // Dynamic Export Container / Shipments
  const bookedContainers = shipments.length
  const hasShipments = shipments.length > 0

  // Dynamic 5-Stage Live Conversion Health
  const isFabricInwardCleared = milestones.some(m => m.milestone_name?.toUpperCase().includes('FABRIC INWARD') && m.status === 'COMPLETED')
  const isCuttingCleared = milestones.some(m => m.milestone_name?.toUpperCase().includes('CUTTING') && m.status === 'COMPLETED')
  const isSewingCleared = milestones.some(m => m.milestone_name?.toUpperCase().includes('SEWING') && m.status === 'COMPLETED')
  const isWashingCleared = milestones.some(m => m.milestone_name?.toUpperCase().includes('WASHING') && m.status === 'COMPLETED')
  const isPackingCleared = milestones.some(m => (m.milestone_name?.toUpperCase().includes('AQL') || m.milestone_name?.toUpperCase().includes('PACK')) && m.status === 'COMPLETED')

  // Real commercial activity stream derived from real live orders
  const activities: ActivityItem[] = orders.length === 0
    ? []
    : orders.slice(0, 6).map((ord, idx) => ({
        id: `act-${ord.id || idx}`,
        type: 'PO' as const,
        title: `PO ${ord.po_number} Active`,
        details: `${ord.total_quantity.toLocaleString()} pcs • ${ord.brand_name} (${ord.style_ref})`,
        location: 'Commercial Desk',
        timestamp: ord.created_at || new Date().toISOString(),
        relativeTime: 'Active'
      }))

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* ========================================================= */}
      {/* 1. PAGE HEADER CARD (EXACT 6TH BOX THEME)                  */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Merchandising &amp; Sourcing Desk
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Real-time buyer PO contracts and critical path T&amp;A tracking
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/merchandising/buyers"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#3A3564]" />
            <span>Active Buyers</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New PO</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. FILTER & TIME RANGE CONTROL BAR (EXACT 6TH BOX THEME)   */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            BRAND:
          </span>
          {uniqueBrands.map(brand => (
            <button
              key={brand}
              type="button"
              onClick={() => {
                setSelectedBrand(brand)
                setSelectedStyleId('ALL')
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                selectedBrand === brand
                  ? 'bg-[#3A3564] text-white'
                  : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#F2ECE1] border border-black/10'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Right Filter Cluster: Style Picker + Search + Sync */}
        <div className="flex items-center gap-2.5 flex-wrap xl:flex-nowrap justify-end">
          
          {/* Style Selector Searchable Dropdown */}
          <div className="relative min-w-[220px]">
            <button
              type="button"
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 text-[#3A3564] shrink-0" />
                <span className="truncate">{selectedStyleDisplayText}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStyleMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-black/10 shadow-xl z-30 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={styleSearchQuery}
                    onChange={e => setStyleSearchQuery(e.target.value)}
                    placeholder="Filter styles or PO #..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStyleId('ALL')
                      setIsStyleMenuOpen(false)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedStyleId === 'ALL'
                        ? 'bg-[#3A3564] text-white'
                        : 'text-slate-700 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <span>All Buyer Styles</span>
                    {selectedStyleId === 'ALL' && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {filteredStylesList.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSelectedStyleId(st.id)
                        setIsStyleMenuOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                        selectedStyleId === st.id
                          ? 'bg-[#3A3564] text-white font-bold'
                          : 'text-slate-700 hover:bg-[#FAF7F0]'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono font-bold">{st.style_ref}</span>
                        <span className="text-[10px] opacity-75 ml-1.5">({st.po_number})</span>
                      </div>
                      {selectedStyleId === st.id && <Check className="w-3 h-3 text-white shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF7F0] border border-black/10 shadow-2xs">
            {(['today', 'week', 'month', 'all'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setDateFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  dateFilter === tab
                    ? 'bg-[#3A3564] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>

          {/* Refresh Sync Button */}
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Sync latest live updates from commercial database"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. COMMERCIAL LIFECYCLE KPI CARDS                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* CARD 1: ACTIVE ARTICLES */}
        <Link 
          href="/design/tech-packs"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Active Articles
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none" suppressHydrationWarning>
              {activeArticlesCount}
            </h3>
          </div>
        </Link>

        {/* CARD 2: ACTIVE BUYER POS */}
        <Link 
          href="/merchandising/orders"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Active Buyer POs
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none" suppressHydrationWarning>
              {totalBookedPcs.toLocaleString('en-IN')}
            </h3>
          </div>
        </Link>

        {/* CARD 3: IN ORDER */}
        <Link 
          href="/merchandising/buyers"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
              <PackageCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              In Order
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none" suppressHydrationWarning>
              {totalInOrderPieces.toLocaleString('en-IN')}
            </h3>
          </div>
        </Link>

        {/* CARD 4: CRITICAL PATH SLA */}
        <Link 
          href="/merchandising/tna-calendar"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
              Critical Path SLA
            </span>
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 leading-none">
              {slaPct}%
            </h3>
          </div>
        </Link>

      </div>

      {/* ========================================================= */}
      {/* 4. LIVE CRITICAL PATH CONVERSION FLOW (EXACT 6TH BOX)      */}
      {/* ========================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Live Critical Path Milestone Health
              </h3>
              <p className="text-xs text-slate-500">Commercial lead-time and factory floor conversion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              Total Booked: <strong className="text-slate-900 font-mono" suppressHydrationWarning>{totalBookedPcs.toLocaleString('en-IN')} pcs</strong>
            </span>
            <Link
              href="/merchandising/tna-calendar"
              className="text-xs font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1"
            >
              Full T&amp;A Calendar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 5 Conversion Flow Stage Cards */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Flow 1: Fabric Inward */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                1. Fabric Inward
              </span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs ${isFabricInwardCleared ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-[#3A3564] bg-[#FAF7F0] border border-black/10'}`}>
                {isFabricInwardCleared ? '100%' : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900" suppressHydrationWarning>
                {isFabricInwardCleared ? `${Math.round(totalBookedPcs * 0.38).toLocaleString('en-IN')}` : '0'} <span className="text-xs font-normal text-slate-400">kg</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">{isFabricInwardCleared ? 'Cleared Lab' : 'Pending Inward'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: isFabricInwardCleared ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Flow 2: Bulk Cutting */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                2. Bulk Cutting
              </span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs ${isCuttingCleared ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-[#3A3564] bg-[#FAF7F0] border border-black/10'}`}>
                {isCuttingCleared ? '100%' : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {isCuttingCleared ? '100%' : '0%'} <span className="text-xs font-normal text-slate-400">Cut</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">{isCuttingCleared ? 'Ratio OK' : 'Pending Lay'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: isCuttingCleared ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Flow 3: Sewing Floor */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Sewing Floor
              </span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs ${isSewingCleared ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-[#3A3564] bg-[#FAF7F0] border border-black/10'}`}>
                {isSewingCleared ? '100%' : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {isSewingCleared ? '100%' : '0%'} <span className="text-xs font-normal text-slate-400">WIP</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">{isSewingCleared ? 'Output OK' : 'Pending Stitch'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: isSewingCleared ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Flow 4: Washing & Special Finish */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                4. Washing &amp; Finish
              </span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs ${isWashingCleared ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-[#3A3564] bg-[#FAF7F0] border border-black/10'}`}>
                {isWashingCleared ? '100%' : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {isWashingCleared ? '100%' : '0%'} <span className="text-xs font-normal text-slate-400">Done</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">{isWashingCleared ? 'In Drum' : 'Pending Wash'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: isWashingCleared ? '100%' : '0%' }}
              />
            </div>
          </div>

          {/* Flow 5: Final AQL & Carton Pack */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                5. Carton Pack (AQL)
              </span>
              <span className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs ${isPackingCleared ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' : 'text-[#3A3564] bg-[#FAF7F0] border border-black/10'}`}>
                {isPackingCleared ? '100%' : '0%'}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                {isPackingCleared ? '100%' : '0%'} <span className="text-xs font-normal text-slate-400">Packed</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">{isPackingCleared ? 'AQL 2.5 Passed' : 'Pending AQL'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: isPackingCleared ? '100%' : '0%' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. 2-COLUMN LOWER SECTION: ORDERS TABLE & ACTIVITY STREAM  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Commercial Orders Pipeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-[family-name:var(--font-heading)]">
                  Active Commercial Orders Pipeline
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Live buyer contracts with BOM variance and production floor handshake status
                </p>
              </div>
              <Link 
                href="/merchandising/orders"
                className="text-sm font-bold text-[#3A3564] hover:underline inline-flex items-center gap-1.5"
              >
                View All Orders <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 text-xs font-semibold">
              {['ALL', 'BOOKED', 'IN_FABRIC', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                      : 'text-slate-600 bg-[#FAF7F0] border border-black/5 hover:bg-black/5'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Table with Exact 6th Box Typography */}
            {filteredOrders.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={selectedBrand !== 'ALL' || selectedStyleId !== 'ALL' || statusFilter !== 'ALL' ? "No matching orders" : "No active commercial orders"}
                description={selectedBrand !== 'ALL' || selectedStyleId !== 'ALL' || statusFilter !== 'ALL' ? "Try adjusting your brand, style, or status filter." : "Register a buyer purchase order to begin tracking."}
                actionLabel="Book New PO"
                onAction={() => setIsCreateModalOpen(true)}
                secondaryActionLabel={selectedBrand !== 'ALL' || selectedStyleId !== 'ALL' || statusFilter !== 'ALL' ? "Reset Filters" : undefined}
                onSecondaryAction={selectedBrand !== 'ALL' || selectedStyleId !== 'ALL' || statusFilter !== 'ALL' ? () => {
                  setSelectedBrand('ALL')
                  setSelectedStyleId('ALL')
                  setStatusFilter('ALL')
                } : undefined}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                      <th className="py-2.5 px-3">PO Number</th>
                      <th className="py-2.5 px-3">Brand / Buyer</th>
                      <th className="py-2.5 px-3">Style Description</th>
                      <th className="py-2.5 px-3 text-right">Total Pcs</th>
                      <th className="py-2.5 px-3">Unit FOB</th>
                      <th className="py-2.5 px-3">Order Value</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredOrders.slice(0, 8).map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold font-mono text-[#3A3564]">
                          {ord.po_number}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {ord.brand_name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800 block">
                            {ord.style_ref}
                          </span>
                          <span className="block text-[10.5px] font-normal text-slate-400 truncate max-w-[200px]">
                            {ord.style_name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono" suppressHydrationWarning>
                          {ord.total_quantity.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {ord.currency === 'INR' ? '₹' : ord.currency === 'USD' ? '$' : '€'}
                          {ord.unit_fob_price.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900" suppressHydrationWarning>
                          {ord.currency === 'INR' ? '₹' : ord.currency === 'USD' ? '$' : '€'}
                          {ord.total_contract_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === 'PACKED' || ord.status === 'DISPATCHED'
                                ? 'bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold'
                                : ord.status === 'IN_PRODUCTION'
                                ? 'bg-slate-100 text-slate-800 border border-slate-200 font-semibold'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href="/merchandising/tna-calendar"
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3A3564] hover:bg-[#2A2649] text-white shadow-2xs"
                            >
                              T&amp;A
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Live Commercial Activity Stream (1 Col) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                Commercial Activity Stream
              </h3>
              <Clock className="w-[18px] h-[18px] text-[#3A3564]" />
            </div>

            <div className="mt-4 space-y-2.5">
              {activities.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No recent activity"
                  description="Activity logs appear automatically as purchase orders progress."
                  compact
                />
              ) : (
                activities.map(act => (
                  <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-[#FAF7F0]/60 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                      {act.type === 'PO' ? (
                        <Briefcase className="w-4 h-4 text-[#3A3564]" />
                      ) : act.type === 'LAB_DIP' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                      ) : act.type === 'BOM' ? (
                        <TrendingUp className="w-4 h-4 text-[#3A3564]" />
                      ) : act.type === 'TRIM' ? (
                        <Boxes className="w-4 h-4 text-[#3A3564]" />
                      ) : act.type === 'CONTAINER' ? (
                        <Ship className="w-4 h-4 text-[#3A3564]" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {act.title}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate mt-0.5 font-medium">
                        {act.details}
                      </span>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{act.location}</span>
                        <span>{act.relativeTime}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Real-time ERP Synchronization</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Connected
            </span>
          </div>
        </div>

      </div>

      {/* Modal: Form 1 Master Buyer PO Creation Stepper */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={reloadData}
      />

    </div>
  )
}
