'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Check, AlertTriangle, ShieldCheck, Scale, Ruler, Sparkles, Layers } from 'lucide-react'
import { FabricRollInspection, FabricShadeGroup } from '../../types/store'
import { updateFabricRollInspection, calculate4PointScore } from '../../utils/storeStorage'

interface InspectRollModalProps {
  isOpen: boolean
  onClose: () => void
  roll: FabricRollInspection | null
}

export function InspectRollModal({ isOpen, onClose, roll }: InspectRollModalProps) {
  const [measuredWidth, setMeasuredWidth] = useState<number>(60.0)
  const [measuredGsm, setMeasuredGsm] = useState<number>(180)
  const [points1, setPoints1] = useState<number>(0)
  const [points2, setPoints2] = useState<number>(0)
  const [points3, setPoints3] = useState<number>(0)
  const [points4, setPoints4] = useState<number>(0)
  const [shadeGroup, setShadeGroup] = useState<FabricShadeGroup>('SHADE_A')
  const [inspectorName, setInspectorName] = useState<string>('QA Fabric Auditor')
  const [godownRack, setGodownRack] = useState<string>('BAY_1_RACK_01')
  const [notes, setNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (roll) {
      setMeasuredWidth(roll.measuredWidthInches || roll.targetWidthInches || 60.0)
      setMeasuredGsm(roll.measuredGsm || roll.targetGsm || 180)
      setPoints1(roll.defectBreakdown?.points1 || 0)
      setPoints2(roll.defectBreakdown?.points2 || 0)
      setPoints3(roll.defectBreakdown?.points3 || 0)
      setPoints4(roll.defectBreakdown?.points4 || 0)
      setShadeGroup(roll.shadeGroup || 'SHADE_A')
      setInspectorName(roll.inspectorName || 'Devrat Sharma (QA-4Pt)')
      setGodownRack(roll.godownRackLocation || 'BAY_1_RACK_02')
      setNotes(roll.notes || '')
    }
  }, [roll])

  // Live ASTM D5430 Calculation
  const totalPoints = useMemo(() => {
    return points1 * 1 + points2 * 2 + points3 * 3 + points4 * 4
  }, [points1, points2, points3, points4])

  const { pointsPer100SqYd, verdict } = useMemo(() => {
    if (!roll) return { pointsPer100SqYd: 0, verdict: 'PENDING_INSPECTION' as const }
    const lengthYards = (roll.netMeterage || 100) * 1.09361
    return calculate4PointScore(totalPoints, lengthYards, measuredWidth || 60)
  }, [roll, totalPoints, measuredWidth])

  if (!isOpen || !roll) return null

  const isPassed = verdict === 'PASSED'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      updateFabricRollInspection(roll.id, {
        measuredGsm,
        measuredWidthInches: measuredWidth,
        points1,
        points2,
        points3,
        points4,
        shadeGroup,
        inspectorName,
        inspectorId: 'emp-qa-101',
        godownRackLocation: godownRack,
        notes
      })
      onClose()
    } catch (err) {
      console.error('Failed to update inspection:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-[family-name:var(--font-heading)]">
                ASTM D5430 4-Point Roll Audit
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Roll: {roll.rollBarcode} • {roll.fabricType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-black/10 text-slate-400 hover:text-slate-700 hover:bg-[#FAF7F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live ASTM Score Banner */}
        <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500">
              ASTM D5430 Penalty Score (SLA ≤ 28.0 pts/100 sq yd)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black font-mono text-slate-900 tabular-nums">
                {pointsPer100SqYd}
              </span>
              <span className="text-xs font-mono text-slate-500">
                pts / 100 sq yd (Total: {totalPoints} penalty pts)
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white text-[#3A3564] border border-black/10 shadow-2xs">
            {isPassed ? <ShieldCheck className="w-4 h-4 text-[#3A3564]" /> : <AlertTriangle className="w-4 h-4 text-[#3A3564]" />}
            <span>{isPassed ? 'PASS FOR CUTTING' : 'REJECT / QUARANTINE'}</span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dimensions & Tolerance Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Measured Width (Inches)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={measuredWidth}
                  onChange={(e) => setMeasuredWidth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-400">±0.5"</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Measured GSM (g/m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={measuredGsm}
                  onChange={(e) => setMeasuredGsm(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                  required
                />
                <span className="absolute right-3 top-2 text-[10px] font-mono text-slate-400">±3%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Spectro Shade Band
              </label>
              <select
                value={shadeGroup}
                onChange={(e) => setShadeGroup(e.target.value as FabricShadeGroup)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
              >
                <option value="SHADE_A">Shade A (Standard Central)</option>
                <option value="SHADE_B">Shade B (Slight Darker)</option>
                <option value="SHADE_C">Shade C (Slight Lighter)</option>
              </select>
            </div>
          </div>

          {/* ASTM 4-Point Defect Breakdown Matrix */}
          <div className="p-4 rounded-xl border border-black/10 bg-[#FAF7F0]/60 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
              ASTM 4-Point Defect Demerit Counts
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  1 Pt (&lt;3")
                </label>
                <input
                  type="number"
                  min="0"
                  value={points1}
                  onChange={(e) => setPoints1(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  2 Pts (3"–6")
                </label>
                <input
                  type="number"
                  min="0"
                  value={points2}
                  onChange={(e) => setPoints2(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  3 Pts (6"–9")
                </label>
                <input
                  type="number"
                  min="0"
                  value={points3}
                  onChange={(e) => setPoints3(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">
                  4 Pts (&gt;9" or Hole)
                </label>
                <input
                  type="number"
                  min="0"
                  value={points4}
                  onChange={(e) => setPoints4(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>
            </div>
          </div>

          {/* Inspector & Rack Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Auditor Sign-off Name
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
                Godown Bay & Rack Location
              </label>
              <select
                value={godownRack}
                onChange={(e) => setGodownRack(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] cursor-pointer"
              >
                <option value="BAY_1_RACK_02">Bay 1 • Rack 02 (Single Jersey A)</option>
                <option value="BAY_1_RACK_03">Bay 1 • Rack 03 (Single Jersey B)</option>
                <option value="BAY_1_RACK_05">Bay 1 • Rack 05 (French Terry)</option>
                <option value="BAY_2_RACK_01">Bay 2 • Rack 01 (Rib & Lycra)</option>
                <option value="BAY_2_QUARANTINE">Bay 2 • Quarantine Rejected Bay</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 mb-1">
              Inspection Findings & Selvedge Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Clean face side, uniform selvedge, skewness 1.2%"
              className="w-full px-3 py-2 bg-[#FAF7F0] border border-black/10 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold text-slate-700 hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white shadow-2xs flex items-center gap-1.5 cursor-pointer bg-[#3A3564] hover:bg-[#2c284e] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Commit Inspection Sign-Off'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
