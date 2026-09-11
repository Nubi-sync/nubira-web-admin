'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  X,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import {
  getAlterTickets,
  saveScrapRequisition,
  updateTicketResolution
} from '../../utils/alterStorage'
import { ScrapRequisition, ScrapReason, AlterationTicket } from '../../types/alter'

interface DeclareScrapModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeclareScrapModal({
  isOpen,
  onClose,
  onSuccess
}: DeclareScrapModalProps) {
  const [openTickets, setOpenTickets] = useState<AlterationTicket[]>([])
  const [selectedTicketNumber, setSelectedTicketNumber] = useState('')
  const [scrapReason, setScrapReason] = useState<ScrapReason>('HOLE_IN_SHELL')
  const [salvageWeightKg, setSalvageWeightKg] = useState<number>(0.45)
  const [reCutAuthorized, setReCutAuthorized] = useState(true)
  const [authorizedBy, setAuthorizedBy] = useState('Kamlesh Joshi (Quality Recovery Head)')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const all = getAlterTickets()
      const inRework = all.filter(t => t.resolutionStatus === 'IN_REWORK')
      setOpenTickets(inRework)
      if (inRework.length > 0) {
        setSelectedTicketNumber(inRework[0].ticketNumber)
      }
      setError(null)
    }
  }, [isOpen])

  const selectedTicket = openTickets.find(t => t.ticketNumber === selectedTicketNumber)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedTicketNumber) {
      setError('Please select an active ticket to declare scrap.')
      return
    }

    const t = selectedTicket || openTickets[0]
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16)

    const newScrap: ScrapRequisition = {
      id: `scrp-${Date.now()}`,
      scrapCode: `SCRP-${Math.floor(8000 + Math.random() * 900)}`,
      ticketNumber: selectedTicketNumber,
      orderNumber: t?.orderNumber || 'PO-7714',
      buyer: t?.buyer || 'Urban Outfitters',
      styleName: t?.styleName || 'French Terry Relaxed Hoodie',
      size: t?.size || 'M',
      color: t?.color || 'Washed Charcoal',
      scrapReason,
      salvageWeightKg: Number(salvageWeightKg),
      reCutAuthorized,
      sentToCuttingAt: nowStr,
      authorizedBy: authorizedBy.trim()
    }

    saveScrapRequisition(newScrap)
    updateTicketResolution(
      selectedTicketNumber,
      'DECLARED_SCRAP',
      'Kamlesh Joshi',
      'PANEL_REPLACED',
      'Devendra Patel',
      scrapReason,
      0
    )

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
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shadow-2xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Declare Permanent Scrap & Re-Cut Requisition
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                End-Bit Downcycling & Division 03 Cutting Floor Order
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
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Select Irreparable Ticket *
            </label>
            <select
              value={selectedTicketNumber}
              onChange={e => setSelectedTicketNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
            >
              {openTickets.length === 0 ? (
                <option value="">No open tickets available to scrap</option>
              ) : (
                openTickets.map(t => (
                  <option key={t.id} value={t.ticketNumber}>
                    {t.ticketNumber} • {t.garmentBarcode} ({t.styleName} - {t.defectType})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Scrap Root Reason *
              </label>
              <select
                value={scrapReason}
                onChange={e => setScrapReason(e.target.value as ScrapReason)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-rose-800"
              >
                <option value="HOLE_IN_SHELL">HOLE_IN_SHELL (Needle cut / fabric hole)</option>
                <option value="FABRIC_TORN">FABRIC_TORN (Severe seam tear / rip)</option>
                <option value="BURNT_FABRIC">BURNT_FABRIC (Buck steam iron scorch)</option>
                <option value="PERMANENT_STAIN">PERMANENT_STAIN (Insoluble chemical tint)</option>
                <option value="UNSALVAGEABLE_COLOR_BLEED">UNSALVAGEABLE_COLOR_BLEED (Dye bleed)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Salvage Rag Weight (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={salvageWeightKg}
                onChange={e => setSalvageWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reCutAuthorized}
                onChange={e => setReCutAuthorized(e.target.checked)}
                className="rounded text-rose-600"
              />
              <span className="text-rose-900 font-bold">
                Authorize Immediate Single-Piece Replacement Re-Cut to 03. Cutting Floor
              </span>
            </label>
            <p className="text-[11px] text-rose-700">
              Preserves Zero Ghost Piece count: issues replacement cut order for exact size {selectedTicket?.size || 'M'} and color {selectedTicket?.color || 'Washed Charcoal'}.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Quality Head Authorization *
            </label>
            <input
              type="text"
              value={authorizedBy}
              onChange={e => setAuthorizedBy(e.target.value)}
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
              className="px-4 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800 transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Scrap & Issue Re-Cut</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
