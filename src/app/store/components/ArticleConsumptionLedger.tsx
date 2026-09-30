'use client'

import React, { useState, useMemo } from 'react'
import {
  Boxes,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Tag,
  Package,
  Palette,
  Search,
  X,
  User,
  AlertCircle
} from 'lucide-react'
import { ActiveAllotment, TruckInward } from './StoreDashboardClient'

interface ArticleConsumptionLedgerProps {
  activeAllotments: ActiveAllotment[]
  truckInwards: TruckInward[]
}

interface LinemanSummary {
  linemanName: string
  lotsCount: number
  totalPcs: number
  colors: string[]
  pendingLotsCount: number
  issuedLotsCount: number
  isFullyIssued: boolean
}

interface ArticleLedgerGroup {
  artNo: string
  rawArtNos: string[]
  description?: string
  totalInward: number
  totalAllotted: number
  balance: number
  totalLots: number
  pendingLots: number
  issuedLots: number
  isFullyIssued: boolean
  latestCreatedAt: number
  linemen: LinemanSummary[]
}

// Normalizer to group suffix lots (e.g., 3293A & 3293 -> 3293)
function getBaseArticle(raw?: string | null): string {
  if (!raw) return 'GENERAL'
  const trimmed = raw.trim().toUpperCase()
  const match = trimmed.match(/^(\d+)[A-Z_\-\/\s]/) || trimmed.match(/^(\d+)[A-Z]+$/)
  if (match) return match[1]
  const numOnly = trimmed.match(/^(\d+)$/)
  if (numOnly) return numOnly[1]
  const prefix = trimmed.match(/^(?:ART|ARTICLE|STYLE)?\s*[-#:]?\s*(\d+)/i)
  if (prefix) return prefix[1]
  return trimmed
}

export function ArticleConsumptionLedger({
  activeAllotments = [],
  truckInwards = []
}: ArticleConsumptionLedgerProps) {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ISSUED'>('ALL')

  // Aggregate Data by Base Master Article
  const articleGroups: ArticleLedgerGroup[] = useMemo(() => {
    const map: Record<string, ArticleLedgerGroup> = {}

    // 1. Process Truck Inwards (GRN)
    truckInwards.forEach(grn => {
      const rawArt = (grn.article_no || '').trim().toUpperCase() || 'GENERAL'
      const baseArt = getBaseArticle(rawArt)
      if (!map[baseArt]) {
        map[baseArt] = {
          artNo: baseArt,
          rawArtNos: [rawArt],
          description: '',
          totalInward: 0,
          totalAllotted: 0,
          balance: 0,
          totalLots: 0,
          pendingLots: 0,
          issuedLots: 0,
          isFullyIssued: true,
          latestCreatedAt: 0,
          linemen: []
        }
      }

      const items = (grn.items && grn.items.length > 0) ? grn.items : (grn.line_items || [])
      const inwardPcs = items.reduce((sum: number, it: any) => {
        const qty = Number(it.quantity || it.received_qty || 0)
        return sum + (isNaN(qty) ? 0 : qty)
      }, 0)

      map[baseArt].totalInward += inwardPcs
    })

    // 2. Process Allotments to map Lineman Line Handovers & BOM items
    const linemanLotsMap: Record<string, Record<string, {
      linemanName: string
      lotsCount: number
      totalPcs: number
      colorsSet: Set<string>
      pendingLotsCount: number
      issuedLotsCount: number
    }>> = {}

    activeAllotments.forEach(al => {
      const rawArt = (al.article?.art_no || '').trim().toUpperCase() || 'GENERAL'
      const baseArt = getBaseArticle(rawArt)
      const desc = al.article?.description || ''
      const createdAtMs = new Date(al.created_at || al.allotment_date || 0).getTime()
      const validCreated = isNaN(createdAtMs) ? 0 : createdAtMs

      if (!map[baseArt]) {
        map[baseArt] = {
          artNo: baseArt,
          rawArtNos: [rawArt],
          description: desc,
          totalInward: 0,
          totalAllotted: 0,
          balance: 0,
          totalLots: 0,
          pendingLots: 0,
          issuedLots: 0,
          isFullyIssued: true,
          latestCreatedAt: validCreated,
          linemen: []
        }
      } else {
        if (!map[baseArt].rawArtNos.includes(rawArt)) {
          map[baseArt].rawArtNos.push(rawArt)
        }
        if (!map[baseArt].description && desc) {
          map[baseArt].description = desc
        }
        map[baseArt].latestCreatedAt = Math.max(map[baseArt].latestCreatedAt, validCreated)
      }

      const targetQty = Number(al.target_qty) || 0
      map[baseArt].totalAllotted += targetQty
      map[baseArt].totalLots += 1

      const materials = (al.allotment_materials || []).map(m => ({
        id: m.id,
        admin_issued: Boolean((m as any).admin_issued)
      }))
      const issuedCount = materials.filter(m => m.admin_issued).length
      const isLotFullyIssued = materials.length > 0 && issuedCount === materials.length

      if (isLotFullyIssued) {
        map[baseArt].issuedLots += 1
      } else {
        map[baseArt].pendingLots += 1
        map[baseArt].isFullyIssued = false
      }

      const linemanName = al.lineman?.username || 'Lineman'
      if (!linemanLotsMap[baseArt]) {
        linemanLotsMap[baseArt] = {}
      }
      if (!linemanLotsMap[baseArt][linemanName]) {
        linemanLotsMap[baseArt][linemanName] = {
          linemanName,
          lotsCount: 0,
          totalPcs: 0,
          colorsSet: new Set(),
          pendingLotsCount: 0,
          issuedLotsCount: 0
        }
      }

      const lm = linemanLotsMap[baseArt][linemanName]
      lm.lotsCount += 1
      lm.totalPcs += targetQty
      if (isLotFullyIssued) {
        lm.issuedLotsCount += 1
      } else {
        lm.pendingLotsCount += 1
      }

      const variants = al.allotment_variants || []
      variants.forEach(v => {
        if (v.color && v.color.trim()) lm.colorsSet.add(v.color.trim())
      })
    })

    // 3. Assemble Lineman summaries & compute balances
    Object.values(map).forEach(group => {
      group.balance = Math.max(0, group.totalInward - group.totalAllotted)

      const lms = linemanLotsMap[group.artNo] || {}
      group.linemen = Object.values(lms).map(lm => ({
        linemanName: lm.linemanName,
        lotsCount: lm.lotsCount,
        totalPcs: lm.totalPcs,
        colors: Array.from(lm.colorsSet),
        pendingLotsCount: lm.pendingLotsCount,
        issuedLotsCount: lm.issuedLotsCount,
        isFullyIssued: lm.pendingLotsCount === 0
      })).sort((a, b) => b.totalPcs - a.totalPcs)
    })

    return Object.values(map).sort((a, b) => {
      // 1. Most recently created / allotted articles ALWAYS appear first on top
      if (b.latestCreatedAt !== a.latestCreatedAt) {
        return b.latestCreatedAt - a.latestCreatedAt
      }
      // 2. Pending lots come before fully issued
      if (a.pendingLots > 0 && b.pendingLots === 0) return -1
      if (b.pendingLots > 0 && a.pendingLots === 0) return 1
      // 3. Then by total allotted qty
      return b.totalAllotted - a.totalAllotted
    })
  }, [activeAllotments, truckInwards])

  // Filter groups
  const filteredGroups = useMemo(() => {
    return articleGroups.filter(g => {
      if (filterStatus === 'PENDING' && g.pendingLots === 0) return false
      if (filterStatus === 'ISSUED' && g.pendingLots > 0) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesArt = g.artNo.toLowerCase().includes(q) || g.rawArtNos.some(r => r.toLowerCase().includes(q))
        const matchesDesc = (g.description || '').toLowerCase().includes(q)
        const matchesLineman = g.linemen.some(l => l.linemanName.toLowerCase().includes(q))
        if (!matchesArt && !matchesDesc && !matchesLineman) return false
      }
      return true
    })
  }, [articleGroups, filterStatus, searchQuery])

  return (
    <div className="space-y-4 select-none">
      {/* Section Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                Live Article Material Consumption & Allotment Status
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
                {articleGroups.length} Active Articles
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Executive overview of article cutting allotments, lineman floor assignments & BOM issue status
            </p>
          </div>
        </div>

        {/* Quick Search & Filters */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter article or lineman..."
              className="w-full pl-8 pr-7 py-1.5 text-xs font-semibold bg-[#FAF7F0]/60 border border-black/10 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-[#3A3564] text-white'
                  : 'bg-[#FAF7F0] text-slate-700 hover:bg-[#eae3d2] border border-black/10'
              }`}
            >
              All ({articleGroups.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PENDING')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filterStatus === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              Pending ({articleGroups.filter(g => g.pendingLots > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ISSUED')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filterStatus === 'ISSUED'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              Issued ({articleGroups.filter(g => g.pendingLots === 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Article Cards List */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400 bg-white rounded-2xl border border-dashed border-black/10">
            No articles match your search filter.
          </div>
        ) : (
          filteredGroups.map(group => {
            const isExpanded = expandedArticle === group.artNo
            const hasPending = group.pendingLots > 0

            return (
              <div
                key={group.artNo}
                className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden transition-all hover:border-[#3A3564]/30"
              >
                {/* Compact Executive Row */}
                <div
                  onClick={() => setExpandedArticle(isExpanded ? null : group.artNo)}
                  className="p-4 sm:p-4.5 bg-white hover:bg-[#FAF7F0]/40 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-3.5"
                >
                  {/* Left: Article Identifier & Lineman Chips */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center font-mono font-black text-sm shadow-2xs shrink-0">
                      <Tag className="w-4.5 h-4.5 text-[#3A3564]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 font-mono tracking-tight">
                          Article {group.artNo}
                        </h3>
                        {group.description && (
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate max-w-xs">
                            {group.description}
                          </span>
                        )}
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {group.totalLots} Lots
                        </span>
                      </div>

                      {/* Lineman Assignment Strip */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {group.linemen.length === 0 ? (
                          <span className="text-xs text-slate-400 font-mono">No floor lineman assigned yet</span>
                        ) : (
                          group.linemen.map(lm => (
                            <span
                              key={lm.linemanName}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-50 text-slate-700 border border-slate-200"
                            >
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{lm.linemanName}</span>
                              <span className="text-slate-400">({lm.lotsCount} lots · {lm.totalPcs.toLocaleString()} pcs)</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Metrics & Clean Status Badge */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="text-right pr-2">
                      <div className="text-sm sm:text-base font-black font-mono text-slate-900 tabular-nums">
                        {group.totalAllotted.toLocaleString()} pcs
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                        Floor Allotted
                      </span>
                    </div>

                    {/* Status Badge */}
                    {hasPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>{group.pendingLots} Lots Pending Handover</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Allotted & Issued</span>
                      </span>
                    )}

                    <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-slate-600 shadow-2xs">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Lineman Breakdown Table (Clean & Compact) */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-black/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                      <span>Floor Lineman Assignments & Color Breakdown</span>
                      <span className="text-[11px] text-slate-400 font-medium">Consolidated Summary</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-2xs">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#FAF7F0] text-slate-700 border-b border-black/10 uppercase tracking-wider text-[10px] font-bold">
                          <tr>
                            <th className="py-2.5 px-3.5">Lineman</th>
                            <th className="py-2.5 px-3.5">Assigned Colors</th>
                            <th className="py-2.5 px-3.5 text-center">Lots</th>
                            <th className="py-2.5 px-3.5 text-right">Target Quantity</th>
                            <th className="py-2.5 px-3.5 text-right">Handover Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.linemen.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                                No floor allotments created yet.
                              </td>
                            </tr>
                          ) : (
                            group.linemen.map(lm => (
                              <tr key={lm.linemanName} className="hover:bg-[#FAF7F0]/40 transition-colors">
                                <td className="py-2.5 px-3.5 font-bold text-slate-900 flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-[#3A3564]" />
                                  <span>{lm.linemanName}</span>
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {lm.colors.length === 0 ? (
                                      <span className="text-slate-400">-</span>
                                    ) : (
                                      lm.colors.map(col => (
                                        <span
                                          key={col}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FAF7F0] text-[#3A3564] border border-black/10"
                                        >
                                          <Palette className="w-2.5 h-2.5" />
                                          <span>{col}</span>
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 text-center font-bold text-slate-800">
                                  {lm.lotsCount}
                                </td>
                                <td className="py-2.5 px-3.5 text-right font-black text-slate-900 tabular-nums">
                                  {lm.totalPcs.toLocaleString()} pcs
                                </td>
                                <td className="py-2.5 px-3.5 text-right">
                                  {lm.isFullyIssued ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Issued ({lm.issuedLotsCount}/{lm.lotsCount})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                                      <Clock className="w-3 h-3 text-amber-700" /> Pending ({lm.pendingLotsCount} lots)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
