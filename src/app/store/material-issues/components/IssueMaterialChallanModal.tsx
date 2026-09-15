'use client'

import { useState, useEffect } from 'react'
import { X, Check, ArrowRight, Layers, Tag, QrCode, UserCheck, Sparkles } from 'lucide-react'
import { MaterialFloorIssueChallan, MaterialDestination } from '../../types/store'
import { createMaterialIssueChallan, getFabricRolls } from '../../utils/storeStorage'
import { getOrders } from '@/app/merchandising/utils/merchandisingStorage'

interface IssueMaterialChallanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IssueMaterialChallanModal({ isOpen, onClose }: IssueMaterialChallanModalProps) {
  const [issueChallanNo, setIssueChallanNo] = useState(`CHL-FLR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
  const [destinationDivision, setDestinationDivision] = useState<MaterialDestination>('CUTTING_FLOOR')
  const [orderId, setOrderId] = useState('PO-2026-9901')
  const [articleNo, setArticleNo] = useState('TP-2026-8801')
  const [buyerName, setBuyerName] = useState('ZARA INTERNATIONAL')
  const [receiverName, setReceiverName] = useState('Cutting Master R. Veerappan')
  const [issuedBy, setIssuedBy] = useState('Store Incharge Suresh Kumar')
  const [barcodesRaw, setBarcodesRaw] = useState('ROL-2026-9901, ROL-2026-9902')
  const [materialSummary, setMaterialSummary] = useState('100% Cotton French Terry 380 GSM (Orange & Green)')
  const [quantityIssued, setQuantityIssued] = useState<number>(900)
  const [unit, setUnit] = useState<string>('meters')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    const orders = getOrders()
    const rolls = getFabricRolls()

    const latestPo = orders.find(o => o.po_number === 'PO-2026-9901') || orders[0]
    if (latestPo) {
      setOrderId(latestPo.po_number)
      setBuyerName(latestPo.brand_name || 'ZARA INTERNATIONAL')
      setArticleNo(latestPo.style_ref || 'TP-2026-8801')

      const colorsList = latestPo.color_matrix?.map((c: any) => c.color).join(' & ') || 'Orange & Green'
      setMaterialSummary(`100% Cotton French Terry 380 GSM (${colorsList})`)
    }

    if (rolls && rolls.length > 0) {
      const activeBarcodes = rolls.map(r => r.rollBarcode).join(', ')
      setBarcodesRaw(activeBarcodes)
      const totalMeters = rolls.reduce((acc, r) => acc + (r.netMeterage || 0), 0)
      if (totalMeters > 0) setQuantityIssued(totalMeters)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDestinationChange = (dest: MaterialDestination) => {
    setDestinationDivision(dest)
    if (dest === 'CUTTING_FLOOR') {
      setReceiverName('Cutting Supervisor')
      setUnit('meters')
    } else {
      setReceiverName('Sewing Supervisor')
      setUnit('sets')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const barcodes = barcodesRaw
        .split(',')
        .map(b => b.trim())
        .filter(b => b.length > 0)

      const challan: MaterialFloorIssueChallan = {
        id: `chl-${Date.now()}`,
        issueChallanNo,
        destinationDivision,
        orderId,
        articleNo,
        buyerName,
        receiverEmployeeId: destinationDivision === 'CUTTING_FLOOR' ? 'emp-cut-02' : 'emp-sew-01',
        receiverName,
        issuedBy,
        scannedBarcodes: barcodes,
        materialSummary,
        quantityIssued,
        unit,
        status: 'IN_TRANSIT_TO_FLOOR',
        issuedAt: new Date().toISOString(),
        notes: notes.trim() || undefined
      }

      createMaterialIssueChallan(challan)
      onClose()
    } catch (err) {
      console.error('Failed to issue challan:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold shadow-2xs">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                Issue Material to Production Floor
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5 font-[family-name:var(--font-public-sans)]">
                Barcode Verified Material Delivery Challan & Floor Handshake
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-black/10 text-slate-400 hover:text-slate-800 hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Challan Number
              </label>
              <input
                type="text"
                value={issueChallanNo}
                onChange={(e) => setIssueChallanNo(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Destination Shop Floor
              </label>
              <select
                value={destinationDivision}
                onChange={(e) => handleDestinationChange(e.target.value as MaterialDestination)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 cursor-pointer"
              >
                <option value="CUTTING_FLOOR">Division 03 • Cutting Floor (Fabric Rolls)</option>
                <option value="SEWING_FLOOR">Division 06 • Stitching Lines (Trims BOM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Production Order
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. PO-2026-991"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Article No
              </label>
              <input
                type="text"
                value={articleNo}
                onChange={(e) => setArticleNo(e.target.value)}
                placeholder="e.g. #609"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Buyer Client
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. ZARA"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Scanned Material Barcodes (Comma Separated)
            </label>
            <div className="relative">
              <input
                type="text"
                value={barcodesRaw}
                onChange={(e) => setBarcodesRaw(e.target.value)}
                placeholder="e.g. RLL-2026-9812, RLL-2026-9813"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Material Description
              </label>
              <input
                type="text"
                value={materialSummary}
                onChange={(e) => setMaterialSummary(e.target.value)}
                placeholder="e.g. 100% Combed Cotton Single Jersey (Sage Olive)"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Qty & Unit
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={quantityIssued}
                  onChange={(e) => setQuantityIssued(parseFloat(e.target.value) || 0)}
                  className="w-2/3 px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                  required
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 px-3 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-mono font-bold text-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Receiver Floor Supervisor
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Dispatching Storekeeper
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Handover Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via trolley corridor"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F0] border border-black/10 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-black/10 text-sm font-bold text-slate-700 hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#3A3564] text-white text-sm font-bold hover:bg-[#2A2649] transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Dispatching...' : 'Authorize Challan Dispatch'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
