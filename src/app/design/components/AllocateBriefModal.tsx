'use client'

import { useState } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Palette, 
  Loader2, 
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignBrief, 
  DesignTeamMember, 
  BriefDesignConceptRequirement 
} from '../types/design'
import { createDesignBriefAction } from '../actions'

function getColorSwatch(colorName: string): string {
  const c = colorName.trim().toLowerCase()
  if (c.includes('black')) return '#0f172a'
  if (c.includes('white') || c.includes('cream')) return '#f8fafc'
  if (c.includes('off-white') || c.includes('sand') || c.includes('beige')) return '#e2d9cc'
  if (c.includes('navy') || c.includes('dark blue')) return '#1e3a8a'
  if (c.includes('blue')) return '#2563eb'
  if (c.includes('olive') || c.includes('sage')) return '#556b2f'
  if (c.includes('green')) return '#15803d'
  if (c.includes('maroon') || c.includes('crimson') || c.includes('red')) return '#881337'
  if (c.includes('orange') || c.includes('rust')) return '#ea580c'
  if (c.includes('grey') || c.includes('gray') || c.includes('charcoal')) return '#475569'
  if (c.includes('purple') || c.includes('lavender')) return '#9333ea'
  if (c.includes('yellow') || c.includes('mustard')) return '#eab308'
  if (c.includes('brown') || c.includes('tan') || c.includes('khaki')) return '#78350f'
  if (c.includes('pink') || c.includes('rose')) return '#f43f5e'
  return '#3A3564'
}

interface DesignInstructionItem {
  id: string
  art_prefix: string // 2-4 chars alphanumeric (optional)
  art_number: string // 3-6 digits numeric (required)
  garment_type: string
  category: string
  print_required: string
  colors: string[]
  color_input: string
}

interface AllocateBriefModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (brief: DesignBrief) => void
  teamMembers: DesignTeamMember[]
  currentUserId: string
  companyName: string
  preselectedDesignerId?: string
  existingGarments?: string[]
  existingCategories?: string[]
}

