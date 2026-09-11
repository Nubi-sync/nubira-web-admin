'use client'

import { useState, useEffect } from 'react'
import {
  Droplets,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import {
  getAlterTickets,
  saveSpottingLog,
  updateTicketResolution
} from '../../utils/alterStorage'
import { SpotCleaningLog, AlterationTicket } from '../../types/alter'

interface ExecuteSpotCleanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ExecuteSpotCleanModal({
  isOpen,
  onClose,
  onSuccess
}: ExecuteSpotCleanModalProps) {
  const [stainTickets, setStainTickets] = useState<AlterationTicket[]>([])
  const [selectedTicketNumber, setSelectedTicketNumber] = useState('')
  const [stainType, setStainType] = useState('Needle Machine Lubricant Oil')
  const [solventUsed, setSolventUsed] = useState('Trichloroethylene-Free Citrus Degreaser A-9')
  const [vacuumSec, setVacuumSec] = useState(20)
  const [stainRemoved, setStainRemoved] = useState(true)
  const [haloVisible, setHaloVisible] = useState(false)
  const [operatorName, setOperatorName] = useState('Imran Khan (Spotting Specialist)')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const all = getAlterTickets()
      const stainOnly = all.filter(t => t.defectType === 'OIL_STAIN' || t.assignedStation.includes('Spot'))
      setStainTickets(stainOnly)
      if (stainOnly.length > 0) {
        setSelectedTicketNumber(stainOnly[0].ticketNumber)
      }
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedTicketNumber) {
      setError('Please select an oil/stain ticket.')
      return
    }

    const newLog: SpotCleaningLog = {
      id: `spt-${Date.now()}`,
      logCode: `SPT-${Math.floor(1000 + Math.random() * 900)}`,
      ticketNumber: selectedTicketNumber,
      stainType,
      solventUsed,
      vacuumTableSec: Number(vacuumSec),
      stainRemoved,
      haloVisible,
      operatorName: operatorName.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveSpottingLog(newLog)

    if (stainRemoved && !haloVisible) {
      updateTicketResolution(
        selectedTicketNumber,
        'REPAIRED_PASSED',
        operatorName.trim(),
        'STAIN_SPRAY_CLEANED',
        'Devendra Patel',
        undefined,
        15.00
      )
    }

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
              <Droplets className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Execute Chemical Vacuum Spot Cleaning
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                High-Pressure Spray Gun & Eco Degreasing Table (Stations 05 & 06)
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
              Target Stain Ticket *
            </label>
            <select
              value={selectedTicketNumber}
              onChange={e => setSelectedTicketNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800"
            >
              {stainTickets.length === 0 ? (
                <option value="">No stain tickets currently pending</option>
              ) : (
                stainTickets.map(t => (
                  <option key={t.id} value={t.ticketNumber}>
                    {t.ticketNumber} • {t.garmentBarcode} ({t.defectDescription.substring(0, 24)}...)
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Stain Chemistry Diagnosis *
              </label>
              <select
                value={stainType}
                onChange={e => setStainType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium text-slate-800"
              >
                <option value="Needle Machine Lubricant Oil">Needle Machine Lubricant Oil</option>
                <option value="Extractor Tumbler Belt Grease">Extractor Tumbler Belt Grease</option>
                <option value="Tea / Coffee Liquid Spill">Tea / Coffee Liquid Spill</option>
                <option value="Friction Scuff & Dirt Mark">Friction Scuff & Dirt Mark</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Vacuum Flush Duration
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={vacuumSec}
                onChange={e => setVacuumSec(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Solvent Formulation (Eco-Certified) *
            </label>
            <select
              value={solventUsed}
              onChange={e => setSolventUsed(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-[#3A3564]"
            >
              <option value="Trichloroethylene-Free Citrus Degreaser A-9">
                Trichloroethylene-Free Citrus Degreaser A-9 (OEKO-TEX Certified)
              </option>
              <option value="Aliphatic Hydrocarbon Spot Lifter Formula B">
                Aliphatic Hydrocarbon Spot Lifter Formula B (Fast Drying)
              </option>
              <option value="Neutral Detergent Cold Spot Spray C">
                Neutral Detergent Cold Spot Spray C (Organic Water Stains)
              </option>
            </select>
          </div>

          {/* Quality Sign-off Checkbox */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2 text-xs">
            <span className="text-xs font-mono font-bold text-[#3A3564] uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Inspection Under 1000-Lux Light
            </span>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stainRemoved}
                onChange={e => setStainRemoved(e.target.checked)}
                className="rounded text-[#3A3564]"
              />
              <span className="text-slate-800 font-medium">
                Stain 100% dissolved and vacuumed into suction baffle
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!haloVisible}
                onChange={e => setHaloVisible(!e.target.checked)}
                className="rounded text-[#3A3564]"
              />
              <span className="text-slate-800 font-medium">
                Zero solvent halo or water ring residue on fabric surface
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Spotting Gun Operator *
            </label>
            <input
              type="text"
              value={operatorName}
              onChange={e => setOperatorName(e.target.value)}
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
              <Droplets className="w-3.5 h-3.5 text-sky-300" />
              <span>Log Chemical Spotting</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
