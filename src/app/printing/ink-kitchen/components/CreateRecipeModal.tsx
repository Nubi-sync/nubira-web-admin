'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Palette } from 'lucide-react'
import { InkRecipe, PrintTechnique } from '../../types/printing'
import { saveInkRecipe } from '../../utils/printingStorage'

interface CreateRecipeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const TECHNIQUES: PrintTechnique[] = [
  'PLASTISOL',
  'WATER_BASED',
  'DISCHARGE',
  'DTG',
  'PUFF',
  'HIGH_DENSITY'
]

export function CreateRecipeModal({ isOpen, onClose, onSuccess }: CreateRecipeModalProps) {
  const [recipeCode, setRecipeCode] = useState('')
  const [colorName, setColorName] = useState('')
  const [pantoneCode, setPantoneCode] = useState('Pantone 19-4052 TCX')
  const [technique, setTechnique] = useState<PrintTechnique>('PLASTISOL')
  const [baseBinderGrams, setBaseBinderGrams] = useState('850')
  const [pigmentGrams, setPigmentGrams] = useState('120')
  const [fixerGrams, setFixerGrams] = useState('30')
  const [retarderGrams, setRetarderGrams] = useState('10')
  const [viscosityCps, setViscosityCps] = useState('18000')
  const [ecoCompliance, setEcoCompliance] = useState<'OEKO-TEX Standard 100' | 'GOTS 6.0' | 'ZDHC Level 3'>('OEKO-TEX Standard 100')
  const [batchVolumeKg, setBatchVolumeKg] = useState('25.0')
  const [preparedBy, setPreparedBy] = useState('A. Gurunathan (Ink Chemist)')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Live total grams
  const bGrams = parseFloat(baseBinderGrams) || 0
  const pGrams = parseFloat(pigmentGrams) || 0
  const fGrams = parseFloat(fixerGrams) || 0
  const rGrams = parseFloat(retarderGrams) || 0
  const totalFormulaGrams = bGrams + pGrams + fGrams + rGrams

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!colorName.trim()) {
      setError('Please provide a color recipe name')
      return
    }

    const newRecipe: InkRecipe = {
      id: `rcp-${Date.now()}`,
      recipe_code: recipeCode.trim() || `RCP-${technique.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      color_name: colorName.trim(),
      pantone_code: pantoneCode.trim(),
      technique: technique,
      base_binder_grams: bGrams,
      pigment_concentrate_grams: pGrams,
      fixer_crosslinker_grams: fGrams,
      retarder_grams: rGrams,
      viscosity_cps: parseInt(viscosityCps, 10) || 15000,
      eco_compliance: ecoCompliance,
      prepared_by: preparedBy.trim(),
      batch_volume_kg: parseFloat(batchVolumeKg) || 25.0,
      created_at: new Date().toISOString()
    }

    saveInkRecipe(newRecipe)
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
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Create Ink Kitchen Formulation
              </h2>
              <p className="text-xs text-slate-500">Exact chemical grams ledger per 1,000g batch</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Recipe Code
              </label>
              <input
                type="text"
                placeholder="RCP-PL-NAVY-02"
                value={recipeCode}
                onChange={e => setRecipeCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Print Technique
              </label>
              <select
                value={technique}
                onChange={e => setTechnique(e.target.value as PrintTechnique)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                {TECHNIQUES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Color Name *
              </label>
              <input
                type="text"
                placeholder="Midnight Obsidian Navy"
                value={colorName}
                onChange={e => setColorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Pantone TCX Code
              </label>
              <input
                type="text"
                value={pantoneCode}
                onChange={e => setPantoneCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
                required
              />
            </div>
          </div>

          {/* Chemical Grams Formulation Grid */}
          <div className="p-4 rounded-xl bg-[#FAF7F0]/60 border border-black/10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Standard 1,000g Batch Formulation</span>
              <span className="font-mono text-[#3A3564]">Total: {totalFormulaGrams}g</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Base Binder (g)</label>
                <input
                  type="number"
                  value={baseBinderGrams}
                  onChange={e => setBaseBinderGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-black/10 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Pigment (g)</label>
                <input
                  type="number"
                  value={pigmentGrams}
                  onChange={e => setPigmentGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-black/10 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Fixer/Cross (g)</label>
                <input
                  type="number"
                  value={fixerGrams}
                  onChange={e => setFixerGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-black/10 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Retarder (g)</label>
                <input
                  type="number"
                  value={retarderGrams}
                  onChange={e => setRetarderGrams(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white border border-black/10 font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Viscosity (cps)
              </label>
              <input
                type="number"
                value={viscosityCps}
                onChange={e => setViscosityCps(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Batch Vol (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={batchVolumeKg}
                onChange={e => setBatchVolumeKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Eco-Standard
              </label>
              <select
                value={ecoCompliance}
                onChange={e => setEcoCompliance(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 font-mono"
              >
                <option value="OEKO-TEX Standard 100">OEKO-TEX Std 100</option>
                <option value="GOTS 6.0">GOTS 6.0 (Organic)</option>
                <option value="ZDHC Level 3">ZDHC Level 3</option>
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
              <span>Save Recipe Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
