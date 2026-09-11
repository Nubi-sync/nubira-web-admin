'use client'

import { useState, useEffect } from 'react'
import { X, Check, CheckCircle2, AlertTriangle, Calculator, ShieldAlert } from 'lucide-react'
import { ShrinkageQcRecord, WashBatch, QcVerdict } from '../../types/washing'
import { getWashBatches, saveShrinkageQcRecord } from '../../utils/washingStorage'

interface RecordShrinkageModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RecordShrinkageModal({ isOpen, onClose }: RecordShrinkageModalProps) {
  const [batches, setBatches] = useState<WashBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [samplePiecesTested, setSamplePiecesTested] = useState(10)
  const [preWashLengthCm, setPreWashLengthCm] = useState(75.0)
  const [postWashLengthCm, setPostWashLengthCm] = useState(74.15)
  const [preWashWidthCm, setPreWashWidthCm] = useState(54.0)
  const [postWashWidthCm, setPostWashWidthCm] = useState(53.48)
  const [colorfastnessRating, setColorfastnessRating] = useState(4.8)
  const [auditorName, setAuditorName] = useState('K. Karmakar (QC Inspector)')
  const [actionTaken, setActionTaken] = useState('')

  useEffect(() => {
    const loaded = getWashBatches()
    setBatches(loaded)
    if (loaded.length > 0 && !selectedBatchId) {
      setSelectedBatchId(loaded[0].id)
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeBatch = batches.find(b => b.id === selectedBatchId) || batches[0]

  // Shrinkage Formula: ((Pre - Post) / Pre) * 100
  const lengthShrinkPct = preWashLengthCm > 0
    ? Math.max(0, ((preWashLengthCm - postWashLengthCm) / preWashLengthCm) * 100)
    : 0

  const widthShrinkPct = preWashWidthCm > 0
    ? Math.max(0, ((preWashWidthCm - postWashWidthCm) / preWashWidthCm) * 100)
    : 0

  // Auto-verdict
  const maxShrink = Math.max(lengthShrinkPct, widthShrinkPct)
  const autoStatus: QcVerdict = maxShrink <= 1.5 ? 'PASS' : maxShrink <= 2.5 ? 'MARGINAL_WARN' : 'CRITICAL_FAIL'
  const isCritical = autoStatus === 'CRITICAL_FAIL'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newQc: ShrinkageQcRecord = {
      id: `sqc-${Date.now()}`,
      qcCode: `SQC-${Math.floor(8830 + Math.random() * 50)}`,
      batchId: selectedBatchId,
      batchNumber: activeBatch?.batchNumber || 'WB-40201',
      articleName: activeBatch?.articleName || 'Garment Batch',
      samplePiecesTested: Number(samplePiecesTested),
      preWashLengthCm: Number(preWashLengthCm),
      postWashLengthCm: Number(postWashLengthCm),
      avgLengthShrinkPct: Number(lengthShrinkPct.toFixed(2)),
      preWashWidthCm: Number(preWashWidthCm),
      postWashWidthCm: Number(postWashWidthCm),
      avgWidthShrinkPct: Number(widthShrinkPct.toFixed(2)),
      colorfastnessRating: Number(colorfastnessRating),
      qcStatus: autoStatus,
      cuttingAlertSent: isCritical,
      auditorName,
      auditDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      actionTaken:
        actionTaken ||
        (isCritical
          ? 'Auto-Escalated to 03 Cutting Floor: Suspend lay cutting for roll lot and expand CAD marker.'
          : 'Certified within standard residual shrinkage tolerance.'),
    }

    saveShrinkageQcRecord(newQc)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Form 2 • Shrinkage & Dimensional Audit Form
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                10-Piece Statistical Audit (AATCC 135 / ISO 6330 Standard)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Batch Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Select Finished Wash Batch *
            </label>
            <select
              value={selectedBatchId}
              onChange={e => setSelectedBatchId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} • {b.articleName} ({b.color}) - {b.totalPieces} pcs - [{b.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sample Pieces Tested */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Sample Pieces Tested *
              </label>
              <input
                type="number"
                min="5"
                max="20"
                value={samplePiecesTested}
                onChange={e => setSamplePiecesTested(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Standard: 10 garments per lot</span>
            </div>

            {/* Colorfastness Rating */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Colorfastness (1.0 - 5.0 Grey Scale) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={colorfastnessRating}
                onChange={e => setColorfastnessRating(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400">Buyer spec: &ge; 4.0</span>
            </div>
          </div>

          {/* Length Pre vs Post */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                Garment Length Measurements (cm)
              </span>
              <span className="text-xs font-mono font-bold text-[#3A3564]">
                Shrinkage: {lengthShrinkPct.toFixed(2)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Pre-Wash Length (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={preWashLengthCm}
                  onChange={e => setPreWashLengthCm(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Post-Wash Length (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={postWashLengthCm}
                  onChange={e => setPostWashLengthCm(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Width Pre vs Post */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                Garment Width Measurements (cm)
              </span>
              <span className="text-xs font-mono font-bold text-[#3A3564]">
                Shrinkage: {widthShrinkPct.toFixed(2)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Pre-Wash Width (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={preWashWidthCm}
                  onChange={e => setPreWashWidthCm(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-500 mb-1">Post-Wash Width (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={postWashWidthCm}
                  onChange={e => setPostWashWidthCm(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Real-time Verdict Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              autoStatus === 'PASS'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : autoStatus === 'MARGINAL_WARN'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-2">
              {autoStatus === 'PASS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span className="text-xs font-bold font-mono uppercase">
                QC Status Verdict: {autoStatus.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs font-mono font-bold">
              Max Shrink: {maxShrink.toFixed(2)}% (Limit &le; 1.5%)
            </span>
          </div>

          {isCritical && (
            <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-xs text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span>Auto-Escalation Engine Triggered (&gt; 2.5% Shrinkage)</span>
              </div>
              <p className="text-[11px]">
                An automated critical notice will be dispatched to <strong>03 Cutting Floor CAD Station</strong> to expand the marker dimensions before further lay cutting.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Corrective Action Taken / Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Approved for finishing OR Marker expansion note"
              value={actionTaken}
              onChange={e => setActionTaken(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-black/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Submit QC Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
