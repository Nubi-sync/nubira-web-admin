'use client'

import { useState, useEffect } from 'react'
import {
  Scissors,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Wrench,
  Sparkles
} from 'lucide-react'
import {
  getAlterTickets,
  updateTicketResolution
} from '../../utils/alterStorage'
import {
  AlterationTicket,
  RepairAction,
  ResolutionStatus,
  ScrapReason
} from '../../types/alter'

interface SignOffRepairModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialTicketId?: string
}

export function SignOffRepairModal({
  isOpen,
  onClose,
  onSuccess,
  initialTicketId
}: SignOffRepairModalProps) {
  const [openTickets, setOpenTickets] = useState<AlterationTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [menderName, setMenderName] = useState('Fatima Bano (Master Seamstress)')
  const [repairActionTaken, setRepairActionTaken] = useState<RepairAction>('SEAM_RE_STITCHED')
  const [inspectorName, setInspectorName] = useState('Devendra Patel (ISO Certified Lead Auditor)')
  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus>('REPAIRED_PASSED')
  const [scrapReason, setScrapReason] = useState<ScrapReason>('HOLE_IN_SHELL')
  const [repairCost, setRepairCost] = useState<number>(18.50)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const all = getAlterTickets()
      const openOnly = all.filter(t => t.resolutionStatus === 'IN_REWORK')
      setOpenTickets(openOnly)

      if (initialTicketId) {
        setSelectedTicketId(initialTicketId)
      } else if (openOnly.length > 0) {
        setSelectedTicketId(openOnly[0].id)
      }
      setResolutionStatus('REPAIRED_PASSED')
      setError(null)
    }
  }, [isOpen, initialTicketId])

  const selectedTicket = openTickets.find(t => t.id === selectedTicketId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedTicketId) {
      setError('Please select an active rework ticket to sign off.')
      return
    }

    updateTicketResolution(
      selectedTicketId,
      resolutionStatus,
      menderName,
      repairActionTaken,
      inspectorName,
      resolutionStatus === 'DECLARED_SCRAP' ? scrapReason : undefined,
      Number(repairCost)
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
        className="bg-white rounded-2xl border border-black/10 shadow-2xl max-w-xl w-full p-6 space-y-5 my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Form 2: Repair Resolution & Secondary QA Sign-Off
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                Mender Action Verification & Re-Injection Authorization
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
              Select Quarantined Ticket *
            </label>
            <select
              value={selectedTicketId}
              onChange={e => setSelectedTicketId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
            >
              {openTickets.length === 0 ? (
                <option value="">No open tickets in queue</option>
              ) : (
                openTickets.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.ticketNumber} • {t.garmentBarcode} ({t.defectType} on {t.styleName.substring(0, 18)}...)
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedTicket && (
            <div className="p-3 rounded-xl border border-black/10 bg-[#FAF7F0] text-xs space-y-1">
              <div className="font-mono font-bold text-[#3A3564]">
                Defect Context: {selectedTicket.defectDescription}
              </div>
              <div className="text-slate-600">
                Origin: <span className="font-medium">{selectedTicket.sourceDivision}</span> • Lineman:{' '}
                <span className="font-medium">{selectedTicket.linemanName}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Senior Mender / Tailor *
              </label>
              <select
                value={menderName}
                onChange={e => setMenderName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium text-slate-800"
              >
                <option value="Fatima Bano (Master Seamstress)">Fatima Bano (Master Seamstress)</option>
                <option value="Rameshwar Lal (Senior Tailor)">Rameshwar Lal (Senior Tailor)</option>
                <option value="Zarina Begum (Trim Specialist)">Zarina Begum (Trim Specialist)</option>
                <option value="Harish Chander (Pattern Mender)">Harish Chander (Pattern Mender)</option>
                <option value="Imran Khan (Spotting Specialist)">Imran Khan (Spotting Specialist)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Corrective Action Taken *
              </label>
              <select
                value={repairActionTaken}
                onChange={e => setRepairActionTaken(e.target.value as RepairAction)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
              >
                <option value="SEAM_RE_STITCHED">SEAM_RE_STITCHED (Unpicked & Re-sewn)</option>
                <option value="COLLAR_RESET">COLLAR_RESET (Collar Realigned & Topstitched)</option>
                <option value="STAIN_SPRAY_CLEANED">STAIN_SPRAY_CLEANED (Vacuum Gun Degreased)</option>
                <option value="PANEL_REPLACED">PANEL_REPLACED (Cut Component Swapped)</option>
                <option value="BUTTON_RESET">BUTTON_RESET (Buttonhole Bartack Reset)</option>
                <option value="UNPICK_RESEW">UNPICK_RESEW (Full Assembly Restitch)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Certified QA Auditor *
              </label>
              <select
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium text-slate-800"
              >
                <option value="Devendra Patel (ISO Certified Lead Auditor)">
                  Devendra Patel (ISO Certified Lead Auditor)
                </option>
                <option value="Suman Roy (Senior QA Specialist)">
                  Suman Roy (Senior QA Specialist)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Repair Cost (₹)
              </label>
              <input
                type="number"
                step="0.5"
                value={repairCost}
                onChange={e => setRepairCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Final Resolution Disposition */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Final Disposition Verdict *
            </label>
            <select
              value={resolutionStatus}
              onChange={e => setResolutionStatus(e.target.value as ResolutionStatus)}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-bold focus:outline-none ${
                resolutionStatus === 'REPAIRED_PASSED'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-rose-300 bg-rose-50 text-rose-900'
              }`}
            >
              <option value="REPAIRED_PASSED">
                REPAIRED_PASSED — Secondary AQL Pass (Return to Ironing/Packing Floor)
              </option>
              <option value="DECLARED_SCRAP">
                DECLARED_SCRAP — Irreparable Piece (Declare Scrap & Issue Re-Cut to Cutting)
              </option>
            </select>
          </div>

          {resolutionStatus === 'DECLARED_SCRAP' && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 space-y-2">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-rose-900">
                Scrap Write-Off Reason *
              </label>
              <select
                value={scrapReason}
                onChange={e => setScrapReason(e.target.value as ScrapReason)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 bg-white font-mono font-bold text-rose-800"
              >
                <option value="HOLE_IN_SHELL">HOLE_IN_SHELL (Unrecoverable needle cut)</option>
                <option value="FABRIC_TORN">FABRIC_TORN (Severe seam tear / fabric rip)</option>
                <option value="BURNT_FABRIC">BURNT_FABRIC (Buck iron scorch / glaze burn)</option>
                <option value="PERMANENT_STAIN">PERMANENT_STAIN (Insoluble chemical tint)</option>
                <option value="UNSALVAGEABLE_COLOR_BLEED">UNSALVAGEABLE_COLOR_BLEED (Dye migration)</option>
              </select>
              <p className="text-[11px] text-rose-700">
                Declaring scrap will automatically generate a replacement re-cut requisition to Division 03 (Cutting Floor).
              </p>
            </div>
          )}

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
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sign Off & Clear Ticket (Form 2)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
