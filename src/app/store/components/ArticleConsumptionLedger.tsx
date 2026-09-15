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
  FileText,
  Palette,
  Sparkles,
  Inbox,
  ArrowUpRight,
  ShieldAlert,
  X,
  AlertCircle
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                Live Article Material Consumption Ledger
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                Matrix Isolation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium font-[family-name:var(--font-public-sans)] mt-0.5">
              Track store inward GRN against color-line lineman handovers & remaining factory balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] font-mono font-bold text-xs border border-black/10 shadow-2xs">
            {articleGroups.length} Articles Active
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
                  onClick={() => setExpandedArticle(isArtExpanded ? null : group.artNo)}
                  className="p-5 bg-[#FAF7F0]/60 border-b border-black/10 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7F0] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center font-mono font-black text-sm shadow-2xs shrink-0">
                      <Tag className="w-5 h-5 text-[#3A3564]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                          ARTICLE #{group.artNo}
                        </h3>
                        {group.description && (
                          <span className="text-xs sm:text-sm font-semibold text-slate-600">
                            • {group.description}
                          </span>
                        )}
                        {isFullyAllocated ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            100% Fully Allotted
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                            {group.allotments.length} Line Handovers
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Store Material Consumption Ledger & Handover Audit
                      </p>
                    </div>
                  </div>

                  {/* Metrics Summary Strip */}
                  <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
                    <div className="hidden sm:block text-right">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Total Store Inward</span>
                      <strong className="text-slate-900 text-sm sm:text-base font-bold">{group.totalInward.toLocaleString('en-IN')} pcs</strong>
                    </div>
                    <div className="hidden sm:block text-right pl-4 border-l border-slate-200">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Issued to Floor</span>
                      <strong className="text-emerald-700 text-sm sm:text-base font-bold">{group.totalAllotted.toLocaleString('en-IN')} pcs</strong>
                    </div>
                    <div className="text-right pl-4 border-l border-slate-200">
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Unallotted Balance</span>
                      <strong className="text-[#3A3564] text-sm sm:text-base font-bold">{group.balance.toLocaleString('en-IN')} pcs</strong>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border border-black/10 flex items-center justify-center text-slate-600 shadow-2xs ml-1">
                      {isArtExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Card Body (Accordion) */}
                {isArtExpanded && (
                  <div className="p-5 sm:p-6 space-y-5 bg-white">
                    {/* Ledger Banner Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs sm:text-sm font-mono">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                          <Inbox className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Store Inward (GRN)</span>
                          <strong className="text-slate-900 text-sm font-bold">{group.totalInward.toLocaleString('en-IN')} pcs (Received)</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-emerald-700 shadow-2xs shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Floor Allocations</span>
                          <strong className="text-emerald-700 text-sm font-bold">{group.totalAllotted.toLocaleString('en-IN')} pcs ({group.allotments.length} Lines)</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-4">
                        <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Remaining Stock</span>
                          <strong className="text-slate-900 text-sm font-bold">
                            {group.balance.toLocaleString('en-IN')} pcs {group.safetyBuffer > 0 ? `(+${group.safetyBuffer} Buffer Safe)` : ''}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Line-by-Line Handover List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-800 pt-1">
                        <span>Floor Line Handovers & Color Isolation ({group.allotments.length} Active Lines)</span>
                        <span className="text-xs text-slate-400 font-medium">Click line to view BOM breakdown</span>
                      </div>

                      {group.allotments.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500 bg-[#FAF7F0] rounded-xl border border-dashed border-black/10">
                          No floor allotments created for this article yet. Use Allotments Desk to assign lines.
                        </div>
                      ) : (
                        group.allotments.map((al, idx) => {
                          const isAllotExpanded = expandedAllotmentIds[al.id]

                          return (
                            <div
                              key={al.id}
                              className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-2xs transition-all"
                            >
                              {/* Line Handover Row Header */}
                              <div
                                onClick={() => toggleAllotment(al.id)}
                                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-[#FAF7F0]/60 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-xs font-mono font-bold text-[#3A3564] shrink-0">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <span className="text-sm font-bold text-slate-900">
                                        Line {idx + 1} Handover ({al.linemanName})
                                      </span>
                                      {al.colors.map(col => (
                                        <span
                                          key={col}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs"
                                        >
                                          <Palette className="w-3 h-3" />
                                          <span>{col}</span>
                                        </span>
                                      ))}
                                      <span className="text-xs font-mono font-bold text-slate-800 bg-[#FAF7F0] px-2.5 py-0.5 rounded-lg border border-black/10">
                                        {al.targetQty.toLocaleString('en-IN')} pcs
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mt-1">
                                      {al.issuedMaterialsCount} of {al.totalMaterialsCount} BOM items verified & issued
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-mono">
                                  {al.isFullyIssued ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>ISSUED TO FLOOR</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                                      <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                                      <span>PENDING HANDOVER</span>
                                    </span>
                                  )}
                                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-slate-600">
                                    {isAllotExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </div>
                                </div>
                              </div>

                              {/* Itemized BOM Checklist Accordion */}
                              {isAllotExpanded && (
                                <div className="p-4 bg-[#FAF7F0]/40 border-t border-black/10 space-y-3">
                                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                                    Itemized Line BOM Handover Details:
                                  </div>

                                  {al.materials.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">No BOM materials attached to this allotment.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {al.materials.map((m, mIdx) => {
                                        const isThread = m.item_name.toLowerCase().includes('thread') || m.item_name.toLowerCase().includes('cone')
                                        const isLabel = m.item_name.toLowerCase().includes('label') || m.item_name.toLowerCase().includes('tag')
                                        const isFabric = m.item_name.toLowerCase().includes('fabric') || m.item_name.toLowerCase().includes('roll') || m.item_name.toLowerCase().includes('panel')

                                        const ItemIcon = isThread ? Layers : isLabel ? Tag : isFabric ? Package : Boxes

                                        return (
                                          <div
                                            key={m.id || mIdx}
                                            className="p-3 rounded-xl bg-white border border-black/10 flex items-center justify-between text-xs shadow-2xs"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                              <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0">
                                                <ItemIcon className="w-3.5 h-3.5" />
                                              </div>
                                              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={m.item_name}>
                                                {m.item_name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 font-mono">
                                              <span className="font-bold text-slate-900 bg-[#FAF7F0] px-2.5 py-1 rounded-lg border border-black/10 text-xs">
                                                {m.required_qty}
                                              </span>
                                              {m.admin_issued ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Issued
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Due
                                                </span>
                                              )}
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
          }))}
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
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${modalQty === n
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
                      className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all ${modalReason === r
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
