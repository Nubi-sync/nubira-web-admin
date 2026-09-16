'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  Loader2, 
  Image as ImageIcon,
  Layers,
  Trash2,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  X,
  Sparkles,
  Shirt,
  RotateCcw,
  SlidersHorizontal,
  Info,
  ClipboardList
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignBrief, 
  BriefStatus, 
  DesignConceptItem, 
  DesignConceptColorway 
} from '../../types/design'
import { submitDesignPhotosAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

// Clean line-art Waving Hand Outline SVG (stroke line-art, fill="none", NO solid fill, NO emoji)
function WavingHandOutlineIcon({ className = "w-6 h-6 text-slate-800" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      aria-label="Waving hand outline"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v4" />
      <path d="M14 10V4a2 2 0 0 0-4 0v7" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6.2-3.1L3.3 15.7a1.5 1.5 0 0 1 2.3-1.9l2.4 2.2V6" />
      <path d="M4 4c1-1 3-1 4 0" />
      <path d="M2 7c1.5-1.5 4-1.5 5.5 0" />
    </svg>
  )
}

interface DesignerDashboardClientProps {
  initialBriefs: DesignBrief[]
  designerName?: string
  designerPhone?: string
  designerUsername?: string
  designerEmail: string
  companyName: string
  currentUserId: string
  userRole?: string
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string; isGreen?: boolean; isRed?: boolean }> = {
  ALLOCATED: { label: 'Pending Upload', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  SUBMITTED: { label: 'In Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold' },
  PH_APPROVED: { label: 'Approved by Head', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true },
  PH_REJECTED: { label: 'Revisions Needed', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', isRed: true },
  SA_APPROVED: { label: 'Approved / Greenlit', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true },
  SA_SAVED_FOR_LATER: { label: 'Seasonal Archive', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', isGreen: true }
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

interface MockupDropzoneProps {
  label: string
  isRequired?: boolean
  photoUrl?: string
  colorwayName: string
  slotType: 'front' | 'back'
  onPhotoChange: (url: string) => void
  onPreview: (url: string) => void
  disabled?: boolean
}

function ColorwayMockupDropzone({
  label,
  isRequired,
  photoUrl,
  colorwayName,
  slotType,
  onPhotoChange,
  onPreview,
  disabled
}: MockupDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP, SVG)')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds 15MB limit.')
      return
    }
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      onPhotoChange(dataUrl)
      setIsUploading(false)
      toast.success(`${slotType === 'front' ? 'Front' : 'Back'} mockup attached!`)
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Failed to read image file.')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {isRequired && <span className="text-rose-500">*</span>}
        </label>
        <span className="text-[10px] font-mono font-medium text-slate-500">
          {slotType === 'front' ? 'Primary CAD' : 'Secondary View'}
        </span>
      </div>

      {photoUrl ? (
        <div className="space-y-2">
          <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-2xl border border-black/10 bg-[#FAF7F0] overflow-hidden group shadow-2xs">
            <img
              src={photoUrl}
              alt={`${colorwayName} ${slotType}`}
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onPreview(photoUrl)}
                className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                title="Zoom Lightbox"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
              {!disabled && (
                <label className="px-3 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {!disabled && (
            <div className="flex items-center justify-between text-[11px] px-1">
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
              </span>
              <button
                type="button"
                onClick={() => onPhotoChange('')}
                className="text-rose-600 hover:text-rose-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer font-mono"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`aspect-square sm:aspect-[4/3] w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer select-none ${
            disabled
              ? 'border-black/10 bg-slate-50 text-slate-400 cursor-not-allowed'
              : isDragging
              ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564] scale-[1.01]'
              : 'border-black/15 bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] hover:border-[#3A3564] text-slate-600 shadow-2xs'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 text-[#3A3564]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold font-mono">Attaching Mockup...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-black/10 shadow-2xs flex items-center justify-center mb-2 text-[#3A3564]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 block">
                {isDragging ? 'Drop Vector Image Here' : `Attach ${slotType === 'front' ? 'Front' : 'Back'} Mockup`}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                PNG, JPG, WEBP &bull; Drag &amp; Drop or Browse
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={disabled || isUploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}

interface ConceptFormState {
  title: string
  notes: string
  colorways: Record<string, { photo_front: string; photo_back: string }>
}

export function DesignerDashboardClient({
  initialBriefs,
  designerName,
  designerPhone,
  designerUsername,
  designerEmail,
  companyName,
  currentUserId,
  userRole
}: DesignerDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const briefIdParam = searchParams.get('briefId')

  const [briefs, setBriefs] = useState<DesignBrief[]>(initialBriefs)
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(briefIdParam || null)

  const activeBrief = selectedBriefId ? (briefs.find(b => b.id === selectedBriefId) || null) : null

  // Active brief variables
  const targetDesignsCount = activeBrief?.target_designs || 1
  const targetColorsList = (activeBrief?.target_colors && activeBrief.target_colors.length > 0)
    ? activeBrief.target_colors
    : ['Default Colorway']

  // Multi-Concept Form State
  const [conceptsState, setConceptsState] = useState<Record<number, ConceptFormState>>({})
  const [activeConceptTab, setActiveConceptTab] = useState<number>(1)
  const [activeColorwayTab, setActiveColorwayTab] = useState<string>(targetColorsList[0] || 'Default Colorway')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Sync selectedBriefId from query params if changed
  useEffect(() => {
    if (briefIdParam && briefIdParam !== selectedBriefId) {
      setSelectedBriefId(briefIdParam)
    }
  }, [briefIdParam])

  // Initialize or re-populate concepts when activeBrief changes
  useEffect(() => {
    if (!activeBrief) return
    const count = activeBrief.target_designs || 1
    const globalColors = (activeBrief.target_colors && activeBrief.target_colors.length > 0)
      ? activeBrief.target_colors
      : ['Default Colorway']

    const nextState: Record<number, ConceptFormState> = {}

    if (activeBrief.latest_submission?.concepts && activeBrief.latest_submission.concepts.length > 0) {
      activeBrief.latest_submission.concepts.forEach(c => {
        const cwMap: Record<string, { photo_front: string; photo_back: string }> = {}
        c.colorways.forEach(cw => {
          cwMap[cw.color_name] = {
            photo_front: cw.photo_front || '',
            photo_back: cw.photo_back || ''
          }
        })
        nextState[c.concept_number] = {
          title: c.title || `Design Concept #${c.concept_number}`,
          notes: c.notes || '',
          colorways: cwMap
        }
      })
    } else if (activeBrief.latest_submission?.photo_url_1) {
      nextState[1] = {
        title: 'Design Concept #1',
        notes: activeBrief.latest_submission.designer_notes || '',
        colorways: {
          [globalColors[0]]: {
            photo_front: activeBrief.latest_submission.photo_url_1,
            photo_back: activeBrief.latest_submission.photo_url_2 || ''
          }
        }
      }
    }

    for (let i = 1; i <= count; i++) {
      const instructedConcept = activeBrief.design_concepts_brief?.find(c => c.concept_number === i)
      const conceptColors = (instructedConcept?.colors && instructedConcept.colors.length > 0)
        ? instructedConcept.colors
        : globalColors

      if (!nextState[i]) {
        nextState[i] = {
          title: instructedConcept?.category_style || `Design Concept #${i}`,
          notes: instructedConcept?.notes || '',
          colorways: {}
        }
      }
      conceptColors.forEach(col => {
        if (!nextState[i].colorways[col]) {
          nextState[i].colorways[col] = { photo_front: '', photo_back: '' }
        }
      })
    }

    setConceptsState(nextState)
    setActiveConceptTab(1)
    
    const firstConceptReq = activeBrief.design_concepts_brief?.find(c => c.concept_number === 1)
    const initialColors = (firstConceptReq?.colors && firstConceptReq.colors.length > 0)
      ? firstConceptReq.colors
      : globalColors
    setActiveColorwayTab(initialColors[0])
  }, [activeBrief?.id])

  // Total slots calculation across all concepts
  let totalSlots = 0
  for (let i = 1; i <= targetDesignsCount; i++) {
    const req = activeBrief?.design_concepts_brief?.find(c => c.concept_number === i)
    const cColors = (req?.colors && req.colors.length > 0) ? req.colors : targetColorsList
    totalSlots += cColors.length
  }
  if (totalSlots === 0) totalSlots = targetDesignsCount * targetColorsList.length

  let readySlotsCount = 0
  for (let i = 1; i <= targetDesignsCount; i++) {
    const cData = conceptsState[i]
    const req = activeBrief?.design_concepts_brief?.find(c => c.concept_number === i)
    const cColors = (req?.colors && req.colors.length > 0) ? req.colors : targetColorsList
    if (cData) {
      cColors.forEach(col => {
        if (cData.colorways[col]?.photo_front?.trim()) {
          readySlotsCount++
        }
      })
    }
  }

  function handleUpdateColorwayPhoto(conceptNum: number, colorName: string, field: 'photo_front' | 'photo_back', value: string) {
    setConceptsState(prev => {
      const c = prev[conceptNum] || { title: `Design Concept #${conceptNum}`, notes: '', colorways: {} }
      const cw = c.colorways[colorName] || { photo_front: '', photo_back: '' }
      return {
        ...prev,
        [conceptNum]: {
          ...c,
          colorways: {
            ...c.colorways,
            [colorName]: {
              ...cw,
              [field]: value
            }
          }
        }
      }
    })
  }

  function handleUpdateConceptField(conceptNum: number, field: 'title' | 'notes', value: string) {
    setConceptsState(prev => {
      const c = prev[conceptNum] || { title: `Design Concept #${conceptNum}`, notes: '', colorways: {} }
      return {
        ...prev,
        [conceptNum]: {
          ...c,
          [field]: value
        }
      }
    })
  }

  async function handleSubmitAllConcepts(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrief) return

    if (readySlotsCount === 0) {
      toast.error('Please attach at least one front artwork mockup before submitting.')
      return
    }

    const conceptsPayload: DesignConceptItem[] = []
    for (let i = 1; i <= targetDesignsCount; i++) {
      const cData = conceptsState[i]
      if (!cData) continue

      const req = activeBrief.design_concepts_brief?.find(c => c.concept_number === i)
      const conceptColors = (req?.colors && req.colors.length > 0) ? req.colors : targetColorsList

      const colorwaysPayload: DesignConceptColorway[] = []
      conceptColors.forEach(colName => {
        const cw = cData.colorways[colName]
        if (cw && (cw.photo_front || cw.photo_back)) {
          colorwaysPayload.push({
            color_name: colName,
            photo_front: cw.photo_front || '',
            photo_back: cw.photo_back || ''
          })
        }
      })

      if (colorwaysPayload.length > 0 || cData.title || cData.notes) {
        conceptsPayload.push({
          concept_number: i,
          title: cData.title || `Design Concept #${i}`,
          notes: cData.notes || '',
          colorways: colorwaysPayload
        })
      }
    }

    setIsSubmitting(true)
    const firstFrontPhoto = conceptsPayload[0]?.colorways[0]?.photo_front || ''
    const firstBackPhoto = conceptsPayload[0]?.colorways[0]?.photo_back || ''

    try {
      const res = await submitDesignPhotosAction({
        brief_id: activeBrief.id,
        designer_member_id: currentUserId,
        photo_url_1: firstFrontPhoto,
        photo_url_2: firstBackPhoto,
        designer_notes: conceptsPayload[0]?.notes || '',
        concepts: conceptsPayload,
        company_name: companyName
      })

      if (res.success) {
        toast.success(`Design deck submitted (${readySlotsCount}/${totalSlots} mockups attached) for Provisional Head review!`)
        
        // Update local brief state to SUBMITTED
        setBriefs(prev => prev.map(b => {
          if (b.id === activeBrief.id) {
            return {
              ...b,
              status: 'SUBMITTED',
              latest_submission: {
                id: res.data?.id || `sub-${Date.now()}`,
                brief_id: b.id,
                designer_member_id: currentUserId,
                designer_name: designerName || 'Designer',
                designer_notes: conceptsPayload[0]?.notes || '',
                photo_url_1: firstFrontPhoto,
                photo_url_2: firstBackPhoto,
                concepts: conceptsPayload,
                ph_verdict: 'PENDING',
                company_name: companyName,
                submitted_at: new Date().toISOString()
              }
            }
          }
          return b
        }))

        // Return to assignments list
        setSelectedBriefId(null)
      } else {
        toast.error(res.error || 'Failed to submit design deck.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'A network error occurred while submitting.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter Active Assignments (ALLOCATED, PH_REJECTED)
  const activeAssignments = briefs.filter(b => b.status === 'ALLOCATED' || b.status === 'PH_REJECTED')
  const completedBriefsCount = briefs.filter(b => b.status === 'PH_APPROVED' || b.status === 'SA_APPROVED' || b.status === 'TECH_PACK_CREATED').length
  const inReviewCount = briefs.filter(b => b.status === 'SUBMITTED').length
  const totalConceptsRequired = activeAssignments.reduce((acc, b) => acc + (b.target_designs || 1), 0)

  // =========================================================================
  // SCREEN 2: DEDICATED CREATIVE STUDIO WORKSPACE FOR AN ASSIGNMENT
  // =========================================================================
  if (activeBrief) {
    const isEditable = activeBrief.status === 'ALLOCATED' || activeBrief.status === 'PH_REJECTED' || activeBrief.status === 'SUBMITTED'
    const currentConcept = conceptsState[activeConceptTab] || {
      title: `Design Concept #${activeConceptTab}`,
      notes: '',
      colorways: {}
    }
    const currentColorwayData = currentConcept.colorways[activeColorwayTab] || { photo_front: '', photo_back: '' }

    return (
      <div className="space-y-5 sm:space-y-6">
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button
              type="button"
              onClick={() => setSelectedBriefId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Assignments</span>
            </button>
            <span className="text-slate-400 font-mono text-xs">/</span>
            <span className="font-mono font-bold text-slate-900 text-xs">
              Studio Workspace &bull; {activeBrief.garment_type} ({activeBrief.category})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full border ${STATUS_CONFIG[activeBrief.status]?.badgeClass}`}>
              {STATUS_CONFIG[activeBrief.status]?.label}
            </span>
          </div>
        </div>

        {/* Layer 2: Top Command Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  {activeBrief.garment_type} Studio Deck
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                  {activeBrief.category} Style
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                Target Scope: <span className="font-mono font-bold text-[#3A3564]">{targetDesignsCount} Designs</span> &times; <span className="font-mono font-bold text-[#3A3564]">{targetColorsList.length} Colors</span> = <span className="font-mono font-bold text-slate-900">{totalSlots} Mockup Slots</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-slate-800 shadow-2xs">
              Attached: <span className="text-emerald-700 font-extrabold">{readySlotsCount}</span> / {totalSlots}
            </div>
          </div>
        </div>

        {/* Layer 3: Palette & Guidelines Card */}
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700 font-mono uppercase tracking-wider text-[11px]">
              Assigned Color Palette ({targetColorsList.length} Swatches):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {targetColorsList.map((col, idx) => {
                const sw = getColorSwatchInfo(col)
                return (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono text-xs font-semibold text-slate-900 shadow-2xs"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" 
                      style={{ backgroundColor: sw.bg }} 
                    />
                    <span>{col}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {activeBrief.instructions && (
            <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs text-slate-700 space-y-1">
              <span className="font-mono font-bold uppercase text-[10px] text-slate-500 block">Provisional Head Instructions:</span>
              <p className="italic font-medium">&ldquo;{activeBrief.instructions}&rdquo;</p>
            </div>
          )}

          {/* Revisions Needed Alert Banner */}
          {activeBrief.status === 'PH_REJECTED' && activeBrief.latest_submission?.ph_feedback && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold font-mono">
                <XCircle className="w-4 h-4" />
                <span>Head Revision Notes (Action Required):</span>
              </div>
              <p className="text-rose-900 italic font-medium pt-0.5">&ldquo;{activeBrief.latest_submission.ph_feedback}&rdquo;</p>
              <p className="text-rose-700 pt-1 text-[11px]">Please adjust your artwork below and click &ldquo;Resubmit Work&rdquo;.</p>
            </div>
          )}
        </div>

        {/* Multi-Concept Tabs & Workspace */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-[family-name:var(--font-heading)]">
              <Layers className="w-4 h-4 text-[#3A3564]" />
              <span>Design Concepts Deck ({targetDesignsCount} Required)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Concept {activeConceptTab} of {targetDesignsCount}
            </span>
          </div>

          {/* Concept Tabs */}
          <div className="flex flex-wrap gap-2 pb-1">
            {Array.from({ length: targetDesignsCount }).map((_, idx) => {
              const cNum = idx + 1
              const isTabActive = activeConceptTab === cNum
              const cData = conceptsState[cNum]
              const req = activeBrief.design_concepts_brief?.find(c => c.concept_number === cNum)
              const cColors = (req?.colors && req.colors.length > 0) ? req.colors : targetColorsList
              const readyForThisConcept = cColors.filter(col => cData?.colorways[col]?.photo_front?.trim()).length
              const isFullyDone = readyForThisConcept >= cColors.length

              return (
                <button
                  key={cNum}
                  type="button"
                  onClick={() => {
                    setActiveConceptTab(cNum)
                    setActiveColorwayTab(cColors[0])
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs border ${
                    isTabActive
                      ? 'bg-[#3A3564] text-white border-[#3A3564]'
                      : isFullyDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-[#FAF7F0] text-slate-700 border-black/10 hover:bg-slate-100'
                  }`}
                >
                  {isFullyDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                      {cNum}
                    </span>
                  )}
                  <span>Design #{cNum}</span>
                  {req?.category_style && (
                    <span className="hidden sm:inline font-sans text-[11px] font-medium text-slate-500 max-w-[120px] truncate">
                      ({req.category_style})
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isTabActive ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-600'
                  }`}>
                    {readyForThisConcept}/{cColors.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Concept Canvas */}
          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-2xl border border-black/10 space-y-4">
            <div>
              <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Design Concept #{activeConceptTab} Title / Theme
              </label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder={`e.g. Front Chest Arch Logo Variant #${activeConceptTab}`}
                value={currentConcept.title}
                onChange={e => handleUpdateConceptField(activeConceptTab, 'title', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all"
              />
            </div>

            {(() => {
              const currentInstructed = activeBrief.design_concepts_brief?.find(c => c.concept_number === activeConceptTab)
              const activeConceptColors = (currentInstructed?.colors && currentInstructed.colors.length > 0)
                ? currentInstructed.colors
                : targetColorsList

              return (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5 flex items-center justify-between">
                    <span>Select Colorway to Attach Artwork ({activeConceptColors.length} Allocated)</span>
                    <span className="text-[11px] font-normal text-slate-500 font-sans">
                      Click each color to upload front &amp; back views
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeConceptColors.map((colName) => {
                      const sw = getColorSwatchInfo(colName)
                      const isColorSelected = activeColorwayTab === colName
                      const hasPhoto = !!currentConcept.colorways[colName]?.photo_front?.trim()

                      return (
                        <button
                          key={colName}
                          type="button"
                          onClick={() => setActiveColorwayTab(colName)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                            isColorSelected
                              ? 'bg-white text-[#3A3564] border-[#3A3564] ring-2 ring-[#3A3564]/15'
                              : hasPhoto
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" 
                            style={{ backgroundColor: sw.bg }} 
                          />
                          <span>{colName}</span>
                          {hasPhoto ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Pending</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-4 h-4 text-[#3A3564]" />
                  Mockups for [{activeColorwayTab} Base {activeBrief.garment_type}]
                </span>
                {currentColorwayData.photo_front && (
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorwayMockupDropzone
                  label="Front Artwork / Primary Mockup"
                  isRequired
                  photoUrl={currentColorwayData.photo_front}
                  colorwayName={activeColorwayTab}
                  slotType="front"
                  onPhotoChange={(url) => handleUpdateColorwayPhoto(activeConceptTab, activeColorwayTab, 'photo_front', url)}
                  onPreview={(url) => setPreviewPhoto(url)}
                  disabled={!isEditable}
                />

                <ColorwayMockupDropzone
                  label="Back View / Detail Artwork (Optional)"
                  photoUrl={currentColorwayData.photo_back || ''}
                  colorwayName={activeColorwayTab}
                  slotType="back"
                  onPhotoChange={(url) => handleUpdateColorwayPhoto(activeConceptTab, activeColorwayTab, 'photo_back', url)}
                  onPreview={(url) => setPreviewPhoto(url)}
                  disabled={!isEditable}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Fabric, Print &amp; Silhouette Notes (Optional)
              </label>
              <textarea
                rows={2}
                disabled={!isEditable}
                placeholder="e.g. 380 GSM French Terry, Plastisol high-density chest print, relaxed drop-shoulder..."
                value={currentConcept.notes}
                onChange={e => handleUpdateConceptField(activeConceptTab, 'notes', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          {isEditable ? (
            <div className="pt-2">
              <form onSubmit={handleSubmitAllConcepts}>
                <button
                  type="submit"
                  disabled={isSubmitting || readySlotsCount === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50 ${
                    readySlotsCount >= totalSlots
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#3A3564] hover:bg-[#2A2649] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>
                    {activeBrief.status === 'PH_REJECTED'
                      ? `Resubmit Revised Work (${readySlotsCount}/${totalSlots} Mockups)`
                      : `Submit Work (${readySlotsCount}/${totalSlots} Mockups) to Provisional Head`}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This brief is currently locked and undergoing technical review.</span>
            </div>
          )}
        </div>

        {/* Lightbox Preview */}
        {previewPhoto && (
          <div 
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl border border-black/10">
              <img 
                src={previewPhoto} 
                alt="Full View" 
                className="max-h-[80vh] w-auto rounded-xl object-contain" 
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-black transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // SCREEN 1: DEDICATED ASSIGNMENTS COCKPIT (`/design/designer`)
  // =========================================================================
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Designer Studio</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Active Assignments</span>
        </div>

        <Link
          href="/design/history"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-800 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
          <span>View Submission History &rarr;</span>
        </Link>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <Palette className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Welcome, {designerName || 'Designer'}
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {activeAssignments.length} Active Tasks
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Your assigned garment creative briefs and multi-concept upload desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            {designerPhone ? `+91 ${designerPhone}` : designerEmail}
          </span>
        </div>
      </div>

      {/* Layer 3: Executive Metrics Strip (Unified 4-Box Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TASKS
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
              {activeAssignments.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TARGET
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Concepts Required
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {totalConceptsRequired}
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
              In Head Review
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {inReviewCount}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              CLEARED
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Approved Designs
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {completedBriefsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Active Briefs Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-[family-name:var(--font-heading)]">
            <Palette className="w-4 h-4 text-[#3A3564]" />
            <span>Assigned Briefs Queue ({activeAssignments.length})</span>
          </h2>
          <span className="text-xs font-mono text-slate-500 font-semibold">
            Click any card to launch studio workspace
          </span>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-8">
            <EmptyState
              icon={CheckCircle2}
              title="All caught up! No pending assignments"
              description="You have completed all active brief allotments. Visit your Submission History to review past approvals."
              actionLabel="View Submission History"
              onAction={() => router.push('/design/history')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAssignments.map(brief => {
              const isRejected = brief.status === 'PH_REJECTED'
              const colorList = brief.target_colors || []

              return (
                <div
                  key={brief.id}
                  onClick={() => setSelectedBriefId(brief.id)}
                  className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md ${
                    isRejected 
                      ? 'border-rose-200 hover:border-rose-400 ring-2 ring-rose-500/10' 
                      : 'border-black/10 hover:border-[#3A3564]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                          Brief #{brief.id.substring(0, 8)}
                        </span>
                        <h3 className="font-bold text-slate-900 text-lg font-[family-name:var(--font-heading)] group-hover:text-[#3A3564] transition-colors leading-tight mt-0.5">
                          {brief.garment_type}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">
                          {brief.category} Style
                        </p>
                      </div>

                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${STATUS_CONFIG[brief.status]?.badgeClass}`}>
                        {STATUS_CONFIG[brief.status]?.label}
                      </span>
                    </div>

                    {/* Scope Spec */}
                    <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500">Design Scope:</span>
                        <span className="font-bold text-[#3A3564]">{brief.target_designs || 1} Concepts &times; {brief.max_colors} Colors</span>
                      </div>

                      {/* Swatch palette preview */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {colorList.map((col, idx) => {
                          const sw = getColorSwatchInfo(col)
                          return (
                            <span 
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-black/10 text-[10px] font-mono font-semibold text-slate-800"
                            >
                              <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: sw.bg }} />
                              <span>{col}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {/* Instructions or Rejection Note */}
                    {isRejected && brief.latest_submission?.ph_feedback ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                        <span className="font-bold block text-[10px] uppercase font-mono">Head Feedback:</span>
                        <p className="line-clamp-2 italic text-[11px] mt-0.5">&ldquo;{brief.latest_submission.ph_feedback}&rdquo;</p>
                      </div>
                    ) : brief.instructions ? (
                      <p className="text-xs text-slate-600 line-clamp-2 italic px-0.5">
                        &ldquo;{brief.instructions}&rdquo;
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3A3564]">
                    <span className="font-mono text-[11px] text-slate-400 font-normal">
                      {brief.company_name || companyName}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform font-bold">
                      {isRejected ? 'Redo / Revise Work' : 'Open Studio Workspace'} <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
