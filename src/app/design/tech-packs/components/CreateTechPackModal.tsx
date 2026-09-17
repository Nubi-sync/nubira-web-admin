'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Layers, 
  Tag, 
  Scissors, 
  Palette, 
  Package, 
  Plus, 
  Trash2, 
  Eye, 
  Info,
  CheckCircle2,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  TechPack, 
  GarmentCategory, 
  SizeSystem, 
  EmbellishmentSequence, 
  SeamClass, 
  TechPackMaterialRequirement, 
  AvailableArticleOption 
} from '../../types/design'
import { saveStoredTechPack } from '../../utils/designStorage'
import { createTechPackAction, fetchApprovedArticlesForTechPackAction } from '../../actions'

interface CreateTechPackModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (techPack: TechPack) => void
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
  availableArticles?: AvailableArticleOption[]
  existingTechPacks?: TechPack[]
}

const CATEGORIES: GarmentCategory[] = ['Hoodie', 'T-Shirt', 'Polo', 'Jogger', 'Jacket', 'Kids Romper', 'Suit', 'Pant', 'Ethnic']
const BRANDS = ['DIRECT CLIENT', 'PRIVATE LABEL', 'GLOBAL BRAND']

const GARMENT_DEFAULTS: Record<string, { gsm: number; fabric: string; seam: SeamClass; base: string }> = {
  'T-Shirt': { gsm: 180, fabric: '100% Combed Cotton Single Jersey', seam: 'ISO 4915 Class 504 (Overlock)', base: 'M' },
  'Hoodie': { gsm: 360, fabric: '3-End French Terry 360 GSM Brushed Inside', seam: 'ISO 4915 Class 504 (Overlock)', base: 'M' },
  'Polo': { gsm: 220, fabric: '100% Cotton Pique Double Knit', seam: 'ISO 4915 Class 401 (Chainstitch)', base: 'M' },
  'Suit': { gsm: 260, fabric: 'Super 120s Wool Worsted', seam: 'ISO 4915 Class 401 (Chainstitch)', base: 'M' },
  'Pant': { gsm: 280, fabric: '98% Cotton 2% Elastane Twill', seam: 'ISO 4915 Class 401 (Chainstitch)', base: '32' },
  'Jogger': { gsm: 320, fabric: 'Cotton Elastane Loopback Fleece', seam: 'ISO 4915 Class 504 (Overlock)', base: 'M' },
  'Jacket': { gsm: 300, fabric: 'Polyester Shell with Quilted Lining', seam: 'ISO 4915 Class 401 (Chainstitch)', base: 'L' },
  'Kids Romper': { gsm: 160, fabric: '100% Organic Interlock Cotton', seam: 'ISO 4915 Class 607 (Flatlock)', base: '4T' },
  'Ethnic': { gsm: 200, fabric: 'Pure Raw Silk / Chanderi Cotton Blend', seam: 'ISO 4915 Class 401 (Chainstitch)', base: 'M' }
}

const SIZE_SYSTEMS: { label: string; value: SizeSystem; defaultBase: string }[] = [
  { label: 'Adult Unisex Alpha (XS–3XL)', value: 'ALPHA_ADULT', defaultBase: 'M' },
  { label: 'Toddler & Kids (2T–14)', value: 'KIDS_AGE', defaultBase: '4T' },
  { label: 'Numeric Waist Jeans/Trousers (28–42)', value: 'NUMERIC_WAIST', defaultBase: '32' },
  { label: 'Plus Size Silhouette (1X–5X)', value: 'PLUS_SIZE', defaultBase: '2X' },
]

const EMBELLISHMENT_SEQUENCES: { label: string; value: EmbellishmentSequence }[] = [
  { label: 'No Embroidery, No Printing', value: 'NONE' },
  { label: 'Only Printing', value: 'ONLY_PRINTING' },
  { label: 'Only Embroidery', value: 'ONLY_EMBROIDERY' },
  { label: 'Embroidery First, Then Printing', value: 'EMBROIDERY_FIRST_THEN_PRINT' },
  { label: 'Printing First, Then Embroidery', value: 'PRINT_FIRST_THEN_EMBROIDERY' },
]

const SEAM_CLASSES: SeamClass[] = [
  'ISO 4915 Class 401 (Chainstitch)',
  'ISO 4915 Class 504 (Overlock)',
  'ISO 4915 Class 607 (Flatlock)'
]

