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
  Tag
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
              : 'Concept rejected.'
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
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Modules</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-500">
          Super Admin Executive Gallery &bull; {companyName}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Super Admin Design Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Review Provisional Head-approved designs, greenlight for Tech-Pack creation, or save in seasonal archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Studio</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('PENDING')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'PENDING' ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10' : 'bg-white border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Awaiting SA Decision
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 font-[family-name:var(--font-heading)] mt-2">
            {pendingSubmissions.length} Concepts
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Approved by Provisional Head &bull; Ready for SA Greenlight
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('APPROVED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'APPROVED' ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10' : 'bg-white border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Greenlit for Tech-Pack
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 font-[family-name:var(--font-heading)] mt-2">
            {approvedSubmissions.length} Approved
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Authorized for PH Tech-Pack production
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('SAVED_FOR_LATER')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'SAVED_FOR_LATER' ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10' : 'bg-white border-black/10 hover:border-black/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Seasonal Archive
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#3A3564] font-[family-name:var(--font-heading)] mt-2">
            {savedForLaterSubmissions.length} Saved
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Archived for upcoming seasonal drops
          </div>
        </div>
      </div>

      {/* Gallery & Table Container */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                activeTab === 'PENDING'
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Pending SA Decision ({pendingSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                activeTab === 'APPROVED'
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Greenlit ({approvedSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab('SAVED_FOR_LATER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                activeTab === 'SAVED_FOR_LATER'
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              Seasonal Archive ({savedForLaterSubmissions.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                activeTab === 'ALL'
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              All Designs ({submissions.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search designs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {/* Gallery Grid View */}
        {filteredList.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No designs found in this category"
            description="When Provisional Heads approve designer submissions, they appear here for Super Admin executive review."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map(sub => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                onReview={(s) => {
                  setReviewingSub(s)
                  setSaNotes(s.sa_notes || '')
                }}
                onPreviewPhoto={(url) => setPreviewPhoto(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Super Admin Executive Review Modal */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/10 p-5 bg-[#FAF7F0] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 border border-black/10 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)] flex items-center gap-2">
                    <span>Super Admin Executive Review</span>
                    {reviewingSub.sa_verdict === 'APPROVED' && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold">
                        Greenlit
                      </span>
                    )}
                    {reviewingSub.sa_verdict === 'SAVED_FOR_LATER' && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#3A3564]/10 text-[#3A3564] font-mono font-bold">
                        Archived
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-600">
                    {reviewingSub.brief?.garment_type || 'Apparel'} ({reviewingSub.brief?.category || 'Casual'}) &bull; Created by {reviewingSub.designer_name} &bull; PH Approved
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewingSub(null)
                  setSaNotes('')
                }}
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-sm font-bold border border-black/10 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Full Concepts & Colorways Deck */}
              {reviewingSub.concepts && reviewingSub.concepts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <label className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
                      <span>Multi-Design Studio Deck ({reviewingSub.concepts.length} Concept Designs)</span>
                    </label>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      Click any mockup to zoom
                    </span>
                  </div>

                  <div className="space-y-4">
                    {reviewingSub.concepts.map((concept) => (
                      <div key={concept.concept_number} className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
                              {concept.concept_number}
                            </span>
                            <span>{concept.title || `Design Concept #${concept.concept_number}`}</span>
                          </span>
                          <span className="text-xs font-mono text-[#3A3564] bg-white px-2.5 py-1 rounded-lg border border-black/10 font-bold">
                            {concept.colorways.length} Colorway(s)
                          </span>
                        </div>

                        {concept.notes && (
                          <div className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-black/5">
                            <span className="font-semibold not-italic text-slate-500 block text-[11px] mb-0.5">Design Notes:</span>
                            &ldquo;{concept.notes}&rdquo;
                          </div>
                        )}

                        {/* Colorways Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                          {concept.colorways.map((cw, cwIdx) => (
                            <div key={cwIdx} className="bg-white p-3 rounded-xl border border-black/10 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                  <Palette className="w-3 h-3 text-[#3A3564]" />
                                  <span>{cw.color_name}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {cw.photo_back ? 'Front & Back' : 'Front Only'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div 
                                  onClick={() => setPreviewPhoto(cw.photo_front)}
                                  className="aspect-square rounded-lg border border-black/10 overflow-hidden bg-slate-900 relative group cursor-pointer"
                                  title={`Zoom ${cw.color_name} Front View`}
                                >
                                  <img 
                                    src={cw.photo_front} 
                                    alt={`${cw.color_name} Front`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10.5px] font-bold">
                                    <Eye className="w-3.5 h-3.5 mr-1" /> Front
                                  </div>
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                                    Front
                                  </span>
                                </div>

                                {cw.photo_back ? (
                                  <div 
                                    onClick={() => setPreviewPhoto(cw.photo_back!)}
                                    className="aspect-square rounded-lg border border-black/10 overflow-hidden bg-slate-900 relative group cursor-pointer"
                                    title={`Zoom ${cw.color_name} Back View`}
                                  >
                                    <img 
                                      src={cw.photo_back} 
                                      alt={`${cw.color_name} Back`} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10.5px] font-bold">
                                      <Eye className="w-3.5 h-3.5 mr-1" /> Back
                                    </div>
                                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[9px] font-mono font-bold">
                                      Back
                                    </span>
                                  </div>
                                ) : (
                                  <div className="aspect-square rounded-lg border border-dashed border-black/10 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-mono text-center p-1">
                                    No back photo
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-800 mb-2 text-xs">
                    Submitted Concept Photos:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPreviewPhoto(reviewingSub.photo_url_1)}
                      className="aspect-4/3 rounded-xl border border-black/10 overflow-hidden bg-slate-900 relative group cursor-pointer shadow-2xs"
                    >
                      <img
                        src={reviewingSub.photo_url_1}
                        alt="Concept 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        <Eye className="w-4 h-4 mr-1" /> Full View
                      </div>
                    </div>

                    {reviewingSub.photo_url_2 ? (
                      <div 
                        onClick={() => setPreviewPhoto(reviewingSub.photo_url_2!)}
                        className="aspect-4/3 rounded-xl border border-black/10 overflow-hidden bg-slate-900 relative group cursor-pointer shadow-2xs"
                      >
                        <img
                          src={reviewingSub.photo_url_2}
                          alt="Concept 2"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          <Eye className="w-4 h-4 mr-1" /> Full View
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-4/3 rounded-xl border border-dashed border-black/15 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                        Single angle submitted
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Review Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {reviewingSub.designer_notes && (
                  <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 text-xs">
                    <span className="font-bold text-[#3A3564] block mb-1">Designer&apos;s Creative Notes:</span>
                    <p className="text-slate-700 italic leading-relaxed">&ldquo;{reviewingSub.designer_notes}&rdquo;</p>
                  </div>
                )}

                {reviewingSub.ph_feedback && (
                  <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-xs">
                    <span className="font-bold text-sky-900 block mb-1">Provisional Head Approval Note:</span>
                    <p className="text-sky-800 leading-relaxed">{reviewingSub.ph_feedback}</p>
                  </div>
                )}
              </div>

              {/* Super Admin Input */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Super Admin Strategic Decision Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Greenlit for Summer 2026 Collection / Sizing graded for oversized street fit / Saved for autumn drop..."
                  value={saNotes}
                  onChange={e => setSaNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setReviewingSub(null)
                  setSaNotes('')
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
              >
                Close Review
              </button>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'REJECTED')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Concept</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'SAVED_FOR_LATER')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save for Later (Archive)</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'APPROVED')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Greenlight for Tech-Pack</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Lightbox */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl">
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

function SubmissionCard({
  sub,
  onReview,
  onPreviewPhoto,
}: {
  sub: DesignSubmission
  onReview: (sub: DesignSubmission) => void
  onPreviewPhoto: (url: string) => void
}) {
  const garment = sub.brief?.garment_type || 'Apparel'
  const category = sub.brief?.category || 'Casual'
  const maxColors = sub.brief?.max_colors || 3
  const isPendingSA = sub.ph_verdict === 'APPROVED' && (!sub.sa_verdict || sub.sa_verdict === 'PENDING')
  const isGreenlit = sub.sa_verdict === 'APPROVED'
  const isSaved = sub.sa_verdict === 'SAVED_FOR_LATER'

  // Extract all photos from concepts & colorways
  const submissionPhotos: { url: string; label: string; color?: string; conceptNum?: number; isBack?: boolean }[] = []
  if (sub.concepts && sub.concepts.length > 0) {
    sub.concepts.forEach(concept => {
      concept.colorways?.forEach(cw => {
        if (cw.photo_front) {
          submissionPhotos.push({
            url: cw.photo_front,
            label: `Design #${concept.concept_number} • ${cw.color_name} (Front)`,
            color: cw.color_name,
            conceptNum: concept.concept_number,
            isBack: false
          })
        }
        if (cw.photo_back) {
          submissionPhotos.push({
            url: cw.photo_back,
            label: `Design #${concept.concept_number} • ${cw.color_name} (Back)`,
            color: cw.color_name,
            conceptNum: concept.concept_number,
            isBack: true
          })
        }
      })
    })
  }
  if (submissionPhotos.length === 0) {
    if (sub.photo_url_1) {
      submissionPhotos.push({ url: sub.photo_url_1, label: 'Concept Photo 1' })
    }
    if (sub.photo_url_2) {
      submissionPhotos.push({ url: sub.photo_url_2, label: 'Concept Photo 2' })
    }
  }

  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const currentPhoto = submissionPhotos[activePhotoIdx] || submissionPhotos[0] || { url: sub.photo_url_1, label: garment }

  // Unique colors in this submission
  const uniqueColors = Array.from(new Set(submissionPhotos.map(p => p.color).filter(Boolean)))
  const totalConcepts = sub.concepts?.length || 1

  return (
    <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-2xs flex flex-col hover:border-black/20 hover:shadow-md transition-all group">
      {/* Main Showcase Photo */}
      <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
        <img 
          src={currentPhoto.url} 
          alt={currentPhoto.label} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold shadow-2xs">
            {garment}
          </span>
          <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold shadow-2xs">
            {category}
          </span>
          {sub.concepts && sub.concepts.length > 0 && (
            <span className="px-2 py-1 rounded-lg bg-[#3A3564]/90 backdrop-blur-xs text-[#FAF7F0] text-[10.5px] font-mono font-bold shadow-2xs">
              {totalConcepts} Designs &bull; {submissionPhotos.length} Mockups
            </span>
          )}
        </div>

        {/* Top Right Zoom Button */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPreviewPhoto(currentPhoto.url)}
            className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title={`View Full Size: ${currentPhoto.label}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Current Photo Label Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-medium truncate max-w-[80%]">
            {currentPhoto.label}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/80 text-slate-900 text-[10px] font-mono font-bold">
            {activePhotoIdx + 1}/{submissionPhotos.length}
          </span>
        </div>
      </div>

      {/* Multi-Photo Carousel Strip if more than 1 photo */}
      {submissionPhotos.length > 1 && (
        <div className="bg-[#FAF7F0] p-2.5 border-b border-black/5 flex items-center gap-2 overflow-x-auto select-none">
          {submissionPhotos.map((item, idx) => {
            const isSelected = idx === activePhotoIdx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-11 h-11 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                  isSelected 
                    ? 'ring-2 ring-[#3A3564] border-[#3A3564] scale-105 shadow-2xs' 
                    : 'border-black/10 opacity-70 hover:opacity-100 hover:scale-102'
                }`}
                title={item.label}
              >
                <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                {item.color && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[8px] font-bold font-mono text-center truncate px-0.5">
                    {item.color.slice(0, 5)}
                  </span>
                )}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => onReview(sub)}
            className="h-11 px-2.5 rounded-lg border border-black/10 bg-white hover:bg-[#F2ECE1] text-[#3A3564] text-[10px] font-bold font-mono flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
            title="Inspect all designs in full review deck"
          >
            <Sparkles className="w-3 h-3 text-[#3A3564]" />
            <span>Deck</span>
          </button>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Designer:</span>
            <span className="font-bold text-slate-800">{sub.designer_name}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Colors / Chart:</span>
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {uniqueColors.length > 0 ? (
                uniqueColors.map((col, i) => (
                  <span key={i} className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-black/5">
                    {col}
                  </span>
                ))
              ) : (
                <span className="font-mono font-bold text-slate-800">{maxColors} Max</span>
              )}
            </div>
          </div>

          {sub.designer_notes && (
            <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-black/10 text-xs text-slate-700 italic">
              &ldquo;{sub.designer_notes}&rdquo;
            </div>
          )}

          {sub.ph_feedback && (
            <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-xs text-sky-900">
              <span className="font-bold block mb-0.5">PH Approval Note:</span>
              {sub.ph_feedback}
            </div>
          )}

          {sub.sa_notes && (
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              <span className="font-bold block mb-0.5">SA Strategic Note:</span>
              {sub.sa_notes}
            </div>
          )}
        </div>

        {/* Decision State / Action Buttons */}
        <div className="pt-3 border-t border-black/5 space-y-2">
          {isPendingSA && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onReview(sub)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-[#FAF7F0] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Review Deck ({submissionPhotos.length} Mockups)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onReview(sub)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Greenlight</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReview(sub)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save for Later</span>
                </button>
              </div>
            </div>
          )}

          {isGreenlit && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onReview(sub)}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Greenlit for Tech-Pack</span>
              </button>

              <Link
                href={`/design/tech-packs?createFromSubmission=${sub.id}&garment=${garment}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
              >
                <span>Tech-Pack</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {isSaved && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => onReview(sub)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] px-2.5 py-1 rounded-lg border border-black/10 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Seasonal Archive</span>
              </button>

              <button
                type="button"
                onClick={() => onReview(sub)}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Revive &amp; Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
