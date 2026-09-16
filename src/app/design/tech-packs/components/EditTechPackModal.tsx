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

  // 4 boxes state for adding new BOM item
  const [newMatType, setNewMatType] = useState('')
  const [newMatName, setNewMatName] = useState('')
  const [newMatConsumption, setNewMatConsumption] = useState('')
  const [newMatPlacement, setNewMatPlacement] = useState('')

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

          {/* Section 3: Additional Instructions Bar */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono block">
              Additional Construction &amp; Packaging Instructions:
            </label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Enter specific garment production notes, stitching guidelines, washing instructions, and packaging details..."
              rows={3}
              className="w-full p-3 rounded-2xl border border-black/15 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] shadow-2xs"
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
