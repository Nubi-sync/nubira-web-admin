'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  RotateCcw,
  Palette,
  Search,
  Layers,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import { DesignBrief, BriefStatus } from '../../types/design'
import { EmptyState } from '@/components/ui/EmptyState'

interface DesignerHistoryClientProps {
  initialBriefs: DesignBrief[]
  designerName?: string
  designerPhone?: string
  designerEmail: string
  companyName: string
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string; isGreen?: boolean; isRed?: boolean }> = {
  ALLOCATED: { label: 'Pending Upload', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'In Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'Approved by Head', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true },
  PH_REJECTED: { label: 'Revisions Needed', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', isRed: true },
  SA_APPROVED: { label: 'Approved / Greenlit', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true },
  SA_SAVED_FOR_LATER: { label: 'Seasonal Archive', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true }
}

function getColorSwatchInfo(colorName: string): { bg: string; border: string; isLight: boolean } {
  const norm = colorName.trim().toLowerCase()
  if (norm.includes('black')) return { bg: '#111111', border: '#222222', isLight: false }
  if (norm.includes('white')) return { bg: '#FFFFFF', border: '#CBD5E1', isLight: true }
  if (norm.includes('navy')) return { bg: '#1B2A4A', border: '#1B2A4A', isLight: false }
  if (norm.includes('olive')) return { bg: '#556B2F', border: '#556B2F', isLight: false }
  if (norm.includes('grey') || norm.includes('gray')) return { bg: '#718096', border: '#718096', isLight: false }
  if (norm.includes('red') || norm.includes('maroon') || norm.includes('crimson')) return { bg: '#C53030', border: '#C53030', isLight: false }
  if (norm.includes('beige') || norm.includes('cream') || norm.includes('khaki') || norm.includes('sand')) return { bg: '#F5F5DC', border: '#CBD5E1', isLight: true }
  if (norm.includes('blue') || norm.includes('cyan') || norm.includes('sky')) return { bg: '#2B6CB0', border: '#2B6CB0', isLight: false }
  if (norm.includes('green') || norm.includes('mint') || norm.includes('emerald')) return { bg: '#276749', border: '#276749', isLight: false }
  if (norm.includes('yellow') || norm.includes('mustard') || norm.includes('gold')) return { bg: '#ECC94B', border: '#D69E2E', isLight: true }
  if (norm.includes('pink') || norm.includes('rose') || norm.includes('fuchsia')) return { bg: '#D53F8C', border: '#D53F8C', isLight: false }
  if (norm.includes('orange') || norm.includes('coral') || norm.includes('rust')) return { bg: '#DD6B20', border: '#DD6B20', isLight: false }
  if (norm.includes('brown') || norm.includes('tan') || norm.includes('chocolate')) return { bg: '#7B341E', border: '#7B341E', isLight: false }
  if (norm.includes('purple') || norm.includes('violet') || norm.includes('lavender')) return { bg: '#6B46C1', border: '#6B46C1', isLight: false }
  return { bg: '#3A3564', border: '#3A3564', isLight: false }
}

export function DesignerHistoryClient({
  initialBriefs,
  designerName,
  designerPhone,
  designerEmail
}: DesignerHistoryClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedBrief, setSelectedBrief] = useState<DesignBrief | null>(null)
  const [activeModalConceptTab, setActiveModalConceptTab] = useState<number>(1)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Submissions that are in history (everything except purely unsubmitted ALLOCATED)
  const historyBriefs = initialBriefs.filter(b => b.status !== 'ALLOCATED' || b.latest_submission)

  const filtered = historyBriefs.filter(b => {
    const matchSearch = 
      b.garment_type.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      (b.instructions || '').toLowerCase().includes(search.toLowerCase())

    if (!matchSearch) return false

    if (filterStatus === 'APPROVED') {
      return b.status === 'PH_APPROVED' || b.status === 'SA_APPROVED' || b.status === 'TECH_PACK_CREATED' || b.status === 'SA_SAVED_FOR_LATER'
    }
    if (filterStatus === 'IN_REVIEW') {
      return b.status === 'SUBMITTED'
    }
    if (filterStatus === 'REVISIONS') {
      return b.status === 'PH_REJECTED'
    }
    return true
  })

  // KPI Metrics
  const totalSubmissions = historyBriefs.length
  const approvedCount = historyBriefs.filter(b => b.status === 'PH_APPROVED' || b.status === 'SA_APPROVED' || b.status === 'TECH_PACK_CREATED').length
  const inReviewCount = historyBriefs.filter(b => b.status === 'SUBMITTED').length
  const revisionsCount = historyBriefs.filter(b => b.status === 'PH_REJECTED').length

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Breadcrumb Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link
            href="/design/designer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Active Studio</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="font-mono font-bold text-slate-900 text-xs">Submission History &amp; Revisions</span>
        </div>

        <Link
          href="/design/designer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>View Active Assignments</span>
        </Link>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Submission History &amp; Review Archive
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                {designerName || 'Designer'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Track Provisional Head verdicts, view past submitted artwork decks, and address revision notes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564]">
            {designerPhone ? `+91 ${designerPhone}` : designerEmail}
          </span>
        </div>
      </div>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-slate-500 block mb-2 uppercase tracking-wider">
            Total Submissions
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalSubmissions} Decks
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">All completed briefs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-emerald-700 block mb-2 uppercase tracking-wider">
            Approved &amp; Greenlit
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
            {approvedCount} Concepts
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Cleared for industrial Tech-Pack</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-amber-700 block mb-2 uppercase tracking-wider">
            In Head Review
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">
            {inReviewCount} Briefs
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Awaiting Provisional Head review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-mono font-bold text-rose-700 block mb-2 uppercase tracking-wider">
            Revisions Needed
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-800 font-mono">
            {revisionsCount} Briefs
          </div>
          <p className="text-xs text-rose-600 mt-1 font-medium">Action required by designer</p>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by garment, style, brief #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            {[
              { key: 'ALL', label: `All History (${historyBriefs.length})` },
              { key: 'APPROVED', label: `Approved (${approvedCount})` },
              { key: 'IN_REVIEW', label: `In Review (${inReviewCount})` },
              { key: 'REVISIONS', label: `Revisions (${revisionsCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-[#FAF7F0] text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Submissions Ledger Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-8">
          <EmptyState
            icon={Clock}
            title="No submissions match your filter"
            description="When you submit briefs on your active studio workspace, they will appear in this history ledger."
            actionLabel="Go to Active Studio"
            onAction={() => router.push('/design/designer')}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                  <th className="py-3 px-4">Garment &amp; Category</th>
                  <th className="py-3 px-4">Scope &amp; Palette</th>
                  <th className="py-3 px-4">Submission Status &amp; Verdict</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map(brief => {
                  const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.SUBMITTED
                  const isRejected = brief.status === 'PH_REJECTED'
                  const isApproved = stCfg.isGreen

                  const concepts = brief.latest_submission?.concepts || []
                  const totalColorwaysAttached = concepts.reduce((acc, c) => {
                    const withPhotos = (c.colorways || []).filter(cw => cw.photo_front || cw.photo_back).length
                    return acc + withPhotos
                  }, 0)

                  return (
                    <tr key={brief.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm block font-[family-name:var(--font-heading)]">
                          {brief.garment_type}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{brief.category} Style</span>
                          <span>&bull;</span>
                          <span className="font-mono text-[11px] text-slate-400">#{brief.id.substring(0, 8)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-slate-800 text-xs">
                            {brief.target_designs || 1} Designs &times; {brief.max_colors} Colors
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            {(brief.target_colors || []).map((col, cIdx) => {
                              const sw = getColorSwatchInfo(col)
                              return (
                                <span
                                  key={cIdx}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-black/10 text-[10px] font-mono text-slate-700"
                                >
                                  <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: sw.bg }} />
                                  <span>{col}</span>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${stCfg.badgeClass}`}>
                              {stCfg.label}
                            </span>
                            {totalColorwaysAttached > 0 && (
                              <span className="text-[10px] font-mono font-semibold text-slate-500">
                                {totalColorwaysAttached} Mockups
                              </span>
                            )}
                          </div>

                          {isRejected && brief.latest_submission?.ph_feedback && (
                            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                              <span className="font-bold font-mono uppercase block text-[10px]">Head Feedback:</span>
                              <p className="italic font-medium line-clamp-2">&ldquo;{brief.latest_submission.ph_feedback}&rdquo;</p>
                            </div>
                          )}

                          {isApproved && (
                            <span className="text-[11px] text-emerald-700 font-medium block">
                              Verified &amp; Industrialized
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {isRejected ? (
                            <Link
                              href={`/design/designer?briefId=${brief.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Redo / Revise Work</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBrief(brief)
                                setActiveModalConceptTab(1)
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 text-[#3A3564] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Deck</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. View Submitted Deck Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl rounded-2xl border border-black/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                      {selectedBrief.garment_type} ({selectedBrief.category} Style)
                    </h2>
                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_CONFIG[selectedBrief.status]?.badgeClass}`}>
                      {STATUS_CONFIG[selectedBrief.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Brief #{selectedBrief.id.substring(0, 8)} &bull; Scope: {selectedBrief.target_designs || 1} Designs &times; {selectedBrief.max_colors} Colors
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Head Feedback banner if any */}
              {selectedBrief.latest_submission?.ph_feedback && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Provisional Head Feedback:</span>
                  </div>
                  <p className="italic font-medium text-xs">&ldquo;{selectedBrief.latest_submission.ph_feedback}&rdquo;</p>
                </div>
              )}

              {/* Concepts Navigation Tabs */}
              {selectedBrief.latest_submission?.concepts && selectedBrief.latest_submission.concepts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 flex-wrap">
                    {selectedBrief.latest_submission.concepts.map(concept => (
                      <button
                        key={concept.concept_number}
                        type="button"
                        onClick={() => setActiveModalConceptTab(concept.concept_number)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          activeModalConceptTab === concept.concept_number
                            ? 'bg-[#3A3564] text-white shadow-xs'
                            : 'bg-[#FAF7F0] text-slate-700 hover:bg-slate-100 border border-black/10'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Design #{concept.concept_number}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Concept Display */}
                  {(() => {
                    const currentConcept = selectedBrief.latest_submission?.concepts.find(c => c.concept_number === activeModalConceptTab) || selectedBrief.latest_submission?.concepts[0]
                    if (!currentConcept) return null

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm font-mono">
                            {currentConcept.title || `Design Concept #${currentConcept.concept_number}`}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {currentConcept.colorways?.length || 0} Colorway(s)
                          </span>
                        </div>

                        {currentConcept.notes && (
                          <p className="text-slate-600 bg-[#FAF7F0] p-3 rounded-xl border border-black/10 italic">
                            &ldquo;{currentConcept.notes}&rdquo;
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {(currentConcept.colorways || []).map((cw, idx) => {
                            const sw = getColorSwatchInfo(cw.color_name)
                            return (
                              <div key={idx} className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: sw.bg }} />
                                    {cw.color_name}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Front</span>
                                    {cw.photo_front ? (
                                      <div
                                        onClick={() => setPreviewPhoto(cw.photo_front)}
                                        className="aspect-square bg-white rounded-lg border border-black/10 p-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                      >
                                        <img src={cw.photo_front} alt="Front" className="h-full w-full object-contain" />
                                      </div>
                                    ) : (
                                      <div className="aspect-square bg-white/60 rounded-lg border border-dashed border-black/10 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                        No Front
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Back</span>
                                    {cw.photo_back ? (
                                      <div
                                        onClick={() => setPreviewPhoto(cw.photo_back || null)}
                                        className="aspect-square bg-white rounded-lg border border-black/10 p-1 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                                      >
                                        <img src={cw.photo_back} alt="Back" className="h-full w-full object-contain" />
                                      </div>
                                    ) : (
                                      <div className="aspect-square bg-white/60 rounded-lg border border-dashed border-black/10 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                        No Back
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-[#FAF7F0] rounded-xl border border-black/10 font-mono">
                  No concept mockups attached for this brief.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-[#FAF7F0]/40">
              <span className="text-xs font-mono text-slate-500">
                Zigza MES Design Studio Archive
              </span>
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Image Lightbox */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl border border-black/10">
            <img
              src={previewPhoto}
              alt="Full View"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
