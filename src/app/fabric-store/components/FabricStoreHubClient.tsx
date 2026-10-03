'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Scissors,
  Layers,
  Search,
  X,
  Boxes,
  PackageCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight
} from 'lucide-react'
import {
  FabricStoreHubData,
  FabricAllocationItem,
  TrimAllocationItem
} from '../actions'
import { getStoreAvatarInitials } from '../utils/storeUtils'
import { AssignFabricArticleModal } from './AssignFabricArticleModal'
import { AddClothModal } from './AddClothModal'

interface FabricStoreHubClientProps {
  hubData?: FabricStoreHubData
  companyName?: string
}

const ITEMS_PER_PAGE = 5

export function FabricStoreHubClient({
  hubData,
  companyName: propCompanyName
}: FabricStoreHubClientProps) {
  const router = useRouter()
  const companyName = hubData?.companyName || propCompanyName || 'Apparel Factory'

  // Data lists
  const [fabricsList, setFabricsList] = useState<FabricAllocationItem[]>(() => hubData?.fabrics || [])
  const [trimsList, setTrimsList] = useState<TrimAllocationItem[]>(() => hubData?.trims || [])

  useEffect(() => {
    if (hubData?.fabrics) setFabricsList(hubData.fabrics)
    if (hubData?.trims) setTrimsList(hubData.trims)
  }, [hubData])

  // Global search query
  const [searchQuery, setSearchQuery] = useState('')

  // Section 1: Fabric filter & pagination
  const [fabricFilter, setFabricFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL')
  const [fabricCurrentPage, setFabricCurrentPage] = useState(1)

  // Section 2: Trims filter & pagination
  const [trimCategoryFilter, setTrimCategoryFilter] = useState<string>('ALL')
  const [trimCurrentPage, setTrimCurrentPage] = useState(1)

  // Modals state
  const [selectedFabricForAssign, setSelectedFabricForAssign] = useState<FabricAllocationItem | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isAddClothModalOpen, setIsAddClothModalOpen] = useState(false)

  // Clean Toast notification
  const showToast = (msg: string) => {
    try {
      toast.success(msg, {
        style: {
          backgroundColor: '#FFFFFF',
          color: '#0B1220',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          fontWeight: '600'
        },
        icon: <CheckCircle2 className="w-5 h-5 text-[#0B1220] shrink-0" />
      })
    } catch (_) {}
  }

  // Filtered Fabrics
  const filteredFabrics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = fabricsList

    if (q) {
      list = list.filter(f => 
        f.fabricType.toLowerCase().includes(q) ||
        f.color.toLowerCase().includes(q) ||
        f.supplierName.toLowerCase().includes(q) ||
        (f.bookedForArticle || '').toLowerCase().includes(q) ||
        (f.articlePo || '').toLowerCase().includes(q) ||
        (f.buyerName || '').toLowerCase().includes(q) ||
        f.rackLocation.toLowerCase().includes(q)
      )
    }

    if (fabricFilter === 'ASSIGNED') {
      list = list.filter(f => Boolean(f.bookedForArticle) && f.bookedMeters > 0)
    } else if (fabricFilter === 'UNASSIGNED') {
      list = list.filter(f => !f.bookedForArticle || f.bookedMeters === 0 || f.availableMeters > 0)
    }

    return list
  }, [fabricsList, searchQuery, fabricFilter])

  // Filtered Trims
  const filteredTrims = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    let list = trimsList

    if (q) {
      list = list.filter(t => 
        t.itemName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.assignedArticle || '').toLowerCase().includes(q) ||
        (t.partyOrSupplier || '').toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q)
      )
    }

    if (trimCategoryFilter !== 'ALL') {
      list = list.filter(t => t.category.toLowerCase() === trimCategoryFilter.toLowerCase())
    }

    return list
  }, [trimsList, searchQuery, trimCategoryFilter])

  // Reset pagination on search change
  useEffect(() => {
    setFabricCurrentPage(1)
    setTrimCurrentPage(1)
  }, [searchQuery, fabricFilter, trimCategoryFilter])

  // Paginated Fabrics (5 per page)
  const totalFabricPages = Math.max(1, Math.ceil(filteredFabrics.length / ITEMS_PER_PAGE))
  const paginatedFabrics = useMemo(() => {
    const start = (fabricCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredFabrics.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredFabrics, fabricCurrentPage])

  // Paginated Trims (5 per page)
  const totalTrimPages = Math.max(1, Math.ceil(filteredTrims.length / ITEMS_PER_PAGE))
  const paginatedTrims = useMemo(() => {
    const start = (trimCurrentPage - 1) * ITEMS_PER_PAGE
    return filteredTrims.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredTrims, trimCurrentPage])

  // Unique Trim Categories
  const trimCategories = useMemo(() => {
    const cats = new Set(trimsList.map(t => t.category))
    return ['ALL', ...Array.from(cats)]
  }, [trimsList])

  // Dynamic KPIs calculation
  const kpis = useMemo(() => {
    const totalClothMeters = fabricsList.reduce((sum, f) => sum + f.totalMeters, 0)
    const totalClothAssignedMeters = fabricsList.reduce((sum, f) => sum + f.bookedMeters, 0)
    const totalTrimUnitsInStore = trimsList.reduce((sum, t) => sum + t.totalInStore, 0)
    const totalTrimAssignedUnits = trimsList.reduce((sum, t) => sum + t.assignedQuantity, 0)

    return {
      totalClothMeters,
      totalClothAssignedMeters,
      totalTrimUnitsInStore,
      totalTrimAssignedUnits
    }
  }, [fabricsList, trimsList])

  // Modal Actions
  const handleOpenAssignModal = (fabric: FabricAllocationItem) => {
    setSelectedFabricForAssign(fabric)
    setIsAssignModalOpen(true)
  }

  const handleAssignSuccess = (fabricId: string, articleNo: string, bookedMeters: number) => {
    setFabricsList(prev => prev.map(f => {
      if (f.id === fabricId) {
        const total = f.totalMeters
        const booked = bookedMeters
        const free = Math.max(0, total - booked)
        const pct = total > 0 ? Math.min(100, Math.round((booked / total) * 100)) : 0
        return {
          ...f,
          bookedForArticle: articleNo || null,
          bookedMeters: booked,
          availableMeters: free,
          allocationPercentage: pct
        }
      }
      return f
    }))
    showToast(`Cloth assigned to ${articleNo ? `Article ${articleNo}` : 'Free Stock'}`)
    router.refresh()
  }

  const handleAddClothSuccess = (newCloth: FabricAllocationItem) => {
    setFabricsList(prev => [newCloth, ...prev])
    showToast(`New cloth added to store`)
    router.refresh()
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      
      {/* 1. Header Banner - Matching Tab Header Standard */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Layers className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Fabric &amp; <span className="text-[#1D4ED8]">Store</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Cloth and trims left in store, and which article they are assigned to.
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="w-full sm:w-80 md:w-96 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cloth, color, trim, or article..."
              className="min-h-[42px] w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 4 Summary KPI Cards - Exact Typography & Hierarchy as First Screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Cloth in Store */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cloth in Store
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalClothMeters.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">m</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Godown Stock</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Scissors className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 2: Cloth Assigned */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cloth Assigned
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#1D4ED8] font-mono">
              {kpis.totalClothAssignedMeters.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">m</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Booked for Articles</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-[#1D4ED8]" />
          </div>
        </div>

        {/* Box 3: Trims in Store */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trims in Store
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalTrimUnitsInStore.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Inventory</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Boxes className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 4: Trims Assigned */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Trims Assigned
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
              {kpis.totalTrimAssignedUnits.toLocaleString('en-IN')}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              100% BOM Allocated
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: CLOTH LEFT IN STORE & ARTICLE ALLOCATION                 */}
      {/* =================================================================== */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2.5">
              <Scissors className="w-6 h-6 text-[#1D4ED8]" />
              Cloth Left in Store
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              {filteredFabrics.length} {filteredFabrics.length === 1 ? 'Cloth Type' : 'Cloth Types'}
            </span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
            {/* Status Filter Pills - As in Screenshot: Active #14C8B4, Inactive White with Slate Border */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFabricFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer border ${
                  fabricFilter === 'ALL'
                    ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                    : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Cloth
              </button>
              <button
                type="button"
                onClick={() => setFabricFilter('ASSIGNED')}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer border ${
                  fabricFilter === 'ASSIGNED'
                    ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                    : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                Assigned
              </button>
              <button
                type="button"
                onClick={() => setFabricFilter('UNASSIGNED')}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer border ${
                  fabricFilter === 'UNASSIGNED'
                    ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                    : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                Free Stock
              </button>
            </div>

            {/* Primary Action Button - Blue */}
            <button
              type="button"
              onClick={() => setIsAddClothModalOpen(true)}
              className="min-h-[42px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Record Cloth Inward</span>
            </button>
          </div>
        </div>

        {/* Desktop 12-Column Guide Header - Single Straight Line Alignment */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Cloth / Fabric Type</div>
          <div className="col-span-2 text-center">Left in Store</div>
          <div className="col-span-4 text-center">Assigned Article &amp; Progress</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Section 1 Item List */}
        {filteredFabrics.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1220]">No cloth records in store</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery 
                ? `No cloth matching "${searchQuery}". Clear your search to see all fabrics.` 
                : 'No fabric rolls have been recorded for this factory yet. Click "Record Cloth Inward" to add stock.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {paginatedFabrics.map((fabric) => {
              const isAssigned = Boolean(fabric.bookedForArticle) && fabric.bookedMeters > 0
              return (
                <div
                  key={fabric.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Desktop Clickable Row (12-column grid) */}
                  <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4">
                    {/* Col 1: Avatar Initials + Fabric Name & Specs (4 cols) */}
                    <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-sm tracking-wide">
                        {getStoreAvatarInitials(fabric.fabricType)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-[#0B1220] truncate">{fabric.fabricType}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {fabric.color}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium truncate">
                          Rack: <strong className="text-slate-700 font-mono">{fabric.rackLocation}</strong> • Rolls: <strong className="text-slate-700 font-mono">{fabric.totalRolls}</strong>
                          {fabric.supplierName && <> • Supplier: <strong className="text-slate-700">{fabric.supplierName}</strong></>}
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Left in Store (2 cols) */}
                    <div className="col-span-2 text-center">
                      <div className="text-base sm:text-lg font-extrabold font-mono text-[#0B1220]">
                        {fabric.totalMeters.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-slate-500">meters</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{fabric.totalRolls} Rolls</span>
                    </div>

                    {/* Col 3: Assigned Article & Progress Card (4 cols) */}
                    <div className="col-span-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">Assigned Article:</span>
                            {isAssigned ? (
                              <span className="font-mono font-bold text-[#0B1220] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-[11px]">
                                {fabric.bookedForArticle}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">Free Stock</span>
                            )}
                          </div>
                          <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40 shrink-0">
                            {fabric.allocationPercentage}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs font-mono font-bold text-slate-900">
                          <span>{fabric.bookedMeters.toLocaleString('en-IN')} meters assigned</span>
                        </div>

                        {/* Progress Bar in Royal Blue on Slate-100 Track */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                            style={{ width: `${fabric.allocationPercentage}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5 font-medium">
                          <span>Free Left: <strong className="text-[#0B1220] font-mono">{fabric.availableMeters.toLocaleString('en-IN')} m</strong></span>
                          {fabric.articlePo && <span>PO: <strong className="text-[#0B1220] font-mono">{fabric.articlePo}</strong></span>}
                        </div>
                      </div>
                    </div>

                    {/* Col 4: Action Button (2 cols) */}
                    <div className="col-span-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(fabric)}
                        className="min-h-[38px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shadow-blue-500/15 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <span>Assign</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Row Header (390px Viewport) */}
                  <div className="block md:hidden p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-xs tracking-wide">
                        {getStoreAvatarInitials(fabric.fabricType)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-[#0B1220] truncate">{fabric.fabricType}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {fabric.color} • {fabric.totalMeters.toLocaleString('en-IN')} meters left
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Card in Mobile */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 uppercase text-[11px]">Assigned: {fabric.bookedForArticle || 'Free Stock'}</span>
                        <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40">
                          {fabric.allocationPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#1D4ED8] h-full rounded-full"
                          style={{ width: `${fabric.allocationPercentage}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Assigned: <strong className="text-[#0B1220]">{fabric.bookedMeters.toLocaleString('en-IN')} m</strong></span>
                        <span>Free: <strong className="text-[#0B1220]">{fabric.availableMeters.toLocaleString('en-IN')} m</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(fabric)}
                      className="w-full min-h-[40px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Assign Cloth</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Pagination Controls for Section 1 */}
            {totalFabricPages > 1 && (
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">
                  Showing <strong className="text-[#0B1220]">{(fabricCurrentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{' '}
                  <strong className="text-[#0B1220]">
                    {Math.min(fabricCurrentPage * ITEMS_PER_PAGE, filteredFabrics.length)}
                  </strong>{' '}
                  of <strong className="text-[#0B1220]">{filteredFabrics.length}</strong> cloth types
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={fabricCurrentPage === 1}
                    onClick={() => setFabricCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold px-2 text-[#0B1220]">
                    {fabricCurrentPage} / {totalFabricPages}
                  </span>
                  <button
                    type="button"
                    disabled={fabricCurrentPage === totalFabricPages}
                    onClick={() => setFabricCurrentPage(prev => Math.min(totalFabricPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: REQUIRED TRIMS & ACCESSORIES                             */}
      {/* =================================================================== */}
      <div className="space-y-4 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2.5">
              <Boxes className="w-6 h-6 text-[#1D4ED8]" />
              Required Trims &amp; Accessories
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              {filteredTrims.length} {filteredTrims.length === 1 ? 'Trim Item' : 'Trim Items'}
            </span>
          </div>

          {/* Category Filter Pills - As in Screenshot: Active #14C8B4, Inactive White with Slate Border */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full text-xs font-semibold">
            {trimCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setTrimCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer border ${
                  trimCategoryFilter === cat
                    ? 'bg-[#14C8B4] text-[#0B1220] border-[#14C8B4] font-bold shadow-2xs'
                    : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Trims' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop 12-Column Guide Header - Single Straight Line Alignment */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Trim / Accessory Item</div>
          <div className="col-span-2 text-center">Left in Store</div>
          <div className="col-span-4 text-center">Assigned Article &amp; Progress</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Section 2 Item List */}
        {filteredTrims.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1220]">No trims recorded</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery 
                ? `No trims matching "${searchQuery}". Clear your search to view all items.` 
                : 'No required trims recorded for this factory.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {paginatedTrims.map((trim) => {
              const isAssigned = Boolean(trim.assignedArticle) && trim.assignedQuantity > 0
              return (
                <div
                  key={trim.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Desktop Clickable Row (12-column grid) */}
                  <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4">
                    {/* Col 1: Avatar Initials + Trim Name & Category (4 cols) */}
                    <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-sm tracking-wide">
                        {getStoreAvatarInitials(trim.itemName)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-[#0B1220] truncate">{trim.itemName}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {trim.category}
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-black/10">
                            {trim.unit}
                          </span>
                        </div>
                        {trim.notes && (
                          <div className="text-xs text-slate-500 font-medium truncate">
                            {trim.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Left in Store (2 cols) */}
                    <div className="col-span-2 text-center">
                      <div className="text-base sm:text-lg font-extrabold font-mono text-[#0B1220]">
                        {trim.totalInStore.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-slate-500">{trim.unit}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">BOM Unit</span>
                    </div>

                    {/* Col 3: Assigned Article & Progress Card (4 cols) */}
                    <div className="col-span-4">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">Assigned Article:</span>
                            {isAssigned ? (
                              <span className="font-mono font-bold text-[#0B1220] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-[11px]">
                                {trim.assignedArticle}
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium">Free Stock</span>
                            )}
                          </div>
                          <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full shadow-2xs text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40 shrink-0">
                            {trim.allocationPercentage}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs font-mono font-bold text-slate-900">
                          <span>{trim.assignedQuantity.toLocaleString('en-IN')} {trim.unit} assigned</span>
                        </div>

                        {/* Progress Bar in Royal Blue on Slate-100 Track */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#1D4ED8] h-full rounded-full transition-all duration-500"
                            style={{ width: `${trim.allocationPercentage}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5 font-medium">
                          <span>Free Left: <strong className="text-[#0B1220] font-mono">{trim.freeQuantity.toLocaleString('en-IN')} {trim.unit}</strong></span>
                          <span className="text-slate-500">BOM Required</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 4: Status Badge (2 cols) */}
                    <div className="col-span-2 flex items-center justify-end">
                      <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-black/10 bg-[#F0FDFA] text-[#0B1220] flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assigned</span>
                      </span>
                    </div>
                  </div>

                  {/* Mobile Row Header (390px Viewport) */}
                  <div className="block md:hidden p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-xs tracking-wide">
                        {getStoreAvatarInitials(trim.itemName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-[#0B1220] truncate">{trim.itemName}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {trim.category} • {trim.totalInStore.toLocaleString('en-IN')} {trim.unit} left
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Card in Mobile */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 border-l-4 border-l-[#14C8B4] shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600 uppercase text-[11px]">Assigned: {trim.assignedArticle || 'Free Stock'}</span>
                        <span className="text-xs font-extrabold font-mono px-2 py-0.5 rounded-full text-[#0B1220] bg-[#F0FDFA] border border-[#14C8B4]/40">
                          {trim.allocationPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#1D4ED8] h-full rounded-full"
                          style={{ width: `${trim.allocationPercentage}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Assigned: <strong className="text-[#0B1220]">{trim.assignedQuantity.toLocaleString('en-IN')} {trim.unit}</strong></span>
                        <span>Free: <strong className="text-[#0B1220]">{trim.freeQuantity.toLocaleString('en-IN')} {trim.unit}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Pagination Controls for Section 2 */}
            {totalTrimPages > 1 && (
              <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500 font-medium">
                  Showing <strong className="text-[#0B1220]">{(trimCurrentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{' '}
                  <strong className="text-[#0B1220]">
                    {Math.min(trimCurrentPage * ITEMS_PER_PAGE, filteredTrims.length)}
                  </strong>{' '}
                  of <strong className="text-[#0B1220]">{filteredTrims.length}</strong> trim items
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={trimCurrentPage === 1}
                    onClick={() => setTrimCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold px-2 text-[#0B1220]">
                    {trimCurrentPage} / {totalTrimPages}
                  </span>
                  <button
                    type="button"
                    disabled={trimCurrentPage === totalTrimPages}
                    onClick={() => setTrimCurrentPage(prev => Math.min(totalTrimPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignFabricArticleModal
        fabric={selectedFabricForAssign}
        activeArticles={hubData?.activeArticles || []}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
        companyName={companyName}
      />

      <AddClothModal
        activeArticles={hubData?.activeArticles || []}
        isOpen={isAddClothModalOpen}
        onClose={() => setIsAddClothModalOpen(false)}
        onSuccess={handleAddClothSuccess}
        companyName={companyName}
      />
    </div>
  )
}
