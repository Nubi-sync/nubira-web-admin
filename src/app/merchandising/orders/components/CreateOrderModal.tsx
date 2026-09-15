'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2,
  Building2,
  Shirt,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  Loader2,
  Palette,
  Scale
} from 'lucide-react'
import { toast } from 'sonner'
import { MerchandisingOrder, ColorSizeMatrixItem } from '../../types/merchandising'
import { TechPack } from '@/app/design/types/design'
import { saveOrder } from '../../utils/merchandisingStorage'
import { createBuyerOrderAction } from '../../actions'
import { fetchTechPacksAction, fetchBrandsAction } from '@/app/design/actions'
import { getStoredTechPacks } from '@/app/design/utils/designStorage'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  availableTechPacks?: TechPack[]
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

// Standard apparel distribution ratios (XS: 5%, S: 20%, M: 40%, L: 25%, XL: 10%)
function distributeQuantity(amount: number, sizes: string[]): Record<string, number> {
  const result: Record<string, number> = {}
  sizes.forEach(s => { result[s] = 0 })
  if (amount <= 0) return result

  const ratios: Record<string, number> = {
    'XS': 0.05,
    'S': 0.20,
    'M': 0.40,
    'L': 0.25,
    'XL': 0.10
  }

  let allocated = 0
  sizes.forEach((size, idx) => {
    if (idx === sizes.length - 1) {
      // Allocate remaining to guarantee exact sum match
      result[size] = Math.max(0, amount - allocated)
    } else {
      const ratio = ratios[size] ?? (1 / sizes.length)
      const qty = Math.round(amount * ratio)
      result[size] = qty
      allocated += qty
    }
  })

  return result
}

