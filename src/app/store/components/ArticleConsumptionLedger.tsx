'use client'

import React, { useState, useMemo } from 'react'
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
  FileText
} from 'lucide-react'
import { ActiveAllotment, TruckInward } from './StoreDashboardClient'

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

export function ArticleConsumptionLedger({
  activeAllotments = [],
  truckInwards = []
}: ArticleConsumptionLedgerProps) {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [expandedAllotmentIds, setExpandedAllotmentIds] = useState<Record<string, boolean>>({})

  const toggleAllotment = (allotId: string) => {
    setExpandedAllotmentIds(prev => ({
      ...prev,
      [allotId]: !prev[allotId]
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

    // 3. Compute final balance & safety buffer
    Object.values(map).forEach(group => {
      if (group.totalInward >= group.totalAllotted) {
        group.balance = Math.max(0, group.totalInward - group.totalAllotted)
        group.safetyBuffer = Math.min(group.balance, Math.floor(group.totalInward * 0.05))
      } else {
        group.balance = 0
        group.safetyBuffer = 0
      }
    })

    return Object.values(map).sort((a, b) => b.allotments.length - a.allotments.length)
  }, [activeAllotments, truckInwards])

  // Auto-expand first article by default if not set
  React.useEffect(() => {
    if (!expandedArticle && articleGroups.length > 0) {
      setExpandedArticle(articleGroups[0].artNo)
      if (articleGroups[0].allotments.length > 0) {
        setExpandedAllotmentIds({ [articleGroups[0].allotments[0].id]: true })
      }
    }
  }, [articleGroups, expandedArticle])

  if (articleGroups.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
            <Boxes className="w-4 h-4 text-[#3A3564]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Live Article Material Consumption Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-[#3A3564] border border-[#3A3564]/15">
                Matrix-Driven Smart Isolation
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Track store inward GRN against color-line lineman handovers & remaining factory balance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-[#3A3564] font-bold border border-black/10 shadow-2xs">
            {articleGroups.length} Articles Active
          </span>
        </div>
      </div>

      {/* Ledger Cards Grid */}
      <div className="space-y-4">
        {articleGroups.map(group => {
          const isArtExpanded = expandedArticle === group.artNo
          const isFullyAllocated = group.totalInward > 0 && group.totalAllotted >= group.totalInward

          return (
            <div 
              key={group.artNo} 
              className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden transition-all"
            >
              {/* Card Header Bar */}
              <div 
                onClick={() => setExpandedArticle(isArtExpanded ? null : group.artNo)}
                className="p-4 sm:p-5 bg-[#FAF7F0] border-b border-black/10 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
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

                {/* Metrics Summary Strip */}
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
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Unallotted Balance</span>
                    <strong className="text-[#3A3564] text-sm">{group.balance.toLocaleString('en-IN')} pcs</strong>
                  </div>
                  <div className="p-1 rounded-lg hover:bg-slate-200 text-slate-500">
                    {isArtExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Card Body (Accordion) */}
              {isArtExpanded && (
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Ledger Banner Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">📥 Store Inward (GRN)</span>
                        <strong className="text-slate-900 text-xs">{group.totalInward.toLocaleString('en-IN')} pcs (Received)</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-emerald-600 shadow-2xs">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">📤 Floor Allocations</span>
                        <strong className="text-emerald-700 text-xs">{group.totalAllotted.toLocaleString('en-IN')} pcs ({group.allotments.length} Lines)</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3A3564]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">⚖️ Remaining Stock</span>
                        <strong className="text-slate-900 text-xs">
                          {group.balance.toLocaleString('en-IN')} pcs {group.safetyBuffer > 0 ? `(+${group.safetyBuffer} Buffer Safe)` : ''}
                        </strong>
                      </div>
                    </div>
                  </div>

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
                              onClick={() => toggleAllotment(al.id)}
                              className="p-3.5 flex flex-wrap items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[11px] font-mono font-bold text-[#3A3564]">
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
                                <div className="p-1 rounded-md text-slate-400">
                                  {isAllotExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </div>
                              </div>
                            </div>

                            {/* Itemized BOM Checklist Accordion */}
                            {isAllotExpanded && (
                              <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 space-y-2">
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                  Itemized Line BOM Handover Details:
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
                                          className="p-2 rounded-lg bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs"
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
        })}
      </div>
    </div>
  )
}
