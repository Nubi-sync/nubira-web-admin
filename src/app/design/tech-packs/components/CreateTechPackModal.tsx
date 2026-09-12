'use client'

import { useState } from 'react'
import { X, Check, ArrowRight, ArrowLeft, Sparkles, FileText, Layers, Tag, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { TechPack, GarmentCategory, SizeSystem, EmbellishmentSequence, SeamClass } from '../../types/design'
import { saveStoredTechPack } from '../../utils/designStorage'
import { createTechPackAction } from '../../actions'

interface CreateTechPackModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (techPack: TechPack) => void
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}

const CATEGORIES: GarmentCategory[] = ['Hoodie', 'T-Shirt', 'Polo', 'Jogger', 'Jacket', 'Kids Romper']
const BRANDS = ['OLLYPOP', 'NUBIRA ESSENTIALS', 'ZARA GLOBAL', 'H&M BASICS', 'MANGO MENSWEAR']
const SIZE_SYSTEMS: { label: string; value: SizeSystem; defaultBase: string }[] = [
  { label: 'Adult Unisex Alpha (XS–3XL)', value: 'ALPHA_ADULT', defaultBase: 'M' },
  { label: 'Toddler & Kids (2T–14)', value: 'KIDS_AGE', defaultBase: '4T' },
  { label: 'Numeric Waist Jeans/Trousers (28–42)', value: 'NUMERIC_WAIST', defaultBase: '32' },
  { label: 'Plus Size Silhouette (1X–5X)', value: 'PLUS_SIZE', defaultBase: '2X' },
]

const EMBELLISHMENT_SEQUENCES: { label: string; value: EmbellishmentSequence; desc: string }[] = [
  { label: 'No Embellishment (Plain Cut)', value: 'NONE', desc: 'Direct cut bundle to sewing line' },
  { label: 'Embroidery First, Then Print', value: 'EMBROIDERY_FIRST_THEN_PRINT', desc: 'Hooped embroidery before screen curing' },
  { label: 'Print First, Then Embroidery', value: 'PRINT_FIRST_THEN_EMBROIDERY', desc: 'Rotary/screen print before chest embroidery' },
]

const SEAM_CLASSES: SeamClass[] = [
  'ISO 4915 Class 401 (Chainstitch)',
  'ISO 4915 Class 504 (Overlock)',
  'ISO 4915 Class 607 (Flatlock)'
]

