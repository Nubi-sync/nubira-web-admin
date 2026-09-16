'use client'

import { useState, useEffect } from 'react'
import { X, Check, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TechPack, GarmentCategory, SizeSystem, EmbellishmentSequence, SeamClass, TechPackStatus, TechPackMaterialRequirement } from '../../types/design'
import { updateTechPackAction } from '../../actions'
import { Plus, Trash2, Package } from 'lucide-react'

interface EditTechPackModalProps {
  isOpen: boolean
  onClose: () => void
  techPack: TechPack | null
  onUpdated?: (techPack: TechPack) => void
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}

const CATEGORIES: GarmentCategory[] = ['Hoodie', 'T-Shirt', 'Polo', 'Jogger', 'Jacket', 'Kids Romper', 'Suit', 'Pant', 'Ethnic']
const BRANDS = ['DIRECT CLIENT', 'PRIVATE LABEL', 'GLOBAL BRAND']
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

  return (
    <EditTechPackModalContent
      onClose={onClose}
      techPack={techPack}
      onUpdated={onUpdated}
      availableBrands={availableBrands}
    />
  )
}

function EditTechPackModalContent({
  onClose,
  techPack,
  onUpdated,
  availableBrands
}: {
  onClose: () => void
  techPack: TechPack
  onUpdated?: (techPack: TechPack) => void
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}) {
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
  const [materials, setMaterials] = useState<TechPackMaterialRequirement[]>(techPack.materials || [])
  const [instructions, setInstructions] = useState(techPack.instructions || '')
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
      setMaterials(techPack.materials || [])
      setInstructions(techPack.instructions || '')
    }
  }, [techPack])

  function handleAddMaterial(preset?: Partial<TechPackMaterialRequirement>) {
    const newMat: TechPackMaterialRequirement = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      component_type: preset?.component_type || 'Ribbon / Tape',
      item_name: preset?.item_name || '100% Cotton Binding Tape',
      specification: preset?.specification || '12mm Width',
      consumption: preset?.consumption || '1 Pcs',
      placement: preset?.placement || 'Inside Neck Seam'
    }
    setMaterials(prev => [...prev, newMat])
  }

  function handleUpdateMaterial(id: string, field: keyof TechPackMaterialRequirement, value: string) {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  function handleDeleteMaterial(id: string) {
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

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
        status,
        materials,
        instructions: instructions.trim() || undefined
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
      <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3A3564]" />
              Core Garment Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Style / Art Number *
                </label>
                <input
                  type="text"
                  required
                  value={styleNumber}
                  onChange={e => setStyleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-[#3A3564] outline-none shadow-2xs"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs"
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
          </div>

          {/* Section 2: Bill of Materials & Trims (BOM) */}
          <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-700" />
                  Bill of Materials (BOM) & Trims
                </h3>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  Specify all materials, ribbons, collars, labels, trims, and packaging components.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddMaterial()}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {/* Quick-Add Presets Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase text-emerald-800/70 font-bold mr-1">Quick Add:</span>
              {[
                { label: '+ Collar / Rib', preset: { component_type: 'Collar / Rib', item_name: '1x1 Cotton Spandex Rib', specification: '380 GSM matching body color', consumption: '1 Pcs', placement: 'Neckline' } },
                { label: '+ Ribbon / Tape', preset: { component_type: 'Ribbon / Tape', item_name: 'Cotton Herringbone Tape', specification: '12mm Natural White', consumption: '1 Pcs', placement: 'Back Neck & Side Slits' } },
                { label: '+ Main Label', preset: { component_type: 'Main Label', item_name: 'Woven Damask Brand Label', specification: '50mm x 25mm High Density', consumption: '1 Pcs', placement: 'Center Back Inner Collar' } },
                { label: '+ Care Label', preset: { component_type: 'Care Label', item_name: 'Printed Satin Wash Label', specification: 'Multi-lingual 30mm x 70mm', consumption: '1 Pcs', placement: 'Left Inner Bottom Seam' } },
                { label: '+ Buttons', preset: { component_type: 'Buttons', item_name: '4-Hole Engraved Chalk Buttons', specification: '18L (11.5mm) Matched Dye', consumption: '3 Pcs', placement: 'Front Placket' } },
                { label: '+ Zipper', preset: { component_type: 'Zipper', item_name: '#5 YKK Metal Zipper', specification: 'Antique Brass Open-End', consumption: '1 Pcs', placement: 'Center Front Opening' } },
                { label: '+ Thread', preset: { component_type: 'Thread', item_name: 'Coats Epic Poly-Wrapped Thread', specification: 'Tex 27 / 40s Color Matched', consumption: '100 m', placement: 'All Structural & Topstitch' } },
                { label: '+ Polybag', preset: { component_type: 'Packaging', item_name: 'Recycled Biodegradable Polybag', specification: 'Self-Adhesive with Warning Print', consumption: '1 Pcs', placement: 'Unit Packaging' } },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddMaterial(chip.preset)}
                  className="px-2 py-0.5 rounded-md bg-white border border-emerald-300/80 hover:border-emerald-600 hover:bg-emerald-50 text-[10px] font-bold text-emerald-900 transition-all cursor-pointer shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Materials Table */}
            {materials.length === 0 ? (
              <div className="py-6 text-center bg-white/60 rounded-xl border border-dashed border-emerald-200">
                <p className="text-xs text-slate-500 font-medium">No materials or trims added yet.</p>
                <button
                  type="button"
                  onClick={() => handleAddMaterial()}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  + Add First Material Item
                </button>
              </div>
            ) : (
              <div className="space-y-2 overflow-x-auto">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <div className="col-span-3">Component Type</div>
                  <div className="col-span-3">Item Name / Material</div>
                  <div className="col-span-3">Specification</div>
                  <div className="col-span-1">Qty / Unit</div>
                  <div className="col-span-1">Placement</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>

                {materials.map((mat, index) => (
                  <div key={mat.id || index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs items-center">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={mat.component_type}
                        onChange={e => handleUpdateMaterial(mat.id, 'component_type', e.target.value)}
                        placeholder="e.g. Collar / Rib, Ribbon, Label"
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={mat.item_name}
                        onChange={e => handleUpdateMaterial(mat.id, 'item_name', e.target.value)}
                        placeholder="e.g. 100% Cotton Rib"
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={mat.specification}
                        onChange={e => handleUpdateMaterial(mat.id, 'specification', e.target.value)}
                        placeholder="e.g. 380 GSM, 12mm width"
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={mat.consumption}
                        onChange={e => handleUpdateMaterial(mat.id, 'consumption', e.target.value)}
                        placeholder="1 Pcs"
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-bold text-center text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={mat.placement || ''}
                        onChange={e => handleUpdateMaterial(mat.id, 'placement', e.target.value)}
                        placeholder="Neck"
                        className="w-full px-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-lg text-xs font-medium text-slate-800 outline-none"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Remove component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Additional Instructions Bar */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4.5 space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
              <span>Additional Manufacturing & Packaging Instructions</span>
              <span className="text-[10px] text-amber-800 font-normal">Special stitching, washing, packaging guidelines</span>
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Enter specific garment production notes, e.g. Pre-shrink wash required before cutting. Double-needle topstitch along shoulder seams. Polybag with desiccant pouch..."
              className="w-full px-3.5 py-2.5 bg-white border border-amber-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-xs font-medium text-slate-900 outline-none shadow-2xs resize-y"
            />
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
