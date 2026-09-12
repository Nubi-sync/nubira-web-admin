'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { MerchandisingOrder, ColorSizeMatrixItem } from '../../types/merchandising'
import { saveOrder } from '../../utils/merchandisingStorage'
import { createBuyerOrderAction } from '../../actions'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const REGISTERED_BRANDS = [
  'Zara Global',
  'Ollypop Kids',
  'H&M Basics',
  'Nubira Essentials',
  'Mango Casuals',
  'Uniqlo Core'
]

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [error, setError] = useState<string | null>(null)

  // Step 1 State
  const [poNumber, setPoNumber] = useState('')
  const [brandName, setBrandName] = useState(REGISTERED_BRANDS[0])
  const [styleRef, setStyleRef] = useState('')
  const [styleName, setStyleName] = useState('')
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>('INR')
  const [unitFobPrice, setUnitFobPrice] = useState<string>('750.00')
  const [totalQuantity, setTotalQuantity] = useState<string>('5000')
  const [exFactoryDate, setExFactoryDate] = useState('')

  // Step 2 State
  const [colors, setColors] = useState<string[]>(['Jet Black', 'Optic White'])
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, number>>>({
    'Jet Black': { 'XS': 1000, 'S': 1500, 'M': 1500, 'L': 1000, 'XL': 0 },
    'Optic White': { 'XS': 1000, 'S': 1500, 'M': 1500, 'L': 1000, 'XL': 0 }
  })
  const [newColorInput, setNewColorInput] = useState('')

  if (!isOpen) return null

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
      setError('Buyer PO Number is mandatory (e.g. PO-ZIG-8902)')
      return
    }
    if (!styleRef.trim() || !styleName.trim()) {
      setError('Style reference and style description are required')
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
    if (!newColorInput.trim()) return
    const trimmed = newColorInput.trim()
    if (!colors.includes(trimmed)) {
      setColors(prev => [...prev, trimmed])
      setMatrixData(prev => ({
        ...prev,
        [trimmed]: { 'XS': 0, 'S': 0, 'M': 0, 'L': 0, 'XL': 0 }
      }))
    }
    setNewColorInput('')
  }

  const handleRemoveColor = (color: string) => {
    if (colors.length <= 1) return
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

    if (currentMatrixSum !== targetQty) {
      setError(`Matrix breakdown total (${currentMatrixSum.toLocaleString()} pcs) must match Target PO Quantity (${targetQty.toLocaleString()} pcs). Delta: ${qtyDelta.toLocaleString()} pcs.`)
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

    const newOrder: MerchandisingOrder = {
      id: `ord-${Date.now()}`,
      po_number: poNumber.trim().toUpperCase(),
      brand_name: brandName,
      style_ref: styleRef.trim().toUpperCase() || 'ART-HD-8821',
      style_name: styleName.trim() || 'Custom Bulk Order',
      total_quantity: targetQty,
      currency,
      unit_fob_price: unitPrice,
      total_contract_value: totalContractValue,
      ex_factory_date: exFactoryDate || new Date(Date.now() + 45*86400000).toISOString().split('T')[0],
      status: 'BOOKED',
      color_matrix,
      created_at: new Date().toISOString().split('T')[0]
    }

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
      toast.success(`PO ${newOrder.po_number} synced to Supabase! (8 T&A Milestones Auto-Generated)`)
    } else {
      toast.error(res.error || 'Failed to save to Supabase.')
    }

    saveOrder(newOrder)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden">
        {/* Header with Stepper Indicator */}
        <div className="px-6 py-5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#3A3564]/10 text-[#3A3564]">
                Form 1 • Master Buyer PO Stepper
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Step {step} of 2
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#09090b] mt-1 font-[family-name:var(--font-heading)]">
              {step === 1 ? '1. Commercial Order Details' : '2. Color & Size Distribution Matrix'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Commercial Basics */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Buyer PO Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={e => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-ZIG-8902"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Brand / Principal Buyer *
                  </label>
                  <select
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-white"
                  >
                    {REGISTERED_BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Style Code / Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={styleRef}
                    onChange={e => setStyleRef(e.target.value)}
                    placeholder="e.g. ZG-HOOD-02"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Target Ex-Factory Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={exFactoryDate}
                    onChange={e => setExFactoryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Garment Silhouette & Material Description *
                </label>
                <input
                  type="text"
                  required
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  placeholder="e.g. Heavyweight Fleece Pullover Hoodie 380 GSM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Commercial Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-white"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Unit FOB Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitFobPrice}
                    onChange={e => setUnitFobPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Total Order Quantity (Pcs) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={totalQuantity}
                    onChange={e => setTotalQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-bold text-[#3A3564]"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Color & Size Matrix Entry */
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-black/5">
                <div>
                  <span className="text-slate-500 font-medium">Target Contract Pcs:</span>{' '}
                  <strong className="text-slate-900 font-bold">{targetQty.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Matrix Sum:</span>{' '}
                  <strong className={currentMatrixSum === targetQty ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {currentMatrixSum.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Delta:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${qtyDelta === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {qtyDelta === 0 ? 'Balanced (0)' : `${qtyDelta > 0 ? '+' : ''}${qtyDelta.toLocaleString()} pcs`}
                  </span>
                </div>
              </div>

              {/* Add Color Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={e => setNewColorInput(e.target.value)}
                  placeholder="Add Colorway (e.g. Sage Green, Heather Grey)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Color
                </button>
              </div>

              {/* Matrix Table */}
              <div className="border border-black/10 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="px-3.5 py-2.5">Colorway</th>
                      {DEFAULT_SIZES.map(s => (
                        <th key={s} className="px-3 py-2.5 text-center">{s}</th>
                      ))}
                      <th className="px-3.5 py-2.5 text-right">Row Total</th>
                      <th className="px-2 py-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
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
                                value={row[size] || 0}
                                onChange={e => handleCellChange(color, size, e.target.value)}
                                className="w-16 px-2 py-1 text-center font-mono rounded-lg border border-black/10 focus:ring-1 focus:ring-[#3A3564] focus:outline-none"
                              />
                            </td>
                          ))}
                          <td className="px-3.5 py-2 text-right font-bold text-[#3A3564]">
                            {rowSum.toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {colors.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(color)}
                                className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
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

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-black/10 flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Basics
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNextToStep2}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3A3564] hover:bg-[#2A2649] shadow-sm transition-all"
              >
                Continue to Color Matrix
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Book Purchase Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
