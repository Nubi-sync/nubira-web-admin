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
  Settings,
  Tag,
  Shirt,
  Phone,
  Target,
  Palette
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
import { AllocateBriefModal } from '../../components/AllocateBriefModal'
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
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
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

  const activeTeamMembers = (teamMembers || []).filter(m => m.status === 'ACTIVE')

  // Dynamically compute existing silhouettes and categories from real database briefs
  const existingGarments = Array.from(new Set(briefs.map(b => b.garment_type).filter(Boolean)))
  const existingCategories = Array.from(new Set(briefs.map(b => b.category).filter(Boolean)))

  // Studio Quota Aggregates
  const totalTargetDesigns = briefs.reduce((acc, b) => acc + (b.target_designs || 1), 0)
  const totalSubmissionsCompleted = briefs.reduce((acc, b) => acc + (b.submissions_count || (b.latest_submission?.photo_url_1 ? 1 : 0)), 0)
  const studioProgressPct = totalTargetDesigns > 0 ? Math.min(100, Math.round((totalSubmissionsCompleted / totalTargetDesigns) * 100)) : 0

  const filteredBriefs = briefs.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      b.garment_type.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.designer_name && b.designer_name.toLowerCase().includes(q)) ||
      (b.instructions && b.instructions.toLowerCase().includes(q))
    return matchesStatus && matchesCategory && matchesSearch
  })

  const pendingReviewCount = briefs.filter(b => b.status === 'SUBMITTED').length
  const pendingSACount = briefs.filter(b => b.status === 'PH_APPROVED').length
  const saApprovedCount = briefs.filter(b => b.status === 'SA_APPROVED').length
  const savedForLaterCount = briefs.filter(b => b.status === 'SA_SAVED_FOR_LATER').length

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
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <ClipboardList className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Design Briefs &amp; Reviews
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {briefs.length} Briefs
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
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

      {/* Metric Cards (Unified 4-Box Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              STAGE 02
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Pending PH Reviews
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingReviewCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              STAGE 03
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Forwarded to SA
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingSACount}
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
              {saApprovedCount}
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
              {savedForLaterCount}
            </div>
          </div>
        </div>
      </div>

      {/* Studio Target Allocation & Quota Tracker Banner */}
      {briefs.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Studio Target Allocation &amp; Quota Tracker
                </h2>
                <p className="text-xs text-slate-500">
                  Live studio design targets vs submitted concept photos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 block">
                  Studio Output
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono text-[#3A3564]">
                  {totalSubmissionsCompleted} / {totalTargetDesigns} Designs ({studioProgressPct}%)
                </span>
              </div>
              <div className="w-24 sm:w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-black/5">
                <div 
                  className="h-full bg-[#3A3564] rounded-full transition-all duration-500"
                  style={{ width: `${studioProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Breakdown per active garment / category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {existingCategories.slice(0, 6).map(cat => {
              const catBriefs = briefs.filter(b => b.category === cat)
              const catTarget = catBriefs.reduce((acc, b) => acc + (b.target_designs || 1), 0)
              const catDone = catBriefs.reduce((acc, b) => acc + (b.submissions_count || (b.latest_submission?.photo_url_1 ? 1 : 0)), 0)
              const catPct = catTarget > 0 ? Math.min(100, Math.round((catDone / catTarget) * 100)) : 0
              const sampleColors = catBriefs[0]?.max_colors || 3

              return (
                <div key={cat} className="p-3 rounded-xl bg-[#FAF7F0] border border-black/5 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {cat}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {catDone}/{catTarget} ({catPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-black/5">
                    <div 
                      className={`h-full rounded-full transition-all ${catDone >= catTarget ? 'bg-emerald-500' : 'bg-[#3A3564]'}`}
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
                    <span className="inline-flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#3A3564]" />
                      {catTarget} Target Designs
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Palette className="w-3 h-3 text-slate-400" />
                      {sampleColors} Colors Chart
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

        {/* Dynamic Collection Filter Pills (Zero Emojis, Pure Lucide Assets) */}
        {existingCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 border-t border-black/5 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-[#3A3564]" />
              Collection Style:
            </span>
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer border ${
                categoryFilter === 'ALL'
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] font-bold'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
              }`}
            >
              All ({briefs.length})
            </button>
            {existingCategories.map(cat => {
              const count = briefs.filter(b => b.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer border inline-flex items-center gap-1.5 ${
                    categoryFilter === cat
                      ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] font-bold'
                      : 'bg-white text-slate-600 border-black/10 hover:bg-[#FAF7F0]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    categoryFilter === cat ? 'bg-white/20 text-[#FAF7F0]' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

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
                  <th className="py-3 px-4">Article Number (Art #)</th>
                  <th className="py-3 px-4">Garment / Category</th>
                  <th className="py-3 px-4">Assigned Designer</th>
                  <th className="py-3 px-4">Colors &amp; Scope</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {(() => {
                  const rows: {
                    key: string
                    brief: DesignBrief
                    conceptNumber: number
                    artNumber: string
                    garmentType: string
                    category: string
                    colors: string[]
                    photos: { url: string; label: string; color?: string }[]
                  }[] = []

                  filteredBriefs.forEach(brief => {
                    if (brief.design_concepts_brief && brief.design_concepts_brief.length > 0) {
                      brief.design_concepts_brief.forEach(req => {
                        const artNo = req.art_number || (req.notes?.match(/Art No:\s*([^|]+)/i)?.[1]?.trim()) || `#${brief.id.substring(0, 6)}-${req.concept_number}`
                        const garment = (req.notes?.match(/Garment:\s*([^|]+)/i)?.[1]?.trim()) || brief.garment_type
                        const cat = req.category_style || brief.category
                        const cols = (req.colors && req.colors.length > 0) ? req.colors : (brief.target_colors || [])
                        const subConcept = brief.latest_submission?.concepts?.find(c => c.concept_number === req.concept_number || (c.art_number && c.art_number.toLowerCase() === artNo.toLowerCase()))
                        
                        const photos: { url: string; label: string; color?: string }[] = []
                        if (subConcept?.colorways) {
                          subConcept.colorways.forEach(cw => {
                            if (cw.photo_front) photos.push({ url: cw.photo_front, label: `${artNo} • ${cw.color_name} (Front)`, color: cw.color_name })
                            if (cw.photo_back) photos.push({ url: cw.photo_back, label: `${artNo} • ${cw.color_name} (Back)`, color: cw.color_name })
                          })
                        }
                        if (photos.length === 0 && brief.latest_submission?.photo_url_1) {
                          photos.push({ url: brief.latest_submission.photo_url_1, label: `${artNo} Mockup` })
                        }

                        rows.push({
                          key: `${brief.id}-${req.concept_number}`,
                          brief,
                          conceptNumber: req.concept_number,
                          artNumber: artNo,
                          garmentType: garment,
                          category: cat,
                          colors: cols,
                          photos
                        })
                      })
                    } else {
                      const artNo = `#${brief.id.substring(0, 6)}`
                      const photos: { url: string; label: string; color?: string }[] = []
                      if (brief.latest_submission?.photo_url_1) photos.push({ url: brief.latest_submission.photo_url_1, label: 'Photo 1' })
                      if (brief.latest_submission?.photo_url_2) photos.push({ url: brief.latest_submission.photo_url_2, label: 'Photo 2' })

                      rows.push({
                        key: brief.id,
                        brief,
                        conceptNumber: 1,
                        artNumber: artNo,
                        garmentType: brief.garment_type,
                        category: brief.category,
                        colors: brief.target_colors || [],
                        photos
                      })
                    }
                  })

                  if (rows.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-mono text-xs">
                          No designs found.
                        </td>
                      </tr>
                    )
                  }

                  return rows.map(item => {
                    const brief = item.brief
                    const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED

                    return (
                      <tr key={item.key} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Article Number (Art #) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-slate-900 text-sm block">
                              {item.artNumber}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-medium block">
                              #{item.conceptNumber} &bull; #{brief.id.substring(0, 6)}
                            </span>
                          </div>
                        </td>

                        {/* 2. Garment / Category */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 text-sm block">{item.garmentType}</span>
                          <span className="text-xs text-slate-500 font-medium">{item.category} Style</span>
                        </td>

                        {/* 3. Designer */}
                        <td className="py-3.5 px-4">
                          {brief.designer_name ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center text-xs font-bold font-mono">
                                {brief.designer_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-800 text-xs block">{brief.designer_name}</span>
                                {brief.designer_phone && (
                                  <span className="text-[10px] text-slate-500 font-mono inline-flex items-center gap-0.5">
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    +91 {brief.designer_phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* 4. Colors & Scope */}
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                              <Palette className="w-3 h-3 text-[#3A3564]" />
                              <span>{item.colors.length} Color{item.colors.length === 1 ? '' : 's'}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.colors.map((col, i) => (
                                <span key={i} className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-[#FAF7F0] border border-black/5 font-mono text-[#3A3564] font-semibold">
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* 5. Photos */}
                        <td className="py-3.5 px-4 min-w-[120px]">
                          {item.photos.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.photos.slice(0, 3).map((photo, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPreviewPhoto(photo.url)}
                                  className="w-9 h-9 rounded-lg border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shrink-0 shadow-2xs hover:ring-2 hover:ring-[#3A3564]"
                                  title={photo.label}
                                >
                                  <img 
                                    src={photo.url} 
                                    alt={photo.label} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                  />
                                </button>
                              ))}
                              {item.photos.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewPhoto(item.photos[3].url)}
                                  className="w-9 h-9 rounded-lg border border-black/10 bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] text-[11px] font-bold font-mono flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
                                >
                                  +{item.photos.length - 3}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No photos</span>
                          )}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3.5 px-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-md border ${stCfg.badgeClass}`}>
                            {stCfg.label}
                          </span>
                        </td>

                        {/* 7. Instructions */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                          {brief.latest_submission?.designer_notes || brief.instructions || '—'}
                        </td>

                        {/* 8. Verification Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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

                            {brief.status === 'SA_SAVED_FOR_LATER' && brief.latest_submission && (
                              <button
                                onClick={() => setSaReviewingSubmission({ submission: brief.latest_submission!, brief })}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3A3564] bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                                title="Revive from Seasonal Archive"
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Revive</span>
                              </button>
                            )}

                            {brief.status === 'ALLOCATED' && (
                              <button
                                onClick={() => {
                                  if (brief.latest_submission) {
                                    setReviewingSubmission({ submission: brief.latest_submission, brief })
                                  } else {
                                    toast.info('Brief is currently allocated and waiting for designer upload.')
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                                title="View Brief Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            )}

                            {brief.status === 'SA_APPROVED' && (
                              <Link
                                href={`/design/tech-packs?from_brief=${brief.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs"
                                title="Create Production Tech-Pack"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Create Tech-Pack</span>
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => setBriefToDelete(brief)}
                              className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer ml-1"
                              title="Delete Brief"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Brief Modal */}
      <AllocateBriefModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={newBrief => {
          setBriefs(prev => [newBrief, ...prev])
        }}
        teamMembers={teamMembers}
        currentUserId={currentUserId}
        companyName={companyName}
        existingGarments={existingGarments}
        existingCategories={existingCategories}
      />

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
              {reviewingSubmission.submission.concepts && reviewingSubmission.submission.concepts.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    Submitted Design Concepts ({reviewingSubmission.submission.concepts.length} Designs):
                  </label>
                  {reviewingSubmission.submission.concepts.map((concept) => {
                    const instructedReq = reviewingSubmission.brief.design_concepts_brief?.find(c => c.concept_number === concept.concept_number)
                    const artNo = concept.art_number || instructedReq?.art_number

                    return (
                      <div key={concept.concept_number} className="p-3.5 rounded-xl bg-slate-50 border border-black/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                            <span className="w-5 h-5 rounded-full bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center text-[10px] font-mono">
                              {concept.concept_number}
                            </span>
                            <span>{concept.title || `Design Concept #${concept.concept_number}`}</span>
                            {artNo && (
                              <span className="px-2 py-0.5 rounded bg-[#3A3564] text-white text-[10px] font-mono font-bold tracking-wider">
                                ART NO: {artNo}
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {concept.colorways.length} Colorway(s)
                          </span>
                        </div>
                      
                      {concept.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-black/5">
                          &ldquo;{concept.notes}&rdquo;
                        </p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {concept.colorways.map((cw, cwIdx) => (
                          <div key={cwIdx} className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-700 block truncate">
                              {cw.color_name} Colorway
                            </span>
                            <div 
                              onClick={() => setPreviewPhoto(cw.photo_front)}
                              className="aspect-video rounded-lg border border-black/10 overflow-hidden bg-white relative group cursor-pointer"
                            >
                              <img src={cw.photo_front} alt={cw.color_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                <Eye className="w-3.5 h-3.5 mr-1" /> View Front
                              </div>
                            </div>
                            {cw.photo_back && (
                              <div 
                                onClick={() => setPreviewPhoto(cw.photo_back!)}
                                className="aspect-video rounded-lg border border-black/10 overflow-hidden bg-white relative group cursor-pointer mt-1"
                              >
                                <img src={cw.photo_back} alt={`${cw.color_name} Back`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                  <Eye className="w-3.5 h-3.5 mr-1" /> View Back
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    )
                  })}
                </div>
              ) : (
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
              )}

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
              {saReviewingSubmission.submission.concepts && saReviewingSubmission.submission.concepts.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    Submitted Design Concepts ({saReviewingSubmission.submission.concepts.length} Designs):
                  </label>
                  {saReviewingSubmission.submission.concepts.map((concept) => (
                    <div key={concept.concept_number} className="p-3.5 rounded-xl bg-slate-50 border border-black/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center text-[10px] font-mono">
                            {concept.concept_number}
                          </span>
                          <span>{concept.title || `Design Concept #${concept.concept_number}`}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {concept.colorways.length} Colorway(s)
                        </span>
                      </div>
                      
                      {concept.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-black/5">
                          &ldquo;{concept.notes}&rdquo;
                        </p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {concept.colorways.map((cw, cwIdx) => (
                          <div key={cwIdx} className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-700 block truncate">
                              {cw.color_name} Colorway
                            </span>
                            <div 
                              onClick={() => setPreviewPhoto(cw.photo_front)}
                              className="aspect-video rounded-lg border border-black/10 overflow-hidden bg-white relative group cursor-pointer"
                            >
                              <img src={cw.photo_front} alt={cw.color_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                                <Eye className="w-3.5 h-3.5 mr-1" /> View Front
                              </div>
                            </div>
                            {cw.photo_back && (
                              <div 
                                onClick={() => setPreviewPhoto(cw.photo_back!)}
                                className="aspect-video rounded-lg border border-black/10 overflow-hidden bg-white relative group cursor-pointer mt-1"
                              >
                                <img src={cw.photo_back} alt={`${cw.color_name} Back`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
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
              ) : (
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
              )}

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