export function AllocateBriefModal({
  isOpen,
  onClose,
  onSuccess,
  teamMembers,
  currentUserId,
  companyName,
  preselectedDesignerId,
  existingGarments = ['T-Shirt', 'Oversized Tee', 'Cargo Pants', 'Jogger', 'Hoodie', 'Polo Shirt'],
  existingCategories = ['Streetwear', 'Anime Graphic', 'Vintage Aesthetic', 'Minimalist', 'Sportswear']
}: AllocateBriefModalProps) {
  const activeTeamMembers = teamMembers.filter(m => m.status === 'ACTIVE')

  const [selectedDesignerId, setSelectedDesignerId] = useState(preselectedDesignerId || '')
  const [instructions, setInstructions] = useState('')
  const [designs, setDesigns] = useState<DesignInstructionItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleAddDesignInstruction() {
    const nextIndex = designs.length + 1
    const defaultNumber = String(100 + nextIndex).padStart(3, '0')
    const newItem: DesignInstructionItem = {
      id: Math.random().toString(36).substring(2, 9),
      art_prefix: 'TS',
      art_number: defaultNumber,
      garment_type: 'T-Shirt',
      category: '',
      print_required: '',
      colors: [],
      color_input: ''
    }
    setDesigns(prev => [...prev, newItem])
  }

  function handleRemoveDesign(index: number) {
    setDesigns(prev => prev.filter((_, i) => i !== index))
  }

  function handleUpdateDesignField(index: number, field: keyof DesignInstructionItem, value: any) {
    setDesigns(prev => prev.map((item, i) => {
      if (i === index) {
        if (field === 'art_prefix') {
          // Strictly uppercase alphanumeric, max 4 chars
          const cleaned = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
          return { ...item, art_prefix: cleaned }
        }
        if (field === 'art_number') {
          // Strictly digits, max 6 chars
          const cleaned = String(value).replace(/\D/g, '').slice(0, 6)
          return { ...item, art_number: cleaned }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  function handleAddManualColor(index: number) {
    setDesigns(prev => prev.map((item, i) => {
      if (i === index) {
        const val = item.color_input.trim()
        if (!val) return item
        if (item.colors.some(c => c.toLowerCase() === val.toLowerCase())) {
          toast.info(`"${val}" is already added.`)
          return { ...item, color_input: '' }
        }
        return {
          ...item,
          colors: [...item.colors, val],
          color_input: ''
        }
      }
      return item
    }))
  }

  function handleRemoveColorFromDesign(designIndex: number, colorIndex: number) {
    setDesigns(prev => prev.map((item, i) => {
      if (i === designIndex) {
        return {
          ...item,
          colors: item.colors.filter((_, cIdx) => cIdx !== colorIndex)
        }
      }
      return item
    }))
  }

  function getFormattedArtNumber(item: DesignInstructionItem): string {
    const prefix = item.art_prefix.trim().toUpperCase()
    const num = item.art_number.trim()
    if (!num) return ''
    return prefix ? `${prefix}-${num}` : num
  }

  function validateArtNumber(item: DesignInstructionItem): { valid: boolean; error?: string } {
    const prefix = item.art_prefix.trim()
    const num = item.art_number.trim()

    if (prefix && prefix.length < 2) {
      return { valid: false, error: 'Prefix must be at least 2 characters (e.g. TS, HD01).' }
    }
    if (!num) {
      return { valid: false, error: 'Art number digits are required.' }
    }
    if (num.length < 3 || num.length > 6) {
      return { valid: false, error: 'Art number must be between 3 and 6 digits (e.g. 101, 0042).' }
    }
    return { valid: true }
  }

  const isFormValid = Boolean(
    selectedDesignerId &&
    designs.length > 0 &&
    designs.every(d => {
      const artCheck = validateArtNumber(d)
      return artCheck.valid && d.garment_type.trim() && d.category.trim() && d.colors.length > 0
    })
  )

  async function handleSubmitBrief(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedDesignerId) {
      toast.error('Please select a designer.')
      return
    }
    if (designs.length === 0) {
      toast.error('Please add at least 1 design instruction.')
      return
    }

    for (let i = 0; i < designs.length; i++) {
      const d = designs[i]
      const artCheck = validateArtNumber(d)
      if (!artCheck.valid) {
        toast.error(`Design #${i + 1}: ${artCheck.error}`)
        return
      }
      if (!d.garment_type.trim()) {
        toast.error(`Please enter garment silhouette for Design #${i + 1}.`)
        return
      }
      if (!d.category.trim()) {
        toast.error(`Please enter category for Design #${i + 1}.`)
        return
      }
      if (d.colors.length === 0) {
        toast.error(`Please add at least 1 color for Design #${i + 1}.`)
        return
      }
    }

    const primaryGarment = Array.from(new Set(designs.map(d => d.garment_type.trim()))).join(', ')
    const primaryCategory = Array.from(new Set(designs.map(d => d.category.trim()))).join(', ')
    const allColors = Array.from(new Set(designs.flatMap(d => d.colors)))
    const maxColors = Math.max(...designs.map(d => d.colors.length), 1)

    const formattedConcepts: BriefDesignConceptRequirement[] = designs.map((d, idx) => {
      const fullArtNo = getFormattedArtNumber(d)
      return {
        concept_number: idx + 1,
        art_number: fullArtNo,
        category_style: `${d.category}${d.print_required ? ` • ${d.print_required}` : ''}`,
        colors: d.colors,
        notes: `Art No: ${fullArtNo} | Garment: ${d.garment_type}`
      }
    })

    setIsSubmitting(true)
    try {
      const res = await createDesignBriefAction({
        ph_user_id: currentUserId,
        designer_member_id: selectedDesignerId,
        garment_type: primaryGarment,
        category: primaryCategory,
        max_colors: maxColors,
        chart_colors: maxColors,
        target_colors: allColors,
        target_designs: designs.length,
        num_designs: designs.length,
        design_concepts: formattedConcepts,
        instructions: instructions.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`Design Brief (${designs.length} Designs) allocated successfully!`)
        onSuccess(res.data)
        onClose()
      } else {
        toast.error(res.error || 'Failed to allocate design brief.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error occurred while allocating brief.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-[family-name:var(--font-heading)] leading-none">
              Allocate Design Brief
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmitBrief} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          
          {/* 1. Designer Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 font-mono mb-1">
              Designer <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedDesignerId}
              onChange={e => setSelectedDesignerId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/15 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all cursor-pointer"
            >
              <option value="">Select Designer...</option>
              {activeTeamMembers.map(m => {
                const phone = m.phone_number || m.designer_phone
                const label = phone ? `+91 ${phone}` : (m.username ? `@${m.username}` : '')
                return (
                  <option key={m.id} value={m.id}>
                    {m.designer_name} {label ? `(${label})` : ''}
                  </option>
                )
              })}
            </select>
            {activeTeamMembers.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No active designers found.
              </p>
            )}
          </div>

          {/* 2. Design Instructions (Added on-demand) */}
          {designs.length === 0 ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddDesignInstruction}
                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#3A3564]/30 hover:border-[#3A3564] bg-[#FAF7F0]/60 hover:bg-[#FAF7F0] text-[#3A3564] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Design Instruction</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {designs.map((design, idx) => {
                const fullArtNo = getFormattedArtNumber(design)
                const artCheck = validateArtNumber(design)

                return (
                  <div 
                    key={design.id}
                    className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-3.5 shadow-2xs"
                  >
                    {/* Design Card Header */}
                    <div className="flex items-center justify-between border-b border-black/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-[#3A3564] tracking-wider">
                          Design #{idx + 1}
                        </span>
                        {fullArtNo && (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#3A3564] text-white text-[11px] font-mono font-bold tracking-wider shadow-2xs">
                            ART NO: {fullArtNo}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDesign(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove Design"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Article Number Configuration (Prefix + Number) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                          Article Number (Art #) <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-[#3A3564] bg-white px-2.5 py-0.5 rounded-lg border border-black/10 shadow-2xs">
                          Prefix: 2–4 chars (Optional) &bull; Number: 3–6 digits (Required)
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Prefix (e.g. TS, HD01)"
                            value={design.art_prefix}
                            onChange={e => handleUpdateDesignField(idx, 'art_prefix', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-mono font-bold text-slate-900 uppercase outline-none placeholder:font-normal placeholder:normal-case placeholder:text-slate-400"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Number (e.g. 101, 0042)"
                            value={design.art_number}
                            onChange={e => handleUpdateDesignField(idx, 'art_number', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-mono font-bold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      {!artCheck.valid && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">
                          {artCheck.error}
                        </p>
                      )}
                    </div>

                    {/* Garment & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1">
                          Garment Silhouette <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          list={`garment-list-${idx}`}
                          placeholder="e.g. T-Shirt, Hoodie"
                          value={design.garment_type}
                          onChange={e => handleUpdateDesignField(idx, 'garment_type', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-900 outline-none"
                        />
                        <datalist id={`garment-list-${idx}`}>
                          {existingGarments.map(g => (
                            <option key={g} value={g} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1">
                          Category / Theme <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          list={`category-list-${idx}`}
                          placeholder="e.g. Streetwear, Vintage"
                          value={design.category}
                          onChange={e => handleUpdateDesignField(idx, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-900 outline-none"
                        />
                        <datalist id={`category-list-${idx}`}>
                          {existingCategories.map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Print Required */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1">
                        Print Required / Placement
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Front Chest Graphic, Puff Print Back, Embroidery"
                        value={design.print_required}
                        onChange={e => handleUpdateDesignField(idx, 'print_required', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    {/* Purely Manual Colors Section */}
                    <div className="pt-2 border-t border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#3A3564]" />
                          <span>Colors ({design.colors.length}) <span className="text-rose-500">*</span></span>
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Type color and click Add
                        </span>
                      </div>

                      {/* Manual Color Input Row */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type color name (e.g. Black, Off-White, Olive Green, Rust)..."
                          value={design.color_input}
                          onChange={e => handleUpdateDesignField(idx, 'color_input', e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddManualColor(idx)
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-semibold text-slate-900 outline-none shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddManualColor(idx)}
                          className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 active:scale-95"
                        >
                          + Add Color
                        </button>
                      </div>

                      {/* Added Colors Display */}
                      {design.colors.length === 0 ? (
                        <div className="p-3 rounded-xl bg-white border border-dashed border-slate-300 text-center text-xs text-slate-400">
                          No colors added yet. Type a color name above and click &ldquo;+ Add Color&rdquo;.
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
                          {design.colors.map((col, cIdx) => (
                            <div
                              key={cIdx}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-900 shadow-2xs"
                            >
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                                style={{ backgroundColor: getColorSwatch(col) }}
                              />
                              <span>{col}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColorFromDesign(idx, cIdx)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0.5 rounded cursor-pointer transition-colors"
                                title={`Remove ${col}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )
              })}

              <button
                type="button"
                onClick={handleAddDesignInstruction}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#3A3564]/30 hover:border-[#3A3564] bg-[#FAF7F0]/60 hover:bg-[#FAF7F0] text-[#3A3564] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Design</span>
              </button>
            </div>
          )}

          {/* 3. Optional General Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono mb-1">
              Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 240 GSM single jersey, minimal aesthetic"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 focus:border-[#3A3564] rounded-xl text-xs font-medium text-slate-900 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isFormValid && !isSubmitting
                  ? 'bg-[#3A3564] hover:bg-[#2A2649] text-white cursor-pointer active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Allocating...</span>
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  <span>
                    {designs.length > 0 ? `Allocate Brief (${designs.length} Designs)` : 'Allocate Brief'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
