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
  Loader2, 
  Image as ImageIcon,
  Layers,
  Trash2,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Link2,
  X,
  Target,
  Shirt
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
      {/* Palm and 4 fingers outline */}
      <path d="M18 11V6a2 2 0 0 0-4 0v4" />
      <path d="M14 10V4a2 2 0 0 0-4 0v7" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6.2-3.1L3.3 15.7a1.5 1.5 0 0 1 2.3-1.9l2.4 2.2V6" />
      {/* Subtle waving motion arcs */}
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

const STATUS_CONFIG: Record<BriefStatus, { label: string; badgeClass: string; desc: string }> = {
  ALLOCATED: { label: 'Pending Upload', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Ready for concept & mockup uploads.' },
  SUBMITTED: { label: 'In Review', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold', desc: 'Under review by Provisional Head.' },
  PH_APPROVED: { label: 'PH Approved', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-semibold', desc: 'Provisional Head approved. Awaiting Super Admin greenlight.' },
  PH_REJECTED: { label: 'Revisions Needed', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold', desc: 'Revision feedback provided.' },
  SA_APPROVED: { label: 'Greenlit', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold', desc: 'Greenlit for production.' },
  SA_SAVED_FOR_LATER: { label: 'Saved for Later', badgeClass: 'bg-[#FAF7F0] text-[#3A3564] border-black/10 font-semibold', desc: 'Saved for upcoming season.' },
  TECH_PACK_CREATED: { label: 'Tech-Pack Created', badgeClass: 'bg-[#FAF7F0] text-slate-900 border-black/15 font-bold', desc: 'Tech-pack generated.' }
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
        <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
          {label} {isRequired && <span className="text-rose-500">*</span>}
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
            placeholder="https://..."
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
          <div className="aspect-video w-full rounded-xl border border-black/10 overflow-hidden bg-slate-100 relative group shadow-2xs">
            <img
              src={photoUrl}
              alt={`${colorwayName} ${label}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => onPreview(photoUrl)}
                className="px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-900 text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
                title="Zoom Lightbox"
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
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-bold font-mono">Loading Mockup...</span>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-white border border-black/10 shadow-2xs flex items-center justify-center mb-1.5 text-[#3A3564]">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 block font-sans">
                {isDragging ? 'Drop Image Here' : 'Click to Upload Artwork'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
                PNG, JPG, WEBP • Drag &amp; Drop or Paste
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
  
  // Navigation State: null = Screen 1 (Dashboard Overview); string = Screen 2 (Dedicated Assignment Page)
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null)
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
        toast.success(`Design submission sent for Provisional Head review!`)
        setBriefs(prev => prev.map(b => b.id === activeBrief.id ? { 
          ...b, 
          status: 'SUBMITTED',
          latest_submission: res.data!
        } : b))
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

  // =========================================================================
  // SCREEN 2: DEDICATED ASSIGNMENT WORKSPACE (When a Brief is Clicked)
  // =========================================================================
  if (activeBrief) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
        {/* Layer 1: Breadcrumb Hierarchy Trail */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <button 
            type="button" 
            onClick={() => setSelectedBriefId(null)}
            className="hover:text-[#3A3564] transition-colors cursor-pointer"
          >
            Allocations
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900">{activeBrief.garment_type}</span>
          <span>/</span>
          <span className="font-mono text-slate-500">#{activeBrief.id.substring(0, 6)}</span>
        </div>

        {/* Layer 2: Encapsulated Top Header Card with Back Button */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => setSelectedBriefId(null)}
              className="w-11 h-11 rounded-xl bg-[#FAF7F0] hover:bg-slate-100 border border-black/10 flex items-center justify-center text-[#3A3564] transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Back to Allocations"
            >
              <ArrowLeft className="w-5 h-5 text-[#3A3564]" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  {activeBrief.garment_type} ({activeBrief.category})
                </h1>
                <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${STATUS_CONFIG[activeBrief.status]?.badgeClass}`}>
                  {STATUS_CONFIG[activeBrief.status]?.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Target: <span className="font-mono font-bold text-[#3A3564]">{targetDesignsCount} Designs</span> &times; <span className="font-mono font-bold text-[#3A3564]">{targetColorsList.length} Colors</span> = <span className="font-mono font-bold text-slate-900">{totalSlots} Mockups</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedBriefId(null)}
              className="px-3.5 py-2 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Layer 3: Palette & Guidelines Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs space-y-3">
          {/* Target Colorway Palette */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700 font-mono uppercase tracking-wider text-[11px]">
              Assigned Colors ({targetColorsList.length}):
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

          {/* Instructions note if present */}
          {activeBrief.instructions && (
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 text-xs text-slate-700 italic">
              &ldquo;{activeBrief.instructions}&rdquo;
            </div>
          )}

          {/* Revision Feedback alert if rejected */}
          {activeBrief.status === 'PH_REJECTED' && activeBrief.latest_submission?.ph_feedback && (
            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold font-mono">
                <XCircle className="w-4 h-4" />
                <span>Revision Feedback:</span>
              </div>
              <p className="text-rose-900 italic">&ldquo;{activeBrief.latest_submission.ph_feedback}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Layer 4 & 5: Multi-Concept Deck Container */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-[family-name:var(--font-heading)]">
              <Layers className="w-4 h-4 text-[#3A3564]" />
              <span>Design Concepts Deck ({targetDesignsCount} Required)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Concept {activeConceptTab} of {targetDesignsCount}
            </span>
          </div>

          {/* Concept Tabs Header */}
          <div className="flex flex-wrap gap-2 pb-2">
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
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isTabActive ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-600'
                  }`}>
                    {readyForThisConcept}/{targetColorsList.length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Concept Card */}
          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-2xl border border-black/10 space-y-4">
            {/* Concept Title */}
            <div>
              <label className="block text-xs sm:text-[13px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Design Concept #{activeConceptTab} Title / Theme
              </label>
              <input
                type="text"
                disabled={!isEditable}
                placeholder={`e.g. Graphic Variant #${activeConceptTab}`}
                value={currentConcept.title}
                onChange={e => handleUpdateConceptField(activeConceptTab, 'title', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all"
              />
            </div>

            {/* Colorway Sub-Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5 flex items-center justify-between">
                <span>Fabric Colorway</span>
                <span className="text-[11px] font-normal text-slate-500 font-sans">
                  Select color to attach artwork
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
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0" 
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

            {/* Front & Back Artwork Dropzones */}
            <div className="bg-white p-4 rounded-xl border border-black/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-3.5 h-3.5 text-[#3A3564]" />
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

            {/* Fabric / Print Technique Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Fabric &amp; Print Notes (Optional)
              </label>
              <textarea
                rows={2}
                disabled={!isEditable}
                placeholder="e.g. High-density screen print, oversized fit, drop shoulder silhouette..."
                value={currentConcept.notes}
                onChange={e => handleUpdateConceptField(activeConceptTab, 'notes', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Submit Action Area */}
          {isEditable ? (
            <div className="pt-2">
              <form onSubmit={handleSubmitAllConcepts}>
                <button
                  type="submit"
                  disabled={isSubmitting || readySlotsCount === 0}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50 ${
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
                    {readySlotsCount >= totalSlots
                      ? `Submit Complete Deck (${readySlotsCount}/${totalSlots}) for Review`
                      : isSubmitted
                      ? `Save & Sync Mockups (${readySlotsCount}/${totalSlots}) to Head`
                      : `Submit Ready Mockups (${readySlotsCount}/${totalSlots}) for Review`}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This style has been approved for production.</span>
            </div>
          )}
        </div>

        {/* Lightbox Preview */}
        {previewPhoto && (
          <div 
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl border border-black/10">
              <img 
                src={previewPhoto} 
                alt="Full View" 
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

  // =========================================================================
  // SCREEN 1: DASHBOARD OVERVIEW (Allocations List)
  // =========================================================================
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <span>Design Studio</span>
        <span>/</span>
        <span>Workspaces</span>
        <span>/</span>
        <span className="font-bold text-slate-900">Designer Desk</span>
      </div>

      {/* Layer 2: Encapsulated Top Header Card with Waving Hand Outline SVG */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
            <WavingHandOutlineIcon className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Welcome, {designerName || 'Designer'}
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {briefs.length} Briefs Assigned
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Your assigned apparel design briefs, concept decks, and colorway submissions
            </p>
          </div>
        </div>

        {/* Designer contact badge */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            +91 {designerPhone || (designerEmail.includes('@') ? designerEmail.split('@')[0] : designerEmail)}
          </span>
        </div>
      </div>

      {/* Layer 3: Executive KPI Metric Cards (Grid of 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              STAGE 01
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Allocations
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Pending concept uploads</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-slate-900">
              {activeBriefsCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              To Submit
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              STAGE 02
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              In Verification Review
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Head &amp; Admin pipeline</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-amber-600">
              {submittedBriefsCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Under Review
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              STAGE 03
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Approved for Production
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Tech-Pack greenlighted</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-[28px] font-bold font-[family-name:var(--font-heading)] text-emerald-600">
              {approvedBriefsCount}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Greenlit
            </span>
          </div>
        </div>
      </div>

      {/* Layer 4 & 5: Work Allotted Ledger Cards */}
      {briefs.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="No design briefs allocated yet"
          description="Your Provisional Head has not assigned any apparel briefs yet. Check back soon."
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
              Allocated Work ({briefs.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium font-sans">
              Click any work card to open assignment workspace
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {briefs.map(brief => {
              const stCfg = STATUS_CONFIG[brief.status] || STATUS_CONFIG.ALLOCATED

              return (
                <div
                  key={brief.id}
                  onClick={() => setSelectedBriefId(brief.id)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 hover:border-[#3A3564] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg font-[family-name:var(--font-heading)] group-hover:text-[#3A3564] transition-colors leading-tight">
                          {brief.garment_type}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {brief.category} Style
                        </p>
                      </div>

                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${stCfg.badgeClass}`}>
                        {stCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                      <span className="font-bold text-[#3A3564]">{brief.target_designs || 1} Designs</span>
                      <span>&bull;</span>
                      <span>{brief.max_colors} Colors</span>
                    </div>

                    {/* Colorway Swatches */}
                    {brief.target_colors && brief.target_colors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {brief.target_colors.map((c, idx) => {
                          const sw = getColorSwatchInfo(c)
                          return (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 font-mono text-slate-800 font-medium"
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

                    {/* Brief Instructions Snippet */}
                    {brief.instructions && (
                      <p className="text-xs text-slate-600 line-clamp-2 italic pt-1">
                        &ldquo;{brief.instructions}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Action Link Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3A3564]">
                    <span className="font-mono text-[11px] text-slate-400 font-normal">
                      #{brief.id.substring(0, 6)}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-bold">
                      Open Work Assignment <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
