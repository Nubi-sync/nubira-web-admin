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
  Boxes
} from 'lucide-react'
import { MerchandisingOrder, OrderStatus, BomCosting, TnaMilestone, ExportShipment } from '../types/merchandising'
import { getOrders, MERCHANDISING_UPDATE_EVENT } from '../utils/merchandisingStorage'
import { CreateOrderModal } from '../orders/components/CreateOrderModal'

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
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [selectedStyleId, setSelectedStyleId] = useState<string>('ALL')
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false)
  const [styleSearchQuery, setStyleSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const reloadData = () => {
    setOrders(getOrders())
  }

  useEffect(() => {
    if (initialOrders && initialOrders.length > 0) {
      setOrders(initialOrders)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_merchandising_orders_v1', JSON.stringify(initialOrders))
      }
    } else {
      reloadData()
    }
    window.addEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(MERCHANDISING_UPDATE_EVENT, reloadData)
  }, [initialOrders])

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

  // Realistic recent commercial activity stream
  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      type: 'PO',
      title: 'PO-ZIG-8901 Released to Floor',
      details: '24,000 pcs • Zara Global (ZG-HOOD-01)',
      location: 'Commercial Desk',
      timestamp: '2026-09-11T16:00:00Z',
      relativeTime: '2 hrs ago'
    },
    {
      id: 'act-2',
      type: 'LAB_DIP',
      title: 'Lab Dip Approved by H&M Quality',
      details: 'Lemon Yellow Shade Sign-off (HM-TSH-102)',
      location: 'Testing Lab',
      timestamp: '2026-09-11T13:30:00Z',
      relativeTime: '5 hrs ago'
    },
    {
      id: 'act-3',
      type: 'BOM',
      title: 'BOM Variance Locked at ±0.8%',
      details: 'Ollypop Kids Raglan Tee (OP-KID-401)',
      location: 'Costing Audit',
      timestamp: '2026-09-11T10:00:00Z',
      relativeTime: '8 hrs ago'
    },
    {
      id: 'act-4',
      type: 'TRIM',
      title: 'Central Store Inward Cleared',
      details: '18,240 kg Single Jersey & Core Spun Thread',
      location: 'Central Store',
      timestamp: '2026-09-10T15:00:00Z',
      relativeTime: '1 day ago'
    },
    {
      id: 'act-5',
      type: 'CONTAINER',
      title: 'Container Handover Scheduled',
      details: 'MSCU-482019-4 (68.0 CBM) for Rotterdam',
      location: 'Dispatch Bay',
      timestamp: '2026-09-10T09:00:00Z',
      relativeTime: '1 day ago'
    },
    {
      id: 'act-6',
      type: 'AQL',
      title: 'Final AQL 2.5 Audit Passed',
      details: 'Mango Casuals 8,500 pcs packed for export',
      location: 'Finished Godown',
      timestamp: '2026-09-09T18:00:00Z',
      relativeTime: '2 days ago'
    }
  ]

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
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Merchandising &amp; Sourcing Desk
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                Commercial Engine Live
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Real-time buyer PO contracts, BOM costing variance, critical path T&amp;A, and container logistics
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New PO</span>
          </button>

          <Link
            href="/merchandising/sourcing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Layers className="w-4 h-4 text-[#3A3564]" />
            <span>Sourcing PR</span>
          </Link>

          <Link
            href="/merchandising/shipments"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-black/15 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
          >
            <Ship className="w-4 h-4 text-[#3A3564]" />
            <span>Container Manifest</span>
          </Link>
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
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#F2ECE1] border border-black/10'
              }`}
            >
              {brand === 'ALL' ? 'All Orders' : brand}
            </button>
          ))}
        </div>

        {/* Style Dropdown & Date Range Selector */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          
          {/* Searchable Style Filter Combobox */}
          <div className="relative w-full sm:w-64">
            <button
              type="button"
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className="w-full text-xs font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 cursor-pointer flex items-center justify-between gap-2 shadow-2xs transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-[#3A3564] shrink-0" />
                <span className="truncate">{selectedStyleDisplayText}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isStyleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {isStyleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsStyleMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[90vw] bg-white border border-black/10 rounded-2xl shadow-xl z-50 p-2.5 animate-in fade-in zoom-in-95 duration-100">
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={styleSearchQuery}
                      onChange={(e) => setStyleSearchQuery(e.target.value)}
                      placeholder="Search Style, PO, Description..."
                      className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 text-slate-900 placeholder:text-slate-400 font-semibold"
                    />
                    {styleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStyleSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Options */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStyleId('ALL')
                        setIsStyleMenuOpen(false)
                        setStyleSearchQuery('')
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        selectedStyleId === 'ALL'
                          ? 'bg-[#FAF7F0] text-[#3A3564] font-extrabold border border-black/10'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>All Buyer Styles ({availableStyles.length} styles)</span>
                      {selectedStyleId === 'ALL' && <Check className="w-4 h-4 text-[#3A3564] stroke-[2.5]" />}
                    </button>

                    {filteredStylesList.map(ord => {
                      const isSelected = selectedStyleId === ord.id
                      return (
                        <button
                          key={ord.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyleId(ord.id)
                            setIsStyleMenuOpen(false)
                            setStyleSearchQuery('')
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#FAF7F0] text-[#3A3564] font-extrabold border border-black/10'
                              : 'hover:bg-slate-50 text-slate-700 font-semibold'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-slate-900 block truncate">
                              {ord.style_ref} • {ord.po_number}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate font-medium">
                              {ord.style_name} ({ord.brand_name})
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#3A3564] stroke-[2.5] shrink-0 mt-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Date Filter Pills & Sync Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 shadow-2xs">
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
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    dateFilter === tab.id
                      ? 'bg-white text-[#3A3564] shadow-2xs font-extrabold'
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
              className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
              title="Sync latest live updates from commercial database"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 6-STAGE COMMERCIAL LIFECYCLE KPI CARDS (EXACT 6TH BOX)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* STAGE 1: ACTIVE BUYER POS */}
        <Link 
          href="/merchandising/orders"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 01
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                1. Active Buyer POs
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Order Pipeline Target
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              {totalBookedPcs.toLocaleString()}
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                {orders.length} Buyer POs
              </span>
            </div>
          </div>
        </Link>

        {/* STAGE 2: BOM COST REALIZATION */}
        <Link 
          href="/merchandising/costing"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <TrendingUp className="w-5 h-5" />
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
                2. BOM Cost Target
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Cost Variance Target
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              98.2%
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-emerald-800 border border-emerald-200 tracking-wider shadow-2xs">
                ±1.8% Variance
              </span>
            </div>
          </div>
        </Link>

        {/* STAGE 3: TRIM IN-HOUSE SOURCING */}
        <Link 
          href="/merchandising/sourcing"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#3A3564] transition-colors">
                  STAGE 03
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#3A3564] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block truncate">
                3. Trim In-House
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Central Store Sourcing
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              100%
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                Zero Line Stop
              </span>
            </div>
          </div>
        </Link>

        {/* STAGE 4: TIME & ACTION (T&A) GATES */}
        <Link 
          href="/merchandising/tna-calendar"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Calendar className="w-5 h-5" />
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
                4. Critical Path SLA
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                T&amp;A Milestone Gates
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              92.5%
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                8 Gates Tracked
              </span>
            </div>
          </div>
        </Link>

        {/* STAGE 5: EXPORT LOGISTICS & CONTAINERS */}
        <Link 
          href="/merchandising/shipments"
          className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 hover:border-[#3A3564]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative shadow-2xs select-none hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#3A3564] group-hover:text-white group-hover:border-[#3A3564] transition-colors">
                <Ship className="w-5 h-5" />
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
                5. Export Container
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                FOB Booked Vessels
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              192.0
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider shadow-2xs">
                3 Boxes Booked
              </span>
            </div>
          </div>
        </Link>

        {/* STAGE 6: ON-TIME DELIVERY (OTD) */}
        <Link 
          href="/merchandising/shipments"
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
                6. On-Time Delivery
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Ex-Factory Compliance
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100/80">
            <h3 className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900 leading-none">
              97.8%
            </h3>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-emerald-800 border border-emerald-200 tracking-wider shadow-2xs">
                Port Cut-Off OK
              </span>
            </div>
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
              Total Booked: <strong className="text-slate-900 font-mono">{totalBookedPcs.toLocaleString()} pcs</strong>
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
          <div className="bg-white border border-black/10 border-l-4 border-l-emerald-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                1. Fabric Inward
              </span>
              <span className="text-xs font-extrabold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                92%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                18,240 <span className="text-xs font-normal text-slate-400">kg</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">Cleared Lab</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '92%' }}
              />
            </div>
          </div>

          {/* Flow 2: Bulk Cutting */}
          <div className="bg-white border border-black/10 border-l-4 border-l-indigo-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                2. Bulk Cutting
              </span>
              <span className="text-xs font-extrabold font-mono text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                78%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                78% <span className="text-xs font-normal text-slate-400">Cut</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">Ratio OK</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '78%' }}
              />
            </div>
          </div>

          {/* Flow 3: Sewing Floor */}
          <div className="bg-white border border-black/10 border-l-4 border-l-blue-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                3. Sewing Floor
              </span>
              <span className="text-xs font-extrabold font-mono text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                64%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                64% <span className="text-xs font-normal text-slate-400">WIP</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">88% Output</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '64%' }}
              />
            </div>
          </div>

          {/* Flow 4: Washing & Special Finish */}
          <div className="bg-white border border-black/10 border-l-4 border-l-amber-500 rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                4. Washing &amp; Finish
              </span>
              <span className="text-xs font-extrabold font-mono text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                42%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                42% <span className="text-xs font-normal text-slate-400">Done</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">In Drum</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '42%' }}
              />
            </div>
          </div>

          {/* Flow 5: Final AQL & Carton Pack */}
          <div className="bg-white border border-black/10 border-l-4 border-l-[#3A3564] rounded-xl p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                5. Carton Pack (AQL)
              </span>
              <span className="text-xs font-extrabold font-mono text-[#3A3564] bg-[#FAF7F0] border border-black/10 px-2 py-0.5 rounded-full shadow-2xs">
                30%
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-slate-900">
                30% <span className="text-xs font-normal text-slate-400">Packed</span>
              </p>
              <span className="text-[10px] font-medium text-slate-400">AQL 2.5 Audit</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#3A3564] h-full rounded-full transition-all duration-500" 
                style={{ width: '30%' }}
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
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono text-[#3A3564]">
                        {ord.po_number}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-indigo-600">
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
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                        {ord.total_quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {ord.currency === 'INR' ? '₹' : ord.currency === 'USD' ? '$' : '€'}
                        {ord.unit_fob_price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {ord.currency === 'INR' ? '₹' : ord.currency === 'USD' ? '$' : '€'}
                        {ord.total_contract_value.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ord.status === 'IN_PRODUCTION'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : ord.status === 'PACKED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ord.status === 'IN_FABRIC'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/merchandising/costing"
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 shadow-2xs"
                          >
                            BOM Cost
                          </Link>
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
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                        No active commercial orders found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Commercial Activity Stream (1 Col) */}
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                Commercial Activity Stream
              </h3>
              <Clock className="w-[18px] h-[18px] text-slate-400" />
            </div>

            <div className="mt-4 space-y-2.5">
              {activities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-[#FAF7F0]/60 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
                    {act.type === 'PO' ? (
                      <Briefcase className="w-4 h-4 text-[#3A3564]" />
                    ) : act.type === 'LAB_DIP' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : act.type === 'BOM' ? (
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                    ) : act.type === 'TRIM' ? (
                      <Boxes className="w-4 h-4 text-amber-600" />
                    ) : act.type === 'CONTAINER' ? (
                      <Ship className="w-4 h-4 text-[#3A3564]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
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
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Real-time ERP Synchronization</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
