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
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string }> = {
  ALLOCATED: { label: 'Allocated', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'In Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'PH Approved', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold' },
  PH_REJECTED: { label: 'Revisions Needed', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold' },
  SA_APPROVED: { label: 'SA Greenlit', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Later', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold' }
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('')
  const [garmentType, setGarmentType] = useState('')
  const [category, setCategory] = useState<string>('')
  const [targetDesigns, setTargetDesigns] = useState<string>('')
  const [maxColors, setMaxColors] = useState<string>('')
  const [targetColors, setTargetColors] = useState<string[]>([])
  const [colorInput, setColorInput] = useState('')
  const [instructions, setInstructions] = useState('')

  // Dedicated View & Review Modal State
  const [selectedBriefForView, setSelectedBriefForView] = useState<DesignBrief | null>(null)
  const [phFeedback, setPhFeedback] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [saNotes, setSaNotes] = useState('')
  const [isSaReviewing, setIsSaReviewing] = useState(false)

  // Photo Lightbox
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Zigza AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiCustomPrompt, setAiCustomPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{
    garmentType: string
    category: string
    targetDesigns: number
    colors: string[]
    instructions: string
  } | null>(null)

  // Delete State
  const [briefToDelete, setBriefToDelete] = useState<DesignBrief | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeTeamMembers = (teamMembers || []).filter(m => m.status === 'ACTIVE')
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

  // Zigza AI Preset Concepts
  const AI_TREND_PRESETS = [
    {
      title: 'Oversized Heavyweight Streetwear Hoodie',
      garmentType: 'Hoodie',
      category: 'Streetwear',
      targetDesigns: 2,
      colors: ['Jet Black', 'Washed Slate', 'Vintage Olive'],
      instructions: '420 GSM French Terry, boxy drop shoulder fit, double layered hood with no drawstrings, minimal high-density puff print across center chest and subtle embroidery on left wrist cuff.'
    },
    {
      title: 'Boxy Drop-Shoulder Minimal Graphic Tee',
      garmentType: 'T-Shirt',
      category: 'Casual',
      targetDesigns: 3,
      colors: ['Chalk White', 'Jet Black', 'Earth Sand'],
      instructions: '240 GSM single jersey cotton, 1.25-inch thick neck ribbing, vintage soft wash. Artwork front: subtle typography chest print; back: large architectural brutalist line-art illustration.'
    },
    {
      title: 'Modular Multi-Pocket Tech Cargo Pant',
      garmentType: 'Cargo Pant',
      category: 'Streetwear',
      targetDesigns: 2,
      colors: ['Tactical Olive', 'Midnight Navy', 'Jet Black'],
      instructions: 'Ripstop stretch fabric, bungee-cord adjustable cuffs, reinforced knee darts, 6 modular utility pockets with matte waterproof zippers and subtle brand silicone badge.'
    },
    {
      title: 'Cuban Collar Breathable Linen Resort Shirt',
      garmentType: 'Resort Shirt',
      category: 'Resort',
      targetDesigns: 2,
      colors: ['Natural Beige', 'Sage Green', 'Terracotta'],
      instructions: '100% pure European linen, relaxed resort fit with camp collar, genuine horn buttons, tonal geometric palm embroidery along placket edge.'
    },
    {
      title: 'Reversible Quilted Overshirt / Bomber',
      garmentType: 'Bomber Jacket',
      category: 'Outerwear',
      targetDesigns: 2,
      colors: ['Forest Green', 'Midnight Navy', 'Jet Black'],
      instructions: 'Diamond quilted nylon shell with contrast matte reverse side, heavyweight two-way YKK metal zipper, storm flap pockets, and ribbed hem band.'
    }
  ]

  function handleGenerateAiBrief(customText?: string) {
    const prompt = (customText || aiCustomPrompt).trim().toLowerCase()
    setIsAiGenerating(true)

    setTimeout(() => {
      let matched = AI_TREND_PRESETS[0]
      if (prompt.includes('tee') || prompt.includes('t-shirt') || prompt.includes('graphic')) {
        matched = AI_TREND_PRESETS[1]
      } else if (prompt.includes('pant') || prompt.includes('cargo') || prompt.includes('trouser') || prompt.includes('jogger')) {
        matched = AI_TREND_PRESETS[2]
      } else if (prompt.includes('shirt') || prompt.includes('linen') || prompt.includes('resort') || prompt.includes('collar')) {
        matched = AI_TREND_PRESETS[3]
      } else if (prompt.includes('jacket') || prompt.includes('bomber') || prompt.includes('coat') || prompt.includes('outerwear')) {
        matched = AI_TREND_PRESETS[4]
      } else if (customText) {
        matched = {
          title: customText,
          garmentType: customText.split(' ')[0] || 'Apparel Concept',
          category: 'Streetwear',
          targetDesigns: 2,
          colors: ['Jet Black', 'Chalk White', 'Vintage Olive'],
          instructions: `Creative direction for "${customText}": Modern tailored silhouette, premium heavyweight fabric, clean placement artwork with minimal branding accents.`
        }
      }

      setAiGeneratedResult({
        garmentType: matched.garmentType,
        category: matched.category,
        targetDesigns: matched.targetDesigns,
        colors: matched.colors,
        instructions: matched.instructions
      })
      setIsAiGenerating(false)
      toast.success('Zigza AI generated apparel creative brief!')
    }, 450)
  }

  function handleApplyAiToBrief(data: {
    garmentType: string
    category: string
    targetDesigns: number
    colors: string[]
    instructions: string
  }) {
    setGarmentType(data.garmentType)
    setCategory(data.category)
    setTargetDesigns(String(data.targetDesigns))
    setMaxColors(String(data.colors.length))
    setTargetColors(data.colors)
    setInstructions(data.instructions)
    setIsAiModalOpen(false)
    setIsCreateOpen(true)
    toast.success('AI brief parameters loaded into Allocate Brief modal!')
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
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564] hover:bg-[#F2ECE1] transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Zigza AI</span>
          </button>

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

      {/* Layer 3: Executive KPI Metric Cards (Grid of 6) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 01
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Briefs
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {activeBriefsCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              STAGE 02
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shadow-2xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pending PH
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingPHCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
              STAGE 03
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pending SA
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-sky-800 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingSACount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              ARCHIVE
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Saved for Later
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#3A3564] font-[family-name:var(--font-heading)] mt-0.5">
              {savedForLaterCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              GREENLIT
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              SA Greenlit
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 font-[family-name:var(--font-heading)] mt-0.5">
              {saApprovedCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              READY
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] text-slate-800 border border-black/10 flex items-center justify-center shadow-2xs">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Tech-Packs
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
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
            {(['ALL', 'SUBMITTED', 'PH_APPROVED', 'SA_APPROVED', 'SA_SAVED_FOR_LATER', 'ALLOCATED', 'PH_REJECTED', 'TECH_PACK_CREATED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                    : 'text-slate-600 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
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
                    <th className="py-3 px-4">Garment Silhouette</th>
                    <th className="py-3 px-4">Designer</th>
                    <th className="py-3 px-4">Scope &amp; Mockups</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredBriefs.map(brief => {
                    const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                    const hasPhotos = brief.latest_submission && brief.latest_submission.photo_url_1
                    const completedSubmissions = brief.submissions_count || (hasPhotos ? 1 : 0)
                    const targetCount = brief.target_designs || 1

                    return (
                      <tr key={brief.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* 1. Garment Silhouette */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 text-sm block font-[family-name:var(--font-heading)]">
                            {brief.garment_type}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {brief.category} Style &bull; <span className="font-mono text-[11px] text-slate-400">#{brief.id.substring(0, 6)}</span>
                          </span>
                        </td>

                        {/* 2. Designer */}
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

                        {/* 3. Scope & Mockups */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 text-xs">
                              <Target className="w-3.5 h-3.5 text-[#3A3564]" />
                              {completedSubmissions}/{targetCount} Designs
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {brief.max_colors} Colors Chart
                            </div>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${stCfg.badgeClass}`}>
                            {stCfg.label}
                          </span>
                        </td>

                        {/* 5. Clean Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBriefForView(brief)}
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

            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredBriefs.map(brief => {
                const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED
                const hasPhotos = brief.latest_submission && brief.latest_submission.photo_url_1
                const completedSubmissions = brief.submissions_count || (hasPhotos ? 1 : 0)
                const targetCount = brief.target_designs || 1

                return (
                  <div key={brief.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)]">
                          {brief.garment_type}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {brief.category} Style &bull; <span className="font-mono text-[11px] text-slate-400">#{brief.id.substring(0, 6)}</span>
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
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Scope</span>
                        <span className="font-bold text-[#3A3564]">{completedSubmissions}/{targetCount} Designs</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedBriefForView(brief)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#3A3564] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Review Concept</span>
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
      {/* DEDICATED VIEW & REVIEW MODAL (Clean Single-Screen Detail) */}
      {/* ========================================================================= */}
      {selectedBriefForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${STATUS_CONFIG[selectedBriefForView.status]?.badgeClass}`}>
                  {STATUS_CONFIG[selectedBriefForView.status]?.label}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  {selectedBriefForView.garment_type} ({selectedBriefForView.category})
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Brief ID: #{selectedBriefForView.id.substring(0, 8)} &bull; Designer: <strong className="text-slate-800 font-sans">{selectedBriefForView.designer_name || 'Unassigned'}</strong>
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

            {/* Scrollable Modal Body */}
            <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
              {/* Target Scope & Palette Banner */}
              <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-black/10 space-y-2.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Required Target:</span>
                  <span className="font-bold text-[#3A3564]">
                    {selectedBriefForView.target_designs || 1} Designs &times; {selectedBriefForView.max_colors} Colors
                  </span>
                </div>

                {selectedBriefForView.target_colors && selectedBriefForView.target_colors.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {selectedBriefForView.target_colors.map((col, idx) => {
                      const sw = getColorSwatchInfo(col)
                      return (
                        <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-black/10 font-mono font-semibold text-slate-800 shadow-2xs">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: sw.bg }} />
                          <span>{col}</span>
                        </span>
                      )
                    })}
                  </div>
                )}

                {selectedBriefForView.instructions && (
                  <p className="text-xs text-slate-700 italic border-t border-black/5 pt-2">
                    &ldquo;{selectedBriefForView.instructions}&rdquo;
                  </p>
                )}
              </div>

              {/* Submitted Artwork Mockups Deck */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2">
                  Submitted Design Concepts Deck:
                </label>

                {selectedBriefForView.latest_submission?.concepts && selectedBriefForView.latest_submission.concepts.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBriefForView.latest_submission.concepts.map(concept => (
                      <div key={concept.concept_number} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 font-[family-name:var(--font-heading)]">
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
                ) : selectedBriefForView.latest_submission?.photo_url_1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPreviewPhoto(selectedBriefForView.latest_submission!.photo_url_1)}
                      className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shadow-2xs"
                    >
                      <img
                        src={selectedBriefForView.latest_submission.photo_url_1}
                        alt="Artwork 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <Eye className="w-4 h-4 mr-1" /> Full View
                      </div>
                    </div>

                    {selectedBriefForView.latest_submission.photo_url_2 && (
                      <div 
                        onClick={() => setPreviewPhoto(selectedBriefForView.latest_submission!.photo_url_2!)}
                        className="aspect-video rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group cursor-pointer shadow-2xs"
                      >
                        <img
                          src={selectedBriefForView.latest_submission.photo_url_2}
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
                    No mockups submitted yet by designer.
                  </div>
                )}
              </div>

              {/* Feedback History If Available */}
              {selectedBriefForView.latest_submission?.ph_feedback && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                  <span className="font-bold text-sky-900 block font-mono uppercase mb-0.5">PH Review Feedback:</span>
                  <p className="text-sky-800 italic">&ldquo;{selectedBriefForView.latest_submission.ph_feedback}&rdquo;</p>
                </div>
              )}

              {/* Feedback Inputs for Active Reviews */}
              {selectedBriefForView.status === 'SUBMITTED' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Provisional Head Review Notes / Feedback:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional feedback for designer (required if rejecting)..."
                    value={phFeedback}
                    onChange={e => setPhFeedback(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              )}

              {selectedBriefForView.status === 'PH_APPROVED' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Super Admin Strategic Decision Notes:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Greenlit for Summer 2026 drop / Saved for Winter collection..."
                    value={saNotes}
                    onChange={e => setSaNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Action Bar */}
            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setBriefToDelete(selectedBriefForView)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Brief</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Provisional Head Action */}
                {selectedBriefForView.status === 'SUBMITTED' && (
                  <>
                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => handlePHReviewSubmit('REJECTED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Request Revisions</span>
                    </button>

                    <button
                      type="button"
                      disabled={isReviewing}
                      onClick={() => handlePHReviewSubmit('APPROVED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Approve &amp; Forward to SA</span>
                    </button>
                  </>
                )}

                {/* 2. Super Admin Decision */}
                {selectedBriefForView.status === 'PH_APPROVED' && (
                  <>
                    <button
                      type="button"
                      disabled={isSaReviewing}
                      onClick={() => handleSAReviewSubmit('SAVED_FOR_LATER')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#3A3564] hover:bg-slate-100 border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Save for Later Archive</span>
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
                {selectedBriefForView.status === 'SA_SAVED_FOR_LATER' && (
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
                {selectedBriefForView.status === 'SA_APPROVED' && (
                  <Link
                    href={`/design/tech-packs?createFromSubmission=${selectedBriefForView.latest_submission?.id || ''}&garment=${selectedBriefForView.garment_type}`}
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
      )}

      {/* Allocate Brief Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                  Creative Allotment
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  Allocate New Design Brief
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false)
                  resetCreateForm()
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrief}>
              <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4 text-xs sm:text-[13px]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Assign Designer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedDesignerId}
                    onChange={e => setSelectedDesignerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  >
                    <option value="">Select an active designer...</option>
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
                      No active designers found. Please add a designer in Team Management.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Garment Silhouette <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="garment-options"
                        placeholder="e.g. T-Shirt, Cargo, Jogger..."
                        value={garmentType}
                        onChange={e => setGarmentType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                      />
                      <datalist id="garment-options">
                        {existingGarments.map(g => (
                          <option key={g} value={g} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Category Style <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="category-options"
                        placeholder="e.g. NBA, Streetwear, Casual..."
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                      />
                      <datalist id="category-options">
                        {existingCategories.map(c => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Target Designs <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      placeholder="e.g. 3"
                      value={targetDesigns}
                      onChange={e => setTargetDesigns(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                      Max Colors Chart <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      placeholder="e.g. 2"
                      value={maxColors}
                      onChange={e => setMaxColors(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Target Colorway Palette (Optional)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-[#3A3564] transition-all">
                    {targetColors.map((col, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564]"
                      >
                        <span>{col}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="text-slate-400 hover:text-slate-700 font-bold ml-0.5 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder={targetColors.length === 0 ? "Type color (e.g. Black, White) and press Enter..." : "Add more..."}
                      value={colorInput}
                      onChange={e => setColorInput(e.target.value)}
                      onKeyDown={handleColorKeyDown}
                      onBlur={() => { if (colorInput.trim()) handleAddColor() }}
                      className="flex-1 min-w-[150px] px-1 py-1 text-xs bg-transparent text-slate-900 font-medium focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Creative Instructions &amp; Guidelines
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Minimal print on chest, drop shoulder fit..."
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetCreateForm()
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDesignerId || !garmentType || !category}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Allocating...' : 'Allocate Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Floating Zigza AI Button for Admin / Provisional Head */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsAiModalOpen(true)
            if (!aiGeneratedResult) handleGenerateAiBrief()
          }}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#3A3564] text-white hover:bg-[#2A2649] shadow-xl border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-extrabold tracking-wide">Zigza AI</div>
            <div className="text-[10px] text-slate-300 font-mono font-medium -mt-0.5">Design Copilot</div>
          </div>
        </button>
      </div>

      {/* Zigza AI Design Studio Assistant Modal */}
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
                      Zigza AI Design Copilot
                    </h2>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                      Studio Assistant
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Creative brief generator, silhouette recommendations &amp; seasonal palettes
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
              {/* Preset Trend Prompts */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Trending Apparel Presets (1-Click Generation)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AI_TREND_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleGenerateAiBrief(preset.title)}
                      className="text-left p-3 rounded-xl bg-white border border-black/10 hover:border-[#3A3564] hover:bg-[#FAF7F0] transition-all cursor-pointer shadow-2xs group"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#3A3564] flex items-center justify-between">
                        <span>{preset.title}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#3A3564] transition-all" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-500">
                        <span className="font-semibold text-[#3A3564]">{preset.garmentType}</span>
                        <span>&bull;</span>
                        <span>{preset.colors.length} Colors</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div className="space-y-2 bg-white p-4 rounded-xl border border-black/10 shadow-2xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                  Custom Apparel Concept Idea
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Acid wash cargo jacket with metallic hardware..."
                    value={aiCustomPrompt}
                    onChange={e => setAiCustomPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleGenerateAiBrief()
                      }
                    }}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#FAF7F0] border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/15 focus:border-[#3A3564] font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    disabled={isAiGenerating}
                    onClick={() => handleGenerateAiBrief()}
                    className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isAiGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Generate</span>
                  </button>
                </div>
              </div>

              {/* Generated Result Card */}
              {aiGeneratedResult && (
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Generated Creative Brief
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {aiGeneratedResult.targetDesigns} Required Designs
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Silhouette</span>
                      <span className="font-bold text-slate-900">{aiGeneratedResult.garmentType}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-black/10">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Category</span>
                      <span className="font-bold text-slate-900">{aiGeneratedResult.category}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#FAF7F0] border border-black/10 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">Colors</span>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {aiGeneratedResult.colors.map((c, i) => (
                          <span key={i} className="text-[11px] font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-black/10">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs text-slate-700 italic">
                    <span className="font-bold text-slate-900 not-italic block mb-1 font-mono text-[10px] uppercase">
                      Tech &amp; Design Instructions:
                    </span>
                    &ldquo;{aiGeneratedResult.instructions}&rdquo;
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyAiToBrief(aiGeneratedResult)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Use in New Brief &rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-slate-500">
                Visible only to Admin &amp; Provisional Head
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
