'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  Bookmark, 
  Clock, 
  Eye, 
  Search, 
  Sparkles, 
  ArrowRight, 
  XCircle, 
  Loader2,
  FileCheck2,
  FolderArchive,
  Palette,
  Layers,
  Tag,
  ChevronRight,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { DesignSubmission } from '../../types/design'
import { saReviewDesignSubmissionAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

function getVariantArtNumber(baseArtNo: string, index: number, totalCount: number): string {
  if (!baseArtNo) return ''
  if (totalCount <= 1) return baseArtNo
  const suffix = String(index + 1).padStart(2, '0')
  return `${baseArtNo}-${suffix}`
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

interface SADesignApprovalsClientProps {
  initialSubmissions: DesignSubmission[]
  companyName: string
  currentUserId: string
  userRole?: string
}

export function SADesignApprovalsClient({
  initialSubmissions,
  companyName,
  currentUserId,
  userRole
}: SADesignApprovalsClientProps) {
  const [submissions, setSubmissions] = useState<DesignSubmission[]>(initialSubmissions || [])
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Review Modal State
  const [reviewingSub, setReviewingSub] = useState<DesignSubmission | null>(null)
  const [modalActiveConceptTab, setModalActiveConceptTab] = useState<number>(1)
  const [saNotes, setSaNotes] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  // Lightbox Photo State
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  const pendingSubmissions = submissions.filter(s => s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING'))
  const approvedSubmissions = submissions.filter(s => s.sa_verdict === 'APPROVED')
  const savedForLaterSubmissions = submissions.filter(s => s.sa_verdict === 'SAVED_FOR_LATER')
  const rejectedSubmissions = submissions.filter(s => s.sa_verdict === 'REJECTED')

  const filteredList = submissions.filter(s => {
    if (activeTab === 'PENDING') {
      if (!(s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING'))) return false
    } else if (activeTab === 'APPROVED') {
      if (s.sa_verdict !== 'APPROVED') return false
    } else if (activeTab === 'SAVED_FOR_LATER') {
      if (s.sa_verdict !== 'SAVED_FOR_LATER') return false
    } else if (activeTab === 'REJECTED') {
      if (s.sa_verdict !== 'REJECTED') return false
    }

    const q = searchQuery.toLowerCase()
    const garment = s.brief?.garment_type?.toLowerCase() || ''
    const cat = s.brief?.category?.toLowerCase() || ''
    const designer = s.designer_name?.toLowerCase() || ''
    const notes = s.designer_notes?.toLowerCase() || ''

    return garment.includes(q) || cat.includes(q) || designer.includes(q) || notes.includes(q)
  })

  async function handleVerdict(submissionId: string, verdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED') {
    setIsReviewing(true)
    try {
      const res = await saReviewDesignSubmissionAction({
        submission_id: submissionId,
        sa_verdict: verdict,
        sa_notes: saNotes.trim() || undefined
      })

      if (res.success) {
        toast.success(
          verdict === 'APPROVED' 
            ? 'Concept greenlit! Ready for Tech-Pack creation.' 
            : verdict === 'SAVED_FOR_LATER'
              ? 'Concept archived in Seasonal Archive for future collections.'
              : 'Concept returned for revisions.'
        )

        setSubmissions(prev => prev.map(s => s.id === submissionId ? {
          ...s,
          sa_verdict: verdict,
          sa_notes: saNotes.trim() || undefined,
          reviewed_at: new Date().toISOString()
        } : s))

        setReviewingSub(null)
        setSaNotes('')
      } else {
        toast.error(res.error || 'Failed to update verdict.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during review.')
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
          Executive Hub
        </Link>
        <span>/</span>
        <span>Approvals</span>
        <span>/</span>
        <span className="font-bold text-slate-900">Design Approvals</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Design Executive Approvals
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {pendingSubmissions.length} Awaiting Decision
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Review Provisional Head-approved designs, greenlight for Tech-Pack creation, or save in seasonal archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Studio</span>
          </Link>
        </div>
      </div>

      {/* Layer 3: Informational KPI Data Boxes (Unified 4-Box Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              PIPELINE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Total Designs
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {submissions.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              DECISION
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Awaiting Decision
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingSubmissions.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              GREENLIT
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              SA Greenlit
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {approvedSubmissions.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              ARCHIVE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Bookmark className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Seasonal Archive
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {savedForLaterSubmissions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4 & 5: Primary Approvals Ledger Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'ALL'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              All Designs ({submissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'PENDING'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Awaiting Decision ({pendingSubmissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'APPROVED'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Greenlit ({approvedSubmissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SAVED_FOR_LATER')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'SAVED_FOR_LATER'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Saved for Later ({savedForLaterSubmissions.length})
            </button>
            {rejectedSubmissions.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('REJECTED')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  activeTab === 'REJECTED'
                    ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                    : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
                }`}
              >
                Revisions Needed ({rejectedSubmissions.length})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts or designers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Ledger Rows */}
        {filteredList.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShieldCheck}
              title="No designs found in this category"
              description="When Provisional Heads approve designer submissions, they appear here for Super Admin executive review."
            />
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                    <th className="py-3 px-4">Art No. &amp; Garment</th>
                    <th className="py-3 px-4">Designer</th>
                    <th className="py-3 px-4">Submitted Concepts</th>
                    <th className="py-3 px-4">Decision Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredList.map(sub => {
                    const garment = sub.brief?.garment_type || 'Apparel'
                    const category = sub.brief?.category || 'Casual'
                    const isPendingSA = sub.ph_verdict === 'APPROVED' && (!sub.sa_verdict || sub.sa_verdict === 'PENDING')
                    const isGreenlit = sub.sa_verdict === 'APPROVED'
                    const isSaved = sub.sa_verdict === 'SAVED_FOR_LATER'
                    const totalConcepts = sub.concepts?.length || 1

                    const allArtNos: string[] = []
                    sub.concepts?.forEach(c => {
                      const baseNo = c.art_number
                      if (baseNo) {
                        if (c.colorways && c.colorways.length > 1) {
                          c.colorways.forEach((_, idx) => {
                            allArtNos.push(getVariantArtNumber(baseNo, idx, c.colorways.length))
                          })
                        } else {
                          allArtNos.push(baseNo)
                        }
                      }
                    })

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4">
                          {allArtNos.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              {allArtNos.map((art, aIdx) => (
                                <span key={aIdx} className="font-mono font-bold text-slate-900 text-sm">
                                  {art}{aIdx < allArtNos.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="font-mono font-bold text-slate-400 text-sm block mb-1">
                              —
                            </span>
                          )}
                          <span className="font-bold text-slate-800 text-xs block font-[family-name:var(--font-heading)]">
                            {garment}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {category} Style &bull; <span className="font-mono text-[11px] text-slate-400">#{sub.id.substring(0, 6)}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 text-xs block">
                            {sub.designer_name}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-mono inline-flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PH Approved
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-800 text-xs block">
                            {totalConcepts} Design Concepts
                          </span>
                          {sub.designer_notes && (
                            <span className="text-[11px] text-slate-500 italic line-clamp-1 max-w-xs block">
                              &ldquo;{sub.designer_notes}&rdquo;
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {isPendingSA && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Awaiting SA Decision
                            </span>
                          )}
                          {isGreenlit && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              SA Greenlit
                            </span>
                          )}
                          {isSaved && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                              Saved in Archive
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingSub(sub)
                              setSaNotes(sub.sa_notes || '')
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-[#3A3564] transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View &amp; Decide</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredList.map(sub => {
                const garment = sub.brief?.garment_type || 'Apparel'
                const category = sub.brief?.category || 'Casual'
                const totalConcepts = sub.concepts?.length || 1

                return (
                  <div key={sub.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)]">
                          {garment}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {category} Style &bull; <span className="font-mono text-[11px] text-slate-400">#{sub.id.substring(0, 6)}</span>
                        </p>
                      </div>

                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        PH Approved
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-[#FAF7F0] p-2.5 rounded-xl border border-black/5">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Designer</span>
                        <span className="font-bold text-slate-800">{sub.designer_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Concepts</span>
                        <span className="font-bold text-[#3A3564]">{totalConcepts} Designs</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewingSub(sub)
                        setSaNotes(sub.sa_notes || '')
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#3A3564] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Decide Concept</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUPER ADMIN EXECUTIVE DECISION MODAL */}
      {/* ========================================================================= */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                    PH Approved
                  </span>
                  {reviewingSub.sa_verdict === 'APPROVED' && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                      Greenlit for Production
                    </span>
                  )}
                  {reviewingSub.sa_verdict === 'SAVED_FOR_LATER' && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                      Saved in Archive
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  {reviewingSub.brief?.garment_type || 'Apparel'} ({reviewingSub.brief?.category || 'Casual'})
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Designer: <strong className="text-slate-800 font-sans">{reviewingSub.designer_name}</strong> &bull; Submission ID: #{reviewingSub.id.substring(0, 8)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewingSub(null)
                  setSaNotes('')
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
              {/* Concept Deck */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Submitted Design Concepts Deck
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click any thumbnail to view full image
                  </span>
                </div>

                {reviewingSub.concepts && reviewingSub.concepts.length > 0 ? (
                  <div className="space-y-3">
                    {/* Concept Selector Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF7F0] rounded-xl border border-black/10">
                      {reviewingSub.concepts.map((concept, idx) => {
                        const cNum = concept.concept_number || (idx + 1)
                        const isTabActive = modalActiveConceptTab === cNum
                        return (
                          <button
                            key={cNum}
                            type="button"
                            onClick={() => setModalActiveConceptTab(cNum)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                              isTabActive
                                ? 'bg-[#3A3564] text-white shadow-2xs'
                                : 'text-slate-700 hover:bg-white/80'
                            }`}
                          >
                            <span>Design #{cNum}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                              isTabActive ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-500'
                            }`}>
                              {concept.colorways?.length || 0} Colors
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Active Selected Concept View */}
                    {(() => {
                      const concepts = reviewingSub.concepts
                      const currentConcept = concepts.find(c => (c.concept_number || 1) === modalActiveConceptTab) || concepts[0]

                      if (!currentConcept) return null

                      return (
                        <div className="p-4 rounded-2xl bg-[#FAF7F0]/60 border border-black/10 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm font-[family-name:var(--font-heading)]">
                                {currentConcept.title || `Design Concept #${currentConcept.concept_number}`}
                              </span>
                              {currentConcept.art_number && (
                                <span className="text-xs font-mono font-bold text-slate-900">
                                  ART NO: {currentConcept.art_number}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-mono text-slate-500">
                              {currentConcept.colorways?.length || 0} Colorway(s)
                            </span>
                          </div>

                          {currentConcept.notes && (
                            <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-black/10">
                              &ldquo;{currentConcept.notes}&rdquo;
                            </p>
                          )}

                          {/* Colorways in Responsive Grid Layout */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                            {currentConcept.colorways && currentConcept.colorways.length > 0 ? (
                              currentConcept.colorways.map((cw, cwIdx) => {
                                const sw = getColorSwatchInfo(cw.color_name)
                                const variantArtNo = getVariantArtNumber(
                                  currentConcept.art_number || '',
                                  cwIdx,
                                  currentConcept.colorways.length
                                )

                                return (
                                  <div
                                    key={cwIdx}
                                    className="bg-white p-3 rounded-2xl border border-black/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-2.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 truncate">
                                        <span
                                          className="w-3 h-3 rounded-full border border-black/15 shrink-0 shadow-2xs"
                                          style={{ backgroundColor: sw.bg }}
                                        />
                                        <span className="truncate">{cw.color_name}</span>
                                      </div>
                                      {variantArtNo ? (
                                        <span className="text-[11px] font-mono font-bold text-slate-900 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10 shrink-0">
                                          {variantArtNo}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono text-slate-400 font-medium bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-black/5 shrink-0">
                                          {cw.photo_back ? '2 Views' : '1 View'}
                                        </span>
                                      )}
                                    </div>

                                    {/* Artwork Thumbnails */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {/* Front Thumbnail */}
                                      {cw.photo_front ? (
                                        <div
                                          onClick={() => setPreviewPhoto(cw.photo_front)}
                                          className="aspect-square rounded-xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-1.5 flex items-center justify-center shadow-2xs hover:border-[#3A3564]/30 transition-all"
                                          title="Click to view full Front Artwork"
                                        >
                                          <img
                                            src={cw.photo_front}
                                            alt={`${cw.color_name} Front`}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold rounded-xl gap-0.5">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Front</span>
                                          </div>
                                          <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-white/90 text-slate-700 px-1 py-0.2 rounded border border-black/5 shadow-2xs">
                                            Front
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono p-1">
                                          <span>No Front</span>
                                        </div>
                                      )}

                                      {/* Back Thumbnail */}
                                      {cw.photo_back ? (
                                        <div
                                          onClick={() => setPreviewPhoto(cw.photo_back!)}
                                          className="aspect-square rounded-xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-1.5 flex items-center justify-center shadow-2xs hover:border-[#3A3564]/30 transition-all"
                                          title="Click to view full Back Artwork"
                                        >
                                          <img
                                            src={cw.photo_back}
                                            alt={`${cw.color_name} Back`}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold rounded-xl gap-0.5">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Back</span>
                                          </div>
                                          <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-white/90 text-slate-700 px-1 py-0.2 rounded border border-black/5 shadow-2xs">
                                            Back
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="aspect-square rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono p-1">
                                          <span>No Back</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="p-4 text-center text-slate-400 text-xs font-mono col-span-full">
                                No colorways uploaded for this concept.
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : reviewingSub.photo_url_1 ? (
                  <div className="flex items-center gap-3 bg-[#FAF7F0] p-3.5 rounded-2xl border border-black/10">
                    <div 
                      onClick={() => setPreviewPhoto(reviewingSub.photo_url_1)}
                      className="w-28 h-20 rounded-xl border border-black/10 overflow-hidden bg-white relative group cursor-pointer shadow-2xs shrink-0"
                    >
                      <img
                        src={reviewingSub.photo_url_1}
                        alt="Front Artwork"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </div>
                    </div>

                    {reviewingSub.photo_url_2 && (
                      <div 
                        onClick={() => setPreviewPhoto(reviewingSub.photo_url_2!)}
                        className="w-28 h-20 rounded-xl border border-black/10 overflow-hidden bg-white relative group cursor-pointer shadow-2xs shrink-0"
                      >
                        <img
                          src={reviewingSub.photo_url_2}
                          alt="Back Artwork"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 font-mono text-xs">
                    No mockups attached.
                  </div>
                )}
              </div>

              {/* Review History */}
              {reviewingSub.ph_feedback && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                  <span className="font-bold text-sky-900 block font-mono uppercase mb-0.5">PH Approval Notes:</span>
                  <p className="text-sky-800 italic">&ldquo;{reviewingSub.ph_feedback}&rdquo;</p>
                </div>
              )}

              {/* SA Decision Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Super Admin Decision Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Greenlit for Summer Drop / Saved in seasonal library..."
                  value={saNotes}
                  onChange={e => setSaNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setReviewingSub(null)
                  setSaNotes('')
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'REJECTED')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'SAVED_FOR_LATER')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#3A3564] hover:bg-slate-100 border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save for Later</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'APPROVED')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Greenlight for Production</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl border border-black/10">
            <img 
              src={previewPhoto} 
              alt="Preview" 
              className="max-h-[80vh] w-auto rounded-xl object-contain" 
            />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
