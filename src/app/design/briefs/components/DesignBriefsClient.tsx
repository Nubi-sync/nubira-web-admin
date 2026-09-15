'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ClipboardList, 
  ChevronLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Image as ImageIcon, 
  FileCheck2, 
  Trash2, 
  Loader2,
  Eye,
  AlertCircle,
  ShieldCheck,
  Bookmark,
  Users,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignBrief, 
  DesignTeamMember, 
  BriefCategory, 
  BriefStatus, 
  DesignSubmission 
} from '../../types/design'
import { 
  createDesignBriefAction, 
  deleteDesignBriefAction, 
  reviewDesignSubmissionAction, 
  saReviewDesignSubmissionAction 
} from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface DesignBriefsClientProps {
  initialBriefs: DesignBrief[]
  teamMembers: DesignTeamMember[]
  companyName: string
  currentUserId: string
  userRole?: string
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string }> = {
  ALLOCATED: { label: 'Allocated', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'Submitted (Review)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'PH Approved (Pending SA)', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold' },
  PH_REJECTED: { label: 'PH Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  SA_APPROVED: { label: 'SA Greenlit (Tech-Pack Ready)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Later (Archive)', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' }
}

export function DesignBriefsClient({
  initialBriefs,
  teamMembers,
  companyName,
  currentUserId,
  userRole
}: DesignBriefsClientProps) {
  const [briefs, setBriefs] = useState<DesignBrief[]>(initialBriefs || [])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PH Review Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState<{
    submission: DesignSubmission
    brief: DesignBrief
  } | null>(null)
  const [phFeedback, setPhFeedback] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  // SA Review Modal State
  const [saReviewingSubmission, setSaReviewingSubmission] = useState<{
    submission: DesignSubmission
    brief: DesignBrief
  } | null>(null)
  const [saNotes, setSaNotes] = useState('')
  const [isSaReviewing, setIsSaReviewing] = useState(false)

  // Photo Preview Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Delete State
  const [briefToDelete, setBriefToDelete] = useState<DesignBrief | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create Brief Form State
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('')
  const [garmentType, setGarmentType] = useState('T-Shirt')
  const [category, setCategory] = useState<BriefCategory>('Casual')
  const [maxColors, setMaxColors] = useState(3)
  const [instructions, setInstructions] = useState('')

  const activeTeamMembers = (teamMembers || []).filter(m => m.status === 'ACTIVE')

  const filteredBriefs = briefs.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      b.garment_type.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.designer_name && b.designer_name.toLowerCase().includes(q)) ||
      (b.instructions && b.instructions.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const pendingReviewCount = briefs.filter(b => b.status === 'SUBMITTED').length
  const pendingSACount = briefs.filter(b => b.status === 'PH_APPROVED').length
  const saApprovedCount = briefs.filter(b => b.status === 'SA_APPROVED').length
  const savedForLaterCount = briefs.filter(b => b.status === 'SA_SAVED_FOR_LATER').length

  async function handleCreateBrief(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await createDesignBriefAction({
        ph_user_id: currentUserId,
        designer_member_id: selectedDesignerId || undefined,
        garment_type: garmentType,
        category: category,
        max_colors: Number(maxColors) || 3,
        instructions: instructions.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success('Design brief allocated successfully!')
        setBriefs(prev => [res.data!, ...prev])
        setIsCreateOpen(false)
        setSelectedDesignerId('')
        setInstructions('')
      } else {
        toast.error(res.error || 'Failed to create design brief.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred creating brief.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePHReviewSubmit(verdict: 'APPROVED' | 'REJECTED') {
    if (!reviewingSubmission) return
    setIsReviewing(true)
    try {
      const res = await reviewDesignSubmissionAction({
        submission_id: reviewingSubmission.submission.id,
        ph_verdict: verdict,
        ph_feedback: phFeedback.trim() || undefined
      })

      if (res.success) {
        const nextStatus: BriefStatus = verdict === 'APPROVED' ? 'PH_APPROVED' : 'PH_REJECTED'
        toast.success(verdict === 'APPROVED' ? 'Concept approved and forwarded to Super Admin!' : 'Submission returned with feedback sent to designer.')
        setBriefs(prev => prev.map(b => b.id === reviewingSubmission.brief.id ? { ...b, status: nextStatus } : b))
        setReviewingSubmission(null)
        setPhFeedback('')
      } else {
        toast.error(res.error || 'Failed to submit PH review.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during review.')
    } finally {
      setIsReviewing(false)
    }
  }

  async function handleSAReviewSubmit(verdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED') {
    if (!saReviewingSubmission) return
    setIsSaReviewing(true)
    try {
      const res = await saReviewDesignSubmissionAction({
        submission_id: saReviewingSubmission.submission.id,
        sa_verdict: verdict,
        sa_notes: saNotes.trim() || undefined
      })

      if (res.success) {
        let nextStatus: BriefStatus = 'SA_APPROVED'
        if (verdict === 'SAVED_FOR_LATER') nextStatus = 'SA_SAVED_FOR_LATER'
        if (verdict === 'REJECTED') nextStatus = 'PH_REJECTED'

        toast.success(
          verdict === 'APPROVED' 
            ? 'Design greenlit for Tech-Pack creation!' 
            : verdict === 'SAVED_FOR_LATER'
              ? 'Design saved in Seasonal Archive for future drop.'
              : 'Design rejected.'
        )

        setBriefs(prev => prev.map(b => b.id === saReviewingSubmission.brief.id ? { ...b, status: nextStatus } : b))
        setSaReviewingSubmission(null)
        setSaNotes('')
      } else {
        toast.error(res.error || 'Failed to update SA verdict.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during SA review.')
    } finally {
      setIsSaReviewing(false)
    }
  }

  async function handleDeleteBrief() {
    if (!briefToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteDesignBriefAction(briefToDelete.id)
      if (res.success) {
        toast.success('Design brief removed.')
        setBriefs(prev => prev.filter(b => b.id !== briefToDelete.id))
        setBriefToDelete(null)
      } else {
        toast.error(res.error || 'Failed to delete brief.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting brief.')
    } finally {
      setIsDeleting(false)
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
          Design Briefs &amp; Submissions Verification
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Design Briefs &amp; Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Allocate apparel briefs to designers, review submitted sample photos, and verify through Super Admin
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/design/team"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team</span>
          </Link>

          <Link
            href="/design/settings"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Brief</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending PH Reviews
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 font-[family-name:var(--font-heading)] mt-2">
            {pendingReviewCount} Awaiting
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Submitted designer photos
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pending SA Approvals
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-sky-800 font-[family-name:var(--font-heading)] mt-2">
            {pendingSACount} Pending
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Awaiting SA Greenlight
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Saved for Later
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#3A3564] font-[family-name:var(--font-heading)] mt-2">
            {savedForLaterCount} Archived
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Seasonal Archive Collection
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            SA Greenlit Ready
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 font-[family-name:var(--font-heading)] mt-2">
            {saApprovedCount} Ready
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Ready for Tech-Pack creation
          </div>
        </div>
      </div>

      {/* Filter and Queue Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['ALL', 'SUBMITTED', 'PH_APPROVED', 'SA_APPROVED', 'SA_SAVED_FOR_LATER', 'ALLOCATED', 'PH_REJECTED', 'TECH_PACK_CREATED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                    : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {st === 'ALL' ? 'All Briefs' : STATUS_CONFIG[st as BriefStatus]?.label || st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search briefs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {filteredBriefs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={searchQuery || statusFilter !== 'ALL' ? "No matching briefs" : "No design briefs created yet"}
            description={
              searchQuery || statusFilter !== 'ALL'
                ? "Adjust your filters or search query."
                : "Create your first design brief to allocate work to creative designers."
            }
            actionLabel="New Design Brief"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Garment / Category</th>
                  <th className="py-3 px-4">Assigned Designer</th>
                  <th className="py-3 px-4">Colors Limit</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {filteredBriefs.map(brief => {
                  const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                  const hasPhotos = brief.latest_submission && brief.latest_submission.photo_url_1

                  return (
                    <tr key={brief.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm block">{brief.garment_type}</span>
                        <span className="text-xs text-slate-500 font-medium">{brief.category} Style</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {brief.designer_name ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center text-xs font-bold font-mono">
                              {brief.designer_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">{brief.designer_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-xs">
                        {brief.max_colors} Max
                      </td>

                      <td className="py-3.5 px-4">
                        {hasPhotos ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewPhoto(brief.latest_submission!.photo_url_1)}
                              className="w-9 h-9 rounded-lg border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                              title="View Concept Photo 1"
                            >
                              <img 
                                src={brief.latest_submission!.photo_url_1} 
                                alt="Design 1" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                            </button>
                            {brief.latest_submission!.photo_url_2 && (
                              <button
                                onClick={() => setPreviewPhoto(brief.latest_submission!.photo_url_2!)}
                                className="w-9 h-9 rounded-lg border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                                title="View Concept Photo 2"
                              >
                                <img 
                                  src={brief.latest_submission!.photo_url_2!} 
                                  alt="Design 2" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No photos yet</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-md border ${stCfg.badgeClass}`}>
                          {stCfg.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {brief.latest_submission?.designer_notes || brief.instructions || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. PH Review Button */}
                          {brief.status === 'SUBMITTED' && brief.latest_submission && (
                            <button
                              onClick={() => setReviewingSubmission({ submission: brief.latest_submission!, brief })}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#FAF7F0] bg-[#3A3564] hover:bg-[#2A2649] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Provisional Head Review"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>PH Review</span>
                            </button>
                          )}

                          {/* 2. SA Review Button */}
                          {brief.status === 'PH_APPROVED' && brief.latest_submission && (
                            <button
                              onClick={() => setSaReviewingSubmission({ submission: brief.latest_submission!, brief })}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Super Admin Greenlight / Seasonal Archive"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>SA Review</span>
                            </button>
                          )}

                          {/* 3. Revive Archive Button */}
                          {brief.status === 'SA_SAVED_FOR_LATER' && brief.latest_submission && (
                            <button
                              onClick={() => setSaReviewingSubmission({ submission: brief.latest_submission!, brief })}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Revive from Seasonal Archive"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Revive</span>
                            </button>
                          )}

                          {/* 4. Generate Tech-Pack */}
                          {brief.status === 'SA_APPROVED' && (
                            <Link
                              href={`/design/tech-packs?createFromSubmission=${brief.latest_submission?.id || ''}&garment=${brief.garment_type}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs"
                              title="Generate Tech-Pack"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Tech-Pack</span>
                            </Link>
                          )}

                          <button
                            onClick={() => setBriefToDelete(brief)}
                            className="p-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-black/5 transition-all cursor-pointer shadow-2xs"
                            title="Delete Brief"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Brief Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Allocate New Design Brief
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrief} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Assign Designer <span className="text-rose-600">*</span>
                </label>
                <select
                  required
                  value={selectedDesignerId}
                  onChange={e => setSelectedDesignerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                >
                  <option value="">Select a team member...</option>
                  {activeTeamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.designer_name} ({m.designer_email})
                    </option>
                  ))}
                </select>
                {activeTeamMembers.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No active designers. Please add designers in Team Management first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Garment Silhouette <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={garmentType}
                    onChange={e => setGarmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Polo">Polo</option>
                    <option value="Suit">Suit</option>
                    <option value="Pant">Pant</option>
                    <option value="Jogger">Jogger</option>
                    <option value="Kids Romper">Kids Romper</option>
                    <option value="Ethnic">Ethnic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Category Style <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as BriefCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    <option value="Formal">Formal</option>
                    <option value="Informal">Informal</option>
                    <option value="Casual">Casual</option>
                    <option value="Ethnic">Ethnic</option>
                    <option value="Sportswear">Sportswear</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Colorways Limit (Max Colors) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={maxColors}
                  onChange={e => setMaxColors(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Design Instructions &amp; Creative Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Minimal typography on chest, raw hem finish, oversized street style..."
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDesignerId}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Allocate Brief</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PH Review Submission Modal */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Provisional Head Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    {reviewingSubmission.brief.garment_type} ({reviewingSubmission.brief.category}) by {reviewingSubmission.brief.designer_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewingSubmission(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-2 text-xs">
                  Submitted Concept Photos (Max 2):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPreviewPhoto(reviewingSubmission.submission.photo_url_1)}
                    className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                  >
                    <img
                      src={reviewingSubmission.submission.photo_url_1}
                      alt="Concept 1"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      <Eye className="w-4 h-4 mr-1" /> Full View
                    </div>
                  </div>

                  {reviewingSubmission.submission.photo_url_2 ? (
                    <div 
                      onClick={() => setPreviewPhoto(reviewingSubmission.submission.photo_url_2!)}
                      className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                    >
                      <img
                        src={reviewingSubmission.submission.photo_url_2}
                        alt="Concept 2"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        <Eye className="w-4 h-4 mr-1" /> Full View
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl border border-dashed border-black/15 bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                      Single photo submitted
                    </div>
                  )}
                </div>
              </div>

              {reviewingSubmission.submission.designer_notes && (
                <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 text-xs">
                  <span className="font-bold text-[#3A3564] block mb-1">Designer&apos;s Creative Notes:</span>
                  <p className="text-slate-700 italic leading-relaxed">&ldquo;{reviewingSubmission.submission.designer_notes}&rdquo;</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Provisional Head Feedback / Revision Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or reasons for approval / rejection..."
                  value={phFeedback}
                  onChange={e => setPhFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() => handlePHReviewSubmit('REJECTED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject to Designer</span>
                  </button>

                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() => handlePHReviewSubmit('APPROVED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Approve &amp; Forward to SA</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SA Review Submission Modal (Greenlight vs Save for Later) */}
      {saReviewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Super Admin Executive Review
                  </h2>
                  <p className="text-xs text-slate-500">
                    {saReviewingSubmission.brief.garment_type} ({saReviewingSubmission.brief.category}) &bull; Provisional Head Approved
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSaReviewingSubmission(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-2 text-xs">
                  Submitted Concept Photos:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setPreviewPhoto(saReviewingSubmission.submission.photo_url_1)}
                    className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                  >
                    <img
                      src={saReviewingSubmission.submission.photo_url_1}
                      alt="Concept 1"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      <Eye className="w-4 h-4 mr-1" /> Full View
                    </div>
                  </div>

                  {saReviewingSubmission.submission.photo_url_2 && (
                    <div 
                      onClick={() => setPreviewPhoto(saReviewingSubmission.submission.photo_url_2!)}
                      className="aspect-square rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer"
                    >
                      <img
                        src={saReviewingSubmission.submission.photo_url_2}
                        alt="Concept 2"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        <Eye className="w-4 h-4 mr-1" /> Full View
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {saReviewingSubmission.submission.designer_notes && (
                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-black/10 text-xs">
                  <span className="font-bold text-[#3A3564] block mb-0.5">Designer Notes:</span>
                  <p className="text-slate-700 italic">&ldquo;{saReviewingSubmission.submission.designer_notes}&rdquo;</p>
                </div>
              )}

              {saReviewingSubmission.submission.ph_feedback && (
                <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs">
                  <span className="font-bold text-sky-900 block mb-0.5">PH Review Comments:</span>
                  <p className="text-sky-800">&ldquo;{saReviewingSubmission.submission.ph_feedback}&rdquo;</p>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Super Admin Decision Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional strategic notes or collection assignment..."
                  value={saNotes}
                  onChange={e => setSaNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setSaReviewingSubmission(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer text-center"
                >
                  Cancel
                </button>

                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <button
                    type="button"
                    disabled={isSaReviewing}
                    onClick={() => handleSAReviewSubmit('SAVED_FOR_LATER')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save for Later Archive</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSaReviewing}
                    onClick={() => handleSAReviewSubmit('APPROVED')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isSaReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Greenlight for Tech-Pack</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Preview Lightbox */}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!briefToDelete}
        title={`Delete Design Brief for "${briefToDelete?.garment_type}"?`}
        description={`Are you sure you want to delete this brief? All associated designer submissions and photos will be permanently deleted.`}
        confirmText="Yes, Delete Brief"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteBrief}
        onClose={() => {
          if (!isDeleting) setBriefToDelete(null)
        }}
      />
    </div>
  )
}
