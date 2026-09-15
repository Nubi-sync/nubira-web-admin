'use client'

import { useState, useEffect } from 'react'
import { X, Check, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TechPack, GarmentCategory, SizeSystem, EmbellishmentSequence, SeamClass, TechPackStatus } from '../../types/design'
import { updateTechPackAction } from '../../actions'

interface EditTechPackModalProps {
  isOpen: boolean
  onClose: () => void
  techPack: TechPack | null
  onUpdated?: (techPack: TechPack) => void
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}

const CATEGORIES: GarmentCategory[] = ['Hoodie', 'T-Shirt', 'Polo', 'Jogger', 'Jacket', 'Kids Romper']
const BRANDS = ['ZARA INTERNATIONAL', 'H&M', 'OLLYPOP', 'DIRECT CLIENT', 'PRIVATE LABEL', 'GLOBAL BRAND']
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

const STATUSES: { label: string; value: TechPackStatus }[] = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sample Development', value: 'SAMPLE_DEV' },
  { label: 'PPS Review', value: 'PPS_SUBMITTED' },
  { label: 'PPS Approved', value: 'PPS_APPROVED' },
  { label: 'Approved for Bulk Cut', value: 'APPROVED_BULK' },
  { label: 'Revise Fit', value: 'REVISE_FIT' }
]

export function EditTechPackModal({ isOpen, onClose, techPack, onUpdated, availableBrands }: EditTechPackModalProps) {
  if (!isOpen || !techPack) return null

  const brandsList = (availableBrands && availableBrands.length > 0)
    ? Array.from(new Set([...availableBrands.map(b => b.brand_name), techPack.brand_name]))
    : Array.from(new Set([...BRANDS, techPack.brand_name]))

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [styleNumber, setStyleNumber] = useState(techPack.style_number)
  const [styleName, setStyleName] = useState(techPack.style_name)
  const [brandName, setBrandName] = useState(techPack.brand_name)
  const [category, setCategory] = useState<GarmentCategory>(techPack.category)
  const [sizeSystem, setSizeSystem] = useState<SizeSystem>(techPack.size_system)
  const [baseSize, setBaseSize] = useState(techPack.base_size)
  const [fabricComposition, setFabricComposition] = useState(techPack.fabric_composition)
  const [targetGsm, setTargetGsm] = useState<number>(techPack.target_gsm)
  const [embellishmentSeq, setEmbellishmentSeq] = useState<EmbellishmentSequence>(techPack.embellishment_sequence)
  const [spi, setSpi] = useState<number>(techPack.spi)
  const [seamClass, setSeamClass] = useState<SeamClass>(techPack.seam_class)
  const [status, setStatus] = useState<TechPackStatus>(techPack.status)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (techPack) {
      setStyleNumber(techPack.style_number)
      setStyleName(techPack.style_name)
      setBrandName(techPack.brand_name)
      setCategory(techPack.category)
      setSizeSystem(techPack.size_system)
      setBaseSize(techPack.base_size)
      setFabricComposition(techPack.fabric_composition)
      setTargetGsm(techPack.target_gsm)
      setEmbellishmentSeq(techPack.embellishment_sequence)
      setSpi(techPack.spi)
      setSeamClass(techPack.seam_class)
      setStatus(techPack.status)
    }
  }, [techPack])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!techPack) return
    setErrors({})

    if (!styleNumber.trim()) {
      setErrors({ styleNumber: 'Style Number is required' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateTechPackAction(techPack.id, {
        style_number: styleNumber.trim(),
        brand_name: brandName,
        category,
        size_system: sizeSystem,
        base_size: baseSize,
        fabric_composition: fabricComposition,
        target_gsm: targetGsm,
        embellishment_sequence: embellishmentSeq,
        spi,
        seam_class: seamClass,
        status
      })

      if (res.success && res.data) {
        toast.success(`Tech-Pack ${styleNumber} updated successfully!`)
        if (onUpdated) onUpdated(res.data)
        onClose()
      } else {
        toast.error(res.error || 'Failed to update tech-pack')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Server error updating tech-pack')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Edit Tech-Pack Specification
              </h2>
              <p className="text-xs font-mono text-slate-500">
                {techPack.style_number} • Version {techPack.version}.0
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Style Number *
              </label>
              <input
                type="text"
                required
                value={styleNumber}
                onChange={e => setStyleNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-[#3A3564] outline-none shadow-2xs"
              />
              {errors.styleNumber && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.styleNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer / Brand *
              </label>
              <input
                type="text"
                required
                list="brands-datalist"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs"
              />
              <datalist id="brands-datalist">
                {brandsList.map(b => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Garment Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as GarmentCategory)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target GSM
              </label>
              <input
                type="number"
                min={60}
                max={700}
                required
                value={targetGsm}
                onChange={e => setTargetGsm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Base Size
              </label>
              <input
                type="text"
                required
                value={baseSize}
                onChange={e => setBaseSize(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Fabric Composition
            </label>
            <input
              type="text"
              required
              value={fabricComposition}
              onChange={e => setFabricComposition(e.target.value)}
              placeholder="e.g. 100% Combed Cotton French Terry"
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Embellishment Sequence
              </label>
              <select
                value={embellishmentSeq}
                onChange={e => setEmbellishmentSeq(e.target.value as EmbellishmentSequence)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {EMBELLISHMENT_SEQUENCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Production Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TechPackStatus)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Stitches Per Inch (SPI)
              </label>
              <input
                type="number"
                min={8}
                max={20}
                value={spi}
                onChange={e => setSpi(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Seam Class (ISO 4915)
              </label>
              <select
                value={seamClass}
                onChange={e => setSeamClass(e.target.value as SeamClass)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-800 outline-none shadow-2xs"
              >
                {SEAM_CLASSES.map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