export function CreateTechPackModal({ isOpen, onClose, onCreated, availableBrands }: CreateTechPackModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const brandsList = (availableBrands && availableBrands.length > 0) ? availableBrands.map(b => b.brand_name) : BRANDS

  // Form State
  const [styleNumber, setStyleNumber] = useState('')
  const [styleName, setStyleName] = useState('')
  const [brandName, setBrandName] = useState(brandsList[0] || 'OLLYPOP')
  const [category, setCategory] = useState<GarmentCategory>('Hoodie')
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>('ALPHA_ADULT')
  const [baseSize, setBaseSize] = useState('M')
  const [fabricComposition, setFabricComposition] = useState('')
  const [targetGsm, setTargetGsm] = useState<number>(380)
  const [embellishmentSeq, setEmbellishmentSeq] = useState<EmbellishmentSequence>('NONE')
  const [spi, setSpi] = useState<number>(12)
  const [seamClass, setSeamClass] = useState<SeamClass>('ISO 4915 Class 504 (Overlock)')
  const [targetCutDate, setTargetCutDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })

  if (!isOpen) return null

  function handleSizeSystemChange(sys: SizeSystem) {
    setSizeSystem(sys)
    const found = SIZE_SYSTEMS.find(s => s.value === sys)
    if (found) {
      setBaseSize(found.defaultBase)
    }
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {}
    if (!styleNumber.trim()) {
      errs.styleNumber = 'Style Number is required (e.g. TP-2026-101)'
    } else if (!/^[A-Z0-9-]{4,25}$/i.test(styleNumber.trim())) {
      errs.styleNumber = 'Alpha-numeric and hyphens only (4–25 chars)'
    }
    if (!styleName.trim()) {
      errs.styleName = 'Style Name is required'
    }
    if (!fabricComposition.trim()) {
      errs.fabricComposition = 'Fabric composition is required'
    }
    if (!targetGsm || targetGsm < 60 || targetGsm > 700) {
      errs.targetGsm = 'Valid GSM between 60 and 700 required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {}
    if (!spi || spi < 8 || spi > 20) {
      errs.spi = 'Stitches per inch must be between 8 and 20'
    }
    if (!targetCutDate) {
      errs.targetCutDate = 'Target cut date is required'
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
    })

    setIsSubmitting(false)

    if (res.success && res.data) {
      saveStoredTechPack(res.data)
      toast.success(`Tech-Pack ${res.data.style_number} created in Supabase!`)
      onCreated?.(res.data)
      onClose()
    } else {
      toast.error(res.error || 'Failed to create tech pack in Supabase.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  New Tech-Pack Specification
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#3A3564] text-[#FAF7F0]">
                  Form 01 • Stepper
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Standardize industrial CAD parameters, grading rules & embellishment sequencing
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

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
              step === 1 ? 'bg-[#3A3564] text-[#FAF7F0]' : 'bg-emerald-600 text-white'
            }`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-[#3A3564]' : 'text-slate-600'}`}>
              Step 1: Garment Metadata & Fabric
            </span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200">
            <div className={`h-full bg-[#3A3564] transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
              step === 2 ? 'bg-[#3A3564] text-[#FAF7F0]' : 'bg-slate-200 text-slate-600'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-[#3A3564]' : 'text-slate-400'}`}>
              Step 2: Stitches & Seam Specs
            </span>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Style Number / Article Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TP-2026-101"
                    value={styleNumber}
                    onChange={e => setStyleNumber(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] ${
                      errors.styleNumber ? 'border-rose-500 bg-rose-50/20' : 'border-black/15'
                    }`}
                  />
                  {errors.styleNumber && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.styleNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Buyer / Brand Client *
                  </label>
                  <select
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {brandsList.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Style Description / Commercial Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavyweight Loopback French Terry Hoodie"
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] ${
                    errors.styleName ? 'border-rose-500 bg-rose-50/20' : 'border-black/15'
                  }`}
                />
                {errors.styleName && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.styleName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Garment Silhouette Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as GarmentCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Size Grading System *
                  </label>
                  <select
                    value={sizeSystem}
                    onChange={e => handleSizeSystemChange(e.target.value as SizeSystem)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {SIZE_SYSTEMS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Base Root Size *
                  </label>
                  <input
                    type="text"
                    value={baseSize}
                    onChange={e => setBaseSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Golden sample fit size</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Shell Fabric Composition *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Combed Compact Cotton"
                    value={fabricComposition}
                    onChange={e => setFabricComposition(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] ${
                      errors.fabricComposition ? 'border-rose-500 bg-rose-50/20' : 'border-black/15'
                    }`}
                  />
                  {errors.fabricComposition && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.fabricComposition}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Weight (GSM) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetGsm}
                      onChange={e => setTargetGsm(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] ${
                        errors.targetGsm ? 'border-rose-500 bg-rose-50/20' : 'border-black/15'
                      }`}
                    />
                    <span className="absolute right-3 top-2 text-xs font-mono text-slate-400 font-bold">GSM</span>
                  </div>
                  {errors.targetGsm && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.targetGsm}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Cut Release Date *
                  </label>
                  <input
                    type="date"
                    value={targetCutDate}
                    onChange={e => setTargetCutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Embellishment Routing Rule *
                </label>
                <div className="space-y-2">
                  {EMBELLISHMENT_SEQUENCES.map(seq => (
                    <label
                      key={seq.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
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
                        className="mt-0.5 text-[#3A3564] focus:ring-[#3A3564]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{seq.label}</span>
                        <span className="text-[11px] text-slate-500">{seq.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Stitches Per Inch (SPI) *
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={20}
                    value={spi}
                    onChange={e => setSpi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Default 12 SPI for woven/knit apparel</p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Seam Construction Class *
                  </label>
                  <select
                    value={seamClass}
                    onChange={e => setSeamClass(e.target.value as SeamClass)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  >
                    {SEAM_CLASSES.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vector Sketch Preview Box */}
              <div className="p-4 rounded-2xl border border-black/10 bg-[#FAF7F0]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#3A3564] uppercase tracking-wider">
                    Auto-Generated Technical CAD Outline
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-black/10 text-slate-600 font-bold">
                    PRESET VECTOR SVG
                  </span>
                </div>
                <div className="h-28 rounded-xl bg-white border border-black/10 flex items-center justify-center p-4">
                  <div className="text-center space-y-1">
                    <Scissors className="w-8 h-8 mx-auto text-[#3A3564]" />
                    <p className="text-xs font-bold text-slate-700">
                      Standard {category} Vector Model Generated
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Front & Back POM coordinates linked to {baseSize} Base Pattern
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/10 bg-slate-50 flex items-center justify-between">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Metadata</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Tech-Pack Specification</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
