'use client'

import { useState } from 'react'
import { X, Check, Truck, CheckCircle2, ShieldCheck } from 'lucide-react'
import { PackingHandover } from '../../types/iron'
import { savePackingHandover } from '../../utils/ironStorage'

interface CreateTrolleyModalProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_CHALLANS = [
  { id: 'CH-2026-901', article: 'Heavyweight Loopback Hoodie', color: 'Vintage Black', defaultPcs: 850 },
  { id: 'CH-2026-902', article: 'Mercerized Interlock Polo', color: 'Navy Crisp', defaultPcs: 980 },
  { id: 'CH-2026-903', article: 'Cargo Jogger Bottoms', color: 'Desert Khaki', defaultPcs: 820 },
  { id: 'CH-2026-904', article: 'Relaxed Ribbed Henley', color: 'Olive Moss', defaultPcs: 1050 },
]

export function CreateTrolleyModal({ isOpen, onClose }: CreateTrolleyModalProps) {
  const [trolleyCode, setTrolleyCode] = useState(`TRL-2026-${Math.floor(105 + Math.random() * 80)}`)
  const [selectedChallanId, setSelectedChallanId] = useState(SAMPLE_CHALLANS[0].id)
  const [piecesTransferred, setPiecesTransferred] = useState(SAMPLE_CHALLANS[0].defaultPcs)
  const [wrinkleFreeVerified, setWrinkleFreeVerified] = useState(true)
  const [zeroShineVerified, setZeroShineVerified] = useState(true)
  const [supervisorSignoff, setSupervisorSignoff] = useState('P. Sengupta (Finishing Master)')

  if (!isOpen) return null

  const activeChallan = SAMPLE_CHALLANS.find(c => c.id === selectedChallanId) || SAMPLE_CHALLANS[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newHandover: PackingHandover = {
      id: `tr-${Date.now()}`,
      trolleyCode,
      challanId: selectedChallanId,
      articleName: activeChallan.article,
      color: activeChallan.color,
      piecesTransferred: Number(piecesTransferred),
      transferredTo: '09. Ready Goods & Packing Floor',
      wrinkleFreeVerified,
      zeroShineVerified,
      supervisorSignoff,
      handoverDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'ACCEPTED',
    }

    savePackingHandover(newHandover)
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
                Create Mobile Trolley Packing Handover
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Transfer pressed garments to 09 Ready Goods & Packing Floor
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Trolley Code *
              </label>
              <input
                type="text"
                value={trolleyCode}
                onChange={e => setTrolleyCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Pieces on Trolley *
              </label>
              <input
                type="number"
                min="1"
                value={piecesTransferred}
                onChange={e => setPiecesTransferred(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Challan Lot & Article *
            </label>
            <select
              value={selectedChallanId}
              onChange={e => {
                setSelectedChallanId(e.target.value)
                const c = SAMPLE_CHALLANS.find(sc => sc.id === e.target.value)
                if (c) setPiecesTransferred(c.defaultPcs)
              }}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
            >
              {SAMPLE_CHALLANS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} • {c.article} ({c.color})
                </option>
              ))}
            </select>
          </div>

          {/* Verification checklist */}
          <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase block">
              Finishing Gate Pass Verifications
            </span>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={wrinkleFreeVerified}
                onChange={e => setWrinkleFreeVerified(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>100% Wrinkle-Free: Placket, sleeves, and hems steam shaped</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={zeroShineVerified}
                onChange={e => setZeroShineVerified(e.target.checked)}
                className="rounded text-[#3A3564] focus:ring-[#3A3564]"
              />
              <span>Zero Shine & Glaze: Teflon protection verified under 1000-lux</span>
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
              <span>Dispatch Trolley</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
