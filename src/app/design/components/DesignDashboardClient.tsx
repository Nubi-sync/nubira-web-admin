'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Palette, 
  ChevronLeft, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  FileCheck2, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  Trash2,
  Loader2,
  Settings,
  ClipboardList,
  Bookmark,
  ShieldCheck,
  FolderArchive,
  Target,
  Tag,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  TechPack, 
  DesignBrief, 
  DesignTeamMember, 
  DesignSubmission, 
  BriefStatus, 
  BriefCategory 
} from '../types/design'
import { 
  createDesignBriefAction, 
  deleteDesignBriefAction, 
  reviewDesignSubmissionAction, 
  saReviewDesignSubmissionAction 
} from '../actions'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string }> = {
  ALLOCATED: { label: 'Allocated', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'Submitted (Review)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'PH Approved (Pending SA)', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold' },
  PH_REJECTED: { label: 'PH Rejected', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  SA_APPROVED: { label: 'SA Greenlit (Tech-Pack Ready)', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Later (Archive)', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' }
}

interface DesignDashboardClientProps {
  metrics: {
    active_briefs: number
    pending_ph_reviews: number
    pending_sa_approvals: number
    sa_approved_designs: number
    saved_for_later: number
    active_tech_packs: number
    team_designers_count: number
  }
  initialBriefs: DesignBrief[]
  initialTechPacks: TechPack[]
  teamMembers: DesignTeamMember[]
  companyName: string
  currentUserId: string
  userRole?: string
}

export function DesignDashboardClient({
  metrics: initialMetrics,
  initialBriefs,
  initialTechPacks,
  teamMembers,
  companyName,
  currentUserId,
  userRole
}: DesignDashboardClientProps) {
  const [briefs, setBriefs] = useState<DesignBrief[]>(initialBriefs || [])
  const [techPacks, setTechPacks] = useState<TechPack[]>(initialTechPacks || [])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Brief Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Create Brief Form State (Initialized empty with clean placeholders - zero dummy data)
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('')
  const [garmentType, setGarmentType] = useState('')
  const [category, setCategory] = useState<string>('')
  const [targetDesigns, setTargetDesigns] = useState<string>('')
  const [maxColors, setMaxColors] = useState<string>('')
  const [targetColors, setTargetColors] = useState<string[]>([])
  const [colorInput, setColorInput] = useState('')
  const [instructions, setInstructions] = useState('')

  function handleAddColor(colorName?: string) {
    const val = (colorName || colorInput).trim().replace(/^,+|,+$/g, '')
    if (!val) return
    if (!targetColors.includes(val)) {
      setTargetColors(prev => [...prev, val])
    }
    setColorInput('')
  }

  function handleRemoveColor(index: number) {
    setTargetColors(prev => prev.filter((_, i) => i !== index))
  }

  function handleColorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddColor()
    } else if (e.key === 'Backspace' && !colorInput && targetColors.length > 0) {
      handleRemoveColor(targetColors.length - 1)
    }
  }

  function resetCreateForm() {
    setSelectedDesignerId('')
    setGarmentType('')
    setCategory('')
    setTargetDesigns('')
    setMaxColors('')
    setTargetColors([])
    setColorInput('')
    setInstructions('')
  }

  // PH Review Modal
  const [reviewingSubmission, setReviewingSubmission] = useState<{
    submission: DesignSubmission
    brief: DesignBrief
  } | null>(null)
  const [phFeedback, setPhFeedback] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  // SA Review Modal
  const [saReviewingSubmission, setSaReviewingSubmission] = useState<{
    submission: DesignSubmission
    brief: DesignBrief
  } | null>(null)
  const [saNotes, setSaNotes] = useState('')
  const [isSaReviewing, setIsSaReviewing] = useState(false)

  // Photo Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Delete State
  const [briefToDelete, setBriefToDelete] = useState<DesignBrief | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeTeamMembers = (teamMembers || []).filter(m => m.status === 'ACTIVE')

  // Dynamically compute existing silhouettes and categories from real database briefs
  const existingGarments = Array.from(new Set(briefs.map(b => b.garment_type).filter(Boolean)))
  const existingCategories = Array.from(new Set(briefs.map(b => b.category).filter(Boolean)))

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

  // Dynamic KPI counts
  const activeBriefsCount = briefs.filter(b => b.status === 'ALLOCATED' || b.status === 'SUBMITTED').length
  const pendingPHCount = briefs.filter(b => b.status === 'SUBMITTED').length
  const pendingSACount = briefs.filter(b => b.status === 'PH_APPROVED').length
  const saApprovedCount = briefs.filter(b => b.status === 'SA_APPROVED').length
  const savedForLaterCount = briefs.filter(b => b.status === 'SA_SAVED_FOR_LATER').length
  const techPacksCount = techPacks.length

  async function handleCreateBrief(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDesignerId || !garmentType || !category) {
      toast.error('Please fill in all required fields.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await createDesignBriefAction({
        ph_user_id: currentUserId,
        designer_member_id: selectedDesignerId || undefined,
        garment_type: garmentType,
        category: category,
        target_designs: Number(targetDesigns) || 1,
        num_designs: Number(targetDesigns) || 1,
        max_colors: Number(maxColors) || (targetColors.length > 0 ? targetColors.length : 3),
        chart_colors: Number(maxColors) || (targetColors.length > 0 ? targetColors.length : 3),
        target_colors: targetColors.length > 0 ? targetColors : undefined,
        instructions: instructions.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success('Design brief allocated successfully!')
        setBriefs(prev => [res.data!, ...prev])
        setIsCreateOpen(false)
        resetCreateForm()
      } else {
        toast.error(res.error || 'Failed to allocate design brief.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating design brief.')
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
        toast.success(verdict === 'APPROVED' ? 'Concept approved and forwarded to Super Admin!' : 'Submission returned with feedback to designer.')
        setBriefs(prev => prev.map(b => b.id === reviewingSubmission.brief.id ? { ...b, status: nextStatus } : b))
        setReviewingSubmission(null)
        setPhFeedback('')
      } else {
        toast.error(res.error || 'Failed to submit PH review.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during PH review.')
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
              ? 'Design archived in Seasonal Archive for future collections.'
              : 'Design rejected.'
        )

        setBriefs(prev => prev.map(b => b.id === saReviewingSubmission.brief.id ? { ...b, status: nextStatus } : b))
        setSaReviewingSubmission(null)
        setSaNotes('')
      } else {
        toast.error(res.error || 'Failed to update SA verdict.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error during SA review.')
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
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3A3564]" />
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
            Division 01 &bull; Design & Tech-Pack Studio
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500">
          {companyName}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Design & Tech-Pack Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Creative team allocation, 3-tier design verification (Designer &rarr; PH &rarr; SA), and precision Tech-Pack generation
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Link
            href="/design/briefs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Briefs Queue</span>
          </Link>

          <Link
            href="/design/tech-packs"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Tech-Packs</span>
          </Link>

          <Link
            href="/design/team"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Team</span>
          </Link>

          <Link
            href="/design/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-slate-700 hover:bg-[#FAF7F0] hover:text-[#3A3564] transition-all shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>PH Settings</span>
          </Link>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Brief</span>
          </button>
        </div>
      </div>

      {/* 6 Studio KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Briefs</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {activeBriefsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">In Creative Dev</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending PH</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-800 font-[family-name:var(--font-heading)]">
            {pendingPHCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Awaiting PH Review</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending SA</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-sky-800 font-[family-name:var(--font-heading)]">
            {pendingSACount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Awaiting SA Greenlight</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Saved for Later</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#3A3564] font-[family-name:var(--font-heading)]">
            {savedForLaterCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Seasonal Archive</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">SA Greenlit</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-800 font-[family-name:var(--font-heading)]">
            {saApprovedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Ready for Tech-Pack</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tech-Packs</span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-slate-800 border border-black/10 flex items-center justify-center">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)]">
            {techPacksCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Production Ready</div>
        </div>
      </div>

      {/* 3-Tier Verification Pipeline Process Ribbon */}
      <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-black/10 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3A3564]">
            3-Tier Design Verification Architecture
          </span>
          <span className="text-xs text-slate-600 font-medium">
            Strict RBAC &bull; Provisional Head &bull; Super Admin
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-3 rounded-xl border border-black/10 shadow-2xs">
            <div className="font-bold text-slate-900 mb-0.5">1. Designer Studio</div>
            <div className="text-slate-600">Receives allocated brief &amp; submits up to 2 concept photos</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/10 shadow-2xs">
            <div className="font-bold text-slate-900 mb-0.5">2. Provisional Head</div>
            <div className="text-slate-600">Reviews submission photos, approves or returns with revision notes</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/10 shadow-2xs">
            <div className="font-bold text-slate-900 mb-0.5">3. Super Admin</div>
            <div className="text-slate-600">Greenlights for Tech-Pack OR saves in Seasonal Archive</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-black/10 shadow-2xs">
            <div className="font-bold text-[#3A3564] mb-0.5">4. Tech-Pack &amp; Merch</div>
            <div className="text-slate-600">PH creates Tech-Pack with auto-filled POMs &amp; BOM trims for Merchandising</div>
          </div>
        </div>
      </div>

      {/* Primary Pipeline Queue Table */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Active Design &amp; Verification Queue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live apparel concepts under creative sampling &amp; multi-tier executive review
            </p>
          </div>
          
          <Link
            href="/merchandising"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3A3564] hover:underline shrink-0"
          >
            <span>Next: Merchandising</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
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
                {st === 'ALL' ? 'All Queue' : STATUS_CONFIG[st as BriefStatus]?.label || st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs sm:text-sm font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredBriefs.length === 0 ? (
          <EmptyState
            icon={Palette}
            title={searchQuery || statusFilter !== 'ALL' ? "No matching concepts" : "No active design concepts"}
            description={
              searchQuery || statusFilter !== 'ALL'
                ? "Adjust your filter tabs or search query."
                : "Allocate your first design brief to start the creative process."
            }
            actionLabel="Allocate Design Brief"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto border border-black/10 rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Garment Silhouette</th>
                  <th className="py-3 px-4">Designer</th>
                  <th className="py-3 px-4">Target &amp; Quota</th>
                  <th className="py-3 px-4">Concept Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / Instructions</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-slate-700">
                {filteredBriefs.map(brief => {
                  const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                  const hasPhotos = brief.latest_submission && brief.latest_submission.photo_url_1
                  const completedSubmissions = brief.submissions_count || (hasPhotos ? 1 : 0)
                  const targetCount = brief.target_designs || 1
                  const pct = Math.min(100, Math.round((completedSubmissions / targetCount) * 100))

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

                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-1 font-mono text-[11.5px]">
                              <Target className="w-3 h-3 text-[#3A3564]" />
                              {completedSubmissions} of {targetCount} Designs
                            </span>
                            <span className="text-[10.5px] font-mono text-slate-500 font-bold">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-black/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                completedSubmissions >= targetCount ? 'bg-emerald-500' : 'bg-[#3A3564]'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-mono inline-flex items-center gap-1">
                            <Palette className="w-2.5 h-2.5 text-slate-400" />
                            {brief.max_colors} Colors Chart
                          </div>
                          {brief.target_colors && brief.target_colors.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {brief.target_colors.map((col, i) => (
                                <span key={i} className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-[#FAF7F0] border border-black/5 font-mono text-[#3A3564] font-semibold">
                                  {col}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
                        {(() => {
                          const submissionPhotos: { url: string; label: string; color?: string }[] = []
                          if (brief.latest_submission?.concepts && brief.latest_submission.concepts.length > 0) {
                            brief.latest_submission.concepts.forEach(concept => {
                              concept.colorways?.forEach(cw => {
                                if (cw.photo_front) {
                                  submissionPhotos.push({
                                    url: cw.photo_front,
                                    label: `Design #${concept.concept_number} • ${cw.color_name} (Front)`,
                                    color: cw.color_name
                                  })
                                }
                                if (cw.photo_back) {
                                  submissionPhotos.push({
                                    url: cw.photo_back,
                                    label: `Design #${concept.concept_number} • ${cw.color_name} (Back)`,
                                    color: cw.color_name
                                  })
                                }
                              })
                            })
                          } else if (brief.latest_submission?.photo_url_1) {
                            submissionPhotos.push({ url: brief.latest_submission.photo_url_1, label: 'Concept Photo 1' })
                            if (brief.latest_submission.photo_url_2) {
                              submissionPhotos.push({ url: brief.latest_submission.photo_url_2, label: 'Concept Photo 2' })
                            }
                          }

                          return submissionPhotos.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {submissionPhotos.slice(0, 3).map((item, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setPreviewPhoto(item.url)}
                                    className="w-9 h-9 rounded-lg border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shrink-0 shadow-2xs hover:ring-2 hover:ring-[#3A3564]"
                                    title={item.label}
                                  >
                                    <img 
                                      src={item.url} 
                                      alt={item.label} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                    />
                                  </button>
                                ))}
                                {submissionPhotos.length > 3 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (brief.status === 'SUBMITTED' && brief.latest_submission) {
                                        setReviewingSubmission({ submission: brief.latest_submission, brief })
                                      } else {
                                        setPreviewPhoto(submissionPhotos[3].url)
                                      }
                                    }}
                                    className="w-9 h-9 rounded-lg border border-black/10 bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] text-[11px] font-bold font-mono flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-2xs"
                                    title={`+${submissionPhotos.length - 3} more mockups. Click to view deck.`}
                                  >
                                    +{submissionPhotos.length - 3}
                                  </button>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                <span>{submissionPhotos.length} mockups</span>
                                {brief.latest_submission?.concepts && (
                                  <span>• {brief.latest_submission.concepts.length} designs</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Pending photos</span>
                          )
                        })()}
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
                          {/* 1. Provisional Head Review */}
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

                          {/* 2. Super Admin Review (Greenlight or Save for Later) */}
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

                          {/* 3. Saved for Later Archive Revive */}
                          {brief.status === 'SA_SAVED_FOR_LATER' && brief.latest_submission && (
                            <button
                              onClick={() => setSaReviewingSubmission({ submission: brief.latest_submission!, brief })}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Revive from Seasonal Archive"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Revive Concept</span>
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
                            title="Delete Concept"
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
                onClick={() => {
                  setIsCreateOpen(false)
                  resetCreateForm()
                }}
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
                  {activeTeamMembers.map(m => {
                    const phone = m.phone_number || m.designer_phone
                    const displayLabel = phone ? `+91 ${phone}` : (m.username ? `@${m.username}` : '')
                    return (
                      <option key={m.id} value={m.id}>
                        {m.designer_name}{displayLabel ? ` (${displayLabel})` : ''}
                      </option>
                    )
                  })}
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
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="garment-options"
                      placeholder="e.g. Tees, Cargo, Jogger, Girls Suit..."
                      value={garmentType}
                      onChange={e => setGarmentType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                    <datalist id="garment-options">
                      {existingGarments.map(g => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Type any real factory silhouette or pick from recent
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Category Style / Collection <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="category-options"
                      placeholder="e.g. Digital, Disney, Casual, Formal..."
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                    <datalist id="category-options">
                      {existingCategories.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Type any collection tag or pick from recent
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 text-xs">
                    Target No. of Designs <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Target className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      placeholder="e.g. 4"
                      value={targetDesigns}
                      onChange={e => setTargetDesigns(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Required designs for this brief (e.g. 4)
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1 text-xs">
                    Chart / Colorways Count <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Palette className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      placeholder="e.g. 3"
                      value={maxColors}
                      onChange={e => setMaxColors(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Colors per chart / colorway (e.g. 3)
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
                  Target Color Palette / Specific Colors (Optional)
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-black/10 bg-white focus-within:ring-2 focus-within:ring-[#3A3564] transition-all">
                  {targetColors.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-semibold text-[#3A3564]"
                    >
                      <span>{col}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-slate-400 hover:text-slate-700 font-bold ml-0.5 cursor-pointer"
                        aria-label={`Remove color ${col}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={targetColors.length === 0 ? "Type color (e.g. Navy Blue, Olive, Black) and press Enter..." : "Add another color..."}
                    value={colorInput}
                    onChange={e => setColorInput(e.target.value)}
                    onKeyDown={handleColorKeyDown}
                    onBlur={() => { if (colorInput.trim()) handleAddColor() }}
                    className="flex-1 min-w-[150px] px-1 py-1 text-xs bg-transparent text-slate-900 font-medium focus:outline-none placeholder:text-slate-400"
                  />
                  {colorInput.trim() && (
                    <button
                      type="button"
                      onClick={() => handleAddColor()}
                      className="px-2 py-0.5 rounded-md bg-[#3A3564] text-[#FAF7F0] text-[11px] font-bold hover:bg-[#2A2649] cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type any color name and press Enter or comma (zero dummy presets)
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 text-xs">
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
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetCreateForm()
                  }}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDesignerId || !garmentType || !category}
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

      {/* 1. PH Review Modal */}
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
                  {reviewingSubmission.submission.concepts.map((concept) => (
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

      {/* 2. Super Admin Review Modal (Greenlight vs Save for Later Archive) */}
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
                    Super Admin Design Approval
                  </h2>
                  <p className="text-xs text-slate-500">
                    {saReviewingSubmission.brief.garment_type} ({saReviewingSubmission.brief.category}) &bull; PH Approved
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
                  Super Admin Strategic Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved for Summer 2026 drop / Save for Winter collection..."
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
