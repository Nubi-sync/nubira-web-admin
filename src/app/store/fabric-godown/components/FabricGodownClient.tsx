'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Layers, 
  ChevronLeft, 
  Search, 
  Scale, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Filter,
  Plus,
  Trash2
} from 'lucide-react'
import { FabricRollInspection, FabricShadeGroup } from '../../types/store'
import { getFabricRolls, deleteFabricRoll, STORE_UPDATE_EVENT } from '../../utils/storeStorage'
import { InspectRollModal } from './InspectRollModal'
import { InwardFabricRollModal } from './InwardFabricRollModal'
import { EmptyState } from '@/components/ui/EmptyState'

export function FabricGodownClient() {
  const [rolls, setRolls] = useState<FabricRollInspection[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [shadeFilter, setShadeFilter] = useState<'ALL' | FabricShadeGroup | 'PENDING' | 'REJECTED'>('ALL')
  const [selectedRoll, setSelectedRoll] = useState<FabricRollInspection | null>(null)
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false)
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false)

  const loadRolls = () => {
    const raw = getFabricRolls()
    // Deduplicate by barcode if duplicates exist
    const seen = new Set<string>()
    const deduplicated: FabricRollInspection[] = []
    for (const r of raw) {
      const code = r.rollBarcode.trim().toLowerCase()
      if (!seen.has(code)) {
        seen.add(code)
        deduplicated.push(r)
      }
    }
    if (deduplicated.length !== raw.length) {
      localStorage.setItem('zigza_store_fabric_rolls_v3', JSON.stringify(deduplicated))
    }
    setRolls(deduplicated)
  }

  const handleDeleteRoll = (rollId: string, barcode: string) => {
    if (confirm(`Remove roll ${barcode} from godown inventory?`)) {
      deleteFabricRoll(rollId)
      loadRolls()
    }
  }

  useEffect(() => {
    loadRolls()
    const handleUpdate = () => loadRolls()
    window.addEventListener(STORE_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(STORE_UPDATE_EVENT, handleUpdate)
  }, [])

  // Metrics
  const totalRolls = rolls.length
  const totalWeightKg = rolls.reduce((acc, r) => acc + r.grossWeightKg, 0)
  const weightTons = (totalWeightKg / 1000).toFixed(1)
  const passedRolls = rolls.filter(r => r.inspectionStatus === 'PASSED').length
  const passRate = totalRolls > 0 ? Math.round((passedRolls / totalRolls) * 100) : 0
  const pendingCount = rolls.filter(r => r.inspectionStatus === 'PENDING_INSPECTION').length

  const filteredRolls = rolls.filter(roll => {
    const matchesSearch = 
      roll.rollBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roll.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roll.fabricType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roll.colorShade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roll.godownRackLocation.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (shadeFilter === 'ALL') return true
    if (shadeFilter === 'PENDING') return roll.inspectionStatus === 'PENDING_INSPECTION'
    if (shadeFilter === 'REJECTED') return roll.inspectionStatus === 'REJECTED'
    return roll.shadeGroup === shadeFilter
  })

  const openInspectModal = (roll: FabricRollInspection) => {
    setSelectedRoll(roll)
    setIsInspectModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/store"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Store Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
          ASTM D5430 4-Point Fabric QC • Raw Godown Bay 1–2
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Fabric Godown &amp; 4-Point QC
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 tracking-wider">
                ASTM D5430 SLA &le; 28 Pts
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Roll yardage inventory ledger, spectrophotometer shade group banding (Shade A/B/C), and direct inspector accountability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsInwardModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Inward Fabric Rolls</span>
          </button>

          <Link
            href="/store/material-issues"
            className="px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 text-xs font-bold hover:bg-[#F2ECE1] transition-all shadow-2xs inline-flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Issue Passed Rolls to Cutting</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards - Unified Icon & Neutral Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Total Rolls in Godown
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {totalRolls} <span className="text-sm font-normal text-slate-500">Rolls</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Godown Bay 1 & Bay 2 Yardage
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Fabric Weight in Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {weightTons} <span className="text-sm font-normal text-slate-500">Tons</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            {totalWeightKg.toLocaleString()} kg Total Gross Weight
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              ASTM 4-Point Pass Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {passRate}%
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            SLA Compliance Target: ≥ 95.0%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Pending Audit Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 tabular-nums">
            {pendingCount} <span className="text-sm font-normal text-slate-500">Rolls</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-1">
            Awaiting 4-Point Inspection Table
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by roll barcode, mill supplier, fabric type, shade, or rack..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>

        {/* Shade & Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SHADE_A', 'SHADE_B', 'SHADE_C', 'PENDING', 'REJECTED'] as const).map(tab => {
            const label = tab === 'ALL' ? 'All Rolls' : tab === 'SHADE_A' ? 'Shade A' : tab === 'SHADE_B' ? 'Shade B' : tab === 'SHADE_C' ? 'Shade C' : tab === 'PENDING' ? 'Pending' : 'Quarantine Reject'
            const active = shadeFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setShadeFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active 
                    ? 'bg-[#3A3564] text-white shadow-2xs' 
                    : 'bg-[#FAF7F0] text-slate-600 hover:text-slate-900 hover:bg-[#F2ECE1] border border-black/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rolls Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Roll Barcode</th>
                <th className="py-3 px-4">Fabric Specification</th>
                <th className="py-3 px-4">Shade Band</th>
                <th className="py-3 px-4">Length & Weight</th>
                <th className="py-3 px-4">ASTM Score</th>
                <th className="py-3 px-4">Rack Bay</th>
                <th className="py-3 px-4">QC Verdict</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 font-medium text-slate-800">
              {filteredRolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      variant="seamless"
                      icon={Layers}
                      title="No Fabric Rolls Found"
                      description="No fabric rolls match your current search query or the godown is currently empty. Inward fabric rolls from the mill truck delivery to begin inspection."
                      actionLabel="+ Inward Fabric Roll"
                      onAction={() => setIsInwardModalOpen(true)}
                      secondaryActionLabel={searchQuery || shadeFilter !== 'ALL' ? "Reset Filters" : undefined}
                      onSecondaryAction={searchQuery || shadeFilter !== 'ALL' ? () => {
                        setSearchQuery('')
                        setShadeFilter('ALL')
                      } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                filteredRolls.map(roll => {
                  const isPassed = roll.inspectionStatus === 'PASSED'
                  const isRejected = roll.inspectionStatus === 'REJECTED'
                  const isPending = roll.inspectionStatus === 'PENDING_INSPECTION'

                  return (
                    <tr key={roll.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-black text-slate-900">
                          {roll.rollBarcode}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {roll.supplierName}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {roll.fabricType}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {roll.colorShade} • {roll.measuredGsm} GSM ({roll.measuredWidthInches}")
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                          {roll.shadeGroup.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">
                          {roll.netMeterage} m
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {roll.grossWeightKg} kg Gross
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isPending ? (
                          <span className="text-[11px] font-mono text-slate-400">
                            Awaiting Test
                          </span>
                        ) : (
                          <div>
                            <span className="font-mono font-black text-sm text-slate-900 tabular-nums">
                              {roll.pointsPer100SqYd} pts
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              / 100 sq yd (Total: {roll.penaltyPointsTotal})
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 border border-black/10 font-bold text-[11px]">
                          {roll.godownRackLocation}
                        </span>
                        {roll.isIssuedToCutting && (
                          <span className="block text-[10px] text-slate-600 font-bold mt-0.5">
                            ✓ Issued to Cut
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isPassed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-[#3A3564]" />
                            Pass (Cut Approved)
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-800 text-[10px] font-mono font-bold uppercase border border-black/15 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-[#3A3564]" />
                            Reject (&gt; 28 Pts)
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-slate-700 text-[10px] font-mono font-bold uppercase border border-black/10">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Pending QC
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openInspectModal(roll)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 hover:bg-[#3A3564] hover:text-white text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs cursor-pointer"
                          >
                            {isPending ? 'Audit Roll' : 'Re-Inspect'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoll(roll.id, roll.rollBarcode)}
                            title="Delete Roll"
                            className="p-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <InwardFabricRollModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onSuccess={loadRolls}
      />

      <InspectRollModal
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        roll={selectedRoll}
      />

    </div>
  )
}
