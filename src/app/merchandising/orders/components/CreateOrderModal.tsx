'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  Scale,
  Package,
  Scissors,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { MerchandisingOrder, ColorSizeMatrixItem, ActiveBuyer } from '../../types/merchandising'
import { TechPack, TechPackMaterialRequirement } from '@/app/design/types/design'
import { saveOrder, getActiveBuyers } from '../../utils/merchandisingStorage'
import { createBuyerOrderAction, fetchActiveBuyersAction } from '../../actions'
import { fetchTechPacksAction, fetchBrandsAction } from '@/app/design/actions'
import { getStoredTechPacks } from '@/app/design/utils/designStorage'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  availableTechPacks?: TechPack[]
  availableBrands?: { id: string; brand_name: string; brand_code: string }[]
  availableBuyers?: ActiveBuyer[]
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']

function generateAutoPoNumber(buyerCode?: string) {
  const yr = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  const prefix = buyerCode ? buyerCode.toUpperCase().slice(0, 4) : 'PO'
  return `${prefix}-${yr}-${rand}`
}

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
  availableBrands: propBrands,
  availableBuyers: propBuyers
}: CreateOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false)

  // Loaded specs state
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const [brandList, setBrandList] = useState<string[]>([])
  const [activeBuyers, setActiveBuyers] = useState<ActiveBuyer[]>([])

  // Selection Key: "buyer_<id>" or "tp_<id>" or "__CUSTOM__"
  const [selectedProductKey, setSelectedProductKey] = useState<string>('')

  // Step 1 State
  const [poNumber, setPoNumber] = useState(() => generateAutoPoNumber())
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

  // Auto-fetched Tech-Pack details & CAD Visuals
  const [embellishmentSeq, setEmbellishmentSeq] = useState<string>('NONE')
  const [bomMaterials, setBomMaterials] = useState<TechPackMaterialRequirement[]>([])
  const [fabricComposition, setFabricComposition] = useState<string>('')
  const [targetGsm, setTargetGsm] = useState<number>(300)
  const [cadFrontUrl, setCadFrontUrl] = useState<string>('')
  const [cadBackUrl, setCadBackUrl] = useState<string>('')
  const [selectedBuyerRef, setSelectedBuyerRef] = useState<ActiveBuyer | null>(null)

  // Step 2 State (Color & Size Matrix)
  const [colors, setColors] = useState<string[]>(['Standard'])
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({
    'Standard': distributeQuantity(1000, DEFAULT_SIZES)
  })
  const [newColorInput, setNewColorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load tech packs, brands, and buyers when modal opens
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setIsLoadingSpecs(true)

    async function loadCatalog() {
      try {
        const [serverTps, serverBrands, serverBuyers] = await Promise.all([
          fetchTechPacksAction(),
          fetchBrandsAction(),
          fetchActiveBuyersAction()
        ])

        if (!isMounted) return

        // 1. Tech Packs
        const localTps = getStoredTechPacks()
        const tpMap = new Map<string, TechPack>()
        localTps.forEach(tp => { if (tp.id) tpMap.set(tp.id, tp) })
        serverTps.forEach(tp => { if (tp.id) tpMap.set(tp.id, tp) })
        if (propTechPacks && propTechPacks.length > 0) {
          propTechPacks.forEach(tp => { if (tp.id) tpMap.set(tp.id, tp) })
        }
        const combinedTps = Array.from(tpMap.values())
        setTechPacks(combinedTps)

        // 2. Active Buyers
        const localBuyers = getActiveBuyers()
        const buyerMap = new Map<string, ActiveBuyer>()
        localBuyers.forEach(b => { if (b.id) buyerMap.set(b.id, b) })
        serverBuyers.forEach(b => { if (b.id) buyerMap.set(b.id, b) })
        if (propBuyers && propBuyers.length > 0) {
          propBuyers.forEach(b => { if (b.id) buyerMap.set(b.id, b) })
        }
        const combinedBuyers = Array.from(buyerMap.values())
        setActiveBuyers(combinedBuyers)

        // 3. Brands
        const bSet = new Set<string>()
        serverBrands.forEach(b => { if (b.brand_name?.trim()) bSet.add(b.brand_name.trim()) })
        combinedBuyers.forEach(b => { if (b.buyer_name?.trim()) bSet.add(b.buyer_name.trim()) })
        combinedTps.forEach(tp => {
          if (tp.brand_name?.trim() && tp.brand_name.toUpperCase() !== 'INHOUSE') {
            bSet.add(tp.brand_name.trim())
          }
        })
        setBrandList(Array.from(bSet))

        // Prioritize pre-selecting the first linked active buyer
        const firstLinkedBuyer = combinedBuyers.find(b => Boolean(b.linked_article_number))
        if (firstLinkedBuyer) {
          handleSelectOption(`buyer_${firstLinkedBuyer.id}`, combinedBuyers, combinedTps)
        } else if (combinedTps.length > 0) {
          handleSelectOption(`tp_${combinedTps[0].id}`, combinedBuyers, combinedTps)
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

  // Handle master selection (Buyer with Linked Article or Tech-Pack)
  function handleSelectOption(key: string, buyersList = activeBuyers, tpsList = techPacks) {
    setSelectedProductKey(key)

    if (key === '__CUSTOM__' || !key) {
      setSelectedTechPackId('')
      setSelectedBuyerRef(null)
      setStyleRef('')
      setStyleName('')
      setEmbellishmentSeq('NONE')
      setBomMaterials([])
      setCadFrontUrl('')
      setCadBackUrl('')
      return
    }

    if (key.startsWith('buyer_')) {
      const buyerId = key.replace('buyer_', '')
      const b = buyersList.find(x => x.id === buyerId)
      if (!b) return

      setSelectedBuyerRef(b)
      setBrandName(b.buyer_name || b.brand_name || '')
      setStyleRef(b.linked_article_number || '')
      
      const qty = Number(b.contracted_volume) || 1000
      setTotalQuantity(String(qty))
      
      const price = Number(b.price_per_piece) || 1450.00
      setUnitFobPrice(price.toFixed(2))

      // Generate buyer specific auto PO if standard
      if (!poNumber || poNumber.startsWith('PO-')) {
        setPoNumber(generateAutoPoNumber(b.buyer_code))
      }

      // Match linked tech pack
      const artClean = (b.linked_article_number || '').trim().toUpperCase()
      const tp = tpsList.find(t => (t.style_number || '').trim().toUpperCase() === artClean)

      if (tp) {
        setSelectedTechPackId(tp.id)
        setStyleName(`${tp.category} Style ${tp.style_number} (${tp.fabric_composition || '100% Cotton'}, ${tp.target_gsm || 300} GSM)`)
        setEmbellishmentSeq(tp.embellishment_sequence || 'NONE')
        setBomMaterials(tp.materials || [])
        setFabricComposition(tp.fabric_composition || '100% Cotton')
        setTargetGsm(tp.target_gsm || 300)
        setCadFrontUrl(tp.cad_front_url || '')
        setCadBackUrl(tp.cad_back_url || '')
      } else {
        setSelectedTechPackId('')
        setStyleName(`${b.buyer_name} Contract ${b.linked_article_number || ''}`)
        setEmbellishmentSeq('NONE')
        setBomMaterials([])
        setCadFrontUrl('')
        setCadBackUrl('')
      }

      // Auto-distribute matrix to exact quantity
      setColors(['Standard'])
      setMatrixData({
        'Standard': distributeQuantity(qty, DEFAULT_SIZES)
      })
    } else if (key.startsWith('tp_')) {
      const tpId = key.replace('tp_', '')
      const tp = tpsList.find(t => t.id === tpId)
      if (!tp) return

      setSelectedTechPackId(tp.id)
      setSelectedBuyerRef(null)
      setStyleRef(tp.style_number)
      setStyleName(`${tp.category} Style ${tp.style_number} (${tp.fabric_composition || '100% Cotton'}, ${tp.target_gsm || 300} GSM)`)
      setEmbellishmentSeq(tp.embellishment_sequence || 'NONE')
      setBomMaterials(tp.materials || [])
      setFabricComposition(tp.fabric_composition || '100% Cotton')
      setTargetGsm(tp.target_gsm || 300)
      setCadFrontUrl(tp.cad_front_url || '')
      setCadBackUrl(tp.cad_back_url || '')

      if (tp.brand_name && tp.brand_name.toUpperCase() !== 'INHOUSE' && !brandName) {
        setBrandName(tp.brand_name)
      }

      const qty = parseInt(totalQuantity, 10) || 1000
      setMatrixData({
        'Standard': distributeQuantity(qty, DEFAULT_SIZES)
      })
    }
  }

  // Linked buyers vs unlinked buyers
  const linkedBuyers = useMemo(() => {
    return activeBuyers.filter(b => Boolean(b.linked_article_number))
  }, [activeBuyers])

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
    if (!styleRef.trim()) {
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

    // Auto-sync matrix if single colorway
    if (colors.length === 1 && currentMatrixSum !== targetQty) {
      setMatrixData({
        [colors[0]]: distributeQuantity(targetQty, DEFAULT_SIZES)
      })
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
    if (!newColorInput.trim()) return
    const formatted = newColorInput.trim()
    if (colors.includes(formatted)) {
      toast.error(`Color "${formatted}" already exists in the matrix`)
      return
    }

    const updatedColors = [...colors, formatted]
    setColors(updatedColors)
    setNewColorInput('')

    // Distribute evenly across all colors
    const perColorQty = Math.floor(targetQty / updatedColors.length)
    const newMatrix: Record<string, Record<string, number>> = {}
    let allocatedTotal = 0

    updatedColors.forEach((c, idx) => {
      const isLast = idx === updatedColors.length - 1
      const cQty = isLast ? (targetQty - allocatedTotal) : perColorQty
      allocatedTotal += cQty
      newMatrix[c] = distributeQuantity(cQty, DEFAULT_SIZES)
    })

    setMatrixData(newMatrix)
  }

  const handleRemoveColor = (colorToRemove: string) => {
    if (colors.length <= 1) {
      toast.error('You must keep at least one colorway in the matrix')
      return
    }
    const updated = colors.filter(c => c !== colorToRemove)
    setColors(updated)

    const perColorQty = Math.floor(targetQty / updated.length)
    const newMatrix: Record<string, Record<string, number>> = {}
    let allocatedTotal = 0

    updated.forEach((c, idx) => {
      const isLast = idx === updated.length - 1
      const cQty = isLast ? (targetQty - allocatedTotal) : perColorQty
      allocatedTotal += cQty
      newMatrix[c] = distributeQuantity(cQty, DEFAULT_SIZES)
    })

    setMatrixData(newMatrix)
  }

  const handleRebalanceAll = () => {
    if (colors.length === 0) return
    const perColorQty = Math.floor(targetQty / colors.length)
    const newMatrix: Record<string, Record<string, number>> = {}
    let allocatedTotal = 0

    colors.forEach((c, idx) => {
      const isLast = idx === colors.length - 1
      const cQty = isLast ? (targetQty - allocatedTotal) : perColorQty
      allocatedTotal += cQty
      newMatrix[c] = distributeQuantity(cQty, DEFAULT_SIZES)
    })

    setMatrixData(newMatrix)
    toast.success('Matrix quantities rebalanced evenly!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (colors.length === 0) {
      setError('Please add at least one colorway to the matrix.')
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
    const finalStyleRef = styleRef.trim().toUpperCase()

    const newOrder: MerchandisingOrder = {
      id: `ord-${Date.now()}`,
      po_number: poNumber.trim().toUpperCase(),
      brand_name: finalBrand,
      style_ref: finalStyleRef,
      style_name: styleName.trim() || `${finalBrand} ${finalStyleRef}`,
      tech_pack_id: selectedTechPackId || undefined,
      total_quantity: targetQty,
      currency,
      unit_fob_price: unitPrice,
      total_contract_value: totalContractValue,
      ex_factory_date: exFactoryDate || new Date(Date.now() + 25*86400000).toISOString().split('T')[0],
      status: 'BOOKED',
      color_matrix,
      created_at: new Date().toISOString().split('T')[0],
      embellishment_sequence: embellishmentSeq,
      bom_materials: bomMaterials,
      fabric_composition: fabricComposition,
      target_gsm: targetGsm,
      buyer_code: selectedBuyerRef?.buyer_code,
      buyer_id: selectedBuyerRef?.id,
      cad_front_url: cadFrontUrl || undefined,
      cad_back_url: cadBackUrl || undefined
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
        toast.success(`PO ${newOrder.po_number} confirmed! Specs & BOM dispatched to Cutting Floor.`)
      } else {
        toast.info(`PO ${newOrder.po_number} recorded locally.`)
      }

      saveOrder(newOrder)

      // Sync active buyer contracted state if needed
      if (typeof window !== 'undefined') {
        try {
          const rawLays = localStorage.getItem('zigza_cutting_lays_v2')
          const lays = rawLays ? JSON.parse(rawLays) : []
          window.dispatchEvent(new Event('storage'))
        } catch {}
      }

      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || 'Failed to book commercial contract.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header with Stepper Indicator */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10 shadow-2xs">
                Master Buyer PO Booking
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 font-[family-name:var(--font-heading)]">
              {step === 1 ? '1. Commercial Contract & Specs' : '2. Colorway & Size Distribution'}
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Commercial Basics & Auto-Fetched Specs */
            <div className="space-y-4">
              
              {/* Primary: Select Contracted Buyer & Product Dropdown */}
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#3A3564]" />
                    <span>Select Contracted Buyer &amp; Linked Article <span className="text-rose-500">*</span></span>
                  </label>
                  {isLoadingSpecs ? (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-[#3A3564]" /> Loading...
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono font-bold text-[#3A3564]">
                      {linkedBuyers.length} Linked Buyer Contract{linkedBuyers.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={selectedProductKey}
                    onChange={e => handleSelectOption(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none shadow-2xs transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Contracted Buyer / Article --</option>
                    
                    {/* 1. Contracted Buyers (Recommended) */}
                    {linkedBuyers.length > 0 && (
                      <optgroup label="Contracted Buyers (Specs Auto-Linked)">
                        {linkedBuyers.map(b => (
                          <option key={`buyer_${b.id}`} value={`buyer_${b.id}`}>
                            {b.buyer_name} — Art #{b.linked_article_number} ({(Number(b.contracted_volume) || 0).toLocaleString('en-IN')} Pcs @ ₹{b.price_per_piece})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* 2. Other Approved Tech Packs */}
                    {techPacks.length > 0 && (
                      <optgroup label="Other Approved Tech-Packs">
                        {techPacks.map(tp => (
                          <option key={`tp_${tp.id}`} value={`tp_${tp.id}`}>
                            {tp.style_number} — {tp.category} ({tp.fabric_composition || '100% Cotton'}, {tp.target_gsm || 300} GSM)
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <option value="__CUSTOM__">
                      + Custom Style Reference (Manual Entry)
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Row 1: PO Number & Brand/Buyer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Buyer PO Number <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Auto-Generated</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      readOnly
                      value={poNumber}
                      placeholder="e.g. PO-2026-9901"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono uppercase font-bold text-[#3A3564] outline-none shadow-2xs cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setPoNumber(generateAutoPoNumber(selectedBuyerRef?.buyer_code))}
                      title="Generate new PO Number"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#3A3564] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Brand / Principal Buyer <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={Boolean(selectedBuyerRef || (selectedTechPackId && selectedProductKey !== '__CUSTOM__'))}
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="e.g. CANDY POP"
                    className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all ${
                      selectedBuyerRef || (selectedTechPackId && selectedProductKey !== '__CUSTOM__')
                        ? 'bg-[#FAF7F0] border-black/10 cursor-not-allowed'
                        : 'bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564]'
                    }`}
                  />
                </div>
              </div>

              {/* Attached Design Reference CAD Visuals (Clean without extra text box) */}
              {(cadFrontUrl || cadBackUrl || selectedTechPackId) && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Front View CAD */}
                  <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-black/10 flex flex-col items-center justify-center min-h-[110px] text-center shadow-2xs">
                    {cadFrontUrl ? (
                      <div className="w-full flex flex-col items-center">
                        <img 
                          src={cadFrontUrl} 
                          alt="CAD Front" 
                          className="h-20 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-black/5"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-700 mt-1.5 uppercase">Front View CAD</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-slate-400">
                        <Shirt className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                        <span className="text-[10.5px] font-mono text-slate-600 font-bold mt-1">Front CAD Preview</span>
                        <span className="text-[9.5px] text-slate-400">Standard Apparel Outline</span>
                      </div>
                    )}
                  </div>

                  {/* Back View CAD */}
                  <div className="p-3 bg-[#FAF7F0] rounded-2xl border border-black/10 flex flex-col items-center justify-center min-h-[110px] text-center shadow-2xs">
                    {cadBackUrl ? (
                      <div className="w-full flex flex-col items-center">
                        <img 
                          src={cadBackUrl} 
                          alt="CAD Back" 
                          className="h-20 w-auto max-w-full object-contain rounded-lg shadow-2xs bg-white p-1 border border-black/5"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-700 mt-1.5 uppercase">Back View CAD</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-slate-400">
                        <Shirt className="w-7 h-7 text-slate-300 stroke-[1.5] -scale-x-100" />
                        <span className="text-[10.5px] font-mono text-slate-600 font-bold mt-1">Back CAD Preview</span>
                        <span className="text-[9.5px] text-slate-400">Standard Apparel Outline</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Row 2: Style Ref & Target Ex-Factory Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Article / Style Reference <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={Boolean(selectedBuyerRef || (selectedTechPackId && selectedProductKey !== '__CUSTOM__'))}
                    value={styleRef}
                    onChange={e => setStyleRef(e.target.value.toUpperCase())}
                    placeholder="e.g. DEMO-101-03"
                    className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono uppercase font-bold text-slate-900 outline-none shadow-2xs transition-all ${
                      selectedBuyerRef || (selectedTechPackId && selectedProductKey !== '__CUSTOM__')
                        ? 'bg-[#FAF7F0] border-black/10 cursor-not-allowed'
                        : 'bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564]'
                    }`}
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

              {/* Embellishment Routing & Fabric Weight (Clean 2 boxes without extra header banner) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 shadow-2xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Embellishment Routing</span>
                  <span className="font-bold text-[#3A3564] block mt-1 text-xs">
                    {embellishmentSeq === 'NONE' ? 'No Embroidery, No Printing (Cut & Sew)' :
                     embellishmentSeq === 'ONLY_PRINTING' ? 'Only Printing' :
                     embellishmentSeq === 'ONLY_EMBROIDERY' ? 'Only Embroidery' :
                     embellishmentSeq === 'EMBROIDERY_FIRST_THEN_PRINT' ? 'Embroidery First, Then Printing' :
                     embellishmentSeq === 'PRINT_FIRST_THEN_EMBROIDERY' ? 'Printing First, Then Embroidery' :
                     embellishmentSeq}
                  </span>
                </div>

                <div className="p-3 bg-[#FAF7F0] rounded-xl border border-black/10 shadow-2xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">Fabric &amp; Weight</span>
                  <span className="font-bold text-slate-900 block mt-1 text-xs truncate">
                    {fabricComposition || '100% Combed Cotton'} {targetGsm ? `• ${targetGsm} GSM` : ''}
                  </span>
                </div>
              </div>

              {/* Row 3: Currency, FOB Price, Total Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    disabled={Boolean(selectedBuyerRef)}
                    onChange={e => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-sm font-semibold text-slate-900 outline-none shadow-2xs transition-all cursor-pointer disabled:bg-[#FAF7F0] disabled:cursor-not-allowed"
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
                    readOnly={Boolean(selectedBuyerRef)}
                    value={unitFobPrice}
                    onChange={e => setUnitFobPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none shadow-2xs transition-all ${
                      selectedBuyerRef ? 'bg-[#FAF7F0] border-black/10 cursor-not-allowed' : 'bg-slate-50/70 hover:bg-white focus:bg-white focus:border-[#3A3564]'
                    }`}
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
                    readOnly={Boolean(selectedBuyerRef)}
                    value={totalQuantity}
                    onChange={e => setTotalQuantity(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-[#3A3564] outline-none shadow-2xs transition-all ${
                      selectedBuyerRef ? 'bg-[#FAF7F0] border border-black/10 cursor-not-allowed' : 'bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-[#3A3564]'
                    }`}
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
            /* STEP 2: BOM Sheet & Color / Size Distribution */
            <div className="space-y-4">
              
              {/* Uneditable Master Bill of Materials (BOM) Sheet */}
              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-2xs bg-white">
                <div className="px-4 py-3 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#3A3564]" />
                    <span>Bill of Materials (BOM) &amp; Trims Sheet</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-[#3A3564] border border-black/10">
                    {bomMaterials.length} Component{bomMaterials.length === 1 ? '' : 's'} (Read-Only)
                  </span>
                </div>

                {bomMaterials.length > 0 ? (
                  <div className="overflow-x-auto max-h-44">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F0]/80 border-b border-black/5 text-[10px] font-mono font-bold uppercase text-slate-600 sticky top-0 bg-[#FAF7F0]">
                        <tr>
                          <th className="py-2 px-3.5">Component</th>
                          <th className="py-2 px-3.5">Item Description</th>
                          <th className="py-2 px-3.5">Consumption</th>
                          <th className="py-2 px-3.5">Placement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-slate-700">
                        {bomMaterials.map((mat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3.5 font-semibold text-slate-900">{mat.component_type}</td>
                            <td className="py-2 px-3.5">{mat.item_name}</td>
                            <td className="py-2 px-3.5 font-mono font-bold text-[#3A3564]">{mat.consumption || '1.0 unit'}</td>
                            <td className="py-2 px-3.5 font-mono text-slate-500">{mat.placement || 'Full Garment'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3.5 text-center text-xs text-slate-500 italic">
                    Standard garment trim and material specifications applied.
                  </div>
                )}
              </div>

              {/* Metric Balance Bar */}
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
                  placeholder="Add Colorway (e.g. Navy Blue, Sage Olive)..."
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
                    <span>Auto-Balance</span>
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
                    {colors.map(color => {
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
                            {colors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(color)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title={`Remove ${color}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Commercial Specs</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/10 text-xs font-semibold text-slate-600 hover:bg-white transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              onClick={handleNextToStep2}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Color Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || currentMatrixSum !== targetQty}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Book Buyer PO</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
