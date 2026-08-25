'use client'

import { useState, useMemo } from 'react'
import { createDetailedAllotment, VariantPayload, MaterialPayload } from '../actions'
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Layers, 
  PackageCheck, 
  Loader2, 
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

type Profile = { id: string; username: string }
type Article = { id: string; art_no: string; description?: string; stitching_rate?: number }

// Preset size groups
const SIZE_PRESETS: Record<string, { label: string; sizes: string[] }> = {
  alpha: {
    label: 'Adult Alpha (XS-5XL)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
  },
  numeric: {
    label: 'Jeans / Numeric (28-44)',
    sizes: ['28', '30', '32', '34', '36', '38', '40', '42', '44']
  },
  kids_age: {
    label: 'Kids Age (0M-16Y)',
    sizes: ['0-6M', '6-12M', '1-2Y', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y', '14-16Y']
  },
  kids_num: {
    label: 'Kids Numbers (16-34)',
    sizes: ['16', '18', '20', '22', '24', '26', '28', '30', '32', '34']
  },
  free_size: {
    label: 'Universal (Free Size)',
    sizes: ['Free Size']
  }
}

export function CreateAllotmentForm({ 
  linemen, 
  articles 
}: { 
  linemen: Profile[], 
  articles: Article[] 
}) {
  const [linemanId, setLinemanId] = useState('')
  const [articleId, setArticleId] = useState('')
  
  // Touched state for validation
  const [touchedLineman, setTouchedLineman] = useState(false)
  const [touchedArticle, setTouchedArticle] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Size Management
  const [activePreset, setActivePreset] = useState<string>('alpha')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [customSizeInput, setCustomSizeInput] = useState('')

  // Color Matrix Management
  const [colorRows, setColorRows] = useState<Array<{
    id: string
    color: string
    quantities: Record<string, number>
  }>>([
    { id: '1', color: 'Navy Blue', quantities: {} },
    { id: '2', color: 'Black', quantities: {} }
  ])

  // Material Requirements Checklist
  const [materials, setMaterials] = useState<Array<{
    id: string
    item_name: string
    required_qty: string
    admin_issued: boolean
  }>>([
    { id: '1', item_name: 'Main Fabric Roll', required_qty: '500 Meters', admin_issued: true },
    { id: '2', item_name: 'Matching Sewing Thread', required_qty: '12 Cones', admin_issued: true },
    { id: '3', item_name: '18L 4-Hole Buttons', required_qty: '1500 pcs', admin_issued: true },
    { id: '4', item_name: 'Main Brand Label', required_qty: '500 pcs', admin_issued: true },
    { id: '5', item_name: 'Size Labels', required_qty: '500 pcs', admin_issued: true },
  ])

  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialQty, setNewMaterialQty] = useState('')

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Selected article details
  const selectedArticle = useMemo(() => {
    return articles.find(a => a.id === articleId)
  }, [articles, articleId])

  // Calculate Grand Matrix Total Pieces
  const totalPieces = useMemo(() => {
    let sum = 0
    colorRows.forEach(row => {
      selectedSizes.forEach(size => {
        const q = row.quantities[size] || 0
        sum += q
      })
    })
    return sum
  }, [colorRows, selectedSizes])

  // Target progress percentage (capped at 100%)
  const targetProgress = totalPieces > 0 ? 100 : 0

  // Add / Remove Sizes
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length === 1) return // Keep at least one size
      setSelectedSizes(selectedSizes.filter(s => s !== size))
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customSizeInput.trim().toUpperCase()
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes, trimmed])
      setCustomSizeInput('')
    }
  }

  // Add / Remove Color Rows
  const addColorRow = () => {
    const newId = Date.now().toString()
    setColorRows([...colorRows, { id: newId, color: '', quantities: {} }])
  }

  const removeColorRow = (id: string) => {
    if (colorRows.length === 1) return
    setColorRows(colorRows.filter(r => r.id !== id))
  }

  const updateColorName = (id: string, color: string) => {
    setColorRows(colorRows.map(r => r.id === id ? { ...r, color } : r))
  }

  const updateQuantity = (id: string, size: string, qty: number) => {
    setColorRows(colorRows.map(r => {
      if (r.id === id) {
        return {
          ...r,
          quantities: {
            ...r.quantities,
            [size]: isNaN(qty) || qty < 0 ? 0 : qty
          }
        }
      }
      return r
    }))
  }

  // Material Checklist Toggles
  const toggleMaterialIssued = (id: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, admin_issued: !m.admin_issued } : m))
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const addCustomMaterial = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaterialName.trim()) return
    const newId = Date.now().toString()
    setMaterials([
      ...materials,
      {
        id: newId,
        item_name: newMaterialName.trim(),
        required_qty: newMaterialQty.trim() || 'As required',
        admin_issued: true
      }
    ])
    setNewMaterialName('')
    setNewMaterialQty('')
  }

  // Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setError(null)
    setSuccess(false)

    if (!linemanId || !articleId) {
      setError('Please select both a Lineman and an Article.')
      return
    }

    if (totalPieces <= 0) {
      setError('Please enter at least 1 piece quantity in the Size & Color Ratio Matrix.')
      return
    }

    // Build payload variants
    const payloadVariants: VariantPayload[] = []
    colorRows.forEach(row => {
      const color = row.color.trim() || 'Default Color'
      selectedSizes.forEach(size => {
        const qty = row.quantities[size] || 0
        if (qty > 0) {
          payloadVariants.push({
            color,
            size,
            quantity: qty
          })
        }
      })
    })

    const payloadMaterials: MaterialPayload[] = materials.map(m => ({
      item_name: m.item_name,
      required_qty: m.required_qty,
      admin_issued: m.admin_issued
    }))

    setIsPending(true)
    const res = await createDetailedAllotment({
      lineman_id: linemanId,
      article_id: articleId,
      target_qty: totalPieces,
      variants: payloadVariants,
      materials: payloadMaterials
    })

    if (res?.error) {
      setError(res.error)
      setIsPending(false)
    } else {
      setSuccess(true)
      setIsPending(false)
      // Reset matrix quantities
      setColorRows(colorRows.map(r => ({ ...r, quantities: {} })))
      setTimeout(() => setSuccess(false), 3500)
    }
  }

  // Field validation flags
  const isLinemanError = (touchedLineman || hasAttemptedSubmit) && !linemanId
  const isLinemanSuccess = Boolean(linemanId)

  const isArticleError = (touchedArticle || hasAttemptedSubmit) && !articleId
  const isArticleSuccess = Boolean(articleId)

  return (
    <div className="space-y-5">
      
      {/* 2. Sticky Page Header */}
      <div 
        className="sticky top-[14px] z-20 bg-white p-5 sm:p-6 rounded-[11px] border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all"
        style={{ borderColor: 'var(--border, #E2E8F0)' }}
      >
        <div className="flex items-center gap-3.5">
          <div 
            className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: 'var(--steel, #2B4C7E)', color: '#FFFFFF' }}
          >
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 
              className="text-[20px] sm:text-[22px] font-bold font-[family-name:var(--font-heading)] leading-tight"
              style={{ color: 'var(--ink, #1C2733)' }}
            >
              Target Allotments & Material Handover
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Assign cut-to-sew size-color ratios & verify raw materials issue
            </p>
          </div>
        </div>

        {/* Grand Target Metric & Progress Bar */}
        <div className="w-full sm:w-auto flex flex-col sm:items-end bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Grand Target:
            </span>
            <span 
              className="text-[22px] font-bold font-[family-name:var(--font-heading)] leading-none"
              style={{ color: 'var(--steel, #2B4C7E)' }}
            >
              {totalPieces.toLocaleString()} <span className="text-[12px] font-normal text-slate-500">pcs</span>
            </span>
          </div>

          {/* 5px Thin Progress Track */}
          <div 
            className="w-full sm:w-36 h-[5px] rounded-full mt-2 overflow-hidden"
            style={{ backgroundColor: 'var(--steel-mist, #EEF3FA)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: totalPieces > 0 ? '100%' : '0%',
                backgroundColor: 'var(--steel, #2B4C7E)' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Allotment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Step 1: Lineman & Article Selection Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
              Select Floor Lineman & Style Article
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Lineman Field with Error/Success validation */}
            <div className="space-y-1.5">
              <label 
                htmlFor="lineman_id" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Assign To Lineman <span className="text-red-500">*</span>
              </label>
              
              <select
                id="lineman_id"
                value={linemanId}
                onChange={(e) => {
                  setLinemanId(e.target.value)
                  setTouchedLineman(true)
                }}
                onBlur={() => setTouchedLineman(true)}
                className={`w-full py-[11px] px-[13px] text-[13.5px] rounded-[8px] border transition-colors outline-none bg-white ${
                  isLinemanError
                    ? 'border-[var(--red,#C0392B)] bg-[var(--red-mist,#FBEAE8)]'
                    : isLinemanSuccess
                    ? 'border-[var(--green,#1F9D63)]'
                    : 'border-[var(--border,#E2E8F0)] focus:border-[var(--steel,#2B4C7E)]'
                }`}
              >
                <option value="">-- Choose Floor Lineman --</option>
                {linemen.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.username} (Line Supervisor)
                  </option>
                ))}
              </select>

              {/* Validation Messages */}
              {isLinemanError && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--red, #C0392B)' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This field is required before assigning target.</span>
                </div>
              )}
              {isLinemanSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green, #1F9D63)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Lineman selected & active on sewing floor.</span>
                </div>
              )}
            </div>

            {/* Article Field with Error/Success validation & Stitching Rate */}
            <div className="space-y-1.5">
              <label 
                htmlFor="article_id" 
                className="block text-[11px] font-semibold uppercase tracking-[1.5px]"
                style={{ color: 'var(--ink-soft, #5B6B7C)' }}
              >
                Style Article (Art No.) <span className="text-red-500">*</span>
              </label>
              
              <select
                id="article_id"
                value={articleId}
                onChange={(e) => {
                  setArticleId(e.target.value)
                  setTouchedArticle(true)
                }}
                onBlur={() => setTouchedArticle(true)}
                className={`w-full py-[11px] px-[13px] text-[13.5px] rounded-[8px] border transition-colors outline-none bg-white ${
                  isArticleError
                    ? 'border-[var(--red,#C0392B)] bg-[var(--red-mist,#FBEAE8)]'
                    : isArticleSuccess
                    ? 'border-[var(--green,#1F9D63)]'
                    : 'border-[var(--border,#E2E8F0)] focus:border-[var(--steel,#2B4C7E)]'
                }`}
              >
                <option value="">-- Choose Article Style --</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.art_no} {a.description ? `- ${a.description}` : ''} {a.stitching_rate ? `(₹${a.stitching_rate}/pc)` : ''}
                  </option>
                ))}
              </select>

              {/* Validation Messages */}
              {isArticleError && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--red, #C0392B)' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This field is required before assigning target.</span>
                </div>
              )}
              {isArticleSuccess && selectedArticle && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--green, #1F9D63)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {selectedArticle.stitching_rate 
                      ? `Stitching rate ₹${selectedArticle.stitching_rate}/pc loaded` 
                      : `${selectedArticle.description || selectedArticle.art_no} loaded`}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Step 2: Size & Color Ratio Matrix Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs space-y-5"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                Size & Color Ratio Matrix
              </h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Configure cutting batch breakdown
            </span>
          </div>

          {/* Size Preset Selector */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Category Preset:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SIZE_PRESETS).map(([key, group]) => {
                const isSelected = activePreset === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActivePreset(key)
                      setSelectedSizes(group.sizes)
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-[6px] border transition-colors outline-none ${
                      isSelected
                        ? 'text-white border-transparent'
                        : 'bg-white text-[var(--ink-soft,#5B6B7C)] hover:text-[var(--ink,#1C2733)] border-[var(--border,#E2E8F0)]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--steel, #2B4C7E)' : '#FFFFFF'
                    }}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Size Chips & Custom Size Add */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Selected Sizes for this Article:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {selectedSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className="px-3 py-1 text-xs font-semibold rounded-[6px] border transition-colors outline-none flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--steel-mist, #EEF3FA)',
                    borderColor: 'var(--steel, #2B4C7E)',
                    color: 'var(--steel-dark, #1F3A63)'
                  }}
                  title="Click to remove size"
                >
                  <span>{size}</span>
                  <span className="text-[10px] opacity-60">×</span>
                </button>
              ))}

              {/* Add Custom Size Inline Form */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  placeholder="+ Size"
                  className="w-20 px-2.5 py-1 text-xs border rounded-[6px] outline-none transition-colors"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddCustomSize(e)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-2.5 py-1 text-xs font-semibold rounded-[6px] border bg-slate-50 hover:bg-slate-100 text-slate-700"
                  style={{ borderColor: 'var(--border, #E2E8F0)' }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Color Rows & Matrix Table (Responsive with horizontal scroll under 900px) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                Piece Matrix Breakdown:
              </label>

              {/* Add Color Button (Outline style in steel) */}
              <button
                type="button"
                onClick={addColorRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-semibold border transition-colors bg-white hover:bg-[var(--steel-mist,#EEF3FA)]"
                style={{
                  borderColor: 'var(--steel, #2B4C7E)',
                  color: 'var(--steel, #2B4C7E)'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Color Row
              </button>
            </div>

            <div className="overflow-x-auto border rounded-[9px]" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--border, #E2E8F0)', color: 'var(--ink-soft, #5B6B7C)' }}>
                    <th className="px-4 py-3 min-w-[160px]">Color / Shade</th>
                    {selectedSizes.map((size) => (
                      <th key={size} className="px-3 py-3 text-center min-w-[75px]">
                        {size}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right min-w-[90px]">Row Total</th>
                    <th className="px-3 py-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colorRows.map((row) => {
                    const rowTotal = selectedSizes.reduce((acc, s) => acc + (row.quantities[s] || 0), 0)
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Color Input */}
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={row.color}
                            onChange={(e) => updateColorName(row.id, e.target.value)}
                            placeholder="e.g. Navy Blue, Black"
                            className="w-full px-2.5 py-1.5 border rounded-[6px] text-xs font-medium outline-none transition-colors"
                            style={{ borderColor: 'var(--border, #E2E8F0)' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'}
                          />
                        </td>

                        {/* Size Inputs */}
                        {selectedSizes.map((size) => (
                          <td key={size} className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              value={row.quantities[size] || ''}
                              onChange={(e) => updateQuantity(row.id, size, parseInt(e.target.value, 10))}
                              placeholder="0"
                              className="w-16 px-2 py-1.5 border rounded-[6px] text-xs text-center font-bold font-mono outline-none transition-colors"
                              style={{ 
                                borderColor: 'var(--border, #E2E8F0)',
                                color: (row.quantities[size] || 0) > 0 ? 'var(--steel, #2B4C7E)' : 'var(--ink-soft, #5B6B7C)'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--steel, #2B4C7E)'
                                e.currentTarget.style.boxShadow = '0 0 0 2px var(--steel-mist, #EEF3FA)'
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            />
                          </td>
                        ))}

                        {/* Row Subtotal */}
                        <td className="px-4 py-2.5 text-right font-bold font-mono text-[13px]" style={{ color: 'var(--steel, #2B4C7E)' }}>
                          {rowTotal} pcs
                        </td>

                        {/* Delete Row Button */}
                        <td className="px-3 py-2.5 text-center">
                          {colorRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColorRow(row.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete color row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Summary Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
                    <td className="px-4 py-3 text-[11px] uppercase tracking-wider" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
                      Total By Size:
                    </td>
                    {selectedSizes.map((size) => {
                      const colSum = colorRows.reduce((acc, r) => acc + (r.quantities[size] || 0), 0)
                      return (
                        <td key={size} className="px-3 py-3 text-center font-mono text-xs font-bold" style={{ color: 'var(--steel, #2B4C7E)' }}>
                          {colSum}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-right font-bold font-mono text-sm" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
                      {totalPieces} pcs
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Step 3: Material Checklist Card */}
        <div 
          className="bg-white rounded-[11px] p-5 sm:p-6 border shadow-xs space-y-4"
          style={{ borderColor: 'var(--border, #E2E8F0)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--border, #E2E8F0)' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--steel-mist,#EEF3FA)] text-[var(--steel,#2B4C7E)] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-[15px] font-bold font-[family-name:var(--font-heading)]" style={{ color: 'var(--ink, #1C2733)' }}>
                BOM Raw Materials Issue Checklist
              </h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--ink-soft, #5B6B7C)' }}>
              Issued materials will require Lineman digital handshake on mobile
            </span>
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.map((mat) => {
              const isChecked = mat.admin_issued
              return (
                <div
                  key={mat.id}
                  onClick={() => toggleMaterialIssued(mat.id)}
                  className={`p-3.5 rounded-[9px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-[var(--green-mist,#E6F6EE)] border-[var(--green,#1F9D63)]'
                      : 'bg-white border-[var(--border,#E2E8F0)] hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className={`block text-xs font-bold truncate ${isChecked ? 'text-[var(--green,#1F9D63)]' : 'text-slate-800'}`}>
                      {mat.item_name}
                    </span>
                    <span className="block text-[11px] text-slate-500 truncate mt-0.5">
                      Qty: {mat.required_qty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isChecked 
                          ? 'bg-[var(--green,#1F9D63)] text-white' 
                          : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeMaterial(mat.id)
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Custom Material Inline Form */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              placeholder="Custom Material Name (e.g. Elastic 25mm)"
              className="w-full sm:flex-2 px-3 py-2 text-xs border rounded-[7px] outline-none"
              style={{ borderColor: 'var(--border, #E2E8F0)' }}
            />
            <input
              type="text"
              value={newMaterialQty}
              onChange={(e) => setNewMaterialQty(e.target.value)}
              placeholder="Quantity / Unit (e.g. 500 Meters)"
              className="w-full sm:flex-1 px-3 py-2 text-xs border rounded-[7px] outline-none"
              style={{ borderColor: 'var(--border, #E2E8F0)' }}
            />
            <button
              type="button"
              onClick={addCustomMaterial}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-[7px] border bg-white hover:bg-slate-50 transition-colors shrink-0"
              style={{ 
                borderColor: 'var(--steel, #2B4C7E)',
                color: 'var(--steel, #2B4C7E)'
              }}
            >
              + Add Material
            </button>
          </div>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Target allotment and BOM materials successfully issued to sewing floor!</span>
          </div>
        )}

        {/* Step 4: Submit Button (Solid Steel with checkmark icon) */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 rounded-[8px] text-[14.5px] font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: 'var(--steel, #2B4C7E)'
            }}
            onMouseEnter={(e) => {
              if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel-dark, #1F3A63)'
            }}
            onMouseLeave={(e) => {
              if (!isPending) e.currentTarget.style.backgroundColor = 'var(--steel, #2B4C7E)'
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Assigning Target...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Assign Target ({totalPieces.toLocaleString()} pcs)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
