'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  Boxes, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Tag, 
  Package, 
  Scissors, 
  Sparkles,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Search,
  X,
  ShieldAlert,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { ActiveAllotment, TruckInward } from './StoreDashboardClient'

export interface BufferReplacementClaim {
  id: string
  artNo: string
  allotmentId: string
  linemanName: string
  itemName: string
  qty: number
  reason: string
  notes?: string
  createdAt: string
}

interface ArticleConsumptionLedgerProps {
  activeAllotments: ActiveAllotment[]
  truckInwards: TruckInward[]
}

interface ArticleLedgerGroup {
  artNo: string
  description?: string
  totalInward: number
  totalAllotted: number
  balance: number
  safetyBuffer: number
  claimedBuffer: number
  availableBuffer: number
  allotments: Array<{
    id: string
    linemanName: string
    targetQty: number
    colors: string[]
    status: string
    isFullyIssued: boolean
    issuedMaterialsCount: number
    totalMaterialsCount: number
    materials: Array<{
      id: string
      item_name: string
      required_qty: string | number
      admin_issued: boolean
    }>
  }>
}

const STORAGE_KEY = 'MES_BUFFER_REPLACEMENT_CLAIMS'

export function ArticleConsumptionLedger({
  activeAllotments = [],
  truckInwards = []
}: ArticleConsumptionLedgerProps) {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [expandedAllotmentIds, setExpandedAllotmentIds] = useState<Record<string, boolean>>({})
  const [bufferPct, setBufferPct] = useState<number>(5)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [claims, setClaims] = useState<BufferReplacementClaim[]>([])
  const [expandedHistoryArt, setExpandedHistoryArt] = useState<Record<string, boolean>>({})

  // Modal State for Buffer Replacement Claim
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [modalArtNo, setModalArtNo] = useState<string>('')
  const [modalAllotmentId, setModalAllotmentId] = useState<string>('')
  const [modalItemName, setModalItemName] = useState<string>('')
  const [modalCustomItem, setModalCustomItem] = useState<string>('')
  const [modalQty, setModalQty] = useState<number>(1)
  const [modalReason, setModalReason] = useState<string>('Floor Mending / Alteration')
  const [modalNotes, setModalNotes] = useState<string>('')

  // Load claims from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setClaims(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load buffer replacement claims:', e)
    }
  }, [])

  // Save claims helper
  const updateClaims = (newClaims: BufferReplacementClaim[]) => {
    setClaims(newClaims)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newClaims))
    } catch (e) {
      console.warn('Failed to persist buffer claims:', e)
    }
  }

  const toggleAllotment = (allotId: string) => {
    setExpandedAllotmentIds(prev => ({
      ...prev,
      [allotId]: !prev[allotId]
    }))
  }

  const toggleHistory = (artNo: string) => {
    setExpandedHistoryArt(prev => ({
      ...prev,
      [artNo]: !prev[artNo]
    }))
  }

  // Aggregate Data by Article
  const articleGroups: ArticleLedgerGroup[] = useMemo(() => {
    const map: Record<string, ArticleLedgerGroup> = {}

    // 1. Process Truck Inwards (GRN) to get total store received quantities
    truckInwards.forEach(grn => {
      const art = (grn.article_no || '').trim().toUpperCase() || 'GENERAL'
      if (!map[art]) {
        map[art] = {
          artNo: art,
          description: '',
          totalInward: 0,
          totalAllotted: 0,
          balance: 0,
          safetyBuffer: 0,
          claimedBuffer: 0,
          availableBuffer: 0,
          allotments: []
        }
      }

      const items = (grn.items && grn.items.length > 0) ? grn.items : (grn.line_items || [])
      const inwardPcs = items.reduce((sum: number, it: any) => {
        const qty = Number(it.quantity || it.received_qty || 0)
        return sum + (isNaN(qty) ? 0 : qty)
      }, 0)

      map[art].totalInward += inwardPcs
    })

    // 2. Process Allotments to map Lineman Line Handovers & BOM items
    activeAllotments.forEach(al => {
      const art = (al.article?.art_no || '').trim().toUpperCase() || 'GENERAL'
      if (!map[art]) {
        map[art] = {
          artNo: art,
          description: al.article?.description || '',
          totalInward: 0,
          totalAllotted: 0,
          balance: 0,
          safetyBuffer: 0,
          claimedBuffer: 0,
          availableBuffer: 0,
          allotments: []
        }
      } else if (!map[art].description && al.article?.description) {
        map[art].description = al.article.description
      }

      map[art].totalAllotted += (al.target_qty || 0)

      const variants = al.allotment_variants || []
      const colors = Array.from(new Set(variants.map(v => (v.color || '').trim()).filter(Boolean)))
      const materials = (al.allotment_materials || []).map(m => ({
        id: m.id,
        item_name: m.item_name,
        required_qty: m.required_qty,
        admin_issued: Boolean((m as any).admin_issued)
      }))

      const issuedCount = materials.filter(m => m.admin_issued).length
      const isFullyIssued = materials.length > 0 && issuedCount === materials.length

      map[art].allotments.push({
        id: al.id,
        linemanName: al.lineman?.username || 'Lineman',
        targetQty: al.target_qty || 0,
        colors: colors.length > 0 ? colors : ['Standard'],
        status: isFullyIssued ? 'ISSUED_TO_FLOOR' : 'PENDING_HANDOVER',
        isFullyIssued,
        issuedMaterialsCount: issuedCount,
        totalMaterialsCount: materials.length,
        materials
      })
    })

    // 3. Compute final balance, safety buffer & claim deductions
    Object.values(map).forEach(group => {
      if (group.totalInward >= group.totalAllotted) {
        group.balance = Math.max(0, group.totalInward - group.totalAllotted)
        // Configurable safety buffer %
        group.safetyBuffer = Math.min(group.balance, Math.floor(group.totalInward * (bufferPct / 100)))
      } else {
        group.balance = 0
        group.safetyBuffer = 0
      }

      // Calculate claims for this article
      const artClaims = claims.filter(c => c.artNo === group.artNo)
      const claimedTotal = artClaims.reduce((sum, c) => sum + (c.qty || 0), 0)
      group.claimedBuffer = claimedTotal
      group.availableBuffer = Math.max(0, group.safetyBuffer - claimedTotal)
    })

    return Object.values(map).sort((a, b) => b.allotments.length - a.allotments.length)
  }, [activeAllotments, truckInwards, bufferPct, claims])

  // Filtered by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return articleGroups
    const q = searchQuery.toLowerCase().trim()
    return articleGroups.filter(g => 
      g.artNo.toLowerCase().includes(q) || 
      (g.description && g.description.toLowerCase().includes(q))
    )
  }, [articleGroups, searchQuery])

  // Auto-expand first article by default if not set
  useEffect(() => {
    if (!expandedArticle && filteredGroups.length > 0) {
      setExpandedArticle(filteredGroups[0].artNo)
      if (filteredGroups[0].allotments.length > 0) {
        setExpandedAllotmentIds({ [filteredGroups[0].allotments[0].id]: true })
      }
    }
  }, [filteredGroups, expandedArticle])

  // Open Claim Modal Handlers
  const handleOpenClaim = (artNo: string, allotmentId?: string, defaultItem?: string) => {
    const group = articleGroups.find(g => g.artNo === artNo)
    if (!group) return

    setModalArtNo(artNo)
    const targetAllot = allotmentId 
      ? group.allotments.find(a => a.id === allotmentId) 
      : group.allotments[0]
    
    setModalAllotmentId(targetAllot ? targetAllot.id : '')
    setModalItemName(defaultItem || (targetAllot && targetAllot.materials[0] ? targetAllot.materials[0].item_name : ''))
    setModalCustomItem('')
    setModalQty(1)
    setModalReason('Floor Mending / Alteration')
    setModalNotes('')
    setClaimModalOpen(true)
  }

  const handleConfirmClaim = () => {
    const group = articleGroups.find(g => g.artNo === modalArtNo)
    if (!group) return

    const effectiveItem = modalItemName === '__CUSTOM__' 
      ? modalCustomItem.trim() 
      : (modalItemName || modalCustomItem.trim() || 'Replacement Trim')

    if (!effectiveItem) {
      toast.error('Please specify the material / trim name to issue.')
      return
    }

    if (modalQty <= 0) {
      toast.error('Quantity must be greater than zero.')
      return
    }

    const allot = group.allotments.find(a => a.id === modalAllotmentId)
    const linemanName = allot ? allot.linemanName : 'Floor Mending Desk'

    const newClaim: BufferReplacementClaim = {
      id: 'CLM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
      artNo: modalArtNo,
      allotmentId: modalAllotmentId,
      linemanName,
      itemName: effectiveItem,
      qty: modalQty,
      reason: modalReason,
      notes: modalNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    }

    updateClaims([newClaim, ...claims])
    setClaimModalOpen(false)
    toast.success(`Issued ${modalQty} pcs of "${effectiveItem}" to ${linemanName} from Buffer Reserve!`)
  }

  const handleRevokeClaim = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId)
    if (!claim) return
    const updated = claims.filter(c => c.id !== claimId)
    updateClaims(updated)
    toast.info(`Revoked claim of ${claim.qty} pcs for "${claim.itemName}". Restored to buffer.`)
  }

  if (articleGroups.length === 0) {
    return null
  }

  const activeModalGroup = articleGroups.find(g => g.artNo === modalArtNo)
  const activeModalAllot = activeModalGroup?.allotments.find(a => a.id === modalAllotmentId)

  return (
    <div className="space-y-4 select-none">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs shrink-0">
            <Boxes className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Live Article Material Consumption Ledger
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/15">
                Matrix-Driven Smart Isolation
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Track store inward GRN against color-line lineman handovers & safety buffer reserves
            </p>
          </div>
        </div>

        {/* Header Toolbar: Buffer % Selector & Search Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Buffer % Pills */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#3A3564]" /> Buffer:
            </span>
            {[3, 5, 8, 10].map(pct => (
              <button
                key={pct}
                onClick={() => setBufferPct(pct)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                  bufferPct === pct 
                    ? 'bg-[#3A3564] text-white shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Art #..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3A3564] w-36 sm:w-44"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] font-bold text-xs font-mono border border-black/10 shadow-2xs shrink-0">
            {filteredGroups.length} Active Articles
          </span>
        </div>
      </div>

      {/* Ledger Cards Grid */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No articles match your search filter.
          </div>
        ) : (
          filteredGroups.map(group => {
            const isArtExpanded = expandedArticle === group.artNo
            const isFullyAllocated = group.totalInward > 0 && group.totalAllotted >= group.totalInward
            const artClaims = claims.filter(c => c.artNo === group.artNo)
            const isHistoryExpanded = Boolean(expandedHistoryArt[group.artNo])

            return (
              <div 
                key={group.artNo} 
                className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden transition-all"
              >
                {/* Card Header Bar */}
                <div 
                  className="p-4 sm:p-5 bg-[#FAF7F0] border-b border-black/10 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div 
                    onClick={() => setExpandedArticle(isArtExpanded ? null : group.artNo)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-[240px]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center font-mono font-black text-sm shadow-2xs shrink-0">
                      <Tag className="w-5 h-5 text-[#3A3564]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 font-mono">
                          ARTICLE #{group.artNo}
                        </h3>
                        {group.description && (
                          <span className="text-xs font-semibold text-slate-500">
                            • {group.description}
                          </span>
                        )}
                        {isFullyAllocated ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            100% Fully Allotted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/20">
                            {group.allotments.length} Line Handovers
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Store Material Consumption Ledger & Handover Audit
                      </p>
                    </div>
                  </div>

                  {/* Metrics Summary Strip + Action Buttons */}
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="hidden sm:block text-right">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Total Store Inward</span>
                      <strong className="text-slate-800 text-sm">{group.totalInward.toLocaleString('en-IN')} pcs</strong>
                    </div>
                    <div className="hidden sm:block text-right pl-3 border-l border-slate-200">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Issued to Floor</span>
                      <strong className="text-emerald-700 text-sm">{group.totalAllotted.toLocaleString('en-IN')} pcs</strong>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                      <span className="block text-[10px] font-bold uppercase text-slate-400">Stock Balance</span>
                      <strong className="text-[#3A3564] text-sm">{group.balance.toLocaleString('en-IN')} pcs</strong>
                    </div>

                    {/* Quick Claim Button on Card Header */}
                    {group.balance > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenClaim(group.artNo)
                        }}
                        className="ml-2 px-2.5 py-1.5 rounded-xl bg-[#3A3564] text-white hover:bg-[#2d2850] transition-colors flex items-center gap-1.5 font-sans font-bold text-xs shadow-2xs cursor-pointer shrink-0"
                        title="Issue replacement trims/materials from the safety buffer reserve"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Claim Buffer</span>
                      </button>
                    )}

                    <div 
                      onClick={() => setExpandedArticle(isArtExpanded ? null : group.artNo)}
                      className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                    >
                      {isArtExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Card Body (Accordion) */}
                {isArtExpanded && (
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Ledger Banner Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">📥 Store Inward (GRN)</span>
                          <strong className="text-slate-900 text-xs">{group.totalInward.toLocaleString('en-IN')} pcs Received</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">📤 Floor Allocations</span>
                          <strong className="text-emerald-700 text-xs">{group.totalAllotted.toLocaleString('en-IN')} pcs ({group.allotments.length} Lines)</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                          <Boxes className="w-3.5 h-3.5 text-[#3A3564]" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">⚖️ Unallotted Stock</span>
                          <strong className="text-slate-900 text-xs">{group.balance.toLocaleString('en-IN')} pcs Balance</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">🛡️ Safety Buffer ({bufferPct}%)</span>
                            <strong className="text-slate-900 text-xs block truncate">
                              {group.availableBuffer.toLocaleString('en-IN')} pcs Left
                              {group.claimedBuffer > 0 && (
                                <span className="text-amber-600 ml-1 font-semibold text-[11px]">
                                  (-{group.claimedBuffer} pcs claimed)
                                </span>
                              )}
                            </strong>
                          </div>
                        </div>

                        {/* Quick Issue Replacement Button */}
                        <button
                          onClick={() => handleOpenClaim(group.artNo)}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-black/10 text-[#3A3564] text-[11px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
                          title="Claim replacement trims from buffer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Claim</span>
                        </button>
                      </div>
                    </div>

                    {/* Claims History Drawer (if any claims exist for this article) */}
                    {artClaims.length > 0 && (
                      <div className="bg-amber-50/50 rounded-xl border border-amber-200/80 overflow-hidden">
                        <div 
                          onClick={() => toggleHistory(group.artNo)}
                          className="p-3 bg-amber-100/40 border-b border-amber-200/60 flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-amber-800" />
                            <span className="text-xs font-bold text-amber-900 font-mono">
                              Buffer Replacement Claims History ({artClaims.length} Claims • {group.claimedBuffer} pcs issued from Reserve)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-amber-800">
                            <span>{isHistoryExpanded ? 'Collapse' : 'View Audit Log'}</span>
                            {isHistoryExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {isHistoryExpanded && (
                          <div className="p-3 divide-y divide-amber-200/40 space-y-2">
                            {artClaims.map(cl => (
                              <div key={cl.id} className="pt-2 first:pt-0 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="font-bold text-slate-800 text-xs">
                                    👤 {cl.linemanName}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                                    {cl.itemName} ({cl.qty} pcs)
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/60 text-amber-900">
                                    {cl.reason}
                                  </span>
                                  {cl.notes && (
                                    <span className="text-slate-500 italic text-[11px] truncate max-w-[200px]">
                                      "{cl.notes}"
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(cl.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button
                                    onClick={() => handleRevokeClaim(cl.id)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Revoke claim & return to buffer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Line-by-Line Handover List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 pt-1">
                        <span>Floor Line Handovers & Color Isolation ({group.allotments.length} Active Lines)</span>
                        <span className="text-[11px] text-slate-400 font-normal">Click any line to inspect itemized BOM checklist</span>
                      </div>

                      {group.allotments.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          No floor allotments created for this article yet. Use Allotments Desk to assign lines.
                        </div>
                      ) : (
                        group.allotments.map((al, idx) => {
                          const isAllotExpanded = expandedAllotmentIds[al.id]

                          return (
                            <div 
                              key={al.id}
                              className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
                            >
                              {/* Line Handover Row Header */}
                              <div 
                                className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 hover:bg-slate-50 transition-colors"
                              >
                                <div 
                                  onClick={() => toggleAllotment(al.id)}
                                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                                >
                                  <span className="w-5 h-5 rounded-md bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[11px] font-mono font-bold text-[#3A3564] shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-black text-slate-900">
                                        Line {idx + 1} Handover ({al.linemanName})
                                      </span>
                                      {al.colors.map(col => (
                                        <span 
                                          key={col} 
                                          className="px-2 py-0.2 rounded text-[10.5px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                                        >
                                          🎨 {col}
                                        </span>
                                      ))}
                                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {al.targetQty.toLocaleString('en-IN')} pcs
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                      {al.issuedMaterialsCount} of {al.totalMaterialsCount} BOM items verified & issued
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-mono">
                                  {/* Quick Mending Claim Button for this Lineman */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenClaim(group.artNo, al.id)
                                    }}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title={`Issue mending / alteration replacement from buffer for Line ${idx + 1}`}
                                  >
                                    <Scissors className="w-3 h-3 text-amber-700" />
                                    <span>Mending Claim</span>
                                  </button>

                                  {al.isFullyIssued ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>ISSUED TO FLOOR</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/15">
                                      <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                                      <span>PENDING HANDOVER</span>
                                    </span>
                                  )}
                                  <div 
                                    onClick={() => toggleAllotment(al.id)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                                  >
                                    {isAllotExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </div>
                                </div>
                              </div>

                              {/* Itemized BOM Checklist Accordion */}
                              {isAllotExpanded && (
                                <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                    <span>Itemized Line BOM Handover Details:</span>
                                    <span>Click "+" on any item to claim replacement from buffer</span>
                                  </div>

                                  {al.materials.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">No BOM materials attached to this allotment.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {al.materials.map((m, mIdx) => {
                                        const isThread = m.item_name.toLowerCase().includes('thread') || m.item_name.toLowerCase().includes('cone')
                                        const isLabel = m.item_name.toLowerCase().includes('label') || m.item_name.toLowerCase().includes('tag')
                                        const isPatch = m.item_name.toLowerCase().includes('patch') || m.item_name.toLowerCase().includes('paw') || m.item_name.toLowerCase().includes('logo')
                                        const isFabric = m.item_name.toLowerCase().includes('fabric') || m.item_name.toLowerCase().includes('roll') || m.item_name.toLowerCase().includes('panel')

                                        const icon = isThread ? '🧵' : isLabel ? '🏷️' : isPatch ? '🎨' : isFabric ? '📦' : '⚙️'

                                        return (
                                          <div 
                                            key={m.id || mIdx}
                                            className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs hover:border-[#3A3564]/30 transition-all"
                                          >
                                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                              <span className="text-sm shrink-0">{icon}</span>
                                              <span className="font-semibold text-slate-800 text-[11.5px] truncate" title={m.item_name}>
                                                {m.item_name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 font-mono">
                                              <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 text-[11px]">
                                                {m.required_qty}
                                              </span>
                                              {m.admin_issued ? (
                                                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Issued
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                  <Clock className="w-3 h-3 text-amber-600" /> Due
                                                </span>
                                              )}

                                              {/* 1-Click Buffer Claim for this item */}
                                              <button
                                                onClick={() => handleOpenClaim(group.artNo, al.id, m.item_name)}
                                                className="p-1 rounded bg-slate-50 hover:bg-amber-100 text-slate-400 hover:text-amber-800 border border-slate-200 transition-colors"
                                                title={`Claim replacement for ${m.item_name} from Buffer`}
                                              >
                                                <Plus className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Buffer Replacement Claim Modal */}
      {claimModalOpen && activeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
                  <ShieldAlert className="w-5 h-5 text-[#3A3564]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 font-mono">
                    Issue Replacement from Safety Buffer
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Article #{activeModalGroup.artNo} • Available Buffer: {activeModalGroup.availableBuffer} pcs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto font-sans text-xs">
              {/* Target Lineman / Allotment Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase font-mono text-[10.5px] mb-1.5">
                  1. Target Floor Lineman / Line:
                </label>
                {activeModalGroup.allotments.length === 0 ? (
                  <p className="text-slate-400 italic">No floor allotments found. General floor issue will be recorded.</p>
                ) : (
                  <select
                    value={modalAllotmentId}
                    onChange={e => {
                      setModalAllotmentId(e.target.value)
                      const target = activeModalGroup.allotments.find(a => a.id === e.target.value)
                      if (target && target.materials.length > 0) {
                        setModalItemName(target.materials[0].item_name)
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                  >
                    {activeModalGroup.allotments.map((a, i) => (
                      <option key={a.id} value={a.id}>
                        Line {i + 1}: {a.linemanName} ({a.colors.join(', ')}) — {a.targetQty} pcs target
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Trim / Material Item Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase font-mono text-[10.5px] mb-1.5">
                  2. Trim / Material to Replace:
                </label>
                {activeModalAllot && activeModalAllot.materials.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={modalItemName}
                      onChange={e => setModalItemName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                    >
                      {activeModalAllot.materials.map(m => (
                        <option key={m.id} value={m.item_name}>
                          {m.item_name} (Quota: {m.required_qty})
                        </option>
                      ))}
                      <option value="__CUSTOM__">➕ Enter Other / Custom Material...</option>
                    </select>

                    {modalItemName === '__CUSTOM__' && (
                      <input
                        type="text"
                        placeholder="e.g. Size 24 Label, Navy Blue Cone..."
                        value={modalCustomItem}
                        onChange={e => setModalCustomItem(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter trim or material name..."
                    value={modalCustomItem}
                    onChange={e => setModalCustomItem(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                  />
                )}
              </div>

              {/* Quantity to Claim with Steppers */}
              <div>
                <label className="block font-bold text-slate-700 uppercase font-mono text-[10.5px] mb-1.5">
                  3. Replacement Quantity (pcs):
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden font-mono">
                    <button
                      type="button"
                      onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, activeModalGroup.availableBuffer)}
                      value={modalQty}
                      onChange={e => setModalQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 text-center bg-transparent py-2 font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setModalQty(modalQty + 1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Preset Badges */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 5, 10].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setModalQty(n)}
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          modalQty === n
                            ? 'bg-[#3A3564] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>

                {modalQty > activeModalGroup.availableBuffer && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Notice: Requested qty ({modalQty}) exceeds remaining calculated buffer ({activeModalGroup.availableBuffer}). Stock will be over-issued.
                  </p>
                )}
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase font-mono text-[10.5px] mb-1.5">
                  4. Reason for Replacement:
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {[
                    'Floor Mending / Alteration',
                    'Damaged in Stitching',
                    'Defective Trim / Label',
                    'Missing in Bundle'
                  ].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setModalReason(r)}
                      className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all ${
                        modalReason === r
                          ? 'bg-[#FAF7F0] text-[#3A3564] border-[#3A3564] shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase font-mono text-[10.5px] mb-1.5">
                  5. Operator Notes / Remarks (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Size M tag ripped during overlock..."
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClaim}
                className="px-5 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2d2850] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Issue from Reserve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
