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
  Palette
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
            {filteredList.map(sub => {
              const garment = sub.brief?.garment_type || 'Apparel'
              const category = sub.brief?.category || 'Casual'
              const maxColors = sub.brief?.max_colors || 3
              const isPendingSA = sub.ph_verdict === 'APPROVED' && (!sub.sa_verdict || sub.sa_verdict === 'PENDING')
              const isGreenlit = sub.sa_verdict === 'APPROVED'
              const isSaved = sub.sa_verdict === 'SAVED_FOR_LATER'

              return (
                <div 
                  key={sub.id} 
                  className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-2xs flex flex-col hover:border-black/20 transition-all group"
                >
                  {/* Photo Display */}
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img 
                      src={sub.photo_url_1} 
                      alt={garment} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                        {garment}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold">
                        {category}
                      </span>
                    </div>

                    {/* Multi-Photo Indicator / Action */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewPhoto(sub.photo_url_1)}
                        className="w-8 h-8 rounded-lg bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="View Full Size"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Secondary Photo Thumbnail if present */}
                    {sub.photo_url_2 && (
                      <button
                        onClick={() => setPreviewPhoto(sub.photo_url_2!)}
                        className="absolute bottom-3 right-3 w-12 h-12 rounded-lg border-2 border-white shadow-md overflow-hidden bg-slate-900 cursor-pointer group/thumb"
                        title="View Angle 2"
                      >
                        <img 
                          src={sub.photo_url_2} 
                          alt="Angle 2" 
                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform" 
                        />
                      </button>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500">Designer:</span>
                        <span className="font-bold text-slate-800">{sub.designer_name}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500">Colors Limit:</span>
                        <span className="font-mono font-bold text-slate-800">{maxColors} Max</span>
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
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setReviewingSub(sub)
                              setSaNotes('')
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Greenlight</span>
                          </button>

                          <button
                            onClick={() => {
                              setReviewingSub(sub)
                              setSaNotes('')
                            }}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save for Later</span>
                          </button>
                        </div>
                      )}

                      {isGreenlit && (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Greenlit for Tech-Pack</span>
                          </span>

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
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] px-2.5 py-1 rounded-lg border border-black/10">
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Seasonal Archive</span>
                          </span>

                          <button
                            onClick={() => {
                              setReviewingSub(sub)
                              setSaNotes('')
                            }}
                            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Revive &amp; Greenlight
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Review & Decision Modal */}
      {reviewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Super Admin Verdict
                  </h2>
                  <p className="text-xs text-slate-500">
                    {reviewingSub.brief?.garment_type} ({reviewingSub.brief?.category}) by {reviewingSub.designer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingSub(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Super Admin Strategic Decision Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Greenlit for Summer 2026 Collection / Archived for Autumn line..."
                  value={saNotes}
                  onChange={e => setSaNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'SAVED_FOR_LATER')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save for Later (Archive)</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(reviewingSub.id, 'APPROVED')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
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
