'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Palette, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon,
  ShieldCheck,
  Bookmark
} from 'lucide-react'
import { toast } from 'sonner'
import { DesignBrief, DesignSubmission, BriefStatus } from '../../types/design'
import { submitDesignPhotosAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

interface DesignerDashboardClientProps {
  initialBriefs: DesignBrief[]
  designerEmail: string
  companyName: string
  currentUserId: string
  userRole?: string
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string; desc: string }> = {
  ALLOCATED: { label: 'Allocated (Pending Submission)', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Please submit up to 2 concept photos.' },
  SUBMITTED: { label: 'Submitted (PH Review)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold', desc: 'Awaiting review by Provisional Head.' },
  PH_APPROVED: { label: 'PH Approved (Awaiting SA)', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold', desc: 'Provisional Head approved! Awaiting Super Admin greenlight.' },
  PH_REJECTED: { label: 'Revisions Requested', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', desc: 'Feedback provided. You may resubmit new photos.' },
  SA_APPROVED: { label: 'Greenlit for Production', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', desc: 'Approved by Super Admin! Tech-Pack is being generated.' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Upcoming Season', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold', desc: 'Archived for future collection release.' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Generated', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold', desc: 'Moved to Merchandising & Sampling.' }
}

export function DesignerDashboardClient({
  initialBriefs,
  designerEmail,
  companyName,
  currentUserId,
  userRole
}: DesignerDashboardClientProps) {
  const [briefs, setBriefs] = useState<DesignBrief[]>(initialBriefs)
  const [activeBrief, setActiveBrief] = useState<DesignBrief | null>(initialBriefs[0] || null)

  // Submission Form State
  const [photo1, setPhoto1] = useState('')
  const [photo2, setPhoto2] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  const activeBriefsCount = briefs.filter(b => b.status === 'ALLOCATED' || b.status === 'PH_REJECTED').length
  const submittedBriefsCount = briefs.filter(b => b.status === 'SUBMITTED' || b.status === 'PH_APPROVED').length
  const approvedBriefsCount = briefs.filter(b => b.status === 'SA_APPROVED' || b.status === 'TECH_PACK_CREATED').length

  async function handleSubmitPhotos(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrief) return
    if (!photo1.trim()) {
      toast.error('At least 1 photo URL is required for submission.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await submitDesignPhotosAction({
        brief_id: activeBrief.id,
        designer_member_id: activeBrief.designer_member_id,
        photo_url_1: photo1.trim(),
        photo_url_2: photo2.trim() || undefined,
        designer_notes: notes.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success('Concept photos submitted to Provisional Head for verification!')
        setBriefs(prev => prev.map(b => b.id === activeBrief.id ? { 
          ...b, 
          status: 'SUBMITTED',
          latest_submission: res.data!
        } : b))
        setActiveBrief(prev => prev ? {
          ...prev,
          status: 'SUBMITTED',
          latest_submission: res.data!
        } : null)
        setPhoto1('')
        setPhoto2('')
        setNotes('')
      } else {
        toast.error(res.error || 'Failed to submit photos.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting photos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Designer Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Allocated apparel design briefs and concept photo submission portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564] font-mono">
            {designerEmail}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Action Required
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {activeBriefsCount} Briefs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pending your concept photo uploads
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            In Verification Review
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {submittedBriefsCount} Under Review
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Provisional Head & Super Admin pipeline
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Approved for Production
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {approvedBriefsCount} Concepts
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Greenlit Tech-Packs
          </div>
        </div>
      </div>

      {briefs.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No design briefs allocated yet"
          description="Your Provisional Head has not assigned any active design briefs to your account. Check back soon."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Briefs List Column */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Allocated Briefs ({briefs.length})
            </h2>

            <div className="space-y-2.5">
              {briefs.map(brief => {
                const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                const isSelected = activeBrief?.id === brief.id

                return (
                  <div
                    key={brief.id}
                    onClick={() => setActiveBrief(brief)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/15'
                        : 'bg-white border-black/10 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)] block">
                          {brief.garment_type}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {brief.category} Style &bull; {brief.max_colors} Max Colors
                        </span>
                      </div>

                      <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${stCfg.badgeClass}`}>
                        {stCfg.label}
                      </span>
                    </div>

                    {brief.instructions && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">
                        &ldquo;{brief.instructions}&rdquo;
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Brief Detail & Submission Upload Area */}
          {activeBrief && (
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    {activeBrief.garment_type} ({activeBrief.category})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned Brief ID: <span className="font-mono">{activeBrief.id.substring(0, 8)}</span>
                  </p>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-md border font-bold ${STATUS_CONFIG[activeBrief.status]?.badgeClass}`}>
                  {STATUS_CONFIG[activeBrief.status]?.label}
                </span>
              </div>

              {/* Status Note Alert */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#3A3564] block">Pipeline Status:</span>
                  <span className="text-slate-700">{STATUS_CONFIG[activeBrief.status]?.desc}</span>
                </div>
              </div>

              {/* Brief Guidelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-black/5">
                  <span className="text-slate-500 font-semibold block">Max Colorways Allowed:</span>
                  <span className="text-slate-900 font-mono font-bold text-sm mt-0.5 block">{activeBrief.max_colors} Colors</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-black/5">
                  <span className="text-slate-500 font-semibold block">Garment Category:</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">{activeBrief.category}</span>
                </div>
              </div>

              {activeBrief.instructions && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-800">Provisional Head Instructions:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-slate-700 leading-relaxed">
                    {activeBrief.instructions}
                  </div>
                </div>
              )}

              {/* PH Rejection Feedback Alert if applicable */}
              {activeBrief.status === 'PH_REJECTED' && activeBrief.latest_submission?.ph_feedback && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                    <XCircle className="w-4 h-4" />
                    <span>Revision Feedback from Provisional Head:</span>
                  </div>
                  <p className="text-rose-900 italic">&ldquo;{activeBrief.latest_submission.ph_feedback}&rdquo;</p>
                  <p className="text-rose-700 font-medium pt-1">Please update your design and submit 2 new photos below.</p>
                </div>
              )}

              {/* Submitted Photos Display (if already submitted) */}
              {activeBrief.latest_submission && (
                <div className="space-y-2 pt-2 border-t border-black/5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Current Submitted Photos (Max 2):
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPreviewPhoto(activeBrief.latest_submission!.photo_url_1)}
                      className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                    >
                      <img
                        src={activeBrief.latest_submission!.photo_url_1}
                        alt="Submitted 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> View Photo 1
                      </div>
                    </div>

                    {activeBrief.latest_submission!.photo_url_2 && (
                      <div
                        onClick={() => setPreviewPhoto(activeBrief.latest_submission!.photo_url_2!)}
                        className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                      >
                        <img
                          src={activeBrief.latest_submission!.photo_url_2!}
                          alt="Submitted 2"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          <Eye className="w-4 h-4 mr-1" /> View Photo 2
                        </div>
                      </div>
                    )}
                  </div>

                  {activeBrief.latest_submission.designer_notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-black/5 mt-2">
                      <strong className="text-slate-800">Your Submitted Notes:</strong> {activeBrief.latest_submission.designer_notes}
                    </div>
                  )}
                </div>
              )}

              {/* Submission Form (Only if ALLOCATED or PH_REJECTED) */}
              {(activeBrief.status === 'ALLOCATED' || activeBrief.status === 'PH_REJECTED') && (
                <form onSubmit={handleSubmitPhotos} className="space-y-4 pt-3 border-t border-black/5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#3A3564]" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      {activeBrief.status === 'PH_REJECTED' ? 'Resubmit Concept Photos' : 'Submit Concept Photos (Up to 2)'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Photo 1 URL <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={photo1}
                        onChange={e => setPhoto1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1 text-xs">
                        Photo 2 URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={photo2}
                        onChange={e => setPhoto2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Designer Notes & Concept Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe the fabric feel, silhouette inspiration, stitch finish details..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564] text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !photo1.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    <span>Submit Photos to Provisional Head</span>
                  </button>
                </form>
              )}
            </div>
          )}
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
              alt="Photo Full View" 
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