export function CreateOrderModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  availableTechPacks: propTechPacks,
  availableBrands: propBrands
}: CreateOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)

  // Loaded specs state
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const [brandList, setBrandList] = useState<string[]>([])

  // Step 1 State
  const [poNumber, setPoNumber] = useState('PO-2026-9901')
  const [brandName, setBrandName] = useState('')
  const [selectedTechPackId, setSelectedTechPackId] = useState<string>('')
  const [styleRef, setStyleRef] = useState('')
  const [styleName, setStyleName] = useState('')
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR')
  const [unitFobPrice, setUnitFobPrice] = useState<string>('1450.00')
  const [totalQuantity, setTotalQuantity] = useState<string>('1000')
  const [exFactoryDate, setExFactoryDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 25)
    return d.toISOString().split('T')[0]
  })

  // Step 2 State (Color & Size Matrix) - Starts fresh with 0 pre-populated colors
  const [colors, setColors] = useState<string[]>([])
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({})
  const [newColorInput, setNewColorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load tech packs and brands once when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setIsLoadingSpecs(true)

    async function loadCatalog() {
      try {
        const [serverTps, serverBrands] = await Promise.all([
          fetchTechPacksAction(),
          fetchBrandsAction()
        ])

        if (!isMounted) return

        const localTps = getStoredTechPacks()
        const tpMap = new Map<string, TechPack>()
        
        // Key STRICTLY by ID so renamed tech packs don't duplicate
        localTps.forEach(tp => {
          if (tp.id) tpMap.set(tp.id, tp)
        })
        serverTps.forEach(tp => {
          if (tp.id) tpMap.set(tp.id, tp)
        })

        if (propTechPacks && propTechPacks.length > 0) {
          propTechPacks.forEach(tp => {
            if (tp.id) tpMap.set(tp.id, tp)
          })
        }

        // Canonical list strictly from map values
        const combinedTps = Array.from(tpMap.values())
        setTechPacks(combinedTps)

        // Sync fresh server records back to localStorage to wipe any old stale style names
        if (typeof window !== 'undefined' && serverTps.length > 0) {
          localStorage.setItem('zigza_design_tech_packs_v2', JSON.stringify(serverTps))
        }

        // Gather real brands from DB and tech packs only (no fake hardcoded brands)
        const bSet = new Set<string>()
        serverBrands.forEach(b => {
          if (b.brand_name && b.brand_name.trim()) bSet.add(b.brand_name.trim())
        })
        if (propBrands) {
          propBrands.forEach(b => {
            if (b.brand_name && b.brand_name.trim()) bSet.add(b.brand_name.trim())
          })
        }
        combinedTps.forEach(tp => {
          if (tp.brand_name && tp.brand_name.trim() && tp.brand_name.toUpperCase() !== 'INHOUSE') {
            bSet.add(tp.brand_name.trim())
          }
        })
        setBrandList(Array.from(bSet))

        // Automatically pre-select the active tech pack (prioritize TP-2026-8801)
        if (combinedTps.length > 0) {
          const targetTp = combinedTps.find(t => t.style_number.toUpperCase().includes('8801') || t.style_number === 'TP-2026-8801') || combinedTps[0]
          setSelectedTechPackId(targetTp.id)
          setStyleRef(targetTp.style_number)
          setStyleName(`${targetTp.category} Style ${targetTp.style_number} (${targetTp.fabric_composition || '100% Cotton'}, ${targetTp.target_gsm || 380} GSM)`)
          if (targetTp.brand_name && targetTp.brand_name.toUpperCase() !== 'INHOUSE' && !brandName) {
            setBrandName(targetTp.brand_name)
          }
        }
      } catch (err) {
        console.error('[CreateOrderModal] Catalog load note:', err)
      } finally {
        if (isMounted) setIsLoadingSpecs(false)
      }
    }

    loadCatalog()
    return () => { isMounted = false }
  }, [isOpen])

  if (!isOpen) return null

  // Handle tech pack selection
  const handleTechPackSelect = (tpId: string) => {
    setSelectedTechPackId(tpId)
    if (tpId === '__CUSTOM__') {
      setStyleRef('')
      setStyleName('')
      return
    }
    const found = techPacks.find(p => p.id === tpId)
    if (found) {
      setStyleRef(found.style_number)
      setStyleName(`${found.category} Style ${found.style_number} (${found.fabric_composition || '100% Cotton'}, ${found.target_gsm || 380} GSM)`)
      if (found.brand_name && found.brand_name.toUpperCase() !== 'INHOUSE') {
        setBrandName(found.brand_name)
      }
    }
  }

  // Calculate current sum in matrix
  const currentMatrixSum = colors.reduce((acc, color) => {
    const row = matrixData[color] || {}
    const rowSum = DEFAULT_SIZES.reduce((rAcc, size) => rAcc + (row[size] || 0), 0)
    return acc + rowSum
  }, 0)

  const targetQty = parseInt(totalQuantity, 10) || 0
  const qtyDelta = targetQty - currentMatrixSum

  const handleNextToStep2 = () => {
    setError(null)
    if (!poNumber.trim()) {
      setError('Buyer PO Number is mandatory (e.g. PO-2026-9901)')
      return
    }
    if (!brandName.trim()) {
      setError('Please specify the Brand / Principal Buyer name')
      return
    }
    if (!styleRef.trim() || !styleName.trim()) {
      setError('Please select an Approved Style Tech Pack or specify a Style Reference')
      return
    }
    if (targetQty <= 0) {
      setError('Total Order Quantity must be greater than 0')
      return
    }
    if (!exFactoryDate) {
      setError('Target Ex-Factory Date is required')
      return
    }
    setStep(2)
  }

  const handleCellChange = (color: string, size: string, value: string) => {
    const num = parseInt(value, 10) || 0
    setMatrixData(prev => ({
      ...prev,
      [color]: {
        ...(prev[color] || {}),
        [size]: Math.max(0, num)
      }
    }))
  }

  const handleAddColor = () => {
    const trimmed = newColorInput.trim()
    if (!trimmed) return
    if (colors.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Colorway "${trimmed}" is already in the matrix.`)
      return
    }

    const updatedColors = [...colors, trimmed]
    const remainingDelta = targetQty - currentMatrixSum

    if (colors.length === 0) {
      // First color: gets the entire targetQty distributed
      const allocatedSizes = distributeQuantity(targetQty, DEFAULT_SIZES)
      setColors(updatedColors)
      setMatrixData({ [trimmed]: allocatedSizes })
    } else if (remainingDelta > 0) {
      // If user pre-edited existing colors down, new color takes the remaining delta!
      const allocatedSizes = distributeQuantity(remainingDelta, DEFAULT_SIZES)
      setColors(updatedColors)
      setMatrixData(prev => ({
        ...prev,
        [trimmed]: allocatedSizes
      }))
    } else {
      // Delta is 0 (or sum equals targetQty): split targetQty equally across all colors!
      const newMatrix: Record<string, Record<string, number>> = {}
      const perColor = Math.floor(targetQty / updatedColors.length)
      let allocated = 0

      updatedColors.forEach((c, idx) => {
        const quota = (idx === updatedColors.length - 1) ? Math.max(0, targetQty - allocated) : perColor
        allocated += quota
        newMatrix[c] = distributeQuantity(quota, DEFAULT_SIZES)
      })

      setColors(updatedColors)
      setMatrixData(newMatrix)
    }

    setNewColorInput('')
    setError(null)
  }

  const handleRebalanceAll = () => {
    if (colors.length === 0 || targetQty <= 0) return
    const newMatrix: Record<string, Record<string, number>> = {}
    const perColor = Math.floor(targetQty / colors.length)
    let allocated = 0

    colors.forEach((c, idx) => {
      const quota = (idx === colors.length - 1) ? Math.max(0, targetQty - allocated) : perColor
      allocated += quota
      newMatrix[c] = distributeQuantity(quota, DEFAULT_SIZES)
    })

    setMatrixData(newMatrix)
    toast.success(`Re-balanced ${targetQty.toLocaleString()} pcs equally across ${colors.length} colorways.`)
  }

  const handleRemoveColor = (color: string) => {
    setColors(prev => prev.filter(c => c !== color))
    setMatrixData(prev => {
      const copy = { ...prev }
      delete copy[color]
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (colors.length === 0) {
      setError('Please add at least one colorway (e.g. Orange, Green) to the matrix.')
      return
    }

    if (currentMatrixSum !== targetQty) {
      setError(`Matrix breakdown total (${currentMatrixSum.toLocaleString()} pcs) must match Target PO Quantity (${targetQty.toLocaleString()} pcs). Delta: ${qtyDelta > 0 ? `+${qtyDelta}` : qtyDelta} pcs.`)
      return
    }

    const color_matrix: ColorSizeMatrixItem[] = colors.map(color => {
      const row = matrixData[color] || {}
      const rowTotal = DEFAULT_SIZES.reduce((acc, s) => acc + (row[s] || 0), 0)
      return {
        color,
        sizes: row,
        total: rowTotal
      }
    })

    const unitPrice = parseFloat(unitFobPrice) || 0
    const totalContractValue = targetQty * unitPrice
    setIsSubmitting(true)

    const finalBrand = brandName.trim()
    const finalStyleRef = styleRef.trim().toUpperCase() || 'TP-2026-8801'

    const newOrder: MerchandisingOrder = {
      id: `ord-${Date.now()}`,
      po_number: poNumber.trim().toUpperCase(),
      brand_name: finalBrand,
      style_ref: finalStyleRef,
      style_name: styleName.trim() || 'Custom Bulk Order',
      tech_pack_id: selectedTechPackId !== '__CUSTOM__' ? selectedTechPackId : undefined,
      total_quantity: targetQty,
      currency,
      unit_fob_price: unitPrice,
      total_contract_value: totalContractValue,
      ex_factory_date: exFactoryDate || new Date(Date.now() + 25*86400000).toISOString().split('T')[0],
      status: 'BOOKED',
      color_matrix,
      created_at: new Date().toISOString().split('T')[0]
    }

    try {
      const res = await createBuyerOrderAction({
        po_number: newOrder.po_number,
        brand_name: newOrder.brand_name,
        style_ref: newOrder.style_ref,
        total_quantity: newOrder.total_quantity,
        unit_fob_price: newOrder.unit_fob_price,
        currency: newOrder.currency,
        ex_factory_date: newOrder.ex_factory_date,
        color_matrix: newOrder.color_matrix
      })

      if (res.success) {
        toast.success(`PO ${newOrder.po_number} confirmed in Supabase! (T&A Milestones Auto-Generated)`)
      } else {
        toast.error(res.error || 'Failed to save to Supabase.')
      }

      saveOrder(newOrder)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book commercial contract.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header with Stepper Indicator — Zigza Executive standard */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                Form 1 • Master Buyer PO Stepper
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
              {step === 1 ? '1. Commercial Order Details' : '2. Color & Size Distribution Matrix'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Commercial Basics */
            <div className="space-y-4">
              
              {/* Row 1: PO Number & Brand/Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Buyer PO Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={e => setPoNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. PO-2026-9901"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono uppercase font-bold text-[#3A3564] outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Brand / Principal Buyer <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      placeholder="e.g. ZARA INTERNATIONAL"
                      list="known-brands-list"
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                    />
                    <datalist id="known-brands-list">
                      {brandList.map(b => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </div>
                  {brandList.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">Saved:</span>
                      {brandList.slice(0, 4).map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrandName(b)}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10 hover:bg-[#3A3564] hover:text-white transition-colors shrink-0 cursor-pointer"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Approved Style Tech Pack Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-[#3A3564]" />
                    <span>Approved Style / Tech Pack <span className="text-rose-500">*</span></span>
                  </label>
                  {isLoadingSpecs ? (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading specs...
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-[#3A3564] font-semibold">
                      {techPacks.length} Tech Pack{techPacks.length === 1 ? '' : 's'} Available
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={selectedTechPackId}
                    onChange={e => handleTechPackSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all appearance-none cursor-pointer"
                  >
                    {techPacks.map(tp => (
                      <option key={tp.id} value={tp.id}>
                        {tp.style_number} — {tp.category} ({tp.fabric_composition || '100% Cotton'}, {tp.target_gsm || 380} GSM) [{tp.status}]
                      </option>
                    ))}
                    <option value="__CUSTOM__">
                      + Custom Style Reference (Manual Entry)
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Row 3: Style Ref & Target Ex-Factory Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Style Code / Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={styleRef}
                    onChange={e => setStyleRef(e.target.value.toUpperCase())}
                    placeholder="e.g. TP-2026-8801"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono uppercase font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Target Ex-Factory Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={exFactoryDate}
                    onChange={e => setExFactoryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Garment Silhouette & Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                  Garment Silhouette & Material Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  placeholder="e.g. Heavyweight Relaxed French Terry Hoodie 380 GSM"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Row 5: Currency, FOB Price, Total Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Unit FOB Price ({currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹'}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitFobPrice}
                    onChange={e => setUnitFobPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Total Order Quantity (Pcs) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={totalQuantity}
                    onChange={e => setTotalQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-mono font-bold text-[#3A3564] outline-none shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Summary Telemetry Pill */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Estimated Commercial Revenue:</span>
                <span className="font-mono font-bold text-[#3A3564] text-sm">
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹'}
                  {((parseFloat(unitFobPrice) || 0) * (parseInt(totalQuantity, 10) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

            </div>
          ) : (
            /* STEP 2: Color & Size Matrix Entry */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs">
                <div>
                  <span className="text-slate-600 font-medium">Target Contract Pcs:</span>{' '}
                  <strong className="font-mono text-slate-900 font-bold">{targetQty.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-600 font-medium">Matrix Sum:</span>{' '}
                  <strong className={`font-mono font-bold ${currentMatrixSum === targetQty ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {currentMatrixSum.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 font-medium">Delta:</span>{' '}
                  <span className={`font-mono px-2.5 py-0.5 rounded-full text-[11px] font-bold ${qtyDelta === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                    {qtyDelta === 0 ? 'Balanced (0)' : `${qtyDelta > 0 ? '+' : ''}${qtyDelta.toLocaleString()} pcs`}
                  </span>
                </div>
              </div>

              {/* Add Color Input & Balance Tool */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={e => setNewColorInput(e.target.value)}
                  placeholder="Add Colorway (e.g. Orange, Sage Olive)..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs font-medium text-slate-900 outline-none shadow-2xs transition-all"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddColor()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-4 py-2.5 bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 text-[#3A3564] font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Color</span>
                </button>
                {colors.length > 1 && (
                  <button
                    type="button"
                    onClick={handleRebalanceAll}
                    className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-black/10 text-slate-700 font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-xs"
                    title="Re-distribute total contract quantity equally across all colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-[#3A3564]" />
                    <span>Even Balance</span>
                  </button>
                )}
              </div>

              {/* Matrix Table */}
              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-semibold uppercase text-[11px] font-mono">
                    <tr>
                      <th className="px-3.5 py-2.5">Colorway</th>
                      {DEFAULT_SIZES.map(s => (
                        <th key={s} className="px-3 py-2.5 text-center">{s}</th>
                      ))}
                      <th className="px-3.5 py-2.5 text-right">Row Total</th>
                      <th className="px-2 py-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-xs">
                    {colors.length === 0 ? (
                      <tr>
                        <td colSpan={DEFAULT_SIZES.length + 3} className="px-4 py-8 text-center bg-white">
                          <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#3A3564]">
                              <Palette className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-bold text-slate-800">No Colorways Added Yet</p>
                              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                                Enter your color name above (e.g. <span className="font-mono font-semibold text-slate-700">Orange</span>, <span className="font-mono font-semibold text-slate-700">Green</span>) and click <span className="font-bold text-[#3A3564]">+ Add Color</span> to automatically distribute the <span className="font-mono font-bold text-slate-800">{targetQty.toLocaleString()} pcs</span> order quantity.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      colors.map(color => {
                        const row = matrixData[color] || {}
                        const rowSum = DEFAULT_SIZES.reduce((acc, s) => acc + (row[s] || 0), 0)
                        return (
                          <tr key={color} className="hover:bg-slate-50/50">
                            <td className="px-3.5 py-2 font-semibold text-slate-900 whitespace-nowrap">
                              {color}
                            </td>
                            {DEFAULT_SIZES.map(size => (
                              <td key={size} className="px-2 py-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={row[size] ?? 0}
                                  onChange={e => handleCellChange(color, size, e.target.value)}
                                  className="w-16 px-2 py-1.5 text-center font-mono rounded-lg border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 bg-white text-slate-900 font-semibold outline-none"
                                />
                              </td>
                            ))}
                            <td className="px-3.5 py-2 text-right font-bold text-[#3A3564] font-mono">
                              {rowSum.toLocaleString()}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(color)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title={`Remove ${color}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Basics</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-black/10 hover:bg-slate-100 rounded-xl shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNextToStep2}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer transition-all"
              >
                <span>Continue to Color Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Booking Order...' : 'Book Commercial Contract'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
