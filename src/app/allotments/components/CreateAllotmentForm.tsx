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
  Sparkles,
  Palette,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

type Profile = { id: string; username: string }
type Article = { id: string; art_no: string; description?: string }

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

// Preset standard materials for garment factory
const DEFAULT_MATERIAL_PRESETS = [
  { item_name: 'Main Fabric Roll', defaultQty: 'Meters' },
  { item_name: 'Sewing Thread Cones', defaultQty: 'Cones' },
  { item_name: 'Buttons', defaultQty: 'pcs' },
  { item_name: 'Main Brand Neck Label', defaultQty: 'pcs' },
  { item_name: 'Size / Wash Care Labels', defaultQty: 'pcs' },
  { item_name: 'Packaging Polybags', defaultQty: 'pcs' },
]

export function CreateAllotmentForm({ 
  linemen, 
  articles 
}: { 
  linemen: Profile[], 
  articles: Article[] 
}) {
  const [linemanId, setLinemanId] = useState('')
  const [articleId, setArticleId] = useState('')
  
  // Size Management
  const [activePreset, setActivePreset] = useState<string>('alpha')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [customSizeInput, setCustomSizeInput] = useState('')

  // Color Matrix Management
  // Array of { color: string, quantities: { [size: string]: number } }
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

  // Calculate Total Quantity
  const grandTotal = useMemo(() => {
    let total = 0
    colorRows.forEach(row => {
      selectedSizes.forEach(size => {
        total += Number(row.quantities[size]) || 0
      })
    })
    return total
  }, [colorRows, selectedSizes])

  // Handle Preset Change
  const handlePresetSelect = (presetKey: string) => {
    setActivePreset(presetKey)
    setSelectedSizes(SIZE_PRESETS[presetKey].sizes.slice(0, 6)) // default take first 6
  }

  // Toggle Size in Active List
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter(s => s !== size))
      }
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  // Add Custom Size
  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase()
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes, trimmed])
      setCustomSizeInput('')
    }
  }

  // Color Rows Management
  const addColorRow = () => {
    setColorRows([
      ...colorRows,
      { id: Date.now().toString(), color: '', quantities: {} }
    ])
  }

  const removeColorRow = (id: string) => {
    if (colorRows.length > 1) {
      setColorRows(colorRows.filter(r => r.id !== id))
    }
  }

  const updateColorName = (id: string, color: string) => {
    setColorRows(colorRows.map(r => r.id === id ? { ...r, color } : r))
  }

  const updateQuantity = (rowId: string, size: string, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10) || 0
    setColorRows(colorRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          quantities: {
            ...r.quantities,
            [size]: qty
          }
        }
      }
      return r
    }))
  }

  // Material Management
  const addMaterial = () => {
    if (newMaterialName.trim()) {
      setMaterials([
        ...materials,
        {
          id: Date.now().toString(),
          item_name: newMaterialName.trim(),
          required_qty: newMaterialQty.trim() || 'As Required',
          admin_issued: true
        }
      ])
      setNewMaterialName('')
      setNewMaterialQty('')
    }
  }

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const toggleMaterialIssued = (id: string) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, admin_issued: !m.admin_issued } : m))
  }

  // Form Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(false)

    if (!linemanId) {
      setError('Please select a Lineman.')
      setIsPending(false)
      return
    }

    if (!articleId) {
      setError('Please select an Article.')
      setIsPending(false)
      return
    }

    if (grandTotal <= 0) {
      setError('Please enter quantities in the Size & Color Matrix.')
      setIsPending(false)
      return
    }

    // Build variants array
    const variants: VariantPayload[] = []
    colorRows.forEach(row => {
      const color = row.color.trim() || 'Default'
      selectedSizes.forEach(size => {
        const qty = Number(row.quantities[size]) || 0
        if (qty > 0) {
          variants.push({ color, size, quantity: qty })
        }
      })
    })

    // Build materials array
    const materialList: MaterialPayload[] = materials.map(m => ({
      item_name: m.item_name,
      required_qty: m.required_qty,
      admin_issued: m.admin_issued
    }))

    const result = await createDetailedAllotment({
      lineman_id: linemanId,
      article_id: articleId,
      target_qty: grandTotal,
      variants,
      materials: materialList
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Reset
      setGrandTotalState()
    }

    setIsPending(false)
  }

  const setGrandTotalState = () => {
    setColorRows([
      { id: '1', color: 'Navy Blue', quantities: {} },
      { id: '2', color: 'Black', quantities: {} }
    ])
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-purple-500/20">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Production Allotment & Handover</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assign target with Size-Color ratio & Material Checklist</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Grand Target</span>
          <span className="text-2xl font-black text-purple-600">{grandTotal} <span className="text-xs font-medium text-slate-500">pcs</span></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Lineman & Article */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Lineman (Supervisor) *
            </label>
            <select
              value={linemanId}
              onChange={(e) => setLinemanId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none transition-all"
            >
              <option value="">-- Choose Lineman --</option>
              {linemen.map((lm) => (
                <option key={lm.id} value={lm.id}>{lm.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Select Article (Style #) *
            </label>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-2xl px-4 py-3 text-slate-900 font-medium outline-none transition-all"
            >
              <option value="">-- Choose Article --</option>
              {articles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.art_no} {art.description ? `(${art.description})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Dynamic Size Selector */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Layers className="h-4 w-4 text-purple-600" />
              <span>3. Choose Size Category & Presets</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SIZE_PRESETS).map(([key, item]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => handlePresetSelect(key)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    activePreset === key 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Available Sizes Checklist */}
          <div>
            <div className="text-xs font-medium text-slate-500 mb-2">
              Select/Deselect sizes for this garment, or add custom:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SIZE_PRESETS[activePreset]?.sizes.map(size => {
                const isSelected = selectedSizes.includes(size)
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-400 shadow-sm'
                        : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {size} {isSelected ? '✓' : '+'}
                  </button>
                )
              })}

              {/* Custom Size Addition */}
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="text"
                  placeholder="+ Custom Size (e.g. 50, 2-3Y)"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 w-36"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Size & Color Ratio Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Palette className="h-4 w-4 text-indigo-600" />
              <span>4. Size & Color Ratio Matrix</span>
            </div>
            <button
              type="button"
              onClick={addColorRow}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Color
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-bold">
                  <th className="px-4 py-3 min-w-[140px]">Color / Shade</th>
                  {selectedSizes.map(size => (
                    <th key={size} className="px-3 py-3 text-center min-w-[70px]">
                      {size}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right min-w-[90px]">Subtotal</th>
                  <th className="px-2 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {colorRows.map((row) => {
                  const rowSubtotal = selectedSizes.reduce((sum, s) => sum + (Number(row.quantities[s]) || 0), 0)

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      {/* Color Input */}
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Navy Blue"
                          value={row.color}
                          onChange={(e) => updateColorName(row.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-purple-500 outline-none"
                        />
                      </td>

                      {/* Sizes Inputs */}
                      {selectedSizes.map(size => (
                        <td key={size} className="px-2 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={row.quantities[size] || ''}
                            onChange={(e) => updateQuantity(row.id, size, e.target.value)}
                            className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-black text-slate-900 focus:bg-white focus:border-purple-500 outline-none"
                          />
                        </td>
                      ))}

                      {/* Subtotal */}
                      <td className="px-4 py-2.5 text-right font-black text-purple-700 text-sm">
                        {rowSubtotal} <span className="text-xs font-normal text-slate-400">pcs</span>
                      </td>

                      {/* Delete Row */}
                      <td className="px-2 py-2.5 text-center">
                        {colorRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColorRow(row.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50/70 border-t-2 border-purple-200 font-bold text-slate-800 text-xs">
                  <td className="px-4 py-3 uppercase tracking-wider font-extrabold text-purple-900">
                    Grand Target Total
                  </td>
                  {selectedSizes.map(size => {
                    const colTotal = colorRows.reduce((sum, r) => sum + (Number(r.quantities[size]) || 0), 0)
                    return (
                      <td key={size} className="px-2 py-3 text-center text-purple-900 font-black">
                        {colTotal}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-right text-base font-black text-purple-900">
                    {grandTotal} pcs
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Step 4: Material Requirements & Handover Checklist */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <PackageCheck className="h-4 w-4 text-emerald-600" />
              <span>5. Raw Materials & Accessories Handover Checklist</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Tick items you have handed over</span>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {materials.map((mat) => (
              <div 
                key={mat.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  mat.admin_issued 
                    ? 'bg-white border-emerald-300 shadow-sm' 
                    : 'bg-slate-100 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={mat.admin_issued}
                    onChange={() => toggleMaterialIssued(mat.id)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{mat.item_name}</div>
                    <div className="text-[11px] text-slate-500">Required: <span className="font-semibold text-emerald-700">{mat.required_qty}</span></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeMaterial(mat.id)}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Custom Material */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              placeholder="Item name (e.g. 5-inch Brass Zipper)"
              value={newMaterialName}
              onChange={(e) => setNewMaterialName(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              placeholder="Quantity (e.g. 500 pcs, 20m)"
              value={newMaterialQty}
              onChange={(e) => setNewMaterialQty(e.target.value)}
              className="w-full sm:w-44 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-xs sm:text-sm p-4 rounded-2xl border border-rose-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs sm:text-sm p-4 rounded-2xl border border-emerald-200">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Allotment created with Size-Color Ratio & Material Checklist successfully!</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl px-6 py-4 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-purple-600/20 text-base"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating Allotment & Handover...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" /> Assign Target ({grandTotal} Pieces)
            </>
          )}
        </button>
      </form>
    </div>
  )
}