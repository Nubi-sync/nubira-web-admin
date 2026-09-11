'use client'

import { useState } from 'react'
import { X, Check, ArrowRight, Layers, Tag, QrCode, UserCheck } from 'lucide-react'
import { MaterialFloorIssueChallan, MaterialDestination } from '../../types/store'
import { createMaterialIssueChallan } from '../../utils/storeStorage'

interface IssueMaterialChallanModalProps {
  isOpen: boolean
  onClose: () => void
}

export function IssueMaterialChallanModal({ isOpen, onClose }: IssueMaterialChallanModalProps) {
  const [issueChallanNo, setIssueChallanNo] = useState(`CHL-FLR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
  const [destinationDivision, setDestinationDivision] = useState<MaterialDestination>('CUTTING_FLOOR')
  const [orderId, setOrderId] = useState('ORD-ZARA-7812')
  const [articleNo, setArticleNo] = useState('ART-7812-CREW')
  const [buyerName, setBuyerName] = useState('Zara Inditex Spain')
  const [receiverName, setReceiverName] = useState('Suresh Verma (Cutting CAD In-Charge)')
  const [issuedBy, setIssuedBy] = useState('Kishan Chand (Chief Storekeeper)')
  const [barcodesRaw, setBarcodesRaw] = useState('RLL-2026-9812, RLL-2026-9813')
  const [materialSummary, setMaterialSummary] = useState('100% Combed Cotton Single Jersey (Shade A) • 2 Rolls (222.5m)')
  const [quantityIssued, setQuantityIssued] = useState<number>(222.5)
  const [unit, setUnit] = useState<string>('meters')
  const [notes, setNotes] = useState<string>('Dispatched for Marker Lay #01.')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleDestinationChange = (dest: MaterialDestination) => {
    setDestinationDivision(dest)
    if (dest === 'CUTTING_FLOOR') {
      setReceiverName('Suresh Verma (Cutting CAD In-Charge)')
      setUnit('meters')
      setBarcodesRaw('RLL-2026-9812, RLL-2026-9813')
      setMaterialSummary('100% Combed Cotton Single Jersey (Shade A) • 2 Rolls (222.5m)')
      setQuantityIssued(222.5)
    } else {
      setReceiverName('Ramesh Kumar (Line 01 Supervisor)')
      setUnit('sets')
      setBarcodesRaw('TRM-THRD-01, TRM-LBL-01, TRM-LBL-02')
      setMaterialSummary('BOM Trims Package: 48 Cones Thread, 2,400 Neck Labels, 2,400 Care Labels')
      setQuantityIssued(2400)
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
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564]/10 text-[#3A3564] flex items-center justify-center font-bold">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Issue Material to Production Floor
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Barcode Verified Material Delivery Challan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Issue Challan Number
              </label>
              <input
                type="text"
                value={issueChallanNo}
                onChange={(e) => setIssueChallanNo(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Destination Shop Floor
              </label>
              <select
                value={destinationDivision}
                onChange={(e) => handleDestinationChange(e.target.value as MaterialDestination)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
              >
                <option value="CUTTING_FLOOR">Division 03 • Cutting Floor (Fabric Rolls)</option>
                <option value="SEWING_FLOOR">Division 06 • Stitching Lines (Trims BOM)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Production Order
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Article No
              </label>
              <input
                type="text"
                value={articleNo}
                onChange={(e) => setArticleNo(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Buyer Client
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
              Scanned Material Barcodes (Comma Separated)
            </label>
            <div className="relative">
              <input
                type="text"
                value={barcodesRaw}
                onChange={(e) => setBarcodesRaw(e.target.value)}
                placeholder="RLL-2026-9812, RLL-2026-9813"
                className="w-full pl-9 pr-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Material Description
              </label>
              <input
                type="text"
                value={materialSummary}
                onChange={(e) => setMaterialSummary(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Qty & Unit
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={quantityIssued}
                  onChange={(e) => setQuantityIssued(parseFloat(e.target.value) || 0)}
                  className="w-2/3 px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/3 px-2 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Receiver Floor Supervisor
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Dispatching Storekeeper
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
              Handover Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dispatched via trolley corridor"
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#3A3564] text-white text-xs font-mono font-bold hover:bg-[#2e2a52] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
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
