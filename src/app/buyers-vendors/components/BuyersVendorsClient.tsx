'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  Search,
  X,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  PackageCheck,
  Truck,
  Layers,
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Boxes,
  Waves,
  Flame,
  Store,
  Wrench,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  FileSpreadsheet,
  Info
} from 'lucide-react'
import {
  BuyersVendorsHubData,
  BuyerItem,
  BuyerArticleHistory,
  ModuleVendorItem
} from '../actions'
import { getBuyerAvatarInitials } from '../utils/buyerUtils'
import { ArticleContractDetailModal } from './ArticleContractDetailModal'
import { AssignVendorModal } from './AssignVendorModal'
import { AddBuyerModal } from './AddBuyerModal'

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Truck
}

interface BuyersVendorsClientProps {
  hubData?: BuyersVendorsHubData
  companyName?: string
}

const BUYERS_PER_PAGE = 5
const ARTICLES_PER_PAGE = 5

export function BuyersVendorsClient({
  hubData,
  companyName: propCompanyName
}: BuyersVendorsClientProps) {
  const router = useRouter()

  const companyName = hubData?.companyName || propCompanyName || 'Apparel Factory'
  
  // Local state for buyers and module vendors
  const [buyersList, setBuyersList] = useState<BuyerItem[]>(() => hubData?.buyers || [])
  const [moduleVendorsList, setModuleVendorsList] = useState<ModuleVendorItem[]>(() => hubData?.moduleVendors || [])

  useEffect(() => {
    if (hubData?.buyers) setBuyersList(hubData.buyers)
    if (hubData?.moduleVendors) setModuleVendorsList(hubData.moduleVendors)
  }, [hubData])

  // Global search query
  const [searchQuery, setSearchQuery] = useState('')

  // Expand / Collapse state for Buyers
  const [expandedBuyers, setExpandedBuyers] = useState<Set<string>>(() => new Set())
  // Expand / Collapse state for Modules
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set())

  // Buyer pagination state (5 buyers per page)
  const [buyerCurrentPage, setBuyerCurrentPage] = useState(1)

  // Per-buyer article pagination state map: { [buyerId]: pageNumber }
  const [buyerArticlePages, setBuyerArticlePages] = useState<Record<string, number>>({})

  // Modals state
  const [selectedArticleForDetail, setSelectedArticleForDetail] = useState<{
    article: BuyerArticleHistory
    buyerName: string
    buyerContact?: string
    buyerPhone?: string
  } | null>(null)

  const [selectedModuleForAssign, setSelectedModuleForAssign] = useState<ModuleVendorItem | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const [isAddBuyerModalOpen, setIsAddBuyerModalOpen] = useState(false)
  const [selectedBuyerForEdit, setSelectedBuyerForEdit] = useState<BuyerItem | null>(null)

  // Clean Toast notification
  const showToast = (msg: string) => {
    try {
      toast.success(msg, {
        style: {
          backgroundColor: '#FFFFFF',
          color: '#0B1220',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          fontWeight: '600'
        },
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      })
    } catch (_) {}
  }

  // Toggle expand for Buyer row
  const toggleBuyerExpand = (buyerId: string) => {
    setExpandedBuyers(prev => {
      const next = new Set(prev)
      if (next.has(buyerId)) {
        next.delete(buyerId)
      } else {
        next.add(buyerId)
      }
      return next
    })
  }

  // Toggle expand for Module row
  const toggleModuleExpand = (moduleRoute: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleRoute)) {
        next.delete(moduleRoute)
      } else {
        next.add(moduleRoute)
      }
      return next
    })
  }

  const expandAllBuyers = () => {
    setExpandedBuyers(new Set(buyersList.map(b => b.id)))
  }

  const collapseAllBuyers = () => {
    setExpandedBuyers(new Set())
  }

  const expandAllModules = () => {
    setExpandedModules(new Set(moduleVendorsList.map(m => m.moduleRoute)))
  }

  const collapseAllModules = () => {
    setExpandedModules(new Set())
  }

  // Filtered Buyers based on global search
  const filteredBuyers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return buyersList

    return buyersList.filter(b => {
      const nameMatch = b.brandName.toLowerCase().includes(q)
      const personMatch = b.contactPerson.toLowerCase().includes(q)
      const phoneMatch = b.phone.includes(q)
      const cityMatch = b.city.toLowerCase().includes(q)
      const gstinMatch = (b.gstin || '').toLowerCase().includes(q)
      const articleMatch = b.articles.some(a => 
        a.artNo.toLowerCase().includes(q) || 
        a.challanNo.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.colorPattern || '').toLowerCase().includes(q)
      )

      return nameMatch || personMatch || phoneMatch || cityMatch || gstinMatch || articleMatch
    })
  }, [buyersList, searchQuery])

  // Reset buyer pagination when search changes
  useEffect(() => {
    setBuyerCurrentPage(1)
  }, [searchQuery])

  // Paginated Buyers (5 per page)
  const totalBuyerPages = Math.max(1, Math.ceil(filteredBuyers.length / BUYERS_PER_PAGE))
  const paginatedBuyers = useMemo(() => {
    const start = (buyerCurrentPage - 1) * BUYERS_PER_PAGE
    return filteredBuyers.slice(start, start + BUYERS_PER_PAGE)
  }, [filteredBuyers, buyerCurrentPage])

  // Filtered Modules based on search
  const filteredModules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return moduleVendorsList

    return moduleVendorsList.filter(m => {
      const nameMatch = m.moduleName.toLowerCase().includes(q)
      const descMatch = m.description.toLowerCase().includes(q)
      const vendorCompMatch = m.assignedVendor?.companyName.toLowerCase().includes(q)
      const vendorPersonMatch = m.assignedVendor?.contactPerson.toLowerCase().includes(q)
      const vendorPhoneMatch = m.assignedVendor?.phone.includes(q)

      return nameMatch || descMatch || vendorCompMatch || vendorPersonMatch || vendorPhoneMatch
    })
  }, [moduleVendorsList, searchQuery])

  // Overall KPIs calculation
  const kpis = useMemo(() => {
    const totalBuyers = buyersList.length
    const totalAssignedPieces = buyersList.reduce((sum, b) => sum + b.totalAssignedPieces, 0)
    const totalDeliveredPieces = buyersList.reduce((sum, b) => sum + b.totalDeliveredPieces, 0)
    const totalArticles = buyersList.reduce((sum, b) => sum + b.totalArticlesCount, 0)
    const overallDeliveryPercent = totalAssignedPieces > 0 ? Math.round((totalDeliveredPieces / totalAssignedPieces) * 100) : 0
    const assignedModulesCount = moduleVendorsList.filter(m => m.assignedVendor !== null).length

    return {
      totalBuyers,
      totalAssignedPieces,
      totalDeliveredPieces,
      totalArticles,
      overallDeliveryPercent,
      assignedModulesCount
    }
  }, [buyersList, moduleVendorsList])

  // Handlers for vendor assignment
  const handleOpenAssignVendor = (mod: ModuleVendorItem) => {
    setSelectedModuleForAssign(mod)
    setIsAssignModalOpen(true)
  }

  const handleVendorAssignSuccess = (updatedMod: ModuleVendorItem) => {
    setModuleVendorsList(prev => prev.map(m => m.moduleRoute === updatedMod.moduleRoute ? updatedMod : m))
    showToast(`Vendor assigned to ${updatedMod.moduleName} successfully`)
    router.refresh()
  }

  const handleVendorRemoveSuccess = (moduleRoute: string) => {
    setModuleVendorsList(prev => prev.map(m => m.moduleRoute === moduleRoute ? { ...m, assignedVendor: null } : m))
    showToast('Vendor removed successfully')
    router.refresh()
  }

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-3.5 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      
      {/* 1. Header Banner - Matching Tab Header Standard */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-6 transition-all">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15 mt-0.5 sm:mt-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Buyers &amp; <span className="text-[#1D4ED8]">Vendors Hub</span>
              </h1>
              <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase px-2 py-0.5 sm:px-2.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {companyName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Buyer contract history, article delivery tracking (5 per page), and 12 factory module vendor assignments.
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="w-full sm:w-80 md:w-96 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search buyer, phone, article code, or vendor..."
              className="min-h-[38px] sm:min-h-[42px] w-full pl-9 pr-8 py-1.5 sm:py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Buyers */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Total Buyers</span>
            <div className="text-lg sm:text-2xl font-extrabold text-[#0B1220] font-mono leading-none pt-0.5">
              {kpis.totalBuyers}
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Contracted Articles */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Articles Contracted</span>
            <div className="text-lg sm:text-2xl font-extrabold text-[#0B1220] font-mono leading-none pt-0.5">
              {kpis.totalArticles}
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Scissors className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* Total Pieces Delivered / Assigned */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Pieces Delivered</span>
            <div className="text-base sm:text-2xl font-extrabold text-[#0B1220] font-mono truncate leading-none pt-0.5">
              <span className="text-emerald-700">{kpis.totalDeliveredPieces.toLocaleString()}</span> / {kpis.totalAssignedPieces.toLocaleString()}
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <PackageCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
          </div>
        </div>

        {/* 12 Factory Modules Assigned */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">Vendor Modules</span>
            <div className="text-lg sm:text-2xl font-extrabold text-[#0B1220] font-mono leading-none pt-0.5">
              {kpis.assignedModulesCount} / 12
            </div>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F0FDFA] border border-black/10 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Layers className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0B1220]" />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 1: BUYERS & CONTRACT HISTORY (Row Format with 5 Pagination) */}
      {/* =================================================================== */}
      <div className="space-y-4 pt-2">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#1D4ED8]" />
              Buyers &amp; Contract History
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              {filteredBuyers.length} {filteredBuyers.length === 1 ? 'Buyer' : 'Buyers'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                setSelectedBuyerForEdit(null)
                setIsAddBuyerModalOpen(true)
              }}
              className="min-h-[42px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Buyer</span>
            </button>
            <button
              type="button"
              onClick={expandAllBuyers}
              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAllBuyers}
              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Desktop 12-Column Guide Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Buyer / Brand</div>
          <div className="col-span-2 text-center">PO Contracts</div>
          <div className="col-span-2 text-center">Contracted Articles</div>
          <div className="col-span-3 text-center">Pcs Delivered / Assigned</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Buyer Rows */}
        <div className="space-y-3.5">
          {filteredBuyers.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base sm:text-lg font-bold text-[#0B1220]">No Matching Buyers</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                No buyer, brand, or contract matched "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="min-h-[44px] px-6 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm inline-flex items-center justify-center cursor-pointer active:scale-[0.98]"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            paginatedBuyers.map(buyer => {
              const isExpanded = expandedBuyers.has(buyer.id)
              const articles = buyer.articles || []
              const artPage = buyerArticlePages[buyer.id] || 1
              const totalArtPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE))
              const paginatedArticles = articles.slice((artPage - 1) * ARTICLES_PER_PAGE, artPage * ARTICLES_PER_PAGE)

              return (
                <div
                  key={buyer.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* Desktop Clickable Row Header (12-column grid) - SINGLE CLEAN STRAIGHT LINE */}
                  <div
                    onClick={() => toggleBuyerExpand(buyer.id)}
                    className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Col 1: DP Initials (HP/OD) + Buyer Name (4 cols) */}
                    <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-sm tracking-wide">
                        {getBuyerAvatarInitials(buyer.brandName)}
                      </div>
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-base font-bold text-[#0B1220] truncate">{buyer.brandName}</span>
                        {buyer.gstin && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            GST
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 2: PO Contracts Count (2 cols) */}
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {buyer.totalContractsCount} {buyer.totalContractsCount === 1 ? 'Contract' : 'Contracts'}
                      </span>
                    </div>

                    {/* Col 3: Contracted Articles Count (2 cols) */}
                    <div className="col-span-2 text-center">
                      <span className="inline-flex items-center text-xs font-mono font-bold text-[#0B1220] bg-[#F0FDFA] px-2.5 py-1 rounded-lg border border-black/15 shadow-2xs">
                        {buyer.totalArticlesCount} {buyer.totalArticlesCount === 1 ? 'Article' : 'Articles'}
                      </span>
                    </div>

                    {/* Col 4: Pcs Delivered / Assigned Progress (3 cols) */}
                    <div className="col-span-3 flex items-center justify-center gap-2.5">
                      <span className="text-xs sm:text-sm font-bold text-[#0B1220] font-mono">
                        {buyer.totalDeliveredPieces.toLocaleString('en-IN')} / {buyer.totalAssignedPieces.toLocaleString('en-IN')} pcs
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        buyer.deliveryPercentage >= 100
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {buyer.deliveryPercentage}%
                      </span>
                    </div>

                    {/* Col 5: Chevron Action (1 col) */}
                    <div className="col-span-1 flex items-center justify-end">
                      <div className={`p-1.5 rounded-xl text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Clickable Row Header (390px Viewport) */}
                  <div
                    onClick={() => toggleBuyerExpand(buyer.id)}
                    className="block md:hidden p-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0 font-bold font-mono text-xs tracking-wide">
                          {getBuyerAvatarInitials(buyer.brandName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-bold text-[#0B1220] truncate">
                            {buyer.brandName}
                          </div>
                          <div className="text-xs font-semibold text-slate-500">
                            {buyer.totalContractsCount} {buyer.totalContractsCount === 1 ? 'Contract' : 'Contracts'} • {buyer.totalArticlesCount} Articles
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {buyer.deliveryPercentage}%
                        </span>
                        <div className={`p-1.5 rounded-lg text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                        }`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED CONTENT UNDER BUYER ROW */}
                  {isExpanded && (
                    <div className="border-t border-slate-200/80 bg-[#F8FAFC]/80 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-1 duration-150">
                      
                      {/* ARTICLES CONTRACTED LIST (With 5-per-page Pagination) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-sm sm:text-base font-bold text-[#0B1220] flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-[#14C8B4]" />
                              Contracted Articles Roster
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                                {articles.length} Total
                              </span>
                            </h3>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedBuyerForEdit(buyer)
                                setIsAddBuyerModalOpen(true)
                              }}
                              className="min-h-[30px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1 cursor-pointer shadow-2xs ml-1"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Edit Buyer</span>
                            </button>
                          </div>


                          {/* Article-Level Pagination Controls */}
                          {totalArtPages > 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500">
                                Page {artPage} of {totalArtPages}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={artPage <= 1}
                                  onClick={() => setBuyerArticlePages(prev => ({ ...prev, [buyer.id]: Math.max(1, artPage - 1) }))}
                                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                                  aria-label="Previous article page"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={artPage >= totalArtPages}
                                  onClick={() => setBuyerArticlePages(prev => ({ ...prev, [buyer.id]: Math.min(totalArtPages, artPage + 1) }))}
                                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                                  aria-label="Next article page"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Articles Table / Cards */}
                        {articles.length === 0 ? (
                          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-xs sm:text-sm text-slate-500">
                            No active contract lines recorded for this buyer yet.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5">
                            {paginatedArticles.map(art => {
                              const assigned = art.assignedQty || 0

                              return (
                                <div
                                  key={art.id}
                                  className="bg-white rounded-xl px-4 py-3 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                                >
                                  {/* Left: Article No, PO Number, Total Booked Pcs, Status - Single Clean Straight Line */}
                                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-wrap">
                                    <span className="text-xs sm:text-sm font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs shrink-0">
                                      {art.artNo}
                                    </span>

                                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-700 shrink-0">
                                      {art.sourceType === 'MERCHANDISING_PO' ? 'PO' : 'CH'} #{art.challanNo}
                                    </span>

                                    <span className="inline-flex items-center text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 shrink-0">
                                      {assigned.toLocaleString('en-IN')} pcs
                                    </span>

                                    <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                      art.status === 'DELIVERED' || art.status === 'DISPATCHED'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : art.status === 'IN_PRODUCTION'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : art.status === 'QC_PASSED'
                                        ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      • {art.status.replace('_', ' ')}
                                    </span>
                                  </div>

                                  {/* Right: View More Button */}
                                  <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedArticleForDetail({
                                        article: art,
                                        buyerName: buyer.brandName,
                                        buyerContact: buyer.contactPerson,
                                        buyerPhone: buyer.phone
                                      })}
                                      className="min-h-[34px] px-3.5 py-1.5 bg-[#F0FDFA] hover:bg-slate-100 text-[#0B1220] border border-black/20 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-[#1D4ED8]" />
                                      <span>View More</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Buyer List Pagination Controls (5 Buyers Per Page) */}
        {totalBuyerPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              Showing <strong className="text-slate-900">{(buyerCurrentPage - 1) * BUYERS_PER_PAGE + 1}</strong> to{' '}
              <strong className="text-slate-900">
                {Math.min(filteredBuyers.length, buyerCurrentPage * BUYERS_PER_PAGE)}
              </strong>{' '}
              of <strong className="text-slate-900">{filteredBuyers.length}</strong> buyers
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={buyerCurrentPage <= 1}
                onClick={() => setBuyerCurrentPage(prev => Math.max(1, prev - 1))}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalBuyerPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setBuyerCurrentPage(p)}
                    className={`min-h-[36px] min-w-[36px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      buyerCurrentPage === p
                        ? 'bg-[#1D4ED8] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={buyerCurrentPage >= totalBuyerPages}
                onClick={() => setBuyerCurrentPage(prev => Math.min(totalBuyerPages, prev + 1))}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: 12 MODULES VENDOR ASSIGNMENT HUB                         */}
      {/* =================================================================== */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)] flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-[#14C8B4]" />
              12 Factory Modules — Vendor Assignment
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold px-3 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
              12 Modules
            </span>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <button
              type="button"
              onClick={expandAllModules}
              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAllModules}
              className="min-h-[42px] px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Desktop 12-Column Guide Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Factory Module / Scope</div>
          <div className="col-span-4">Assigned Vendor Company</div>
          <div className="col-span-2 text-center">Contact Person &amp; Phone</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* 12 Module Rows */}
        <div className="space-y-3.5">
          {filteredModules.map(mod => {
            const isExpanded = expandedModules.has(mod.moduleRoute)
            const IconComponent = MODULE_ICONS[mod.iconName] || Layers
            const vendor = mod.assignedVendor

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Desktop Clickable Row (12-column grid) */}
                <div
                  onClick={() => toggleModuleExpand(mod.moduleRoute)}
                  className="hidden md:grid grid-cols-12 items-center gap-4 p-5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Col 1: Module Name & Icon (5 cols) */}
                  <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                      <IconComponent className="w-6 h-6 text-[#0B1220]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base lg:text-lg font-bold text-[#0B1220] truncate flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {mod.moduleCode}
                        </span>
                        <span className="truncate">{mod.moduleName}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                        {mod.defaultDesignation}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Assigned Vendor Company (4 cols) */}
                  <div className="col-span-4 min-w-0">
                    {vendor ? (
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-[#0B1220] truncate flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{vendor.companyName}</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-500 truncate pl-4.5">
                          Job Work Contractor • Active
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                        Not Assigned (In-house / Open)
                      </div>
                    )}
                  </div>

                  {/* Col 3: Contact Person & Phone (2 cols) */}
                  <div className="col-span-2 text-center min-w-0">
                    {vendor ? (
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#0B1220] truncate">
                          {vendor.contactPerson}
                        </div>
                        <div className="text-xs font-mono font-bold text-slate-700">
                          +91 {vendor.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">—</span>
                    )}
                  </div>

                  {/* Col 4: Action / Chevron (1 col) */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className={`p-2 rounded-xl text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                    }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Mobile Clickable Row Header */}
                <div
                  onClick={() => toggleModuleExpand(mod.moduleRoute)}
                  className="block md:hidden p-4 sm:p-5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                        <IconComponent className="w-5 h-5 text-[#0B1220]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-[#0B1220] truncate">
                          {mod.moduleName}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 truncate">
                          {mod.defaultDesignation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        vendor
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {vendor ? 'Assigned' : 'Open'}
                      </span>
                      <div className={`p-1.5 rounded-lg text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile sub-strip */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Vendor:</span>
                      <span className="font-bold text-[#0B1220] truncate">
                        {vendor ? vendor.companyName : 'Not Assigned'}
                      </span>
                    </div>
                    {vendor && (
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        +91 {vendor.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED CONTENT UNDER MODULE ROW */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-[#F8FAFC]/80 p-4 sm:p-6 space-y-4 animate-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#0B1220] flex items-center gap-2">
                            <Building2 className="w-4.5 h-4.5 text-[#1D4ED8]" />
                            {mod.moduleName} — Vendor Contract Details
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            {mod.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenAssignVendor(mod)
                            }}
                            className="min-h-[40px] px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4 text-white" />
                            <span>{vendor ? 'Edit Vendor Assignment' : 'Assign Vendor'}</span>
                          </button>
                        </div>
                      </div>

                      {vendor ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</span>
                            <div className="text-sm sm:text-base font-bold text-[#0B1220]">
                              {vendor.companyName}
                            </div>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active Partner
                            </span>
                          </div>

                          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</span>
                            <div className="text-sm sm:text-base font-bold text-[#0B1220]">
                              {vendor.contactPerson}
                            </div>
                            <span className="text-[11px] text-slate-500">Unit Representative</span>
                          </div>

                          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 space-y-1">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone / Mobile</span>
                            <div className="text-sm sm:text-base font-bold text-[#0B1220] font-mono">
                              +91 {vendor.phone}
                            </div>
                            <a
                              href={`tel:+91${vendor.phone}`}
                              className="text-[11px] text-[#1D4ED8] font-bold hover:underline inline-block"
                            >
                              Call Vendor Directly →
                            </a>
                          </div>

                          {vendor.notes && (
                            <div className="col-span-1 sm:col-span-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                              <strong>Scope / Notes:</strong> {vendor.notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                          <Info className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="text-sm font-bold text-slate-700">
                            No External Vendor Assigned
                          </div>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            This module is currently handled in-house. You can assign a specialized external job work vendor anytime.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALS                                                              */}
      {/* =================================================================== */}

      {/* 1. Article & Contract Detail Modal ("View More") */}
      {selectedArticleForDetail && (
        <ArticleContractDetailModal
          isOpen={Boolean(selectedArticleForDetail)}
          article={selectedArticleForDetail.article}
          buyerName={selectedArticleForDetail.buyerName}
          buyerContact={selectedArticleForDetail.buyerContact}
          buyerPhone={selectedArticleForDetail.buyerPhone}
          onClose={() => setSelectedArticleForDetail(null)}
        />
      )}

      {/* 2. Assign Vendor Modal */}
      {selectedModuleForAssign && (
        <AssignVendorModal
          isOpen={isAssignModalOpen}
          moduleItem={selectedModuleForAssign}
          onClose={() => {
            setIsAssignModalOpen(false)
            setSelectedModuleForAssign(null)
          }}
          onSuccess={handleVendorAssignSuccess}
          onRemoveSuccess={handleVendorRemoveSuccess}
        />
      )}

      {/* 3. Add / Edit Buyer Modal */}
      <AddBuyerModal
        isOpen={isAddBuyerModalOpen}
        buyer={selectedBuyerForEdit}
        onClose={() => {
          setIsAddBuyerModalOpen(false)
          setSelectedBuyerForEdit(null)
        }}
        onSuccess={() => {
          showToast('Buyer master profile saved successfully')
          router.refresh()
        }}
      />
    </div>
  )
}
