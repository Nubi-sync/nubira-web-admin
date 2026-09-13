'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Palette, 
  ChevronLeft, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  FileCheck2, 
  Ruler, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Scissors
} from 'lucide-react'
import { TechPack, TechPackStatus, SampleApproval, GradingScheme, MaterialItem } from '../types/design'
import { getStoredTechPacks } from '../utils/designStorage'
import { CreateTechPackModal } from '../tech-packs/components/CreateTechPackModal'

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: 'Draft', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SAMPLE_DEV: { label: 'Sample Dev', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  PPS_SUBMITTED: { label: 'PPS Review', badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold' },
  PPS_APPROVED: { label: 'PPS Approved', badgeClass: 'bg-[#FAF7F0] text-slate-800 border-black/10 font-semibold' },
  APPROVED_BULK: { label: 'Approved Bulk', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' },
  REVISE_FIT: { label: 'Revise Fit', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' }
}

interface DesignDashboardClientProps {
  initialTechPacks?: TechPack[]
  initialApprovals?: SampleApproval[]
  initialSchemes?: GradingScheme[]
  initialMaterials?: MaterialItem[]
}

export function DesignDashboardClient({ 
  initialTechPacks,
  initialApprovals,
  initialSchemes,
  initialMaterials
}: DesignDashboardClientProps = {}) {
  const [techPacks, setTechPacks] = useState<TechPack[]>(() => {
    if (initialTechPacks && initialTechPacks.length > 0) return initialTechPacks
    return []
  })
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  function loadData() {
    const stored = getStoredTechPacks()
    if (stored && stored.length > 0) {
      setTechPacks(stored)
    }
  }

  useEffect(() => {
    if (initialTechPacks !== undefined) {
      setTechPacks(initialTechPacks)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_design_tech_packs', JSON.stringify(initialTechPacks))
      }
    } else {
      loadData()
    }

    const handler = () => {
      loadData()
    }
    window.addEventListener('zigza_tech_packs_updated', handler)
    return () => window.removeEventListener('zigza_tech_packs_updated', handler)
  }, [initialTechPacks])

  const approvedCount = techPacks.filter(p => p.status === 'APPROVED_BULK' || (p.status as string) === 'PPS_APPROVED').length
  const pendingCount = techPacks.filter(p => p.status === 'PPS_SUBMITTED' || p.status === 'SAMPLE_DEV').length

  // Live Database Metrics
  const approvalsTotal = initialApprovals?.length || 0
  const approvedAuditsCount = initialApprovals?.filter(a => a.approval_status === 'APPROVED').length || 0
  const totalPomsCount = initialSchemes?.reduce((acc, s) => acc + (s.poms?.length || 0), 0) || 0
  const uniqueSystemsCount = new Set(techPacks.map(p => p.size_system)).size || 1
  const readinessPct = techPacks.length > 0 ? (approvedCount / techPacks.length) * 100 : 0

  const filteredPacks = techPacks.filter(tp => {
    const matchesStatus = 
      statusFilter === 'ALL' || 
      tp.status === statusFilter || 
      (statusFilter === 'APPROVED_BULK' && (tp.status as string) === 'PPS_APPROVED')
    const matchesSearch = 
      tp.style_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.style_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tp.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-500">
          Design & Tech-Pack Studio
        </span>
      </div>

      {/* Module Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Design & Tech-Pack Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              CAD sampling approvals, tech-pack spec sheets, grading tolerances, and sample development tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/design/tech-packs"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <FileCheck2 className="w-4 h-4 text-[#3A3564]" />
            <span>Master Catalog</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tech-Pack</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Tech-Packs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {techPacks.length} Specs
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 font-medium">
            {approvedCount} Approved for Bulk Cut
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sample Fit Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {pendingCount > 0 ? `${pendingCount} Pending` : `${approvalsTotal} Audited`}
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 font-medium">
            {approvalsTotal > 0 ? `${approvedAuditsCount} of ${approvalsTotal} Golden Seal Fit` : '0 pending review'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Size Grading Matrix
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {totalPomsCount > 0 ? `${totalPomsCount} Points` : `${uniqueSystemsCount} Systems`}
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 font-medium">
            Graded across {techPacks.length} active style{techPacks.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PPS Readiness
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {readinessPct.toFixed(1)}%
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 font-medium">
            {approvedCount} of {techPacks.length} production ready
          </div>
        </div>
      </div>

      {/* Primary Pipeline Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">Active Design & Tech-Pack Queue</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Live development batches under creative sampling review</p>
          </div>
          
          <Link
            href="/cutting"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3A3564] hover:underline shrink-0"
          >
            <span>Next: Cutting Lay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['ALL', 'APPROVED_BULK', 'PPS_APPROVED', 'PPS_SUBMITTED', 'SAMPLE_DEV', 'REVISE_FIT', 'DRAFT'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                    : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {st === 'ALL' ? 'All Queue' : STATUS_CONFIG[st as TechPackStatus]?.label || st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {/* Interactive Queue Table */}
        <div className="overflow-x-auto border border-black/10 rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Style Ref</th>
                <th className="py-3 px-4">Buyer / Brand</th>
                <th className="py-3 px-4">Garment Silhouette</th>
                <th className="py-3 px-4">Base Size</th>
                <th className="py-3 px-4">PPS Status</th>
                <th className="py-3 px-4">Embellishment Flow</th>
                <th className="py-3 px-4">Target Cut Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-slate-700">
              {filteredPacks.map(pack => {
                const stCfg = STATUS_CONFIG[pack.status] || STATUS_CONFIG.DRAFT
                return (
                  <tr key={pack.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#3A3564] block text-sm">{pack.style_number}</span>
                      <span className="text-xs text-slate-500 line-clamp-1">{pack.style_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
                      {pack.brand_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 text-sm">{pack.category}</span>
                      <span className="text-xs font-mono text-slate-500 block">{pack.target_gsm} GSM</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-sm">
                      {pack.base_size}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-md border ${stCfg.badgeClass}`}>
                        {stCfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {pack.embellishment_sequence === 'NONE' ? (
                        <span className="text-slate-400">Plain Cut</span>
                      ) : (
                        <span className="font-semibold text-[#3A3564]">{pack.embellishment_sequence.split('_')[0]} First</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {pack.target_cut_date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/design/sample-approvals"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#3A3564] hover:underline"
                      >
                        <span>Audit</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Division Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/design/sample-approvals"
          className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] group-hover:text-[#3A3564]">Sample Approvals & PPS</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">Audit physical fit prototypes & record buyer golden piece sign-offs</p>
        </Link>

        <Link
          href="/design/grading-matrix"
          className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mb-3">
            <Ruler className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] group-hover:text-[#3A3564]">Dynamic Grading Matrix</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">Multi-system size scale calibration across adult, kids, and numeric ranges</p>
        </Link>

        <Link
          href="/design/materials-library"
          className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mb-3">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] group-hover:text-[#3A3564]">Fabric & Trims Library</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">Shrinkage telemetry, spirality indexes, and validated thread needle pairings</p>
        </Link>
      </div>

      {/* Stepper Modal */}
      <CreateTechPackModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadData}
      />

    </div>
  )
}
