'use client'

import { useState, useEffect } from 'react'
import { X, Check, ArrowRight, Truck, ShieldCheck } from 'lucide-react'
import { FinishingHandover, WashBatch } from '../../types/washing'
import { getWashBatches, saveFinishingHandover } from '../../utils/washingStorage'

interface CreateHandoverModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateHandoverModal({ isOpen, onClose }: CreateHandoverModalProps) {
  const [batches, setBatches] = useState<WashBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState('')
  const [piecesTransferred, setPiecesTransferred] = useState(1200)
  const [moistureVerified, setMoistureVerified] = useState(true)
  const [odorFreeVerified, setOdorFreeVerified] = useState(true)
  const [pieceCountMatch, setPieceCountMatch] = useState(true)
  const [supervisorSignoff, setSupervisorSignoff] = useState('Ramesh Mondal (Washing Master)')

  useEffect(() => {
    const loaded = getWashBatches().filter(b => b.status === 'PASSED')
    setBatches(loaded)
    if (loaded.length > 0 && !selectedBatchId) {
      setSelectedBatchId(loaded[0].id)
      setPiecesTransferred(loaded[0].totalPieces)
    }
  }, [isOpen])

  if (!isOpen) return null

  const activeBatch = batches.find(b => b.id === selectedBatchId) || batches[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newHandover: FinishingHandover = {
      id: `ho-${Date.now()}`,
      handoverCode: `WH-2026-${Math.floor(510 + Math.random() * 80)}`,
      batchNumber: activeBatch?.batchNumber || 'WB-40190',
      challanId: activeBatch?.challanId || 'CH-2026-880',
      articleName: activeBatch?.articleName || 'Garments Lot',
      piecesTransferred: Number(piecesTransferred),
      transferredTo: '08. Steam Ironing & Finishing Floor',
      moistureVerified,
      odorFreeVerified,
      pieceCountMatch,
      supervisorSignoff,
      handoverDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'ACCEPTED',
    }

    saveFinishingHandover(newHandover)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Generate Finishing Handover Gate Pass
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Transfer to 08. Steam Ironing & Finishing Floor
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
          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Select Passed Batch *
            </label>
            <select
              value={selectedBatchId}
              onChange={e => {
                setSelectedBatchId(e.target.value)
                const b = batches.find(x => x.id === e.target.value)
                if (b) setPiecesTransferred(b.totalPieces)
              }}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.batchNumber} • {b.articleName} ({b.totalPieces} pcs)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Pieces Transferred (Physical Count) *
            </label>
            <input
              type="number"
              value={piecesTransferred}
              onChange={e => setPiecesTransferred(Number(e.target.value))}
              required
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Quality Pre-Check Checklist */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2.5">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase block">
              Conditioning & Handover Verification
            </span>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={moistureVerified}
                onChange={e => setMoistureVerified(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Zero Dampness: Garments 100% dry & thermally relaxed</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={odorFreeVerified}
                onChange={e => setOdorFreeVerified(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Zero Chemical Odor: Acetic acid neutralized and enzyme washed clean</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={pieceCountMatch}
                onChange={e => setPieceCountMatch(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Piece Count Match: Physical count matches sewing inward challan</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Supervisor Sign-off *
            </label>
            <input
              type="text"
              value={supervisorSignoff}
              onChange={e => setSupervisorSignoff(e.target.value)}
              required
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
              <span>Dispatch to Finishing</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
