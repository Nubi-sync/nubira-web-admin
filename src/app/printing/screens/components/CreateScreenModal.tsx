'use client'

import React, { useState } from 'react'
import { X, Layers, CheckCircle2, AlertCircle } from 'lucide-react'
import { PrintingScreen, ScreenMesh, ScreenStatus } from '../../types/printing'
import { saveScreen } from '../../utils/printingStorage'

interface CreateScreenModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const AVAILABLE_MESHES: ScreenMesh[] = [120, 160, 180, 200, 230, 280, 305]

export function CreateScreenModal({ isOpen, onClose, onSuccess }: CreateScreenModalProps) {
  const [screenCode, setScreenCode] = useState('')
  const [artworkRef, setArtworkRef] = useState('')
  const [colorSeparation, setColorSeparation] = useState('Base White')
  const [meshCount, setMeshCount] = useState<ScreenMesh>(160)
  const [tensionNewtons, setTensionNewtons] = useState('25.0')
  const [emulsionType, setEmulsionType] = useState('Murakami One-Pot SBQ')
  const [frameMaterial, setFrameMaterial] = useState<'ALUMINUM' | 'WOOD'>('ALUMINUM')
  const [rackLocation, setRackLocation] = useState('Rack S-01 / Bin 01')
  const [status, setStatus] = useState<ScreenStatus>('READY_FOR_PRINT')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!screenCode.trim()) {
      setError('Please enter a unique screen code (e.g. SCR-2026-01)')
      return
    }

    if (!artworkRef.trim()) {
      setError('Please specify the linked artwork vector reference')
      return
    }

    const newScreen: PrintingScreen = {
      id: `scr-${Date.now()}`,
      screen_code: screenCode.toUpperCase().trim(),
      artwork_ref: artworkRef.toUpperCase().trim(),
      color_separation: colorSeparation.trim(),
      mesh_count: meshCount,
      tension_newtons: parseFloat(tensionNewtons) || 24.0,
      emulsion_type: emulsionType,
      frame_material: frameMaterial,
      rack_location: rackLocation,
      status: status,
      exposures_count: 0,
      last_exposure_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    saveScreen(newScreen)
    if (onSuccess) onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-black/10 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F0]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Register New Screen Stencil
              </h2>
              <p className="text-xs text-slate-500">Record frame tension, emulsion type, and rack slot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Screen Barcode / Code *
              </label>
              <input
                type="text"
                placeholder="SCR-NV-160-A"
                value={screenCode}
                onChange={e => setScreenCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Artwork Reference *
              </label>
              <input
                type="text"
                placeholder="ART-HOODIE-CHEST-LOGO"
                value={artworkRef}
                onChange={e => setArtworkRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Color Separation Channel
              </label>
              <input
                type="text"
                placeholder="Base White / Highlight Gold"
                value={colorSeparation}
                onChange={e => setColorSeparation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mesh Count (Monofilament)
              </label>
              <select
                value={meshCount}
                onChange={e => setMeshCount(Number(e.target.value) as ScreenMesh)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                {AVAILABLE_MESHES.map(m => (
                  <option key={m} value={m}>
                    {m} Mesh {m <= 160 ? '(High Deposit / Underbase)' : m >= 280 ? '(Fine Micro Detail)' : '(Standard)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Frame Tension (N/cm)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="25.0"
                value={tensionNewtons}
                onChange={e => setTensionNewtons(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rack Bin Storage Slot
              </label>
              <input
                type="text"
                placeholder="Rack S-02 / Bin 08"
                value={rackLocation}
                onChange={e => setRackLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Emulsion Chemistry
              </label>
              <input
                type="text"
                placeholder="Murakami One-Pot SBQ"
                value={emulsionType}
                onChange={e => setEmulsionType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Initial Stencil Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ScreenStatus)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                <option value="READY_FOR_PRINT">READY_FOR_PRINT</option>
                <option value="IN_USE">IN_USE</option>
                <option value="NEEDS_RECLAMATION">NEEDS_RECLAMATION</option>
                <option value="DAMAGED_MESH">DAMAGED_MESH</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Register Screen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