function mapToCategory(val: string): GarmentCategory {
  const norm = (val || '').toUpperCase()
  if (norm.includes('HOODIE')) return 'Hoodie'
  if (norm.includes('TSHIRT') || norm.includes('T-SHIRT') || norm.includes('TEE')) return 'T-Shirt'
  if (norm.includes('POLO')) return 'Polo'
  if (norm.includes('JOGGER')) return 'Jogger'
  if (norm.includes('JACKET')) return 'Jacket'
  if (norm.includes('ROMPER')) return 'Kids Romper'
  if (norm.includes('SUIT')) return 'Suit'
  if (norm.includes('PANT')) return 'Pant'
  if (norm.includes('ETHNIC')) return 'Ethnic'
  return 'T-Shirt'
}

function getColorSwatchInfo(colorName?: string): { bg: string } {
  if (!colorName) return { bg: '#e2e8f0' }
  const c = colorName.toLowerCase()
  if (c.includes('black')) return { bg: '#18181b' }
  if (c.includes('white')) return { bg: '#f8fafc' }
  if (c.includes('red') || c.includes('crimson') || c.includes('maroon') || c.includes('burgundy')) return { bg: '#e11d48' }
  if (c.includes('navy')) return { bg: '#1e293b' }
  if (c.includes('blue') || c.includes('royal')) return { bg: '#2563eb' }
  if (c.includes('green') || c.includes('olive') || c.includes('sage') || c.includes('emerald')) return { bg: '#15803d' }
  if (c.includes('yellow') || c.includes('mustard') || c.includes('gold')) return { bg: '#ca8a04' }
  if (c.includes('orange') || c.includes('rust')) return { bg: '#ea580c' }
  if (c.includes('purple') || c.includes('lavender') || c.includes('violet') || c.includes('plum')) return { bg: '#7c3aed' }
  if (c.includes('pink') || c.includes('rose') || c.includes('blush') || c.includes('coral')) return { bg: '#db2777' }
  if (c.includes('brown') || c.includes('tan') || c.includes('khaki') || c.includes('beige') || c.includes('camel')) return { bg: '#78350f' }
  if (c.includes('grey') || c.includes('gray') || c.includes('charcoal') || c.includes('heather')) return { bg: '#475569' }
  if (c.includes('teal') || c.includes('cyan')) return { bg: '#0d9488' }
  return { bg: '#cbd5e1' }
}

