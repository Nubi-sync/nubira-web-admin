'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  Calculator,
  Layers,
  Info,
  Sparkles,
  Search
} from 'lucide-react'
import {
  calculateIso2859SampleSize,
  saveAqlAudit,
  getReadyGoodsCartons
} from '../../utils/readyGoodsStorage'
import { AqlAudit, AqlAuditDecision, ReadyGoodsCarton } from '../../types/readyGoods'

interface AqlAuditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialCartonId?: string
}

export function AqlAuditModal({
  isOpen,
  onClose,
  onSuccess,
  initialCartonId
}: AqlAuditModalProps) {
  const [cartons, setCartons] = useState<ReadyGoodsCarton[]>([])
  const [auditNumber, setAuditNumber] = useState('')
  const [selectedCartonId, setSelectedCartonId] = useState('')
  const [orderNumber, setOrderNumber] = useState('PO-7714')
  const [inspectorName, setInspectorName] = useState('Devendra Patel (ISO Certified Lead Auditor)')
  const [lotSizePieces, setLotSizePieces] = useState<number>(4800)
  const [criticalDefects, setCriticalDefects] = useState<number>(0)
  const [majorDefects, setMajorDefects] = useState<number>(0)
  const [minorDefects, setMinorDefects] = useState<number>(0)
  const [auditDecision, setAuditDecision] = useState<AqlAuditDecision>('PASS')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const allCartons = getReadyGoodsCartons()
      setCartons(allCartons)
      const randomCode = Math.floor(10000 + Math.random() * 90000)
      setAuditNumber(`AQL-${randomCode}`)

      if (initialCartonId) {
        const found = allCartons.find(c => c.id === initialCartonId || c.cartonNumber === initialCartonId)
        if (found) {
          setSelectedCartonId(found.id)
          setOrderNumber(found.orderNumber)
        }
      } else if (allCartons.length > 0) {
        setSelectedCartonId(allCartons[0].id)
        setOrderNumber(allCartons[0].orderNumber)
      }
      setCriticalDefects(0)
      setMajorDefects(0)
      setMinorDefects(0)
      setAuditDecision('PASS')
      setRemarks('')
      setError(null)
    }
  }, [isOpen, initialCartonId])

  // Recalculate ISO sampling whenever lot size changes
  const isoLimits = calculateIso2859SampleSize(lotSizePieces || 100)

  // Auto-suggest decision when defects change
  useEffect(() => {
    if (criticalDefects > 0) {
      setAuditDecision('REJECT_QUARANTINE')
    } else if (majorDefects > isoLimits.maxMajorDefects) {
      setAuditDecision('REJECT_QUARANTINE')
    } else if (minorDefects > isoLimits.maxMinorDefects) {
      setAuditDecision('RE_AUDIT')
    } else {
      setAuditDecision('PASS')
    }
  }, [criticalDefects, majorDefects, minorDefects, isoLimits.maxMajorDefects, isoLimits.maxMinorDefects])

  const handleCartonSelect = (cId: string) => {
    setSelectedCartonId(cId)
    const found = cartons.find(c => c.id === cId)
    if (found) {
      setOrderNumber(found.orderNumber)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!auditNumber.trim()) {
      setError('Audit number is required.')
      return
    }

    if (!selectedCartonId) {
      setError('Please select a target export carton to audit.')
      return
    }

    const targetCarton = cartons.find(c => c.id === selectedCartonId)
    if (!targetCarton) {
      setError('Selected carton was not found.')
      return
    }

    // Validation: Critical defect cannot be passed
    if (criticalDefects > 0 && auditDecision === 'PASS') {
      setError('ISO 2859-1 SLA Violation: 0 Critical Defects allowed. Cannot mark PASS with critical defects.')
      return
    }

    const newAudit: AqlAudit = {
      id: `aql-${Date.now()}`,
      auditNumber: auditNumber.trim(),
      orderId: targetCarton.orderId,
      orderNumber: targetCarton.orderNumber,
      cartonId: targetCarton.id,
      cartonNumber: targetCarton.cartonNumber,
      inspectorId: 'emp-qa-lead',
      inspectorName: inspectorName.trim(),
      lotSizePieces: Number(lotSizePieces),
      sampleSizeAudited: isoLimits.sampleSize,
      criticalDefects: Number(criticalDefects),
      majorDefects: Number(majorDefects),
      minorDefects: Number(minorDefects),
      auditDecision,
      defects: [
        ...(criticalDefects > 0
          ? [{ type: 'Critical Defect / Needle or Stain Alert', category: 'CRITICAL' as const, count: criticalDefects }]
          : []),
        ...(majorDefects > 0
          ? [{ type: 'Major Seam or Dimensional Defect', category: 'MAJOR' as const, count: majorDefects }]
          : []),
        ...(minorDefects > 0
          ? [{ type: 'Minor Cosmetic / Thread Defect', category: 'MINOR' as const, count: minorDefects }]
          : [])
      ],
      remarks: remarks.trim() || `ISO 2859-1 AQL 2.5 Normal Level II audit completed. Decision: ${auditDecision}.`,
      auditDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }

    saveAqlAudit(newAudit)
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
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Form 1: Conduct AQL 2.5 Quality Audit
              </h2>
              <p className="text-[11px] font-mono text-slate-500">
                ISO 2859-1 Normal Level II Statistical Sampling Verification
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Audit Number & Target Carton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Audit Voucher # (AQL-XXXXX) *
              </label>
              <input
                type="text"
                value={auditNumber}
                onChange={e => setAuditNumber(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono font-bold text-[#3A3564] focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Target Export Carton *
              </label>
              <select
                value={selectedCartonId}
                onChange={e => handleCartonSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              >
                {cartons.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.cartonNumber} • {c.orderNumber} ({c.styleName.substring(0, 18)}...) [{c.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Certified Inspector & PO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Certified QA Inspector *
              </label>
              <select
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
              >
                <option value="Devendra Patel (ISO Certified Lead Auditor)">
                  Devendra Patel (ISO Certified Lead Auditor)
                </option>
                <option value="Suman Roy (Senior QA Specialist)">
                  Suman Roy (Senior QA Specialist)
                </option>
                <option value="Farhana Begum (Export Finishing Inspector)">
                  Farhana Begum (Export Finishing Inspector)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
                Represented Order PO
              </label>
              <input
                type="text"
                value={orderNumber}
                readOnly
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 font-mono text-slate-600"
              />
            </div>
          </div>

          {/* ISO 2859-1 Sampling Telemetry Box */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-[#FAF7F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#3A3564] uppercase flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                ISO 2859-1 Sampling Standard
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3A3564] text-white font-bold">
                Normal Level II
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Lot Size</span>
                <input
                  type="number"
                  min={10}
                  max={100000}
                  value={lotSizePieces}
                  onChange={e => setLotSizePieces(Number(e.target.value))}
                  className="w-full text-center font-mono font-black text-slate-900 text-xs mt-0.5 border-b border-black/10 focus:outline-none"
                />
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Sample To Inspect</span>
                <div className="font-mono font-black text-[#3A3564] text-sm mt-0.5">
                  {isoLimits.sampleSize} pcs
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-black/10">
                <span className="text-[10px] font-mono text-slate-500 uppercase">AQL 2.5 Major SLA</span>
                <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                  Max ≤ {isoLimits.maxMajorDefects}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Defect Counters */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-rose-700 uppercase mb-1">
                Critical (0 Allowed)
              </label>
              <input
                type="number"
                min={0}
                value={criticalDefects}
                onChange={e => setCriticalDefects(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-black text-center focus:outline-none ${
                  criticalDefects > 0
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-black/10 bg-white text-slate-800'
                }`}
              />
              <span className="text-[9px] text-slate-400">Needle, metal, sharp points</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-amber-700 uppercase mb-1">
                Major (≤ {isoLimits.maxMajorDefects})
              </label>
              <input
                type="number"
                min={0}
                value={majorDefects}
                onChange={e => setMajorDefects(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-black text-center focus:outline-none ${
                  majorDefects > isoLimits.maxMajorDefects
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-black/10 bg-white text-slate-800'
                }`}
              />
              <span className="text-[9px] text-slate-400">Open seam, size mis-tag</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">
                Minor (≤ {isoLimits.maxMinorDefects})
              </label>
              <input
                type="number"
                min={0}
                value={minorDefects}
                onChange={e => setMinorDefects(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white font-mono font-black text-slate-800 text-center focus:outline-none"
              />
              <span className="text-[9px] text-slate-400">Stray thread, fold crease</span>
            </div>
          </div>

          {/* Row 4: Audit Decision Verdict */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Master QA Decision Verdict *
            </label>
            <select
              value={auditDecision}
              onChange={e => setAuditDecision(e.target.value as AqlAuditDecision)}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-bold focus:outline-none ${
                auditDecision === 'PASS'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : auditDecision === 'REJECT_QUARANTINE'
                  ? 'border-rose-300 bg-rose-50 text-rose-900'
                  : 'border-amber-300 bg-amber-50 text-amber-900'
              }`}
            >
              <option value="PASS">PASS — Release for Central Godown Handover (AQL_AUDIT_PASSED)</option>
              <option value="RE_AUDIT">RE_AUDIT — Secondary 100-pc Sampling Required</option>
              <option value="REJECT_QUARANTINE">
                REJECT_QUARANTINE — Quarantine Carton & Halt Release (QUARANTINED_AQL_FAILED)
              </option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1">
              Auditor Remarks & Corrective Actions
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={2}
              placeholder="e.g. 1000-lux inspection passed. Zero needle fragments detected on calibrated conveyor metal detector."
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-1 focus:ring-[#3A3564]"
            />
          </div>

          {/* Submit Actions */}
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
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Submit AQL 2.5 Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
