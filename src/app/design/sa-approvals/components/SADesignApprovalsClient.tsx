'use client'

import { useState, useEffect } from 'react'
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
  X,
  Shirt
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignSubmission, 
  BriefStatus, 
  DesignConceptItem, 
  DesignConceptColorway,
  SAVerdict
} from '../../types/design'
import { saReviewDesignSubmissionAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

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

interface SARowItem {
  key: string
  submissionId: string
  briefId: string
  conceptNumber: number
  artNumber: string
  baseArtNumber: string
  colorName: string
  colorway: DesignConceptColorway
  garment: string
  category: string
  designerName: string
  designerPhone?: string
  isPHApproved: boolean
  isPHRejected: boolean
  saVerdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED' | 'PENDING'
  status: BriefStatus
  phFeedback?: string
  saNotes?: string
  designerNotes?: string
  submittedAt: string
  rawSubmission: DesignSubmission
  rawConcept?: DesignConceptItem
}

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Review Modal State
  const [selectedRowItem, setSelectedRowItem] = useState<SARowItem | null>(null)
  const [saNotes, setSaNotes] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)

  // Lightbox Photo State
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Derive individual unbundled variant rows from submissions
  const allRows: SARowItem[] = []

  submissions.forEach(sub => {
    const brief = sub.brief
    const instructedConcepts = brief?.design_concepts_brief || []
    const subConcepts = sub.concepts || []

    if (subConcepts.length > 0) {
      subConcepts.forEach((concept, cIdx) => {
        const cNum = concept.concept_number || (cIdx + 1)
        const instructedReq = instructedConcepts.find(b => b.concept_number === cNum)
        
        const baseArtNo = concept.art_number || instructedReq?.art_number || `DEMO-10${cNum}`
        const garment = (instructedReq?.notes?.match(/Garment:\s*([^|]+)/i)?.[1]?.trim()) || 
                        brief?.garment_type?.split(',')[cNum - 1]?.trim() || 
                        brief?.garment_type || 
                        'Apparel'
        const category = concept.title || instructedReq?.category_style || brief?.category || 'Casual'
        const colorways = concept.colorways || []

        if (colorways.length > 0) {
          colorways.forEach((cw, cwIdx) => {
            const variantArtNo = getVariantArtNumber(baseArtNo, cwIdx, colorways.length)
            
            // Strictly exclude if rejected by Provisional Head
            if (cw.status === 'REJECTED') return
            if (!cw.status && concept.ph_verdict === 'REJECTED') return
            if (!cw.status && !concept.ph_verdict && sub.ph_verdict === 'REJECTED') return
            if (!cw.status && !concept.ph_verdict && sub.ph_verdict !== 'APPROVED') return

            const isPHApproved = cw.status === 'APPROVED' || (!cw.status && concept.ph_verdict === 'APPROVED') || sub.ph_verdict === 'APPROVED'
            if (!isPHApproved) return

            const saVerdict = (cw.sa_verdict || concept.sa_verdict || sub.sa_verdict || 'PENDING') as 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED' | 'PENDING'

            const status: BriefStatus = saVerdict === 'APPROVED' 
              ? 'SA_APPROVED' 
              : saVerdict === 'SAVED_FOR_LATER' 
              ? 'SA_SAVED_FOR_LATER' 
              : saVerdict === 'REJECTED'
              ? 'PH_REJECTED'
              : 'PH_APPROVED'

            allRows.push({
              key: `${sub.id}-c-${cNum}-cw-${cw.color_name}-${cwIdx}`,
              submissionId: sub.id,
              briefId: sub.brief_id,
              conceptNumber: cNum,
              artNumber: variantArtNo,
              baseArtNumber: baseArtNo,
              colorName: cw.color_name,
              colorway: cw,
              garment,
              category,
              designerName: sub.designer_name || brief?.designer_name || 'Designer',
              designerPhone: brief?.designer_phone,
              isPHApproved: true,
              isPHRejected: false,
              saVerdict,
              status,
              phFeedback: concept.ph_feedback || sub.ph_feedback,
              saNotes: cw.sa_notes || concept.sa_notes || sub.sa_notes,
              designerNotes: concept.notes || sub.designer_notes,
              submittedAt: sub.submitted_at,
              rawSubmission: sub,
              rawConcept: concept
            })
          })
        } else {
          // Fallback if no specific colorways array
          if (concept.ph_verdict === 'REJECTED' || sub.ph_verdict === 'REJECTED') return
          const isPHApproved = concept.ph_verdict === 'APPROVED' || sub.ph_verdict === 'APPROVED'
          if (!isPHApproved) return

          const saVerdict = (concept.sa_verdict || sub.sa_verdict || 'PENDING') as 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED' | 'PENDING'
          const status: BriefStatus = saVerdict === 'APPROVED' ? 'SA_APPROVED' : saVerdict === 'SAVED_FOR_LATER' ? 'SA_SAVED_FOR_LATER' : saVerdict === 'REJECTED' ? 'PH_REJECTED' : 'PH_APPROVED'

          allRows.push({
            key: `${sub.id}-c-${cNum}`,
            submissionId: sub.id,
            briefId: sub.brief_id,
            conceptNumber: cNum,
            artNumber: baseArtNo,
            baseArtNumber: baseArtNo,
            colorName: 'Standard',
            colorway: { color_name: 'Standard', photo_front: sub.photo_url_1, photo_back: sub.photo_url_2 },
            garment,
            category,
            designerName: sub.designer_name || brief?.designer_name || 'Designer',
            designerPhone: brief?.designer_phone,
            isPHApproved: true,
            isPHRejected: false,
            saVerdict,
            status,
            phFeedback: concept.ph_feedback || sub.ph_feedback,
            saNotes: concept.sa_notes || sub.sa_notes,
            designerNotes: concept.notes || sub.designer_notes,
            submittedAt: sub.submitted_at,
            rawSubmission: sub,
            rawConcept: concept
          })
        }
      })
    } else if (sub.ph_verdict === 'APPROVED') {
      const artNo = brief?.design_concepts_brief?.[0]?.art_number || 'DEMO-101'
      const garment = brief?.garment_type || 'Apparel'
      const category = brief?.category || 'Casual'
      const saVerdict = (sub.sa_verdict || 'PENDING') as 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED' | 'PENDING'

      allRows.push({
        key: `${sub.id}-c-1`,
        submissionId: sub.id,
        briefId: sub.brief_id,
        conceptNumber: 1,
        artNumber: artNo,
        baseArtNumber: artNo,
        colorName: brief?.target_colors?.[0] || 'Default',
        colorway: { color_name: brief?.target_colors?.[0] || 'Default', photo_front: sub.photo_url_1, photo_back: sub.photo_url_2 },
        garment,
        category,
        designerName: sub.designer_name || brief?.designer_name || 'Designer',
        designerPhone: brief?.designer_phone,
        isPHApproved: true,
        isPHRejected: false,
        saVerdict,
        status: saVerdict === 'APPROVED' ? 'SA_APPROVED' : saVerdict === 'SAVED_FOR_LATER' ? 'SA_SAVED_FOR_LATER' : 'PH_APPROVED',
        phFeedback: sub.ph_feedback,
        saNotes: sub.sa_notes,
        designerNotes: sub.designer_notes,
        submittedAt: sub.submitted_at,
        rawSubmission: sub
      })
    }
  })

  // Sync SA notes when opening review item
  useEffect(() => {
    if (!selectedRowItem) {
      setSaNotes('')
      return
    }
    setSaNotes(selectedRowItem.saNotes || '')
  }, [selectedRowItem?.key])

  const pendingItems = allRows.filter(r => r.isPHApproved && (!r.saVerdict || r.saVerdict === 'PENDING'))
  const approvedItems = allRows.filter(r => r.saVerdict === 'APPROVED')
  const savedForLaterItems = allRows.filter(r => r.saVerdict === 'SAVED_FOR_LATER')
  const rejectedItems = allRows.filter(r => r.saVerdict === 'REJECTED')

  const filteredList = allRows.filter(r => {
    if (activeTab === 'PENDING') {
      if (!(r.isPHApproved && (!r.saVerdict || r.saVerdict === 'PENDING'))) return false
    } else if (activeTab === 'APPROVED') {
      if (r.saVerdict !== 'APPROVED') return false
    } else if (activeTab === 'SAVED_FOR_LATER') {
      if (r.saVerdict !== 'SAVED_FOR_LATER') return false
    } else if (activeTab === 'REJECTED') {
      if (r.saVerdict !== 'REJECTED') return false
    }

    const q = searchQuery.toLowerCase()
    const art = r.artNumber.toLowerCase()
    const garment = r.garment.toLowerCase()
    const cat = r.category.toLowerCase()
    const col = r.colorName.toLowerCase()
    const designer = r.designerName.toLowerCase()
    const notes = r.designerNotes?.toLowerCase() || ''

    return art.includes(q) || garment.includes(q) || cat.includes(q) || col.includes(q) || designer.includes(q) || notes.includes(q)
  })

  async function handleVerdict(item: SARowItem, verdict: 'APPROVED' | 'SAVED_FOR_LATER' | 'REJECTED') {
    setIsReviewing(true)
    try {
      const res = await saReviewDesignSubmissionAction({
        submission_id: item.submissionId,
        concept_number: item.conceptNumber,
        colorway_name: item.colorName,
        sa_verdict: verdict,
        sa_notes: saNotes.trim() || undefined
      })

      if (res.success) {
        toast.success(
          verdict === 'APPROVED' 
            ? `Design ${item.artNumber} greenlit! Ready for Tech-Pack creation.` 
            : verdict === 'SAVED_FOR_LATER'
              ? `Design ${item.artNumber} archived in Seasonal Archive.`
              : `Design ${item.artNumber} returned for revisions.`
        )

        setSubmissions(prev => prev.map(s => {
          if (s.id === item.submissionId) {
            const updatedConcepts = (s.concepts || []).map(c => {
              if (c.concept_number === item.conceptNumber) {
                const updatedCws = (c.colorways || []).map(cw => {
                  if (cw.color_name === item.colorName) {
                    return {
                      ...cw,
                      sa_verdict: verdict,
                      sa_notes: saNotes.trim() || undefined
                    }
                  }
                  return cw
                })
                return {
                  ...c,
                  sa_verdict: verdict,
                  sa_notes: saNotes.trim() || undefined,
                  status: verdict === 'APPROVED' 
                    ? ('SA_APPROVED' as BriefStatus) 
                    : verdict === 'SAVED_FOR_LATER' 
                    ? ('SA_SAVED_FOR_LATER' as BriefStatus) 
                    : ('PH_REJECTED' as BriefStatus),
                  colorways: updatedCws
                }
              }
              return c
            })

            return {
              ...s,
              sa_verdict: verdict,
              sa_notes: saNotes.trim() || undefined,
              concepts: updatedConcepts.length > 0 ? updatedConcepts : s.concepts,
              reviewed_at: new Date().toISOString()
            }
          }
          return s
        }))

        setSelectedRowItem(null)
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
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Design Executive Approvals
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {pendingItems.length} Awaiting Decision
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Review Provisional Head-approved designs individually with unique Art Numbers, greenlight for Tech-Pack, or save in seasonal archive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            href="/design"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F0] text-[#3A3564] hover:bg-[#F2ECE1] border border-black/10 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design Studio</span>
          </Link>
        </div>
      </div>

      {/* Layer 3: Informational KPI Data Boxes (Unified 4-Box Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              PIPELINE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Total Designs
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {allRows.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              DECISION
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Awaiting Decision
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {pendingItems.length}
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
              {approvedItems.length}
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
              {savedForLaterItems.length}
            </div>
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
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'ALL'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              All Designs ({allRows.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'PENDING'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Awaiting Decision ({pendingItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'APPROVED'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Greenlit ({approvedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SAVED_FOR_LATER')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                activeTab === 'SAVED_FOR_LATER'
                  ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                  : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
              }`}
            >
              Saved for Later ({savedForLaterItems.length})
            </button>
            {rejectedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('REJECTED')}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  activeTab === 'REJECTED'
                    ? 'bg-[#3A3564] text-white border-[#3A3564] font-bold shadow-2xs'
                    : 'text-slate-700 bg-[#FAF7F0] border-black/10 hover:bg-slate-100'
                }`}
              >
                Revisions Needed ({rejectedItems.length})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search art no, colors, garment..."
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
              description="When Provisional Heads approve designer submissions, each individual design and colorway appears here for Super Admin executive review."
            />
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0]">
                    <th className="py-3 px-4">Art No. &amp; Garment</th>
                    <th className="py-3 px-4">Designer</th>
                    <th className="py-3 px-4">Colorway &amp; Artwork</th>
                    <th className="py-3 px-4">Decision Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredList.map(item => {
                    const isPendingSA = item.isPHApproved && (!item.saVerdict || item.saVerdict === 'PENDING')
                    const isGreenlit = item.saVerdict === 'APPROVED'
                    const isSaved = item.saVerdict === 'SAVED_FOR_LATER'
                    const isRejected = item.isPHRejected || item.saVerdict === 'REJECTED'

                    const sw = getColorSwatchInfo(item.colorName)

                    return (
                      <tr key={item.key} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-extrabold text-slate-900 text-sm">
                              {item.artNumber}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-black/5">
                              #{item.conceptNumber} &bull; #{item.briefId.substring(0, 6)}
                            </span>
                          </div>
                          <span className="font-bold text-slate-800 text-xs block font-[family-name:var(--font-heading)]">
                            {item.garment}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 text-xs block">
                            {item.designerName}
                          </span>
                          {item.designerPhone && (
                            <span className="text-[11px] font-mono text-slate-400 block">
                              {item.designerPhone}
                            </span>
                          )}
                          <span className="text-[11px] text-emerald-700 font-mono inline-flex items-center gap-1 font-bold mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PH Approved
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs" 
                                style={{ backgroundColor: sw.bg }} 
                              />
                              <span className="font-bold text-slate-800 text-xs">
                                {item.colorName}
                              </span>
                            </div>

                            {/* Mini Thumbnail */}
                            {item.colorway.photo_front ? (
                              <div 
                                onClick={() => setPreviewPhoto(item.colorway.photo_front)}
                                className="w-10 h-10 rounded-lg border border-black/10 overflow-hidden bg-[#FAF7F0] cursor-pointer p-0.5 shadow-2xs hover:border-[#3A3564] transition-all shrink-0"
                                title="Click to preview artwork"
                              >
                                <img
                                  src={item.colorway.photo_front}
                                  alt={`${item.artNumber} Preview`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-[10px]">No Artwork</span>
                            )}
                          </div>
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
                          {isRejected && (
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              Revisions Requested
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedRowItem(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-black/10 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer hover:border-black/20"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
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
              {filteredList.map(item => {
                const isPendingSA = item.isPHApproved && (!item.saVerdict || item.saVerdict === 'PENDING')
                const isGreenlit = item.saVerdict === 'APPROVED'
                const isSaved = item.saVerdict === 'SAVED_FOR_LATER'
                const isRejected = item.isPHRejected || item.saVerdict === 'REJECTED'
                const sw = getColorSwatchInfo(item.colorName)

                return (
                  <div key={item.key} className="p-4 space-y-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 text-sm">
                            {item.artNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-black/5">
                            #{item.conceptNumber}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                          {item.garment}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {item.category}
                        </p>
                      </div>

                      {isPendingSA && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          Awaiting Decision
                        </span>
                      )}
                      {isGreenlit && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          Greenlit
                        </span>
                      )}
                      {isSaved && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shrink-0">
                          Archived
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          Revisions
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Designer</span>
                        <span className="font-bold text-slate-800">{item.designerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Colorway</span>
                        <div className="flex items-center gap-1 font-bold text-slate-800 justify-end">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: sw.bg }} />
                          <span>{item.colorName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRowItem(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#3A3564] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View &amp; Decide {item.artNumber}</span>
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
      {/* SUPER ADMIN EXECUTIVE DECISION MODAL (INDIVIDUAL VARIANT) */}
      {/* ========================================================================= */}
      {selectedRowItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                    {selectedRowItem.isPHApproved ? 'PH Approved' : 'PH Rejected'}
                  </span>
                  <span className="text-xs font-mono font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-black/10 shadow-2xs">
                    ART NO: {selectedRowItem.artNumber}
                  </span>
                  {selectedRowItem.saVerdict === 'APPROVED' && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                      Greenlit for Tech-Pack
                    </span>
                  )}
                  {selectedRowItem.saVerdict === 'SAVED_FOR_LATER' && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                      Saved in Archive
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
                  {selectedRowItem.garment} ({selectedRowItem.category})
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Colorway: <strong className="text-slate-800 font-sans">{selectedRowItem.colorName}</strong> &bull; Designer: <strong className="text-slate-800 font-sans">{selectedRowItem.designerName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRowItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-[13px] flex-1">
              {/* Artwork Cards */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Artwork Mockups ({selectedRowItem.artNumber})
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    Click image to expand
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedRowItem.colorway.photo_front ? (
                    <div
                      onClick={() => setPreviewPhoto(selectedRowItem.colorway.photo_front)}
                      className="rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-2 flex flex-col items-center justify-center shadow-2xs hover:border-[#3A3564]/40 transition-all min-h-[220px]"
                    >
                      <img
                        src={selectedRowItem.colorway.photo_front}
                        alt={`${selectedRowItem.artNumber} Front View`}
                        className="max-h-52 w-auto object-contain group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2.5 py-0.5 rounded-full border border-black/10 shadow-2xs">
                        Front View
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-2xl">
                        <Eye className="w-4 h-4" /> Expand View
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-mono p-6 min-h-[220px]">
                      No Front View Attached
                    </div>
                  )}

                  {selectedRowItem.colorway.photo_back ? (
                    <div
                      onClick={() => setPreviewPhoto(selectedRowItem.colorway.photo_back!)}
                      className="rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden relative group cursor-pointer p-2 flex flex-col items-center justify-center shadow-2xs hover:border-[#3A3564]/40 transition-all min-h-[220px]"
                    >
                      <img
                        src={selectedRowItem.colorway.photo_back}
                        alt={`${selectedRowItem.artNumber} Back View`}
                        className="max-h-52 w-auto object-contain group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono font-bold bg-white/95 text-slate-800 px-2.5 py-0.5 rounded-full border border-black/10 shadow-2xs">
                        Back View
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-2xl">
                        <Eye className="w-4 h-4" /> Expand View
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-mono p-6 min-h-[220px]">
                      No Back View Attached
                    </div>
                  )}
                </div>
              </div>

              {/* Designer Notes */}
              {selectedRowItem.designerNotes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block font-mono uppercase mb-0.5">Designer Notes:</span>
                  <p className="text-slate-600 italic">&ldquo;{selectedRowItem.designerNotes}&rdquo;</p>
                </div>
              )}

              {/* PH Approval Notes */}
              {selectedRowItem.phFeedback && (
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs">
                  <span className="font-bold text-sky-900 block font-mono uppercase mb-0.5">Provisional Head Notes:</span>
                  <p className="text-sky-800 italic">&ldquo;{selectedRowItem.phFeedback}&rdquo;</p>
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
            <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedRowItem(null)
                  setSaNotes('')
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer transition-all"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(selectedRowItem, 'REJECTED')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(selectedRowItem, 'SAVED_FOR_LATER')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#3A3564] hover:bg-slate-100 border border-black/15 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save for Later</span>
                </button>

                <button
                  type="button"
                  disabled={isReviewing}
                  onClick={() => handleVerdict(selectedRowItem, 'APPROVED')}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isReviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Greenlight for Tech-Pack</span>
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
    </div>
  )
}
