'use client'

import { useState } from 'react'
import {
  Tag,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { saveHangtagScan } from '../../utils/readyGoodsStorage'
import { HangtagVerification } from '../../types/readyGoods'

interface ScanHangtagModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ScanHangtagModal({
  isOpen,
  onClose,
  onSuccess
}: ScanHangtagModalProps) {
  const [scanCode, setScanCode] = useState('')
  const [orderNumber, setOrderNumber] = useState('PO-7714')
  const [styleName, setStyleName] = useState('French Terry Relaxed Hoodie')
  const [sku, setSku] = useState('UO-HOOD-BLK-L')
  const [size, setSize] = useState('L')
  const [color, setColor] = useState('Washed Charcoal')
  const [operatorName, setOperatorName] = useState('Sanjay Rawat')
  const [kimbleAttached, setKimbleAttached] = useState(true)
  const [silicaInserted, setSilicaInserted] = useState(true)
  const [polybagSealed, setPolybagSealed] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSimulateScan = () => {
    // Generate simulated EAN-13 barcode
    const randomBarcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000)
    setScanCode(randomBarcode)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!scanCode.trim()) {
      setError('Please enter or scan an EAN-13 / UPC barcode.')
      return
    }

    const newScan: HangtagVerification = {
      id: `ht-${Date.now()}`,
      scanCode: scanCode.trim(),
      orderNumber,
      sku: sku.trim(),
      styleName,
      size,
      color,
      kimbleFastenerAttached: kimbleAttached,
      silicaGelInserted: silicaInserted,
      polybagHeatSealed: polybagSealed,
      scanStatus: 'VERIFIED_OK',
      operatorName: operatorName.trim(),
      scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveHangtagScan(newScan)
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
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-lg w-full p-6 space-y-5 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Hangtag Barcode & Polybag Verification
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                EAN-13 / UPC-A Fastener & Silica Gel Moisture Check
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
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                EAN-13 Barcode / UPC Tag *
              </label>
              <button
                type="button"
                onClick={handleSimulateScan}
                className="text-[10px] font-mono font-bold text-[#3A3564] hover:underline"
              >
                Simulate Laser Scan
              </button>
            </div>
            <div className="relative">
              <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={scanCode}
                onChange={e => setScanCode(e.target.value)}
                placeholder="Scan or enter 13-digit EAN barcode..."
                required
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono font-black text-[#3A3564] focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Order PO
              </label>
              <select
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
              >
                <option value="PO-7714">PO-7714 (Urban Outfitters)</option>
                <option value="PO-8102">PO-8102 (Zara Men)</option>
                <option value="PO-9045">PO-9045 (Pull & Bear)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Buyer SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Garment Size
              </label>
              <select
                value={size}
                onChange={e => setSize(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Packing Operator
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Physical Verification Checklist */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2.5">
            <span className="text-xs font-mono font-bold text-[#3A3564] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Packing Station Physical Inspection Checklist
            </span>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kimbleAttached}
                  onChange={e => setKimbleAttached(e.target.checked)}
                  className="rounded text-[#3A3564] focus:ring-[#3A3564]"
                />
                <span className="text-slate-700">
                  Hangtag attached with Kimble tag gun / Micro-Tach fastener (armhole/neck)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={silicaInserted}
                  onChange={e => setSilicaInserted(e.target.checked)}
                  className="rounded text-[#3A3564] focus:ring-[#3A3564]"
                />
                <span className="text-slate-700">
                  2g Silica Gel moisture-absorption desiccant pouch placed inside
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={polybagSealed}
                  onChange={e => setPolybagSealed(e.target.checked)}
                  className="rounded text-[#3A3564] focus:ring-[#3A3564]"
                />
                <span className="text-slate-700">
                  Buyer-compliant polybag with warning text cleanly folded and adhesive sealed
                </span>
              </label>
            </div>
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
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Verify & Record Polybag</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
