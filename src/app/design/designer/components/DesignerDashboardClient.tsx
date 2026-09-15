'use client'

import { useState, useEffect } from 'react'
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
  Bookmark,
  Target,
  Layers,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Shirt,
  Tag,
  Phone,
  Upload,
  Link2,
  RefreshCw,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignBrief, 
  DesignSubmission, 
  BriefStatus, 
  DesignConceptItem, 
  DesignConceptColorway 
} from '../../types/design'
import { submitDesignPhotosAction } from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'

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

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string; desc: string }> = {
  ALLOCATED: { label: 'Allocated (Pending Submission)', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Please complete all required design concepts and colorways.' },
  SUBMITTED: { label: 'Submitted (PH Review)', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold', desc: 'Awaiting verification review by Provisional Head.' },
  PH_APPROVED: { label: 'PH Approved (Awaiting SA)', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold', desc: 'Provisional Head approved! Awaiting Super Admin greenlight.' },
  PH_REJECTED: { label: 'Revisions Requested', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', desc: 'Revision feedback provided. You can update your designs and resubmit.' },
  SA_APPROVED: { label: 'Greenlit for Production', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', desc: 'Approved by Super Admin! Tech-Pack generation in progress.' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Upcoming Season', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold', desc: 'Archived in seasonal studio library.' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Generated', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold', desc: 'Moved to Merchandising & Sampling queue.' }
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
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlValue, setUrlValue] = useState(photoUrl || '')

  useEffect(() => {
    setUrlValue(photoUrl || '')
  }, [photoUrl])

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
      toast.success(`${slotType === 'front' ? 'Front' : 'Back'} mockup loaded!`)
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

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          processFile(file)
          return
        }
      }
    }
  }

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlValue.trim()) {
      onPhotoChange(urlValue.trim())
      toast.success('Image URL applied!')
    }
  }

  return (
    <div className="space-y-1.5" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs">
          {label} {isRequired && <span className="text-rose-600">*</span>}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-mono font-medium text-slate-500 hover:text-[#3A3564] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Link2 className="w-3 h-3" />
            <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
          </button>
        )}
      </div>

      {showUrlInput && !disabled && (
        <form onSubmit={handleApplyUrl} className="flex gap-1.5 mb-1.5 animate-in fade-in duration-150">
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={urlValue}
            onChange={e => setUrlValue(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#3A3564] text-[#FAF7F0] rounded-xl text-xs font-bold hover:bg-[#2A2649] cursor-pointer"
          >
            Apply
          </button>
        </form>
      )}

      {photoUrl ? (
        <div className="space-y-1.5">
          <div className="aspect-video w-full rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group">
            <img
              src={photoUrl}
              alt={`${colorwayName} ${label}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => onPreview(photoUrl)}
                className="px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                title="Full Lightbox Zoom"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
              {!disabled && (
                <label className="px-2.5 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all">
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
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Image attached
              </span>
              <button
                type="button"
                onClick={() => onPhotoChange('')}
                className="text-rose-600 hover:text-rose-800 font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
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
          className={`aspect-video w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer select-none ${
            disabled
              ? 'border-black/10 bg-slate-50 text-slate-400 cursor-not-allowed'
              : isDragging
              ? 'border-[#3A3564] bg-[#FAF7F0] text-[#3A3564] scale-[1.01]'
              : 'border-black/15 bg-slate-50 hover:bg-[#FAF7F0]/60 hover:border-[#3A3564] text-slate-600'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 text-[#3A3564]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-bold">Loading Image...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-black/10 shadow-2xs flex items-center justify-center mb-2 text-[#3A3564] group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 block">
                {isDragging ? 'Drop Image Here' : 'Click to Upload Mockup'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                PNG, JPG, WEBP, SVG • Or Drag &amp; Drop / Paste
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
  const [briefs, setBriefs] = useState<DesignBrief[]>(initialBriefs)
  const [activeBrief, setActiveBrief] = useState<DesignBrief | null>(initialBriefs[0] || null)

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

  // Initialize or re-populate concepts when activeBrief changes
  useEffect(() => {
    if (!activeBrief) return
    const count = activeBrief.target_designs || 1
    const colors = (activeBrief.target_colors && activeBrief.target_colors.length > 0)
      ? activeBrief.target_colors
      : ['Default Colorway']

    const nextState: Record<number, ConceptFormState> = {}

    // 1. Check if previous submission concepts exist
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
      // Legacy single submission fallback
      nextState[1] = {
        title: 'Design Concept #1',
        notes: activeBrief.latest_submission.designer_notes || '',
        colorways: {
          [colors[0]]: {
            photo_front: activeBrief.latest_submission.photo_url_1,
            photo_back: activeBrief.latest_submission.photo_url_2 || ''
          }
        }
      }
    }

    // Fill missing concept slots up to target count
    for (let i = 1; i <= count; i++) {
      if (!nextState[i]) {
        nextState[i] = {
          title: `Design Concept #${i}`,
          notes: '',
          colorways: {}
        }
      }
      colors.forEach(col => {
        if (!nextState[i].colorways[col]) {
          nextState[i].colorways[col] = { photo_front: '', photo_back: '' }
        }
      })
    }

    setConceptsState(nextState)
    setActiveConceptTab(1)
    setActiveColorwayTab(colors[0])
  }, [activeBrief?.id])

  // Count ready colorways across all concepts
  const totalSlots = targetDesignsCount * targetColorsList.length
  let readySlotsCount = 0
  for (let i = 1; i <= targetDesignsCount; i++) {
    const cData = conceptsState[i]
    if (cData) {
      targetColorsList.forEach(col => {
        if (cData.colorways[col]?.photo_front?.trim()) {
          readySlotsCount++
        }
      })
    }
  }
  const completionPercentage = totalSlots > 0 ? Math.min(100, Math.round((readySlotsCount / totalSlots) * 100)) : 0

  // Quick concept handlers
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

  // Active brief submission handler
  async function handleSubmitAllConcepts(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrief) return

    // Build structured concepts list
    const conceptsPayload: DesignConceptItem[] = []
    let firstFrontPhoto = ''
    let firstBackPhoto = ''

    for (let i = 1; i <= targetDesignsCount; i++) {
      const cData = conceptsState[i]
      if (!cData) continue
      const colorwaysPayload: DesignConceptColorway[] = []
      targetColorsList.forEach(col => {
        const cw = cData.colorways[col]
        if (cw?.photo_front?.trim()) {
          if (!firstFrontPhoto) firstFrontPhoto = cw.photo_front.trim()
          if (!firstBackPhoto && cw.photo_back?.trim()) firstBackPhoto = cw.photo_back.trim()
          colorwaysPayload.push({
            color_name: col,
            photo_front: cw.photo_front.trim(),
            photo_back: cw.photo_back?.trim() || undefined
          })
        }
      })

      if (colorwaysPayload.length > 0 || cData.title.trim() || cData.notes.trim()) {
        conceptsPayload.push({
          concept_number: i,
          title: cData.title?.trim() || `Design Concept #${i}`,
          notes: cData.notes?.trim() || undefined,
          colorways: colorwaysPayload
        })
      }
    }

    if (conceptsPayload.length === 0 || !firstFrontPhoto) {
      toast.error('Please upload at least 1 design artwork mockup before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await submitDesignPhotosAction({
        brief_id: activeBrief.id,
        designer_member_id: activeBrief.designer_member_id,
        photo_url_1: firstFrontPhoto,
        photo_url_2: firstBackPhoto || undefined,
        designer_notes: conceptsState[1]?.notes || undefined,
        concepts: conceptsPayload,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`All ${conceptsPayload.length} design concepts submitted to Provisional Head!`)
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
      } else {
        toast.error(res.error || 'Failed to submit design concepts.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred submitting concepts.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFinalApproved = activeBrief?.status === 'SA_APPROVED' || activeBrief?.status === 'TECH_PACK_CREATED'
  const isEditable = !isFinalApproved
  const isSubmitted = activeBrief?.status === 'SUBMITTED' || activeBrief?.status === 'PH_APPROVED'

  const activeBriefsCount = briefs.filter(b => b.status === 'ALLOCATED' || b.status === 'PH_REJECTED' || (b.status === 'SUBMITTED' && (b.submissions_count || 0) < (b.target_designs || 1))).length
  const submittedBriefsCount = briefs.filter(b => b.status === 'SUBMITTED' || b.status === 'PH_APPROVED').length
  const approvedBriefsCount = briefs.filter(b => b.status === 'SA_APPROVED' || b.status === 'TECH_PACK_CREATED').length

  const currentConcept = conceptsState[activeConceptTab] || {
    title: `Design Concept #${activeConceptTab}`,
    notes: '',
    colorways: {}
  }
  const currentColorwayData = currentConcept.colorways[activeColorwayTab] || { photo_front: '', photo_back: '' }

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
              Apparel design briefs, multi-concept studio deck, and colorway submissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-bold text-[#3A3564] font-mono flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>{designerName || 'Designer'}</span>
            <span className="opacity-40">|</span>
            <span>+91 {designerPhone || (designerEmail.includes('@') ? designerEmail.split('@')[0] : designerEmail)}</span>
          </span>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Action Required
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-2">
            {activeBriefsCount} Briefs
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pending artwork &amp; colorway uploads
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
            Provisional Head &amp; Super Admin pipeline
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
            Greenlit for Tech-Pack generation
          </div>
        </div>
      </div>

      {briefs.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No design briefs allocated yet"
          description="Your Provisional Head has not assigned any active apparel briefs to your account. Check back soon."
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
                        <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span>{brief.category} Style</span>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-0.5 text-[#3A3564] font-bold font-mono">
                            <Target className="w-3 h-3" />
                            {brief.target_designs || 1} Designs
                          </span>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-0.5 font-mono">
                            <Palette className="w-3 h-3 text-slate-400" />
                            {brief.max_colors} Colors
                          </span>
                        </div>
                      </div>

                      <span className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold shrink-0 ${stCfg.badgeClass}`}>
                        {stCfg.label}
                      </span>
                    </div>

                    {brief.target_colors && brief.target_colors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {brief.target_colors.map((c, i) => {
                          const sw = getColorSwatchInfo(c)
                          return (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-black/10 font-mono text-slate-800 font-semibold shadow-2xs"
                            >
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0" 
                                style={{ backgroundColor: sw.bg }} 
                              />
                              <span>{c}</span>
                            </span>
                          )
                        })}
                      </div>
                    )}

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

          {/* Active Brief Detail & Multi-Concept Studio Deck */}
          {activeBrief && (
            <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-5">
              {/* Top Banner with Quota Progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                      {activeBrief.garment_type} ({activeBrief.category})
                    </h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-md border font-bold ${STATUS_CONFIG[activeBrief.status]?.badgeClass}`}>
                      {STATUS_CONFIG[activeBrief.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Brief ID: <span className="font-mono">{activeBrief.id.substring(0, 8)}</span> &bull; Assigned by Provisional Head
                  </p>
                </div>

                {/* Formula pill */}
                <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564]">
                  {targetDesignsCount} Designs &times; {targetColorsList.length} Colors = {totalSlots} Mockups
                </div>
              </div>

              {/* Status Note Banner */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-xl border border-black/10 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#3A3564] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3A3564]">Studio Workflow Target:</span>
                    <span className="font-mono font-bold text-slate-700">{readySlotsCount} of {totalSlots} Mockups Ready ({completionPercentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5 border border-black/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${completionPercentage >= 100 ? 'bg-emerald-500' : 'bg-[#3A3564]'}`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target Palette Swatches */}
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Palette className="w-3.5 h-3.5 text-[#3A3564]" />
                  <span>Colorway Palette ({targetColorsList.length} Colors):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {targetColorsList.map((col, idx) => {
                    const sw = getColorSwatchInfo(col)
                    return (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-black/10 font-mono text-xs font-bold text-slate-900 shadow-2xs"
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-black/20" 
                          style={{ backgroundColor: sw.bg }} 
                        />
                        <span>{col}</span>
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Instructions Banner if available */}
              {activeBrief.instructions && (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-800">Creative Guidelines &amp; Instructions:</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-black/5 text-slate-700 leading-relaxed italic">
                    &ldquo;{activeBrief.instructions}&rdquo;
                  </div>
                </div>
              )}

              {/* Rejection Feedback alert */}
              {activeBrief.status === 'PH_REJECTED' && activeBrief.latest_submission?.ph_feedback && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                    <XCircle className="w-4 h-4" />
                    <span>Revision Feedback from Provisional Head:</span>
                  </div>
                  <p className="text-rose-900 italic">&ldquo;{activeBrief.latest_submission.ph_feedback}&rdquo;</p>
                  <p className="text-rose-700 font-medium pt-1">Please update the design mockups in the deck below and resubmit.</p>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MULTI-DESIGN CONCEPT STUDIO TABS */}
              {/* ========================================================================= */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#3A3564]" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Design Concepts Deck ({targetDesignsCount} Required)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Tab {activeConceptTab} of {targetDesignsCount}
                  </span>
                </div>

                {/* Concept Tabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-black/10 pb-3">
                  {Array.from({ length: targetDesignsCount }).map((_, idx) => {
                    const cNum = idx + 1
                    const isTabActive = activeConceptTab === cNum
                    const cData = conceptsState[cNum]
                    const readyForThisConcept = targetColorsList.filter(col => cData?.colorways[col]?.photo_front?.trim()).length
                    const isFullyDone = readyForThisConcept >= targetColorsList.length

                    return (
                      <button
                        key={cNum}
                        type="button"
                        onClick={() => {
                          setActiveConceptTab(cNum)
                          setActiveColorwayTab(targetColorsList[0])
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer shadow-2xs border ${
                          isTabActive
                            ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564]'
                            : isFullyDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
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
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          isTabActive ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-600'
                        }`}>
                          {readyForThisConcept}/{targetColorsList.length}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Active Concept Editing Card */}
                <div className="bg-[#FAF7F0]/60 p-4 sm:p-5 rounded-2xl border border-black/10 space-y-4">
                  {/* Concept Title */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Design Concept #{activeConceptTab} Title / Theme
                    </label>
                    <input
                      type="text"
                      disabled={!isEditable}
                      placeholder={`e.g. ${activeBrief.garment_type} Graphic Print Variant #${activeConceptTab}`}
                      value={currentConcept.title}
                      onChange={e => handleUpdateConceptField(activeConceptTab, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3A3564] text-xs"
                    />
                  </div>

                  {/* Colorway Sub-Selector for this Concept */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1.5 text-xs flex items-center justify-between">
                      <span>Select Colorway to Upload Mockups:</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        Upload artwork on each fabric color
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {targetColorsList.map((colName) => {
                        const sw = getColorSwatchInfo(colName)
                        const isColorSelected = activeColorwayTab === colName
                        const hasPhoto = !!currentConcept.colorways[colName]?.photo_front?.trim()

                        return (
                          <button
                            key={colName}
                            type="button"
                            onClick={() => setActiveColorwayTab(colName)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                              isColorSelected
                                ? 'bg-white text-[#3A3564] border-[#3A3564] ring-2 ring-[#3A3564]/15'
                                : hasPhoto
                                ? 'bg-emerald-50/80 text-emerald-900 border-emerald-200'
                                : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
                            }`}
                          >
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" 
                              style={{ backgroundColor: sw.bg }} 
                            />
                            <span>{colName} Colorway</span>
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

                  {/* Dual Photo Upload Slots for Selected Colorway */}
                  <div className="bg-white p-4 rounded-xl border border-black/10 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#3A3564]" />
                        Mockup Photos for [{activeColorwayTab} Base {activeBrief.garment_type}]
                      </span>
                      {currentColorwayData.photo_front && (
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Front Mockup Ready
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photo 1: Front / Primary Mockup */}
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

                      {/* Photo 2: Back / Detail Mockup */}
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

                  {/* Fabric & Technique Notes */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1 text-xs">
                      Fabric, Stitch &amp; Print Technique Notes for Design #{activeConceptTab}
                    </label>
                    <textarea
                      rows={2}
                      disabled={!isEditable}
                      placeholder="e.g. High-density screen print on chest, oversized fit, drop shoulder silhouette..."
                      value={currentConcept.notes}
                      onChange={e => handleUpdateConceptField(activeConceptTab, 'notes', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564] text-xs"
                    />
                  </div>
                </div>

                {/* Submission & Action Section */}
                {isEditable ? (
                  <div className="space-y-3 pt-2">
                    {isSubmitted && (
                      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>
                            <strong>Review Pipeline Active:</strong> {readySlotsCount} of {totalSlots} mockups uploaded. You can continue uploading the remaining colorways and click <em>&ldquo;Save &amp; Sync to Head&rdquo;</em> anytime.
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-800 shrink-0">
                          {readySlotsCount}/{totalSlots} Ready
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSubmitAllConcepts}>
                      <button
                        type="submit"
                        disabled={isSubmitting || readySlotsCount === 0}
                        className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                          readySlotsCount >= totalSlots
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : isSubmitted
                            ? 'bg-[#3A3564] hover:bg-[#2A2649] text-[#FAF7F0]'
                            : 'bg-[#3A3564] hover:bg-[#2A2649] text-[#FAF7F0]'
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        <span>
                          {readySlotsCount >= totalSlots
                            ? `Submit Complete Studio Deck (${readySlotsCount}/${totalSlots} Mockups) to Provisional Head`
                            : isSubmitted
                            ? `Save & Sync Updated Mockups (${readySlotsCount}/${totalSlots} Ready) to Provisional Head`
                            : `Submit Ready Mockups (${readySlotsCount}/${totalSlots}) to Provisional Head`}
                        </span>
                      </button>
                      <p className="text-[11px] text-center text-slate-400 mt-2">
                        {readySlotsCount >= totalSlots
                          ? 'All required design concepts and colorways are attached and ready for provisional review.'
                          : `You can submit individual colorways as you finish them (${readySlotsCount} of ${totalSlots} completed so far).`}
                      </p>
                    </form>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>This style has been officially greenlit by Super Admin and moved to Tech-Pack generation.</span>
                  </div>
                )}
              </div>
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
          <div className="relative max-w-4xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl">
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
