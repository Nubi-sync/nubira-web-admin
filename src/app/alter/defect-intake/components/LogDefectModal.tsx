'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  X,
  Plus,
  QrCode,
  Sparkles,
  CheckCircle2,
  Scissors
} from 'lucide-react'
import { saveAlterTicket } from '../../utils/alterStorage'
import {
  AlterationTicket,
  DefectSource,
  DefectType,
  AssignedStation
} from '../../types/alter'

interface LogDefectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function LogDefectModal({
  isOpen,
  onClose,
  onSuccess
}: LogDefectModalProps) {
  const [ticketNumber, setTicketNumber] = useState('')
  const [garmentBarcode, setGarmentBarcode] = useState('')
  const [orderNumber, setOrderNumber] = useState('PO-7714')
  const [buyer, setBuyer] = useState('Urban Outfitters')
  const [styleName, setStyleName] = useState('French Terry Relaxed Hoodie')
  const [size, setSize] = useState('L')
  const [color, setColor] = useState('Washed Charcoal')
  const [defectSource, setDefectSource] = useState<DefectSource>('SEWING_LINE')
  const [defectType, setDefectType] = useState<DefectType>('SKIP_STITCH')
  const [defectDescription, setDefectDescription] = useState('')
  const [linemanName, setLinemanName] = useState('Dinesh Prasad (Line 2 Operator)')
  const [assignedStation, setAssignedStation] = useState<AssignedStation>('Mending Station 01')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const randomCode = Math.floor(5500 + Math.random() * 400)
      setTicketNumber(`ALT-${randomCode}`)
      const randPcs = Math.floor(1 + Math.random() * 30)
      setGarmentBarcode(`BDL-7714-04-P${randPcs < 10 ? '0' + randPcs : randPcs}`)
      setDefectDescription('')
      setError(null)
    }
  }, [isOpen])

  // Automatically suggest assigned station based on defect type
  useEffect(() => {
    if (defectType === 'OIL_STAIN') {
      setAssignedStation('Spot Cleaning Gun 05')
    } else if (defectType === 'SKIP_STITCH') {
      setAssignedStation('Mending Station 01')
    } else if (defectType === 'SEAM_OPEN' || defectType === 'PUCKERING') {
      setAssignedStation('Mending Station 02')
    } else if (defectType === 'SIZE_MISTAG') {
      setAssignedStation('Mending Station 03')
    } else if (defectType === 'FABRIC_HOLE') {
      setAssignedStation('Mending Station 04')
    }
  }, [defectType])

  const handleOrderChange = (po: string) => {
    setOrderNumber(po)
    if (po === 'PO-7714') {
      setBuyer('Urban Outfitters')
      setStyleName('French Terry Relaxed Hoodie')
      setColor('Washed Charcoal')
    } else if (po === 'PO-8102') {
      setBuyer('Zara Men')
      setStyleName('Slub Cotton Henley Tee')
      setColor('Natural Oatmeal')
    } else {
      setBuyer('Pull & Bear')
      setStyleName('Washed Twill Cargo Bottoms')
      setColor('Olive Drab')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!ticketNumber.trim()) {
      setError('Ticket number is required.')
      return
    }

    if (!garmentBarcode.trim()) {
      setError('Garment bundle barcode is required.')
      return
    }

    const newTicket: AlterationTicket = {
      id: `alt-${Date.now()}`,
      ticketNumber: ticketNumber.trim(),
      garmentBarcode: garmentBarcode.trim(),
      orderNumber,
      buyer,
      styleName,
      size,
      color,
      sourceDivision: defectSource,
      defectType,
      defectDescription: defectDescription.trim() || `${defectType} defect logged from ${defectSource}`,
      linemanEmployeeId: 'emp-lineman-custom',
      linemanName: linemanName.trim(),
      assignedStation,
      resolutionStatus: 'IN_REWORK',
      repairCost: 0,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveAlterTicket(newTicket)
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
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Form 1: Log Inward Defect & Triage
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Pareto Defect Intake & Lineman Operator Attribution
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
                Ticket Voucher (ALT-XXXX) *
              </label>
              <input
                type="text"
                value={ticketNumber}
                onChange={e => setTicketNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono font-black text-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Garment Bundle Barcode *
              </label>
              <input
                type="text"
                value={garmentBarcode}
                onChange={e => setGarmentBarcode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Order PO *
              </label>
              <select
                value={orderNumber}
                onChange={e => handleOrderChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
              >
                <option value="PO-7714">PO-7714 (Urban Outfitters)</option>
                <option value="PO-8102">PO-8102 (Zara Men)</option>
                <option value="PO-9045">PO-9045 (Pull & Bear)</option>
              </select>
            </div>
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
                <option value="30">30</option>
                <option value="32">32</option>
                <option value="34">34</option>
              </select>
            </div>
          </div>

          {/* Defect Origin & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Originating Source Division *
              </label>
              <select
                value={defectSource}
                onChange={e => setDefectSource(e.target.value as DefectSource)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="SEWING_LINE">06. Stitching & Sewing Floor</option>
                <option value="WASHING">07. Industrial Washing Plant</option>
                <option value="IRONING">08. Steam Ironing Station</option>
                <option value="PACKING_AQL">09. Ready Goods (AQL 2.5 Rejects)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                ASTM Defect Taxonomy *
              </label>
              <select
                value={defectType}
                onChange={e => setDefectType(e.target.value as DefectType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-amber-800"
              >
                <option value="SKIP_STITCH">SKIP_STITCH (Skipped Stitches)</option>
                <option value="SEAM_OPEN">SEAM_OPEN (Open Seam / Low SPI)</option>
                <option value="OIL_STAIN">OIL_STAIN (Machine Lubricant)</option>
                <option value="PUCKERING">PUCKERING (Uneven Tension)</option>
                <option value="FABRIC_HOLE">FABRIC_HOLE (Needle Cut / Tear)</option>
                <option value="SIZE_MISTAG">SIZE_MISTAG (Wrong Label / Tag)</option>
                <option value="SHADING">SHADING (Fabric Lot Mismatch)</option>
              </select>
            </div>
          </div>

          {/* Lineman Attribution & Assigned Station */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Responsible Lineman / Operator *
              </label>
              <select
                value={linemanName}
                onChange={e => setLinemanName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium text-slate-800"
              >
                <option value="Dinesh Prasad (Line 2 Operator)">Dinesh Prasad (Line 2 Operator)</option>
                <option value="Sunita Sharma (Line 4 Operator)">Sunita Sharma (Line 4 Operator)</option>
                <option value="Kishore Jena (Line 1 Overlock)">Kishore Jena (Line 1 Overlock)</option>
                <option value="Manoj Tiwari (Line 5 Assembly)">Manoj Tiwari (Line 5 Assembly)</option>
                <option value="Santosh Rawat (Line 5 Operator)">Santosh Rawat (Line 5 Operator)</option>
                <option value="Pappu Lal (Buck Table 4)">Pappu Lal (Buck Table 4)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Assigned Clinic Workstation *
              </label>
              <select
                value={assignedStation}
                onChange={e => setAssignedStation(e.target.value as AssignedStation)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="Mending Station 01">Mending Station 01 (Collar & Neck)</option>
                <option value="Mending Station 02">Mending Station 02 (Flatlock & Seams)</option>
                <option value="Mending Station 03">Mending Station 03 (Labels & Welts)</option>
                <option value="Mending Station 04">Mending Station 04 (Panel Replacement)</option>
                <option value="Spot Cleaning Gun 05">Spot Cleaning Gun 05 (Oil Dissolver)</option>
                <option value="Spot Cleaning Gun 06">Spot Cleaning Gun 06 (Water/Dye Desk)</option>
              </select>
            </div>
          </div>

          {/* Defect Description */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Physical Defect Description & Yellow Arrow Location
            </label>
            <textarea
              value={defectDescription}
              onChange={e => setDefectDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Skipped 4 stitches along kangaroo pocket curve; yellow defect sticker placed on left apex."
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
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
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Register Inward Defect (Form 1)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
