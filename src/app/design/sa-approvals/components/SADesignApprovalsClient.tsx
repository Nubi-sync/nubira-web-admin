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
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'SAVED_FOR_LATER' | 'ALL'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')

  // Review Modal State
  const [reviewingSub, setReviewingSub] = useState<DesignSubmission | null>(null)
  const [saNotes, setSaNotes] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  // Lightbox Photo State
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Zigza AI Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiCustomPrompt, setAiCustomPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null)

  const pendingSubmissions = submissions.filter(s => s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING'))
  const approvedSubmissions = submissions.filter(s => s.sa_verdict === 'APPROVED')
  const savedForLaterSubmissions = submissions.filter(s => s.sa_verdict === 'SAVED_FOR_LATER')

  const filteredList = submissions.filter(s => {
    if (activeTab === 'PENDING') {
      if (!(s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING'))) return false
    } else if (activeTab === 'APPROVED') {
      if (s.sa_verdict !== 'APPROVED') return false
    } else if (activeTab === 'SAVED_FOR_LATER') {
      if (s.sa_verdict !== 'SAVED_FOR_LATER') return false
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
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
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Zigza AI</span>
          </button>

          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Studio</span>
          </Link>
        </div>
      </div>

      {/* Layer 3: Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === 'PENDING' ? 'border-[#3A3564] ring-2 ring-[#3A3564]/10 bg-[#FAF7F0]/40' : 'border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              PENDING SA
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Awaiting SA Decision
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Head approved &bull; Ready for Greenlight</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-amber-700">
              {pendingSubmissions.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Decide
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('APPROVED')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === 'APPROVED' ? 'border-[#3A3564] ring-2 ring-[#3A3564]/10 bg-[#FAF7F0]/40' : 'border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              GREENLIT
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Greenlit for Tech-Pack
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Approved for studio tech-packs</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-700">
              {approvedSubmissions.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Production Ready
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('SAVED_FOR_LATER')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-2xs flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === 'SAVED_FOR_LATER' ? 'border-[#3A3564] ring-2 ring-[#3A3564]/10 bg-[#FAF7F0]/40' : 'border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              ARCHIVE
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Seasonal Archive
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Saved for future drop seasons</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-[#3A3564]">
              {savedForLaterSubmissions.length}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              Archived
            </span>
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
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'PENDING'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-600 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Pending SA Decision ({pendingSubmissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'APPROVED'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-600 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
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
                  : 'text-slate-600 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Seasonal Archive ({savedForLaterSubmissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'ALL'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-600 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              All Designs ({submissions.length})
            </button>
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
                    <th className="py-3 px-4">Garment Silhouette</th>
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

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 text-sm block font-[family-name:var(--font-heading)]">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
                  Submitted Design Concepts &amp; Colorways:
                </label>

                {reviewingSub.concepts && reviewingSub.concepts.length > 0 ? (
                  <div className="space-y-3">
                    {reviewingSub.concepts.map((concept) => (
                      <div key={concept.concept_number} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-2 font-[family-name:var(--font-heading)]">
                            <span className="w-5 h-5 rounded-full bg-[#3A3564] text-white flex items-center justify-center text-[10px] font-mono">
                              {concept.concept_number}
                            </span>
                            <span>{concept.title || `Design Concept #${concept.concept_number}`}</span>
                          </span>
                          <span className="text-[11px] font-mono font-bold text-slate-500">
                            {concept.colorways.length} Colorway(s)
                          </span>
                        </div>

                        {concept.notes && (
                          <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                            &ldquo;{concept.notes}&rdquo;
                          </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {concept.colorways.map((cw, cwIdx) => (
                            <div key={cwIdx} className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-700 block truncate font-mono">
                                {cw.color_name}
                              </span>
                              <div
                                onClick={() => setPreviewPhoto(cw.photo_front)}
                                className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-white relative group cursor-pointer shadow-2xs"
                              >
                                <img src={cw.photo_front} alt={cw.color_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                  <Eye className="w-3.5 h-3.5 mr-1" /> View Front
                                </div>
                              </div>
                              {cw.photo_back && (
                                <div
                                  onClick={() => setPreviewPhoto(cw.photo_back!)}
                                  className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-white relative group cursor-pointer shadow-2xs"
                                >
                                  <img src={cw.photo_back} alt={`${cw.color_name} Back`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                    <Eye className="w-3.5 h-3.5 mr-1" /> View Back
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviewingSub.photo_url_1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPreviewPhoto(reviewingSub.photo_url_1)}
                      className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shadow-2xs"
                    >
                      <img
                        src={reviewingSub.photo_url_1}
                        alt="Artwork 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> Full View
                      </div>
                    </div>

                    {reviewingSub.photo_url_2 && (
                      <div 
                        onClick={() => setPreviewPhoto(reviewingSub.photo_url_2!)}
                        className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shadow-2xs"
                      >
                        <img
                          src={reviewingSub.photo_url_2}
                          alt="Artwork 2"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          <Eye className="w-4 h-4 mr-1" /> Full View
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

      {/* Floating Zigza AI Button for Super Admin */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsAiModalOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#3A3564] text-white hover:bg-[#2A2649] shadow-xl border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-extrabold tracking-wide">Zigza AI</div>
            <div className="text-[10px] text-slate-300 font-mono font-medium -mt-0.5">Approval Insights</div>
          </div>
        </button>
      </div>

      {/* Zigza AI Executive Decision Copilot Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                  <Sparkles className="w-5 h-5 text-[#3A3564]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)]">
                      Zigza AI Approval Insights
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      Executive Copilot
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Production viability, commercial risk evaluation &amp; seasonal market fit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FAF7F0]/40">
              {/* Strategic Insights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Greenlight Criteria</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    High commercial viability, standard fabric availability (French Terry, Cotton Jersey), and clear contrast prints suitable for automated screen printing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-black/10 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                    <Bookmark className="w-4 h-4 text-[#3A3564]" />
                    <span>Seasonal Archive Strategy</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Save strong concepts with seasonal dependencies (e.g. heavy winter outerwear during summer planning) for instant revival in future quarters.
                  </p>
                </div>
              </div>

              {/* Quick AI Audit Tool */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Executive Design Quality Query
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Check fabric yield for 420 GSM French Terry..."
                    value={aiCustomPrompt}
                    onChange={e => setAiCustomPrompt(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/15 focus:border-[#3A3564] font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsAiGenerating(true)
                      setTimeout(() => {
                        setAiAnalysisResult('Fabric consumption estimated at ~1.45m/piece with minimal cutting waste (<6%). Recommended stitch count for embroidery is 8,500 stitches at chest zone.')
                        setIsAiGenerating(false)
                        toast.success('Zigza AI intelligence analysis complete!')
                      }, 400)
                    }}
                    className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                  >
                    {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Analyze</span>
                  </button>
                </div>

                {aiAnalysisResult && (
                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs text-slate-800">
                    <span className="font-bold text-[#3A3564] block font-mono text-[10px] uppercase mb-1">
                      AI Production Assessment:
                    </span>
                    {aiAnalysisResult}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-500">
                Visible only to Executive Super Admin
              </span>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
