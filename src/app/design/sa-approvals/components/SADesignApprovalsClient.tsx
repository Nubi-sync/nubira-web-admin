'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ShieldCheck, 
  ChevronLeft, 
  CheckCircle2, 
  Bookmark, 
  XCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  Eye, 
  ArrowRight, 
  FileCheck2, 
  Search, 
  Filter, 
  Loader2,
  Calendar,
  User,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'
import { DesignSubmission, SAVerdict } from '../../types/design'
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
  const [submissions, setSubmissions] = useState<DesignSubmission[]>(initialSubmissions)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'SAVED_FOR_LATER'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  
  // Decision Dialog State
  const [selectedSub, setSelectedSub] = useState<DesignSubmission | null>(null)
  const [decisionAction, setDecisionAction] = useState<SAVerdict | null>(null)
  const [saNotes, setSaNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const pendingSubmissions = submissions.filter(s => s.ph_verdict === 'APPROVED' && (!s.sa_verdict || s.sa_verdict === 'PENDING' as any))
  const approvedSubmissions = submissions.filter(s => s.sa_verdict === 'APPROVED')
  const savedForLaterSubmissions = submissions.filter(s => s.sa_verdict === 'SAVED_FOR_LATER')

  const currentTabSubmissions = activeTab === 'PENDING'
    ? pendingSubmissions
    : activeTab === 'APPROVED'
      ? approvedSubmissions
      : savedForLaterSubmissions

  const filteredSubmissions = currentTabSubmissions.filter(s => {
    const q = searchQuery.toLowerCase()
    return (
      (s.brief?.garment_type && s.brief.garment_type.toLowerCase().includes(q)) ||
      (s.brief?.category && s.brief.category.toLowerCase().includes(q)) ||
      (s.designer_name && s.designer_name.toLowerCase().includes(q)) ||
      (s.designer_notes && s.designer_notes.toLowerCase().includes(q)) ||
      (s.ph_feedback && s.ph_feedback.toLowerCase().includes(q))
    )
  })

  async function handleExecuteVerdict() {
    if (!selectedSub || !decisionAction) return
    setIsProcessing(true)
    try {
      const res = await saReviewDesignSubmissionAction({
        submission_id: selectedSub.id,
        sa_verdict: decisionAction,
        sa_notes: saNotes.trim() || undefined
      })

      if (res.success) {
        toast.success(
          decisionAction === 'APPROVED'
            ? 'Design greenlit! Provisional Head can now generate the Tech-Pack.'
            : decisionAction === 'SAVED_FOR_LATER'
              ? 'Design concept saved in archive for upcoming seasons.'
              : 'Submission rejected and flagged.'
        )
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, sa_verdict: decisionAction, sa_notes: saNotes.trim() || undefined } : s))
        setSelectedSub(null)
        setDecisionAction(null)
        setSaNotes('')
      } else {
        toast.error(res.error || 'Failed to update decision.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during decision execution.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/design"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Design Studio</span>
        </Link>
        <span className="text-xs font-mono font-medium text-slate-500">
          Super Admin Verification Portal (Tier 3)
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Super Admin Design Approvals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Final executive sign-off on PH-approved concepts. Greenlight for immediate Tech-Pack production or save for future seasonal collections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564]">
            Super Admin Gatekeeper
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            activeTab === 'PENDING'
              ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10'
              : 'bg-white border-black/10 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Awaiting Greenlight
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {pendingSubmissions.length} Concepts
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Verified by Provisional Head
          </div>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            activeTab === 'APPROVED'
              ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10'
              : 'bg-white border-black/10 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Greenlit for Tech-Pack
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {approvedSubmissions.length} Approved
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Unlocked for Merchandising pipeline
          </div>
        </button>

        <button
          onClick={() => setActiveTab('SAVED_FOR_LATER')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs ${
            activeTab === 'SAVED_FOR_LATER'
              ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10'
              : 'bg-white border-black/10 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saved for Future Seasons
            </span>
            <Bookmark className="w-4 h-4 text-[#3A3564]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {savedForLaterSubmissions.length} Archived
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Preserved concept library
          </div>
        </button>
      </div>

      {/* Gallery Cards Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              {activeTab === 'PENDING'
                ? 'Pending Executive Review Queue'
                : activeTab === 'APPROVED'
                  ? 'Greenlit Production Concepts'
                  : 'Saved for Later Concept Archive'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 font-bold font-mono">
              {filteredSubmissions.length}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts, designers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={
              searchQuery
                ? "No matching concepts"
                : activeTab === 'PENDING'
                  ? "No concepts pending executive approval"
                  : activeTab === 'APPROVED'
                    ? "No approved concepts yet"
                    : "No designs saved for later"
            }
            description={
              activeTab === 'PENDING'
                ? "When Provisional Heads approve designer submissions, they will appear here for your executive sign-off."
                : "Reviewed design concepts will be cataloged in this gallery."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSubmissions.map(sub => (
              <div 
                key={sub.id} 
                className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Photo Grid Header */}
                <div className="p-3 bg-slate-50/60 border-b border-black/5">
                  <div className="grid grid-cols-2 gap-2 aspect-[4/3]">
                    <div 
                      onClick={() => setPreviewPhoto(sub.photo_url_1)}
                      className="rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer h-full"
                    >
                      <img 
                        src={sub.photo_url_1} 
                        alt="Concept Photo 1" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </div>
                    </div>

                    {sub.photo_url_2 ? (
                      <div 
                        onClick={() => setPreviewPhoto(sub.photo_url_2!)}
                        className="rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer h-full"
                      >
                        <img 
                          src={sub.photo_url_2!} 
                          alt="Concept Photo 2" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-black/15 bg-white flex flex-col items-center justify-center text-xs text-slate-400 p-2 text-center">
                        <Palette className="w-5 h-5 mb-1 text-slate-300" />
                        <span>Single view</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)] block">
                          {sub.brief?.garment_type || 'Garment Silhouette'}
                        </span>
                        <span className="text-xs font-semibold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-black/10 inline-block mt-0.5">
                          {sub.brief?.category || 'Casual'} &bull; {sub.brief?.max_colors || 3} Colors
                        </span>
                      </div>

                      <span className={`text-xs px-2.5 py-0.5 rounded-md border font-bold ${
                        sub.sa_verdict === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : sub.sa_verdict === 'SAVED_FOR_LATER'
                            ? 'bg-[#FAF7F0] text-[#3A3564] border-black/10'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {sub.sa_verdict || 'Awaiting SA'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Designer: <strong className="text-slate-800">{sub.designer_name || 'Designer'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>PH Verdict: <strong className="text-emerald-700">Verified Approved</strong></span>
                      </div>
                    </div>

                    {sub.designer_notes && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-black/5 text-xs text-slate-600 line-clamp-2">
                        <strong className="text-slate-800">Designer:</strong> &ldquo;{sub.designer_notes}&rdquo;
                      </div>
                    )}

                    {sub.ph_feedback && (
                      <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-black/10 text-xs text-slate-600 line-clamp-2">
                        <strong className="text-[#3A3564]">PH Note:</strong> {sub.ph_feedback}
                      </div>
                    )}

                    {sub.sa_notes && (
                      <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <strong className="text-slate-900">SA Executive Note:</strong> {sub.sa_notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-black/5 flex items-center gap-2">
                    {activeTab === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSub(sub)
                            setDecisionAction('APPROVED')
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Greenlight</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedSub(sub)
                            setDecisionAction('SAVED_FOR_LATER')
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Save for Later</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedSub(sub)
                          setDecisionAction(activeTab === 'APPROVED' ? 'SAVED_FOR_LATER' : 'APPROVED')
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        {activeTab === 'APPROVED' ? (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Move to Saved for Later</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Greenlight for Tech-Pack</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {selectedSub && decisionAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  {decisionAction === 'APPROVED' ? 'Greenlight Concept' : 'Save for Later Season'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedSub(null)
                  setDecisionAction(null)
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600 leading-relaxed">
                {decisionAction === 'APPROVED' ? (
                  <>
                    Are you sure you want to approve this <strong>{selectedSub.brief?.garment_type}</strong> concept? This will notify the Provisional Head to generate the official Tech-Pack for bulk cutting and merchandising.
                  </>
                ) : (
                  <>
                    Archive this <strong>{selectedSub.brief?.garment_type}</strong> concept for future collections? It will be safely stored in your Saved for Later library.
                  </>
                )}
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Executive Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Approved for Summer 2026 drop / Good concept, hold for Autumn line..."
                  value={saNotes}
                  onChange={e => setSaNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSub(null)
                    setDecisionAction(null)
                  }}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleExecuteVerdict}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Decision</span>
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
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl">
            <img 
              src={previewPhoto} 
              alt="Concept Full View" 
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
