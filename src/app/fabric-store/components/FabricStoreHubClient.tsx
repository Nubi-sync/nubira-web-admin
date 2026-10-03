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
      
      {/* 1. Header Banner - Clean, Human, Simple English */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <Layers className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Fabric &amp; Store
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
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

      {/* 2. Top 4 KPI Boxes - STRICT BRAND STANDARD: ONE HEADER & THE NUMBER ONLY, NO OTHER COLOR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Cloth in Store */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Cloth in Store
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalClothMeters.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">m</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Scissors className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 2: Cloth Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Cloth Assigned
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalClothAssignedMeters.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">m</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Layers className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 3: Trims in Store */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Trims in Store
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalTrimUnitsInStore.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Boxes className="w-5 h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Box 4: Trims Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Trims Assigned
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1220] font-mono">
              {kpis.totalTrimAssignedUnits.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">pcs</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <PackageCheck className="w-5 h-5 text-[#0B1220]" />
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
              <Scissors className="w-6 h-6 text-[#0B1220]" />
              Cloth Left in Store
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              {filteredFabrics.length} {filteredFabrics.length === 1 ? 'Cloth Type' : 'Cloth Types'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
            {/* Simple Status Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFabricFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  fabricFilter === 'ALL'
                    ? 'bg-white text-[#0B1220] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-[#0B1220]'
                }`}
              >
                All Cloth
              </button>
              <button
                type="button"
                onClick={() => setFabricFilter('ASSIGNED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  fabricFilter === 'ASSIGNED'
                    ? 'bg-white text-[#0B1220] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-[#0B1220]'
                }`}
              >
                Assigned
              </button>
              <button
                type="button"
                onClick={() => setFabricFilter('UNASSIGNED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  fabricFilter === 'UNASSIGNED'
                    ? 'bg-white text-[#0B1220] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-[#0B1220]'
                }`}
              >
                Free Stock
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsAddClothModalOpen(true)}
              className="min-h-[38px] px-3.5 py-1.5 bg-[#0B1220] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Record Cloth Inward</span>
            </button>
          </div>
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
          <div className="space-y-3">
            {paginatedFabrics.map((fabric) => {
              const isAssigned = Boolean(fabric.bookedForArticle) && fabric.bookedMeters > 0
              return (
                <div
                  key={fabric.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Cloth Name & Details */}
                  <div className="space-y-1.5 min-w-0 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-[#0B1220] font-[family-name:var(--font-heading)] leading-snug">
                        {fabric.fabricType}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {fabric.color}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                      <span>Rack: <strong className="text-slate-700 font-mono">{fabric.rackLocation}</strong></span>
                      <span>•</span>
                      <span>Rolls: <strong className="text-slate-700 font-mono">{fabric.totalRolls} rolls</strong></span>
                      {fabric.supplierName && (
                        <>
                          <span>•</span>
                          <span>Supplier: <strong className="text-slate-700">{fabric.supplierName}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column 1: Total in Store */}
                  <div className="space-y-0.5 min-w-[160px]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Left in Store
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0B1220]">
                      {fabric.totalMeters.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">meters</span>
                    </div>
                  </div>

                  {/* Middle Column 2: Assigned to Article */}
                  <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 min-w-[280px] max-w-sm space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Assigned Article:</span>
                      {isAssigned ? (
                        <span className="font-mono font-bold text-[#0B1220] bg-white border border-slate-300 px-2 py-0.5 rounded-md shadow-2xs">
                          {fabric.bookedForArticle}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Free Stock</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0B1220]">
                      <span>{fabric.bookedMeters.toLocaleString()} m assigned</span>
                      <span>{fabric.allocationPercentage}%</span>
                    </div>

                    {/* Clean Progress Bar in Brand Dark */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#0B1220] h-full transition-all duration-300"
                        style={{ width: `${fabric.allocationPercentage}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                      <span>Free Left: <strong className="text-[#0B1220]">{fabric.availableMeters.toLocaleString()} m</strong></span>
                      {fabric.articlePo && <span>PO: <strong className="text-[#0B1220]">{fabric.articlePo}</strong></span>}
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAssignModal(fabric)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#0B1220] border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs hover:border-[#0B1220] flex items-center gap-1.5"
                    >
                      <span>Assign</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
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
              <Boxes className="w-6 h-6 text-[#0B1220]" />
              Required Trims &amp; Accessories
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15">
              {filteredTrims.length} {filteredTrims.length === 1 ? 'Trim Item' : 'Trim Items'}
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {trimCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setTrimCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  trimCategoryFilter === cat
                    ? 'bg-[#0B1220] text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Trims' : cat}
              </button>
            ))}
          </div>
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
          <div className="space-y-3">
            {paginatedTrims.map((trim) => {
              const isAssigned = Boolean(trim.assignedArticle) && trim.assignedQuantity > 0
              return (
                <div
                  key={trim.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Trim Item details */}
                  <div className="space-y-1.5 min-w-0 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-[#0B1220] font-[family-name:var(--font-heading)] leading-snug">
                        {trim.itemName}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {trim.category}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#F0FDFA] text-[#0B1220] border border-black/10">
                        {trim.unit}
                      </span>
                    </div>
                    {trim.notes && (
                      <p className="text-xs text-slate-500 font-medium">
                        {trim.notes}
                      </p>
                    )}
                  </div>

                  {/* Middle Column 1: Total in Store */}
                  <div className="space-y-0.5 min-w-[160px]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Left in Store
                    </span>
                    <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#0B1220]">
                      {trim.totalInStore.toLocaleString()}{' '}
                      <span className="text-xs font-normal text-slate-500">{trim.unit}</span>
                    </div>
                  </div>

                  {/* Middle Column 2: Article Allocation Card */}
                  <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 min-w-[280px] max-w-sm space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">Assigned Article:</span>
                      {isAssigned ? (
                        <span className="font-mono font-bold text-[#0B1220] bg-white border border-slate-300 px-2 py-0.5 rounded-md shadow-2xs">
                          {trim.assignedArticle}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">Free Stock</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#0B1220]">
                      <span>{trim.assignedQuantity.toLocaleString()} {trim.unit} assigned</span>
                      <span>{trim.allocationPercentage}%</span>
                    </div>

                    {/* Progress Bar in Brand Dark */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-[#0B1220] h-full transition-all duration-300"
                        style={{ width: `${trim.allocationPercentage}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between pt-0.5">
                      <span>Free Left: <strong className="text-[#0B1220]">{trim.freeQuantity.toLocaleString()} {trim.unit}</strong></span>
                      <span className="text-slate-500 font-medium">BOM Required</span>
                    </div>
                  </div>

                  {/* Right Status Badge in Brand Palette */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold border border-black/10 bg-[#F0FDFA] text-[#0B1220] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0B1220]" />
                      <span>Assigned</span>
                    </span>
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
