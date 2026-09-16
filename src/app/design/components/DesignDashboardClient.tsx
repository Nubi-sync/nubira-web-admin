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
  Phone,
  ChevronRight,
  X,
  RefreshCw,
  Shirt
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
import { AllocateBriefModal } from './AllocateBriefModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string }> = {
  ALLOCATED: { label: 'Allocated', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'In Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'PH Approved', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold' },
  PH_REJECTED: { label: 'Revisions Needed', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  SA_APPROVED: { label: 'SA Greenlit', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
  SA_SAVED_FOR_LATER: { label: 'PH Approved', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' }
}

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

  // Dedicated View & Review Modal State
  const [selectedBriefForView, setSelectedBriefForView] = useState<DesignBrief | null>(null)
  const [modalActiveConceptTab, setModalActiveConceptTab] = useState<number>(1)
  const [phFeedback, setPhFeedback] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [saNotes, setSaNotes] = useState('')
  const [isSaReviewing, setIsSaReviewing] = useState(false)

  // Photo Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Delete State
  const [briefToDelete, setBriefToDelete] = useState<DesignBrief | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeTeamMembers = (teamMembers || []).filter(m => m.status === 'ACTIVE')
  const existingGarments = Array.from(new Set(briefs.map(b => b.garment_type).filter(Boolean)))
  const existingCategories = Array.from(new Set(briefs.map(b => b.category).filter(Boolean)))

  const filteredBriefs = briefs.filter(b => {
    let matchesStatus = true
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PH_APPROVED') {
        matchesStatus = b.status === 'PH_APPROVED' || b.status === 'SA_APPROVED' || b.status === 'SA_SAVED_FOR_LATER'
      } else {
        matchesStatus = b.status === statusFilter
      }
    }
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

  async function handlePHReviewSubmit(verdict: 'APPROVED' | 'REJECTED') {
    if (!selectedBriefForView?.latest_submission) return
    setIsReviewing(true)
    try {
      const res = await reviewDesignSubmissionAction({
        submission_id: selectedBriefForView.latest_submission.id,
        ph_verdict: verdict,
        ph_feedback: phFeedback.trim() || undefined
      })

      if (res.success) {
        const nextStatus: BriefStatus = verdict === 'APPROVED' ? 'PH_APPROVED' : 'PH_REJECTED'
        toast.success(verdict === 'APPROVED' ? 'Concept approved and forwarded to Super Admin!' : 'Submission returned with feedback to designer.')
        setBriefs(prev => prev.map(b => b.id === selectedBriefForView.id ? { ...b, status: nextStatus } : b))
        setSelectedBriefForView(prev => prev ? { ...prev, status: nextStatus } : null)
        setPhFeedback('')
      } else {
        toast.error(res.error || 'Failed to submit review.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during review.')
    } finally {
      setIsReviewing(false)
    }
  }

  async function handleSAReviewSubmit(verdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED') {
    if (!selectedBriefForView?.latest_submission) return
    setIsSaReviewing(true)
    try {
      const res = await saReviewDesignSubmissionAction({
        submission_id: selectedBriefForView.latest_submission.id,
        sa_verdict: verdict,
        sa_notes: saNotes.trim() || undefined
      })

      if (res.success) {
        const nextStatus: BriefStatus = 
          verdict === 'APPROVED' 
            ? 'SA_APPROVED' 
            : verdict === 'SAVED_FOR_LATER' 
            ? 'SA_SAVED_FOR_LATER' 
            : 'PH_REJECTED'
        
        toast.success(
          verdict === 'APPROVED' 
            ? 'Concept officially greenlit for Tech-Pack generation!' 
            : verdict === 'SAVED_FOR_LATER' 
            ? 'Concept saved in Seasonal Archive!' 
            : 'Concept returned for revision.'
        )
        setBriefs(prev => prev.map(b => b.id === selectedBriefForView.id ? { ...b, status: nextStatus } : b))
        setSelectedBriefForView(prev => prev ? { ...prev, status: nextStatus } : null)
        setSaNotes('')
      } else {
        toast.error(res.error || 'Failed to process Super Admin review.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during Super Admin review.')
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
        toast.success('Design brief deleted successfully.')
        setBriefs(prev => prev.filter(b => b.id !== briefToDelete.id))
        if (selectedBriefForView?.id === briefToDelete.id) {
          setSelectedBriefForView(null)
        }
        setBriefToDelete(null)
      } else {
        toast.error(res.error || 'Failed to delete design brief.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting design brief.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
          Design Studio
        </Link>
        <span>/</span>
        <span>Workspaces</span>
        <span>/</span>
        <span className="font-bold text-slate-900">Provisional Head Desk</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Palette className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Design &amp; Tech-Pack Studio
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {activeBriefsCount} Active Briefs
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Creative pipeline, multi-concept studio deck, and tech-pack generation
            </p>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <Link
            href="/design/tech-packs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Tech-Packs</span>
          </Link>

          <Link
            href="/design/team"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Team</span>
          </Link>

          <Link
            href="/design/settings"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-all shadow-2xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>PH Settings</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Brief</span>
          </button>
        </div>
      </div>

      {/* Layer 3: Streamlined KPI Stat Cards (4 Clean Boxes - No Archive/Save for Later) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              STAGE 01
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ClipboardList className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Active Briefs
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {activeBriefsCount}
            </div>
          </div>
        </div>

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
              Pending PH Review
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingPHCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
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
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              CATALOG
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <FileCheck2 className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Tech-Packs Ready
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {techPacksCount}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4 & 5: Primary Pipeline Queue Table & Card Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pb-1 sm:pb-0">
            {(['ALL', 'SUBMITTED', 'PH_APPROVED', 'ALLOCATED', 'PH_REJECTED', 'TECH_PACK_CREATED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                    : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All Queue' : STATUS_CONFIG[st as BriefStatus]?.label || st}
              </button>
            ))}
          </div>

          {/* Search Box */}
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

        {/* Content Section: Empty vs Table/Cards */}
        {filteredBriefs.length === 0 ? (
          <div className="p-6">
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
          </div>
        ) : (
          <div>
            {/* Desktop Table View (Hidden on mobile < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                    <th className="py-3 px-4">Article Number (Art #)</th>
                    <th className="py-3 px-4">Garment &amp; Theme</th>
                    <th className="py-3 px-4">Designer</th>
                    <th className="py-3 px-4">Colors &amp; Scope</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(() => {
                    const designRows: {
                      rowKey: string
                      brief: DesignBrief
                      conceptNumber: number
                      artNumber: string
                      garmentType: string
                      category: string
                      colors: string[]
                      photos: { url: string; label: string }[]
                      status: BriefStatus
                    }[] = []

                    filteredBriefs.forEach(brief => {
                      if (brief.design_concepts_brief && brief.design_concepts_brief.length > 0) {
                        brief.design_concepts_brief.forEach(req => {
                          const artNo = req.art_number || (req.notes?.match(/Art No:\s*([^|]+)/i)?.[1]?.trim()) || `#${brief.id.substring(0, 6)}-${req.concept_number}`
                          const garment = (req.notes?.match(/Garment:\s*([^|]+)/i)?.[1]?.trim()) || brief.garment_type
                          const cat = req.category_style || brief.category
                          const cols = (req.colors && req.colors.length > 0) ? req.colors : (brief.target_colors || [])
                          const subConcept = brief.latest_submission?.concepts?.find(c => c.concept_number === req.concept_number || (c.art_number && c.art_number.toLowerCase() === artNo.toLowerCase()))
                          
                          const photos: { url: string; label: string }[] = []
                          if (subConcept?.colorways) {
                            subConcept.colorways.forEach(cw => {
                              if (cw.photo_front) photos.push({ url: cw.photo_front, label: `${artNo} • ${cw.color_name} (Front)` })
                              if (cw.photo_back) photos.push({ url: cw.photo_back, label: `${artNo} • ${cw.color_name} (Back)` })
                            })
                          }
                          if (photos.length === 0 && brief.latest_submission?.photo_url_1) {
                            photos.push({ url: brief.latest_submission.photo_url_1, label: `${artNo} Mockup` })
                          }

                          designRows.push({
                            rowKey: `${brief.id}-${req.concept_number}`,
                            brief,
                            conceptNumber: req.concept_number,
                            artNumber: artNo,
                            garmentType: garment,
                            category: cat,
                            colors: cols,
                            photos,
                            status: brief.status
                          })
                        })
                      } else {
                        const artNo = `#${brief.id.substring(0, 6)}`
                        const photos: { url: string; label: string }[] = []
                        if (brief.latest_submission?.photo_url_1) {
                          photos.push({ url: brief.latest_submission.photo_url_1, label: 'Concept Photo 1' })
                        }
                        if (brief.latest_submission?.photo_url_2) {
                          photos.push({ url: brief.latest_submission.photo_url_2, label: 'Concept Photo 2' })
                        }

                        designRows.push({
                          rowKey: brief.id,
                          brief,
                          conceptNumber: 1,
                          artNumber: artNo,
                          garmentType: brief.garment_type,
                          category: brief.category,
                          colors: brief.target_colors || [],
                          photos,
                          status: brief.status
                        })
                      }
                    })

                    if (designRows.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                            No designs found.
                          </td>
                        </tr>
                      )
                    }

                    return designRows.map(row => {
                      const stCfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.ALLOCATED
                      const brief = row.brief

                      return (
                        <tr key={row.rowKey} className="hover:bg-slate-50/80 transition-colors group">
                          {/* 1. Article Number (Art #) */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-slate-900 text-sm block">
                                {row.artNumber}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 font-medium block">
                                #{row.conceptNumber} &bull; #{brief.id.substring(0, 6)}
                              </span>
                            </div>
                          </td>

                          {/* 2. Garment & Theme */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 text-sm block font-[family-name:var(--font-heading)]">
                              {row.garmentType}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {row.category} Style
                            </span>
                          </td>

                          {/* 3. Designer */}
                          <td className="py-3.5 px-4">
                            {brief.designer_name ? (
                              <div>
                                <span className="font-semibold text-slate-800 text-xs block">
                                  {brief.designer_name}
                                </span>
                                {brief.designer_phone && (
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    +91 {brief.designer_phone}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic font-mono">Unassigned</span>
                            )}
                          </td>

                          {/* 4. Colors & Scope */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1">
                                <Palette className="w-3 h-3 text-[#3A3564]" />
                                <span>{row.colors.length} Color{row.colors.length === 1 ? '' : 's'}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1">
                                {row.colors.slice(0, 3).map((c, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-black/10 text-[10px] font-mono text-slate-700">
                                    <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: getColorSwatchInfo(c).bg }} />
                                    <span>{c}</span>
                                  </span>
                                ))}
                                {row.colors.length > 3 && (
                                  <span className="text-[10px] font-mono text-slate-400">+{row.colors.length - 3}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 5. Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${stCfg.badgeClass}`}>
                              {stCfg.label}
                            </span>
                          </td>

                          {/* 6. Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBriefForView(brief)
                                  setModalActiveConceptTab(row.conceptNumber)
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 text-xs font-bold text-[#3A3564] transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View &amp; Review</span>
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setBriefToDelete(brief)}
                                className="p-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
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

            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredBriefs.flatMap(brief => {
                const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                const concepts = brief.design_concepts_brief && brief.design_concepts_brief.length > 0
                  ? brief.design_concepts_brief
                  : [{ concept_number: 1, art_number: `#${brief.id.substring(0, 6)}`, category_style: brief.category, colors: brief.target_colors || [] }]

                return concepts.map(req => {
                  const artNo = req.art_number || (req.notes?.match(/Art No:\s*([^|]+)/i)?.[1]?.trim()) || `#${brief.id.substring(0, 6)}-${req.concept_number}`
                  const garment = (req.notes?.match(/Garment:\s*([^|]+)/i)?.[1]?.trim()) || brief.garment_type
                  const cat = req.category_style || brief.category

                  return (
                    <div key={`${brief.id}-${req.concept_number}`} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm block mb-0.5">
                            {artNo}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)]">
                            {garment}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            {cat} Style &bull; <span className="font-mono text-[11px] text-slate-400">#{req.concept_number} &bull; #{brief.id.substring(0, 6)}</span>
                          </p>
                        </div>

                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${stCfg.badgeClass}`}>
                          {stCfg.label}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-600 bg-[#FAF7F0] p-2.5 rounded-xl border border-black/5">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Designer</span>
                          <span className="font-bold text-slate-800">{brief.designer_name || 'Unassigned'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Colors</span>
                          <span className="font-bold text-[#3A3564]">{(req.colors || []).length} Selected</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBriefForView(brief)
                          setModalActiveConceptTab(req.concept_number)
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#3A3564] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View &amp; Review ({artNo})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED VIEW & REVIEW MODAL (Clean Single-Screen Detail) */}
      {/* ========================================================================= */}
      {selectedBriefForView && (() => {
        const brief = selectedBriefForView
        const instructedReq = brief.design_concepts_brief?.find(c => c.concept_number === modalActiveConceptTab)
        const currentArtNo = instructedReq?.art_number || `#${brief.id.substring(0, 6)}`
        const currentGarment = instructedReq?.category_style ? `${brief.garment_type}` : brief.garment_type
        const currentCategory = instructedReq?.category_style || brief.category

        const currentConcept = brief.latest_submission?.concepts?.find(
          c => c.concept_number === modalActiveConceptTab
        ) || (brief.latest_submission?.concepts ? brief.latest_submission.concepts[0] : null)

        const colorways = currentConcept?.colorways || []

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${STATUS_CONFIG[brief.status]?.badgeClass}`}>
                      {STATUS_CONFIG[brief.status]?.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ART NO: {currentArtNo}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                    {currentGarment} ({currentCategory} Style)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Designer: <strong className="text-slate-800">{brief.designer_name || 'Unassigned'}</strong>
                    {brief.designer_phone ? ` • +91 ${brief.designer_phone}` : ''}
                    {brief.design_concepts_brief && brief.design_concepts_brief.length > 1 ? ` • Concept #${modalActiveConceptTab} of ${brief.design_concepts_brief.length}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBriefForView(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Body (Flat, Clean, No Boxes-in-Boxes) */}
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-5 text-xs sm:text-[13px]">
                {/* Submitted Artwork Mockups */}
                {colorways.length > 0 ? (
                  <div className="space-y-6">
                    {colorways.map((cw, cwIdx) => {
                      const sw = getColorSwatchInfo(cw.color_name)
                      const variantArtNo = getVariantArtNumber(currentArtNo, cwIdx, colorways.length)

                      return (
                        <div key={cwIdx} className="space-y-3">
                          {/* Colorway Label */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-900">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: sw.bg }}
                              />
                              <span>{cw.color_name} Colorway</span>
                            </div>
                            {variantArtNo && (
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {variantArtNo}
                              </span>
                            )}
                          </div>

                          {/* Normal Floated Clean Artwork Images */}
                          <div className={`grid gap-4 ${cw.photo_back ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
                            {cw.photo_front ? (
                              <div
                                onClick={() => setPreviewPhoto(cw.photo_front)}
                                className="aspect-square rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-3 flex items-center justify-center shadow-2xs hover:shadow-md transition-all"
                                title="Click to view full Front Artwork"
                              >
                                <img
                                  src={cw.photo_front}
                                  alt={`${cw.color_name} Front`}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>Full View</span>
                                </div>
                                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md border border-black/10 shadow-2xs">
                                  Front View
                                </span>
                              </div>
                            ) : (
                              <div className="aspect-square rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-mono">
                                No Front Artwork
                              </div>
                            )}

                            {cw.photo_back && (
                              <div
                                onClick={() => setPreviewPhoto(cw.photo_back!)}
                                className="aspect-square rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-3 flex items-center justify-center shadow-2xs hover:shadow-md transition-all"
                                title="Click to view full Back Artwork"
                              >
                                <img
                                  src={cw.photo_back}
                                  alt={`${cw.color_name} Back`}
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform drop-shadow-xs"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>Full View</span>
                                </div>
                                <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md border border-black/10 shadow-2xs">
                                  Back View
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : brief.latest_submission?.photo_url_1 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPreviewPhoto(brief.latest_submission!.photo_url_1)}
                      className="aspect-square rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-3 flex items-center justify-center shadow-2xs hover:shadow-md transition-all"
                    >
                      <img
                        src={brief.latest_submission.photo_url_1}
                        alt="Front Artwork"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Full View</span>
                      </div>
                      <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md border border-black/10 shadow-2xs">
                        Front View
                      </span>
                    </div>

                    {brief.latest_submission.photo_url_2 && (
                      <div
                        onClick={() => setPreviewPhoto(brief.latest_submission!.photo_url_2!)}
                        className="aspect-square rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-3 flex items-center justify-center shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={brief.latest_submission.photo_url_2}
                          alt="Back Artwork"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-2xl gap-1">
                          <Eye className="w-4 h-4" />
                          <span>Full View</span>
                        </div>
                        <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md border border-black/10 shadow-2xs">
                          Back View
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 font-mono">No artwork has been submitted by the designer yet.</p>
                  </div>
                )}

                {/* Designer Notes */}
                {brief.latest_submission?.designer_notes && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-black/10">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                      Designer Notes:
                    </span>
                    <p className="text-xs text-slate-700 italic">
                      &ldquo;{brief.latest_submission.designer_notes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Provisional Head Feedback Input */}
                {(brief.status === 'SUBMITTED' || brief.status === 'ALLOCATED') && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-800 uppercase font-mono block">
                      Provisional Head Review Notes / Feedback:
                    </label>
                    <textarea
                      value={phFeedback}
                      onChange={e => setPhFeedback(e.target.value)}
                      placeholder="Optional feedback for designer (required if rejecting)..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-black/10 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                )}

                {/* Super Admin Review Notes Input (If PH Approved) */}
                {brief.status === 'PH_APPROVED' && (
                  <div className="space-y-1.5 pt-2">
                    {brief.latest_submission?.ph_feedback && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 mb-3">
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">
                          Provisional Head Feedback:
                        </span>
                        <p className="text-xs text-amber-900 mt-0.5">
                          &ldquo;{brief.latest_submission.ph_feedback}&rdquo;
                        </p>
                      </div>
                    )}
                    <label className="text-xs font-bold text-slate-800 uppercase font-mono block">
                      Super Admin Review Directives:
                    </label>
                    <textarea
                      value={saNotes}
                      onChange={e => setSaNotes(e.target.value)}
                      placeholder="Instructions for production / pattern master..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-black/10 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBriefToDelete(brief)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Brief</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. Provisional Head Review Actions */}
                  {brief.status === 'SUBMITTED' && (
                    <>
                      <button
                        type="button"
                        disabled={isReviewing}
                        onClick={() => handlePHReviewSubmit('REJECTED')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Request Revisions</span>
                      </button>

                      <button
                        type="button"
                        disabled={isReviewing}
                        onClick={() => handlePHReviewSubmit('APPROVED')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-white hover:bg-[#2A2649] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Approve &amp; Forward to SA</span>
                      </button>
                    </>
                  )}

                  {/* 2. Super Admin Actions */}
                  {brief.status === 'PH_APPROVED' && (
                    <>
                      <button
                        type="button"
                        disabled={isSaReviewing}
                        onClick={() => handleSAReviewSubmit('REJECTED')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Request Revision</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSaReviewing}
                        onClick={() => handleSAReviewSubmit('SAVED_FOR_LATER')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#3A3564] hover:bg-slate-100 border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>Save for Later</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSaReviewing}
                        onClick={() => handleSAReviewSubmit('APPROVED')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isSaReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Greenlight for Tech-Pack</span>
                      </button>
                    </>
                  )}

                  {/* 3. Revive Archive */}
                  {brief.status === 'SA_SAVED_FOR_LATER' && (
                    <button
                      type="button"
                      disabled={isSaReviewing}
                      onClick={() => handleSAReviewSubmit('APPROVED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Revive Concept</span>
                    </button>
                  )}

                  {/* 4. Tech-Pack Link */}
                  {brief.status === 'SA_APPROVED' && (
                    <Link
                      href={`/design/tech-packs?createFromSubmission=${brief.latest_submission?.id || ''}&garment=${brief.garment_type}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-xs"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Generate Tech-Pack</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedBriefForView(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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

      {/* Full Photo Lightbox */}
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
