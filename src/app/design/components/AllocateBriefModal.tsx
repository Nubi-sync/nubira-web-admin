'use client'

import { useState } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Palette, 
  Shirt, 
  Layers, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Tag,
  Info,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  DesignBrief, 
  DesignTeamMember, 
  BriefDesignConceptRequirement 
} from '../types/design'
import { createDesignBriefAction } from '../actions'

const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off-White / Cream', hex: '#FAF7F0' },
  { name: 'Charcoal Grey', hex: '#334155' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Forest Green', hex: '#1B4D3E' },
  { name: 'Crimson / Maroon', hex: '#800020' },
  { name: 'Beige / Sand', hex: '#D2B48C' },
  { name: 'Sky / Ice Blue', hex: '#93C5FD' },
  { name: 'Lavender', hex: '#E9D5FF' },
  { name: 'Rust / Terracotta', hex: '#C85A17' }
]

function getColorSwatch(colorName: string): string {
  const c = colorName.trim().toLowerCase()
  if (c.includes('black')) return '#0f172a'
  if (c.includes('white') || c.includes('cream') || c.includes('bone')) return '#f8fafc'
  if (c.includes('off-white') || c.includes('sand') || c.includes('beige')) return '#e2d9cc'
  if (c.includes('navy') || c.includes('dark blue')) return '#1e3a8a'
  if (c.includes('royal') || c.includes('blue')) return '#2563eb'
  if (c.includes('sky') || c.includes('ice')) return '#7dd3fc'
  if (c.includes('olive') || c.includes('sage')) return '#556b2f'
  if (c.includes('forest') || c.includes('emerald') || c.includes('green')) return '#15803d'
  if (c.includes('maroon') || c.includes('crimson') || c.includes('burgundy')) return '#881337'
  if (c.includes('red') || c.includes('ruby')) return '#dc2626'
  if (c.includes('pink') || c.includes('rose') || c.includes('blush')) return '#f43f5e'
  if (c.includes('purple') || c.includes('lavender') || c.includes('violet')) return '#7c3aed'
  if (c.includes('yellow') || c.includes('mustard') || c.includes('gold')) return '#eab308'
  if (c.includes('orange') || c.includes('rust') || c.includes('terracotta')) return '#ea580c'
  if (c.includes('brown') || c.includes('mocha') || c.includes('tan')) return '#78350f'
  if (c.includes('grey') || c.includes('gray') || c.includes('charcoal') || c.includes('ash')) return '#475569'
  return '#3A3564'
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
  existingGarments = ['T-Shirt', 'Oversized Tee', 'Cargo Pants', 'Jogger', 'Hoodie', 'Girls Suit', 'Polo Shirt'],
  existingCategories = ['Streetwear', 'Anime Graphic', 'Vintage Aesthetic', 'Minimalist', 'Sportswear', 'Casual Lounge']
}: AllocateBriefModalProps) {
  const activeTeamMembers = teamMembers.filter(m => m.status === 'ACTIVE')

  // Top Brief Details
  const [selectedDesignerId, setSelectedDesignerId] = useState(preselectedDesignerId || '')
  const [garmentType, setGarmentType] = useState('T-Shirt')
  const [category, setCategory] = useState('')
  const [instructions, setInstructions] = useState('')

  // Instructed Designs List
  const [designConcepts, setDesignConcepts] = useState<BriefDesignConceptRequirement[]>([
    {
      concept_number: 1,
      category_style: 'Front Chest Graphic',
      colors: ['Black', 'Off-White', 'Olive Green'],
      notes: ''
    }
  ])

  // New Design Builder State
  const [newConceptTitle, setNewConceptTitle] = useState('')
  const [newConceptColors, setNewConceptColors] = useState<string[]>([])
  const [newConceptColorInput, setNewConceptColorInput] = useState('')
  const [newConceptNotes, setNewConceptNotes] = useState('')
  const [isAddingConcept, setIsAddingConcept] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function handleAddColorToNewConcept(colorName?: string) {
    const col = (colorName || newConceptColorInput).trim()
    if (!col) return
    if (!newConceptColors.some(c => c.toLowerCase() === col.toLowerCase())) {
      setNewConceptColors(prev => [...prev, col])
    }
    setNewConceptColorInput('')
  }

  function handleRemoveColorFromNewConcept(index: number) {
    setNewConceptColors(prev => prev.filter((_, idx) => idx !== index))
  }

  function handleCommitNewDesignConcept() {
    const title = newConceptTitle.trim() || `Design Concept #${designConcepts.length + 1}`
    const colors = newConceptColors.length > 0 ? newConceptColors : ['Black', 'White']

    const nextItem: BriefDesignConceptRequirement = {
      concept_number: designConcepts.length + 1,
      category_style: title,
      colors: colors,
      notes: newConceptNotes.trim() || undefined
    }

    setDesignConcepts(prev => [...prev, nextItem])
    // Reset builder form
    setNewConceptTitle('')
    setNewConceptColors([])
    setNewConceptColorInput('')
    setNewConceptNotes('')
    setIsAddingConcept(false)
    toast.success(`Added Design #${nextItem.concept_number}: ${title}`)
  }

  function handleRemoveDesignConcept(index: number) {
    if (designConcepts.length <= 1) {
      toast.error('At least 1 design instruction is required.')
      return
    }
    setDesignConcepts(prev => {
      const filtered = prev.filter((_, idx) => idx !== index)
      // Renumber concepts
      return filtered.map((item, idx) => ({
        ...item,
        concept_number: idx + 1
      }))
    })
  }

  function handleAddColorDirectlyToConcept(conceptIndex: number, colorName: string) {
    const col = colorName.trim()
    if (!col) return
    setDesignConcepts(prev => prev.map((item, idx) => {
      if (idx === conceptIndex) {
        if (!item.colors.some(c => c.toLowerCase() === col.toLowerCase())) {
          return { ...item, colors: [...item.colors, col] }
        }
      }
      return item
    }))
  }

  function handleRemoveColorDirectlyFromConcept(conceptIndex: number, colorIndex: number) {
    setDesignConcepts(prev => prev.map((item, idx) => {
      if (idx === conceptIndex) {
        if (item.colors.length <= 1) {
          toast.error('Each design must have at least 1 colorway.')
          return item
        }
        return {
          ...item,
          colors: item.colors.filter((_, cIdx) => cIdx !== colorIndex)
        }
      }
      return item
    }))
  }

  // Summary Metrics
  const totalDesignsCount = designConcepts.length
  const allUniqueColors = Array.from(
    new Set(designConcepts.flatMap(d => d.colors.map(c => c.trim())).filter(Boolean))
  )
  const maxColorsPerDesign = Math.max(...designConcepts.map(d => d.colors.length), 1)

  async function handleSubmitBrief(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedDesignerId) {
      toast.error('Please assign a designer to this brief.')
      return
    }
    if (!garmentType.trim()) {
      toast.error('Please specify the garment silhouette.')
      return
    }
    if (!category.trim()) {
      toast.error('Please specify the main collection or theme category.')
      return
    }
    if (designConcepts.length === 0) {
      toast.error('Please add at least 1 design requirement.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createDesignBriefAction({
        ph_user_id: currentUserId,
        designer_member_id: selectedDesignerId,
        garment_type: garmentType.trim(),
        category: category.trim(),
        max_colors: maxColorsPerDesign,
        chart_colors: maxColorsPerDesign,
        target_colors: allUniqueColors,
        target_designs: totalDesignsCount,
        num_designs: totalDesignsCount,
        design_concepts: designConcepts,
        instructions: instructions.trim() || undefined,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`Design Brief allocated (${totalDesignsCount} Designs) successfully!`)
        onSuccess(res.data)
        onClose()
      } else {
        toast.error(res.error || 'Failed to allocate design brief.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'A network error occurred while allocating brief.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-[family-name:var(--font-heading)] leading-tight">
                Allocate New Design Brief
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Assign garment silhouette, designer, and specific design instructions with colorways.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitBrief} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-[13px]">
          
          {/* Section 1: Core Allotment Details */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                Assign Designer <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedDesignerId}
                onChange={e => setSelectedDesignerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all"
              >
                <option value="">Select an active designer from team...</option>
                {activeTeamMembers.map(m => {
                  const phone = m.phone_number || m.designer_phone
                  const displayLabel = phone ? `+91 ${phone}` : (m.username ? `@${m.username}` : '')
                  return (
                    <option key={m.id} value={m.id}>
                      {m.designer_name}{displayLabel ? ` (${displayLabel})` : ''}
                    </option>
                  )
                })}
              </select>
              {activeTeamMembers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No active designers found. Please add a designer in Team Management first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Garment Silhouette <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="garment-options-modal"
                    placeholder="e.g. T-Shirt, Cargo, Jogger, Hoodie..."
                    value={garmentType}
                    onChange={e => setGarmentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                  <datalist id="garment-options-modal">
                    {existingGarments.map(g => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Collection / Theme Style <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="category-options-modal"
                    placeholder="e.g. Streetwear 2026, Anime, Vintage..."
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                  <datalist id="category-options-modal">
                    {existingCategories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                General Instructions &amp; Guidelines (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Heavyweight 240 GSM single jersey, minimal puff chest branding, oversized streetwear drape..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Section 2: Dynamic Design Instructions & Colorways Builder */}
          <div className="pt-2 border-t border-black/10 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                  <Layers className="w-4 h-4 text-[#3A3564]" />
                  <span>Instructed Designs &amp; Colorways ({designConcepts.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Define each design concept with its unique style and allocated colorway palette.
                </p>
              </div>

              {!isAddingConcept && (
                <button
                  type="button"
                  onClick={() => setIsAddingConcept(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3A3564] text-white hover:bg-[#2A2649] text-xs font-bold shadow-xs cursor-pointer transition-all self-start"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Design Instructed</span>
                </button>
              )}
            </div>

            {/* Interactive Add Design Instruction Box */}
            {isAddingConcept && (
              <div className="p-4 bg-[#FAF7F0] rounded-2xl border-2 border-[#3A3564]/20 space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="text-xs font-bold font-mono uppercase text-[#3A3564]">
                    Add Requirement for Design #{designConcepts.length + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingConcept(false)}
                    className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Design Category / Concept Style <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vintage Back Graphic, Chest Pocket Print, Minimal Typography..."
                    value={newConceptTitle}
                    onChange={e => setNewConceptTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Allocated Colorways for this Design <span className="text-rose-500">*</span>
                  </label>

                  {/* Preset quick colors */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {PRESET_COLORS.map(pc => {
                      const isSelected = newConceptColors.some(c => c.toLowerCase() === pc.name.toLowerCase())
                      return (
                        <button
                          key={pc.name}
                          type="button"
                          onClick={() => handleAddColorToNewConcept(pc.name)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#3A3564] text-white border-[#3A3564]' 
                              : 'bg-white text-slate-700 border-black/10 hover:border-black/30'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: pc.hex }} />
                          <span>{pc.name}</span>
                          {isSelected && <Check className="w-2.5 h-2.5 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom color input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Or type custom color (e.g. Acid Wash Grey) & press Enter..."
                      value={newConceptColorInput}
                      onChange={e => setNewConceptColorInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddColorToNewConcept()
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 focus:border-[#3A3564] rounded-xl text-xs font-medium text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddColorToNewConcept()}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-black font-bold text-xs cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Active Chips for this new design */}
                  {newConceptColors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5 p-2 bg-white rounded-xl border border-black/10">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-400 mr-1">
                        Allocated ({newConceptColors.length}):
                      </span>
                      {newConceptColors.map((col, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF7F0] border border-black/10 font-mono text-xs font-bold text-[#3A3564]"
                        >
                          <span
                            className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: getColorSwatch(col) }}
                          />
                          <span>{col}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColorFromNewConcept(idx)}
                            className="text-slate-400 hover:text-slate-700 ml-0.5 cursor-pointer font-bold"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setIsAddingConcept(false)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitNewDesignConcept}
                    className="px-4 py-1.5 rounded-xl bg-[#3A3564] text-white hover:bg-[#2A2649] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Design #{designConcepts.length + 1}
                  </button>
                </div>
              </div>
            )}

            {/* Designs Table */}
            <div className="border border-black/10 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] border-b border-black/10 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-600">
                      <th className="py-2.5 px-3.5 font-bold w-16">Design #</th>
                      <th className="py-2.5 px-3.5 font-bold">Category / Print Style</th>
                      <th className="py-2.5 px-3.5 font-bold">Allocated Colorways</th>
                      <th className="py-2.5 px-3.5 font-bold text-center w-20">Colors</th>
                      <th className="py-2.5 px-3.5 font-bold text-right w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs">
                    {designConcepts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                          <span className="w-6 h-6 rounded-lg bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-xs text-[#3A3564]">
                            {item.concept_number}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-slate-900">
                          <input
                            type="text"
                            value={item.category_style || ''}
                            onChange={e => {
                              const val = e.target.value
                              setDesignConcepts(prev => prev.map((c, cIdx) => cIdx === idx ? { ...c, category_style: val } : c))
                            }}
                            placeholder={`e.g. Design Style #${item.concept_number}`}
                            className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-[#3A3564] focus:bg-white font-semibold text-slate-900 text-xs outline-none transition-all"
                          />
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {item.colors.map((col, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10 text-[11px] font-mono font-bold text-[#3A3564]"
                              >
                                <span
                                  className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                                  style={{ backgroundColor: getColorSwatch(col) }}
                                />
                                <span>{col}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveColorDirectlyFromConcept(idx, cIdx)}
                                  className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer font-bold"
                                  title="Remove color"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}

                            {/* Quick add color chip trigger */}
                            <input
                              type="text"
                              placeholder="+ Add color"
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const target = e.target as HTMLInputElement
                                  if (target.value.trim()) {
                                    handleAddColorDirectlyToConcept(idx, target.value)
                                    target.value = ''
                                  }
                                }
                              }}
                              className="w-20 px-1.5 py-0.5 text-[11px] bg-transparent placeholder:text-slate-400 border-b border-dashed border-slate-300 focus:border-[#3A3564] outline-none font-mono"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-700 text-xs">
                          {item.colors.length}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDesignConcept(idx)}
                            disabled={designConcepts.length <= 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 cursor-pointer transition-colors"
                            title={designConcepts.length <= 1 ? "At least 1 design required" : "Delete design requirement"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Summary metrics */}
              <div className="px-4 py-2.5 bg-[#FAF7F0] border-t border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-3 text-slate-700">
                  <span>
                    Total Designs: <strong className="text-[#3A3564] font-bold">{totalDesignsCount}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Total Unique Colors: <strong className="text-[#3A3564] font-bold">{allUniqueColors.length}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Palette:</span>
                  <div className="flex items-center -space-x-1">
                    {allUniqueColors.slice(0, 6).map((c, i) => (
                      <span
                        key={i}
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
                        style={{ backgroundColor: getColorSwatch(c) }}
                        title={c}
                      />
                    ))}
                    {allUniqueColors.length > 6 && (
                      <span className="text-[10px] font-bold text-slate-500 pl-1.5">
                        +{allUniqueColors.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || activeTeamMembers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] active:scale-98 rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Allocating Brief...</span>
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  <span>Allocate Brief ({totalDesignsCount} Designs)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
