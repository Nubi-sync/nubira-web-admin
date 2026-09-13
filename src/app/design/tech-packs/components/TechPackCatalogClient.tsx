'use client'

import { useState, useEffect } from 'react'
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Plus, 
  Layers, 
  LayoutGrid, 
  Table as TableIcon, 
  Clock, 
  Tag, 
  Scissors, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  GitCompare,
  X
} from 'lucide-react'
import { TechPack, TechPackStatus } from '../../types/design'
import { getStoredTechPacks } from '../../utils/designStorage'
import { CreateTechPackModal } from './CreateTechPackModal'
import { EmptyState } from '@/components/ui/EmptyState'

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: 'Draft', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SAMPLE_DEV: { label: 'Sample Dev', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  PPS_SUBMITTED: { label: 'PPS Review', badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 font-semibold' },
  PPS_APPROVED: { label: 'PPS Approved', badgeClass: 'bg-[#FAF7F0] text-slate-800 border-black/10 font-semibold' },
  APPROVED_BULK: { label: 'Approved Bulk', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' },
  REVISE_FIT: { label: 'Revise Fit', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' }
}

interface TechPackCatalogClientProps {
  initialTechPacks?: TechPack[]
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}

export function TechPackCatalogClient({ initialTechPacks, availableBrands }: TechPackCatalogClientProps = {}) {
  const [techPacks, setTechPacks] = useState<TechPack[]>(() => {
    if (initialTechPacks && initialTechPacks.length > 0) return initialTechPacks
    return []
  })
  const [activeTab, setActiveTab] = useState<'gallery' | 'table'>('gallery')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [diffPack, setDiffPack] = useState<TechPack | null>(null)

  function loadPacks() {
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
      loadPacks()
    }
    const handler = () => loadPacks()
    window.addEventListener('zigza_tech_packs_updated', handler)
    return () => window.removeEventListener('zigza_tech_packs_updated', handler)
  }, [initialTechPacks])

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
      
      {/* Action Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Tech-Pack Master Catalog
            </h1>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {filteredPacks.length} specifications
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Standardized technical packages, CAD vectors, SPI standards & bill of materials
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Gallery / Table Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-black/10 shrink-0">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-white text-[#3A3564] shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visual Card Gallery"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-white text-[#3A3564] shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Detailed Spec Table"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tech-Pack</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'APPROVED_BULK', 'PPS_APPROVED', 'PPS_SUBMITTED', 'SAMPLE_DEV', 'REVISE_FIT', 'DRAFT'] as const).map(st => {
            const isSel = statusFilter === st
            const label = st === 'ALL' ? 'All Specs' : STATUS_CONFIG[st]?.label || st
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSel
                    ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                    : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search style or brand..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>
      </div>

      {/* Primary Display: Gallery, Table, or EmptyState */}
      {filteredPacks.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={searchQuery || statusFilter !== 'ALL' ? "No matching tech-packs" : "No tech-packs found"}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? "Try adjusting your filters or search query."
              : "Create your first specification package."
          }
          actionLabel="Create Tech-Pack"
          onAction={() => setIsCreateOpen(true)}
          secondaryActionLabel={
            searchQuery || statusFilter !== 'ALL' ? "Reset filters" : undefined
          }
          onSecondaryAction={
            searchQuery || statusFilter !== 'ALL'
              ? () => {
                  setStatusFilter('ALL')
                  setSearchQuery('')
                }
              : undefined
          }
        />
      ) : activeTab === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPacks.map(pack => {
            const stCfg = STATUS_CONFIG[pack.status] || STATUS_CONFIG.DRAFT
            return (
              <div
                key={pack.id}
                className="bg-white rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-black/5 bg-[#FAF7F0]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#3A3564] px-2.5 py-1 rounded-md bg-white border border-black/10">
                      {pack.style_number}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-md border ${stCfg.badgeClass}`}>
                      {stCfg.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3A3564] transition-colors line-clamp-1 font-[family-name:var(--font-heading)]">
                      {pack.style_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Brand: {pack.brand_name} • Category: {pack.category}
                    </p>
                  </div>
                </div>

                {/* Card Specs Body */}
                <div className="p-5 space-y-3.5 flex-1">
                  <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                      <span className="text-xs text-slate-400 font-medium block">Base Size</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{pack.base_size}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-black/5">
                      <span className="text-xs text-slate-400 font-medium block">Target Weight</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{pack.target_gsm} GSM</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm">
                    <span className="text-xs text-slate-400 font-medium block">Fabric Composition</span>
                    <p className="font-medium text-slate-700 line-clamp-1">{pack.fabric_composition}</p>
                  </div>

                  <div className="space-y-1 text-xs sm:text-sm">
                    <span className="text-xs text-slate-400 font-medium block">Embellishment Flow</span>
                    <span className="inline-block text-xs font-mono font-medium text-[#3A3564] bg-[#FAF7F0] px-2.5 py-1 rounded border border-black/10">
                      {pack.embellishment_sequence === 'NONE' ? 'Plain Cut Assembly' : pack.embellishment_sequence}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-black/5 bg-[#FAF7F0]/40 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cut: {pack.target_cut_date}</span>
                  </div>

                  <button
                    onClick={() => setDiffPack(pack)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#3A3564] hover:underline cursor-pointer"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>View Diff (v{pack.version}.0)</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Detailed Spec Table */
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Style Ref</th>
                  <th className="py-3 px-4">Commercial Name</th>
                  <th className="py-3 px-4">Buyer Brand</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Size</th>
                  <th className="py-3 px-4">Fabric / GSM</th>
                  <th className="py-3 px-4">SPI / Seam</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {filteredPacks.map(pack => {
                  const stCfg = STATUS_CONFIG[pack.status] || STATUS_CONFIG.DRAFT
                  return (
                    <tr key={pack.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#3A3564]">
                        {pack.style_number}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {pack.style_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {pack.brand_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{pack.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">{pack.base_size}</td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {pack.target_gsm} GSM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {pack.spi} SPI • {pack.seam_class.split(' ')[2] || 'Overlock'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md border ${stCfg.badgeClass}`}>
                          {stCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDiffPack(pack)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#3A3564] hover:underline cursor-pointer"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Diff</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Version History Diff Modal */}
      {diffPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Version Diff Engine • {diffPack.style_number}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Comparing v{diffPack.version - 1}.0 vs Active v{diffPack.version}.0
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiffPack(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs text-slate-700 space-y-1">
                <span className="font-semibold text-slate-900 block">Audit Log Sign-Off</span>
                <p>Base pattern released to CAD spreading table. Approved by Lead Technical Designer.</p>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <span className="font-semibold uppercase tracking-wider text-slate-500 block">Measurement Deltas:</span>
                <div className="divide-y divide-black/5 border border-black/10 rounded-xl overflow-hidden">
                  <div className="p-3 flex items-center justify-between bg-slate-50">
                    <span className="font-medium text-slate-700">Half Chest Width</span>
                    <span className="font-mono font-semibold text-slate-800 bg-white border border-black/10 px-2 py-0.5 rounded">
                      +1.5 cm (v1.1)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Body Length from HPS</span>
                    <span className="font-mono font-semibold text-slate-800 bg-white border border-black/10 px-2 py-0.5 rounded">
                      -0.5 cm (v1.1)
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-slate-50">
                    <span className="font-medium text-slate-700">Neck Opening Drop</span>
                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      0.0 cm (No change)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 bg-[#FAF7F0]/60 flex justify-end">
              <button
                onClick={() => setDiffPack(null)}
                className="px-5 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all cursor-pointer font-[family-name:var(--font-heading)]"
              >
                Close Diff Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Modal */}
      <CreateTechPackModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadPacks}
        availableBrands={availableBrands}
      />
    </div>
  )
}
