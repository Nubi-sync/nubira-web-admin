'use client'

import { useState, useEffect } from 'react'
import {
  PackageCheck,
  X,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Boxes,
  Plus,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react'
import { saveReadyGoodsCarton } from '../../utils/readyGoodsStorage'
import { ReadyGoodsCarton } from '../../types/readyGoods'

interface SealCartonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SealCartonModal({
  isOpen,
  onClose,
  onSuccess
}: SealCartonModalProps) {
  const [cartonNumber, setCartonNumber] = useState('')
  const [orderNumber, setOrderNumber] = useState('PO-7714')
  const [buyer, setBuyer] = useState('Urban Outfitters')
  const [styleName, setStyleName] = useState('French Terry Relaxed Hoodie')
  const [color, setColor] = useState('Washed Charcoal')
  const [bundleInput, setBundleInput] = useState('BDL-7714-19, BDL-7714-20')
  
  // Size Breakdown
  const [sizeS, setSizeS] = useState(10)
  const [sizeM, setSizeM] = useState(15)
  const [sizeL, setSizeL] = useState(15)
  const [sizeXL, setSizeXL] = useState(0)

  const totalPieces = Number(sizeS) + Number(sizeM) + Number(sizeL) + Number(sizeXL)

  // Weight
  const [unitBOMWeightKg, setUnitBOMWeightKg] = useState(0.43) // per garment
  const tareWeightKg = 0.95 // 5-ply export box + tape + silica
  const expectedGrossWeight = (totalPieces * unitBOMWeightKg) + tareWeightKg
  const [measuredGrossWeight, setMeasuredGrossWeight] = useState(18.20)

  const weightVariance = measuredGrossWeight - expectedGrossWeight
  const isVarianceOk = Math.abs(weightVariance) <= 0.15

  const [godownBay, setGodownBay] = useState<'BAY_3' | 'BAY_4' | 'BAY_5'>('BAY_3')
  const [sealedBy, setSealedBy] = useState('Rajesh Kumar (Packing Line 1)')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const randomCode = Math.floor(100 + Math.random() * 900)
      setCartonNumber(`CTN-0${randomCode}`)
      setMeasuredGrossWeight(Number((expectedGrossWeight + 0.04).toFixed(2)))
      setError(null)
    }
  }, [isOpen])

  // Recalculate default measured weight when pieces change
  useEffect(() => {
    setMeasuredGrossWeight(Number((expectedGrossWeight + 0.04).toFixed(2)))
  }, [totalPieces])

  const handleOrderChange = (po: string) => {
    setOrderNumber(po)
    if (po === 'PO-7714') {
      setBuyer('Urban Outfitters')
      setStyleName('French Terry Relaxed Hoodie')
      setColor('Washed Charcoal')
      setUnitBOMWeightKg(0.43)
      setGodownBay('BAY_3')
      setBundleInput('BDL-7714-19, BDL-7714-20')
    } else if (po === 'PO-8102') {
      setBuyer('Zara Men')
      setStyleName('Slub Cotton Henley Tee')
      setColor('Natural Oatmeal')
      setUnitBOMWeightKg(0.23)
      setGodownBay('BAY_4')
      setBundleInput('BDL-8102-21, BDL-8102-22')
    } else {
      setBuyer('Pull & Bear')
      setStyleName('Washed Twill Cargo Bottoms')
      setColor('Olive Drab')
      setUnitBOMWeightKg(0.48)
      setGodownBay('BAY_5')
      setBundleInput('BDL-9045-15, BDL-9045-16')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!cartonNumber.trim()) {
      setError('Carton Barcode Number is required.')
      return
    }

    if (totalPieces <= 0) {
      setError('A carton must contain at least 1 garment.')
      return
    }

    const bundleIds = bundleInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (bundleIds.length === 0) {
      setError('At least one cutting bundle QR ticket must be scanned to satisfy Zero Ghost Piece traceability.')
      return
    }

    const sizeBreakdown: Record<string, number> = {}
    if (sizeS > 0) sizeBreakdown['S'] = sizeS
    if (sizeM > 0) sizeBreakdown['M'] = sizeM
    if (sizeL > 0) sizeBreakdown['L'] = sizeL
    if (sizeXL > 0) sizeBreakdown['XL'] = sizeXL

    const newCarton: ReadyGoodsCarton = {
      id: `ctn-${Date.now()}`,
      cartonNumber: cartonNumber.trim(),
      orderId: `ord-${orderNumber.toLowerCase()}`,
      orderNumber,
      buyer,
      styleName,
      color,
      totalPieces,
      sizeBreakdown,
      packedBundleIds: bundleIds,
      measuredGrossWeightKg: Number(measuredGrossWeight.toFixed(2)),
      expectedGrossWeightKg: Number(expectedGrossWeight.toFixed(2)),
      weightVarianceKg: Number(weightVariance.toFixed(2)),
      status: 'PACKED',
      godownBay,
      dimensionsCm: '60x40x40',
      cbmVolume: 0.096,
      sealedBy: sealedBy.trim(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveReadyGoodsCarton(newCarton)
    onSuccess()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Form 2: Seal & Register Master Carton
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Zero Ghost Piece Bundle Ceilings & Weighbridge Scale Validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold font-mono px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Carton Barcode # (CTN-XXXXX) *
              </label>
              <input
                type="text"
                value={cartonNumber}
                onChange={e => setCartonNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono font-black text-[#3A3564] focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Purchase Order PO *
              </label>
              <select
                value={orderNumber}
                onChange={e => handleOrderChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800 focus:outline-none"
              >
                <option value="PO-7714">PO-7714 (Urban Outfitters)</option>
                <option value="PO-8102">PO-8102 (Zara Men)</option>
                <option value="PO-9045">PO-9045 (Pull & Bear)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Buyer & Garment Style
              </label>
              <input
                type="text"
                value={`${buyer} • ${styleName}`}
                readOnly
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Storage Bay Location *
              </label>
              <select
                value={godownBay}
                onChange={e => setGodownBay(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="BAY_3">Central Godown Bay 3 (Hoodies/Knits)</option>
                <option value="BAY_4">Central Godown Bay 4 (Tees/Polos)</option>
                <option value="BAY_5">Central Godown Bay 5 (Bottoms/Pants)</option>
              </select>
            </div>
          </div>

          {/* Zero Ghost Piece Bundle Binding Input */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Scanned Cutting Bundles (FK Linking) *
            </label>
            <input
              type="text"
              value={bundleInput}
              onChange={e => setBundleInput(e.target.value)}
              placeholder="e.g. BDL-7714-01, BDL-7714-02"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Directly binds cutting bundles to carton in `ready_goods_carton_bundles`.
            </span>
          </div>

          {/* Size Breakdown Grid */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#3A3564] uppercase">
                Packing Ratio Size Breakdown
              </span>
              <span className="text-xs font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-black/10">
                Sum: {totalPieces} Garments
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-mono font-bold text-center text-slate-600 uppercase mb-0.5">
                  Size S
                </label>
                <input
                  type="number"
                  min={0}
                  value={sizeS}
                  onChange={e => setSizeS(Number(e.target.value))}
                  className="w-full text-center py-1.5 text-xs font-mono font-bold rounded-lg border border-black/10 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-center text-slate-600 uppercase mb-0.5">
                  Size M
                </label>
                <input
                  type="number"
                  min={0}
                  value={sizeM}
                  onChange={e => setSizeM(Number(e.target.value))}
                  className="w-full text-center py-1.5 text-xs font-mono font-bold rounded-lg border border-black/10 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-center text-slate-600 uppercase mb-0.5">
                  Size L
                </label>
                <input
                  type="number"
                  min={0}
                  value={sizeL}
                  onChange={e => setSizeL(Number(e.target.value))}
                  className="w-full text-center py-1.5 text-xs font-mono font-bold rounded-lg border border-black/10 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-center text-slate-600 uppercase mb-0.5">
                  Size XL
                </label>
                <input
                  type="number"
                  min={0}
                  value={sizeXL}
                  onChange={e => setSizeXL(Number(e.target.value))}
                  className="w-full text-center py-1.5 text-xs font-mono font-bold rounded-lg border border-black/10 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Digital Weighbridge Gross Weight Integration */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#3A3564]" />
                Digital Weighbridge Gross Weight Check
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isVarianceOk
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                Tolerance (±0.15 kg): {isVarianceOk ? 'PASSED' : 'OUT OF SPEC'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Theoretical BOM</span>
                <div className="font-mono font-black text-slate-700 text-sm mt-0.5">
                  {expectedGrossWeight.toFixed(2)} kg
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Scale Reading</span>
                <input
                  type="number"
                  step="0.01"
                  value={measuredGrossWeight}
                  onChange={e => setMeasuredGrossWeight(Number(e.target.value))}
                  className="w-full text-center font-mono font-black text-[#3A3564] text-sm mt-0.5 border-b border-black/10 focus:outline-none"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Scale Variance</span>
                <div
                  className={`font-mono font-black text-sm mt-0.5 ${
                    isVarianceOk ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {weightVariance >= 0 ? '+' : ''}
                  {weightVariance.toFixed(2)} kg
                </div>
              </div>
            </div>

            {!isVarianceOk && (
              <p className="text-[11px] text-rose-700 font-medium">
                Warning: Variance exceeds ±0.15 kg. Verify garment count to prevent missing or foreign pieces.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Packing Station Operator Signoff *
            </label>
            <input
              type="text"
              value={sealedBy}
              onChange={e => setSealedBy(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-bold hover:bg-[#2c284e] transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Seal & Register Carton (Form 2)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