export function CreateTechPackModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  availableBrands,
  availableArticles = [],
  existingTechPacks = []
}: CreateTechPackModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [articlesList, setArticlesList] = useState<AvailableArticleOption[]>(availableArticles)
  const [selectedArtKey, setSelectedArtKey] = useState<string>('')
  const [selectedArticle, setSelectedArticle] = useState<AvailableArticleOption | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  const brandsList = (availableBrands && availableBrands.length > 0) ? availableBrands.map(b => b.brand_name) : BRANDS

  // Form State
  const [styleNumber, setStyleNumber] = useState('')
  const [styleName, setStyleName] = useState('')
  const [brandName, setBrandName] = useState(brandsList[0] || 'DIRECT CLIENT')
  const [category, setCategory] = useState<GarmentCategory>('Hoodie')
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('ALPHA_ADULT')
  const [baseSize, setBaseSize] = useState('M')
  const [fabricComposition, setFabricComposition] = useState('3-End French Terry 360 GSM Brushed Inside')
  const [targetGsm, setTargetGsm] = useState<number>(360)
  const [embellishmentSeq, setEmbellishmentSeq] = useState<EmbellishmentSequence>('NONE')
  const [spi, setSpi] = useState<number>(12)
  const [seamClass, setSeamClass] = useState<SeamClass>('ISO 4915 Class 504 (Overlock)')
  const [cadFrontUrl, setCadFrontUrl] = useState<string | undefined>()
  const [cadBackUrl, setCadBackUrl] = useState<string | undefined>()
  const [submissionId, setSubmissionId] = useState<string | undefined>()
  const [additionalInstructions, setAdditionalInstructions] = useState('')
  const [materials, setMaterials] = useState<TechPackMaterialRequirement[]>([])

  // 4 boxes state for adding new BOM item
  const [newMatType, setNewMatType] = useState('')
  const [newMatName, setNewMatName] = useState('')
  const [newMatConsumption, setNewMatConsumption] = useState('')
  const [newMatPlacement, setNewMatPlacement] = useState('')

  const [targetCutDate, setTargetCutDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })

  // Load articles if not provided or refreshed
  useEffect(() => {
    if (isOpen) {
      fetchApprovedArticlesForTechPackAction().then(res => {
        if (res) setArticlesList(res)
      })
    } else if (availableArticles && availableArticles.length > 0) {
      setArticlesList(availableArticles)
    }
  }, [isOpen, availableArticles])

  // Filter out any articles that already have a tech pack created
  const unassignedArticles: AvailableArticleOption[] = useMemo(() => {
    const existingStyles = new Set(
      (existingTechPacks || []).map(tp => (tp.style_number || '').trim().toUpperCase()).filter(Boolean)
    )
    return articlesList.filter((a: AvailableArticleOption) => !existingStyles.has(a.art_number.trim().toUpperCase()))
  }, [articlesList, existingTechPacks])

  // Handle article selection from dropdown
  function handleSelectArticle(artKey: string) {
    setSelectedArtKey(artKey)
    if (!artKey || artKey === '__CUSTOM__') {
      setSelectedArticle(null)
      if (artKey === '__CUSTOM__') {
        setStyleNumber('')
      }
      return
    }

    const art = articlesList.find(a => a.id === artKey || a.art_number === artKey)
    if (!art) return

    setSelectedArticle(art)
    setStyleNumber(art.art_number)
    
    const cat = mapToCategory(art.garment_type)
    setCategory(cat)
    
    const colorPart = art.color_name ? ` • ${art.color_name} Colorway` : ''
    setStyleName(`${art.garment_type} (${art.category_style}${colorPart})`)

    const defaults = GARMENT_DEFAULTS[cat]
    if (defaults) {
      setTargetGsm(defaults.gsm)
      setFabricComposition(defaults.fabric)
      setSeamClass(defaults.seam)
      if (cat === 'Pant') {
        setSizeSystem('NUMERIC_WAIST')
        setBaseSize('32')
      } else if (cat === 'Kids Romper') {
        setSizeSystem('KIDS_AGE')
        setBaseSize('4T')
      } else {
        setSizeSystem('ALPHA_ADULT')
        setBaseSize(defaults.base || 'M')
      }
    }

    if (art.photo_front) setCadFrontUrl(art.photo_front)
    if (art.photo_back) setCadBackUrl(art.photo_back)
    if (art.submission_id) setSubmissionId(art.submission_id)

    // Clear any errors
    setErrors(prev => ({ ...prev, styleNumber: '', styleName: '' }))
  }

  function handleCategoryChange(cat: GarmentCategory) {
    setCategory(cat)
    const defaults = GARMENT_DEFAULTS[cat]
    if (defaults) {
      setTargetGsm(defaults.gsm)
      setFabricComposition(defaults.fabric)
      setSeamClass(defaults.seam)
      if (cat === 'Pant') {
        setSizeSystem('NUMERIC_WAIST')
        setBaseSize('32')
      } else if (cat === 'Kids Romper') {
        setSizeSystem('KIDS_AGE')
        setBaseSize('4T')
      }
    }
  }

  function handleSizeSystemChange(sys: SizeSystem) {
    setSizeSystem(sys)
    const found = SIZE_SYSTEMS.find(s => s.value === sys)
    if (found) {
      setBaseSize(found.defaultBase)
    }
  }

  // Material helpers
  function handleAddNewMaterial() {
    if (!newMatType.trim() && !newMatName.trim()) {
      toast.error('Please enter a component type or item description')
      return
    }
    const newMat: TechPackMaterialRequirement = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      component_type: newMatType.trim() || 'Material',
      item_name: newMatName.trim() || '-',
      specification: '',
      consumption: newMatConsumption.trim() || '1 Pcs',
      placement: newMatPlacement.trim() || '-'
    }
    setMaterials(prev => [...prev, newMat])
    setNewMatType('')
    setNewMatName('')
    setNewMatConsumption('')
    setNewMatPlacement('')
  }

  function handleUpdateMaterial(id: string, field: keyof TechPackMaterialRequirement, value: string) {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  function handleDeleteMaterial(id: string) {
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {}
    if (!styleNumber.trim()) {
      errs.styleNumber = 'Please select an Article Number or enter a valid style code.'
    }
    if (!styleName.trim()) {
      errs.styleName = 'Style description is required.'
    }
    if (!fabricComposition.trim()) {
      errs.fabricComposition = 'Fabric composition is required.'
    }
    if (!targetGsm || targetGsm < 60 || targetGsm > 700) {
      errs.targetGsm = 'Valid GSM between 60 and 700 required.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {}
    if (!spi || spi < 8 || spi > 20) {
      errs.spi = 'Stitches per inch must be between 8 and 20.'
    }
    if (!targetCutDate) {
      errs.targetCutDate = 'Target cut date is required.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    }
  }

  async function handleSubmit() {
    if (!validateStep2()) return
    setIsSubmitting(true)

    const matchedBrand = availableBrands?.find(b => b.brand_name === brandName)

    const res = await createTechPackAction({
      style_number: styleNumber.trim().toUpperCase(),
      style_name: styleName.trim(),
      brand_name: brandName,
      brand_id: matchedBrand?.id,
      category,
      size_system: sizeSystem,
      base_size: baseSize,
      fabric_composition: fabricComposition.trim(),
      target_gsm: Number(targetGsm),
      embellishment_sequence: embellishmentSeq,
      spi: Number(spi),
      seam_class: seamClass,
      cad_front_url: cadFrontUrl,
      cad_back_url: cadBackUrl,
      design_submission_id: submissionId,
      materials,
      instructions: additionalInstructions.trim() || undefined,
      target_cut_date: targetCutDate
    })

    setIsSubmitting(false)

    if (res.success && res.data) {
      saveStoredTechPack(res.data)
      toast.success(`Tech-Pack ${res.data.style_number} created with BOM and specifications!`)
      onCreated?.(res.data)
      onClose()
    } else {
      toast.error(res.error || 'Failed to create tech pack in Supabase.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Create Production Tech-Pack
              </h2>
              <p className="text-xs text-slate-600">
                Generate production specification with BOM, trims, stitches &amp; CAD coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
              step === 1 ? 'bg-[#3A3564] text-white' : 'bg-emerald-600 text-white'
            }`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-[#3A3564]' : 'text-slate-700'}`}>
              Article Selection, BOM &amp; Instructions
            </span>
          </div>

          <div className="w-16 h-0.5 bg-slate-200 mx-2">
            <div className={`h-full bg-[#3A3564] transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
              step === 2 ? 'bg-[#3A3564] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-[#3A3564]' : 'text-slate-400'}`}>
              CAD Grading &amp; Seam Engineering
            </span>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900">
          {step === 1 ? (
            <div className="space-y-6">

              {/* 1. Article Selection Dropdown */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#3A3564]" />
                    <span>Select Approved Article Number (Art #) *</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {unassignedArticles.length} Available Articles
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedArtKey}
                    onChange={e => handleSelectArticle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Choose Article Number from Design Studio --</option>
                    {unassignedArticles.map(art => (
                      <option key={art.id} value={art.id}>
                        {art.art_number} — {art.garment_type} ({art.category_style}{art.color_name ? ` • ${art.color_name}` : ''})
                      </option>
                    ))}
                    <option value="__CUSTOM__">➕ Enter Custom Style / Article Number Manually</option>
                  </select>
                </div>

                {errors.styleNumber && (
                  <p className="text-xs text-rose-600 font-medium">{errors.styleNumber}</p>
                )}

                {/* Pop-up Article Showcase Banner if selected */}
                {selectedArticle && (
                  <div className="mt-3 p-3.5 bg-white rounded-xl border border-black/10 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Artwork Mockup Photos */}
                    <div className="flex items-center gap-2 shrink-0">
                      {selectedArticle.photo_front ? (
                        <div 
                          onClick={() => setPreviewPhoto(selectedArticle.photo_front!)}
                          className="w-16 h-16 rounded-xl border border-black/10 bg-[#FAF7F0] overflow-hidden cursor-pointer relative group p-1 flex items-center justify-center shadow-2xs"
                          title="Click to zoom Front Mockup"
                        >
                          <img 
                            src={selectedArticle.photo_front} 
                            alt="Front Mockup" 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          No Photo
                        </div>
                      )}

                      {selectedArticle.photo_back && (
                        <div 
                          onClick={() => setPreviewPhoto(selectedArticle.photo_back!)}
                          className="w-16 h-16 rounded-xl border border-black/10 bg-[#FAF7F0] overflow-hidden cursor-pointer relative group p-1 flex items-center justify-center shadow-2xs"
                          title="Click to zoom Back Mockup"
                        >
                          <img 
                            src={selectedArticle.photo_back} 
                            alt="Back Mockup" 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Article Details & Badges */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                          {selectedArticle.art_number}
                        </span>
                        <span className="text-xs font-bold text-[#3A3564]">
                          {selectedArticle.garment_type}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({selectedArticle.category_style})
                        </span>
                        {selectedArticle.color_name && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <span 
                              className="w-2 h-2 rounded-full border border-black/20" 
                              style={{ backgroundColor: getColorSwatchInfo(selectedArticle.color_name).bg }} 
                            />
                            <span>{selectedArticle.color_name}</span>
                          </span>
                        )}
                      </div>

                      {selectedArticle.designer_name && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          Designer: <span className="font-semibold text-slate-700">{selectedArticle.designer_name}</span>
                        </p>
                      )}

                      {selectedArticle.designer_notes && (
                        <p className="text-xs text-slate-600 italic line-clamp-2">
                          &ldquo;{selectedArticle.designer_notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Style Code & Basic Garment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                    Style / Art Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DEMO-102"
                    value={styleNumber}
                    onChange={e => setStyleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                    Garment Product Type *
                  </label>
                  <select
                    value={category}
                    onChange={e => handleCategoryChange(e.target.value as GarmentCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Style Commercial Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                  Style Description / Commercial Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavyweight Cotton French Terry Hoodie"
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
                {errors.styleName && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.styleName}</p>
                )}
              </div>

              {/* Shell Fabric & Target GSM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                    Shell Fabric Composition *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Combed Cotton Single Jersey"
                    value={fabricComposition}
                    onChange={e => setFabricComposition(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                  {errors.fabricComposition && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{errors.fabricComposition}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase font-mono mb-1.5">
                    Target Weight (GSM) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetGsm}
                      onChange={e => setTargetGsm(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                    />
                    <span className="absolute right-3.5 top-2 text-[10px] font-mono text-slate-400 font-bold">GSM</span>
                  </div>
                </div>
              </div>

              {/* 3. NEW SECTION: Required Materials & Bill of Materials (BOM) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#3A3564]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                      Bill of Materials (BOM) &amp; Trims Required
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] px-2 py-0.5 rounded border border-black/10">
                      {materials.length} Items
                    </span>
                  </div>
                </div>

                {/* 4 Input Boxes + Add Button */}
                <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-black/10 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Component Type
                      </label>
                      <input
                        type="text"
                        value={newMatType}
                        onChange={e => setNewMatType(e.target.value)}
                        placeholder="e.g. Ribbon, Collar, Label"
                        className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewMaterial() } }}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Item Description / Spec
                      </label>
                      <input
                        type="text"
                        value={newMatName}
                        onChange={e => setNewMatName(e.target.value)}
                        placeholder="e.g. 1x1 Cotton Spandex Rib 380 GSM"
                        className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewMaterial() } }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Consumption / Qty
                      </label>
                      <input
                        type="text"
                        value={newMatConsumption}
                        onChange={e => setNewMatConsumption(e.target.value)}
                        placeholder="e.g. 1 Pcs, 0.35 Mtr"
                        className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewMaterial() } }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Placement
                      </label>
                      <input
                        type="text"
                        value={newMatPlacement}
                        onChange={e => setNewMatPlacement(e.target.value)}
                        placeholder="e.g. Neck Seam, Placket"
                        className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewMaterial() } }}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddNewMaterial}
                        className="w-full h-[38px] flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        title="Add Material to Table"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materials List Table */}
                {materials.length === 0 ? (
                  <div className="py-6 text-center bg-white rounded-2xl border border-dashed border-black/15 p-4">
                    <p className="text-xs text-slate-500 font-medium">No materials added yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fill the 4 boxes above and click &quot;+&quot; to add them to this table.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F0] border-b border-black/10 text-[10px] font-mono font-bold uppercase text-slate-600">
                          <th className="py-2.5 px-3">Component Type</th>
                          <th className="py-2.5 px-3">Item Description / Spec</th>
                          <th className="py-2.5 px-3 w-28">Consumption</th>
                          <th className="py-2.5 px-3">Placement</th>
                          <th className="py-2.5 px-2 text-right w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.map((mat) => (
                          <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={mat.component_type}
                                onChange={e => handleUpdateMaterial(mat.id, 'component_type', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:ring-1 focus:ring-[#3A3564]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={mat.item_name}
                                onChange={e => handleUpdateMaterial(mat.id, 'item_name', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-900 bg-white focus:ring-1 focus:ring-[#3A3564]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={mat.consumption || ''}
                                onChange={e => handleUpdateMaterial(mat.id, 'consumption', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-white focus:ring-1 focus:ring-[#3A3564]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={mat.placement || ''}
                                onChange={e => handleUpdateMaterial(mat.id, 'placement', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:ring-1 focus:ring-[#3A3564]"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Material Line"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 4. NEW SECTION: Additional Instructions Bar */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono block">
                  Additional Construction &amp; Packaging Instructions:
                </label>
                <textarea
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  placeholder="Enter specific garment production notes, stitching guidelines, washing instructions, and packaging details..."
                  rows={3}
                  className="w-full p-3 rounded-2xl border border-black/15 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] shadow-2xs"
                />
              </div>

            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Embellishment Routing */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-2">
                  Embellishment Routing Rule *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Column 1: 3 options */}
                  <div className="space-y-2">
                    {EMBELLISHMENT_SEQUENCES.slice(0, 3).map(seq => (
                      <label
                        key={seq.value}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          embellishmentSeq === seq.value
                            ? 'border-[#3A3564] bg-[#FAF7F0] shadow-2xs'
                            : 'border-black/10 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="embellishment"
                          checked={embellishmentSeq === seq.value}
                          onChange={() => setEmbellishmentSeq(seq.value)}
                          className="text-[#3A3564] focus:ring-[#3A3564]"
                        />
                        <span className="text-xs font-bold text-slate-900">{seq.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Column 2: 2 options */}
                  <div className="space-y-2">
                    {EMBELLISHMENT_SEQUENCES.slice(3).map(seq => (
                      <label
                        key={seq.value}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          embellishmentSeq === seq.value
                            ? 'border-[#3A3564] bg-[#FAF7F0] shadow-2xs'
                            : 'border-black/10 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="embellishment"
                          checked={embellishmentSeq === seq.value}
                          onChange={() => setEmbellishmentSeq(seq.value)}
                          className="text-[#3A3564] focus:ring-[#3A3564]"
                        />
                        <span className="text-xs font-bold text-slate-900">{seq.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizing & Base Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1.5">
                    Size Grading System *
                  </label>
                  <select
                    value={sizeSystem}
                    onChange={e => handleSizeSystemChange(e.target.value as SizeSystem)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {SIZE_SYSTEMS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1.5">
                    Base Golden Sample Size *
                  </label>
                  <input
                    type="text"
                    value={baseSize}
                    onChange={e => setBaseSize(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
              </div>

              {/* Stitches, Seam Class & Target Cut Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1.5">
                    Stitches / Inch (SPI) *
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={20}
                    value={spi}
                    onChange={e => setSpi(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Default 12 SPI</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1.5">
                    Seam Construction Class *
                  </label>
                  <select
                    value={seamClass}
                    onChange={e => setSeamClass(e.target.value as SeamClass)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {SEAM_CLASSES.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1.5">
                    Target Cut Date *
                  </label>
                  <input
                    type="date"
                    value={targetCutDate}
                    onChange={e => setTargetCutDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/15 text-xs font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
              </div>

              {/* Technical CAD Vector Summary Box */}
              <div className="p-4 rounded-2xl border border-black/10 bg-[#FAF7F0] space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  CAD Specifications Ready
                </span>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-black/10">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shrink-0">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Standard {category} Pattern POMs Linked to Size {baseSize}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {materials.length} BOM components and {seamClass} mapped for production handover.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-black/10 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer font-[family-name:var(--font-heading)]"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer disabled:opacity-50 font-[family-name:var(--font-heading)]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Tech-Pack Specification</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Full Photo Zoom Modal */}
      {previewPhoto && (
        <div 
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] p-2 bg-white rounded-2xl shadow-2xl border border-black/10">
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
