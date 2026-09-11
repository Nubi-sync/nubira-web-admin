'use client'

import { useState } from 'react'
import { X, FlaskConical, Check, Plus } from 'lucide-react'
import { WashRecipe, RecipeCategory } from '../../types/washing'
import { saveWashRecipe } from '../../utils/washingStorage'

interface CreateRecipeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateRecipeModal({ isOpen, onClose }: CreateRecipeModalProps) {
  const [recipeCode, setRecipeCode] = useState(`WASH-REC-${Math.floor(10 + Math.random() * 90)}`)
  const [recipeName, setRecipeName] = useState('')
  const [category, setCategory] = useState<RecipeCategory>('BIO_POLISH')
  const [enzymeType, setEnzymeType] = useState('Neutral Cellulase Enzyme')
  const [enzymeDoseGpl, setEnzymeDoseGpl] = useState(1.5)
  const [aceticAcidGpl, setAceticAcidGpl] = useState(0.8)
  const [softenerGpl, setSoftenerGpl] = useState(2.0)
  const [temperatureC, setTemperatureC] = useState(55)
  const [cycleMinutes, setCycleMinutes] = useState(45)
  const [phTarget, setPhTarget] = useState('5.2 - 5.5')
  const [liquorRatio, setLiquorRatio] = useState('1 : 5.0')
  const [targetHandFeel, setTargetHandFeel] = useState('Peach Finish / Ultra-Soft')
  const [approvedBy, setApprovedBy] = useState('Dr. A. Sengupta (Chief Chemist)')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipeName) return

    const newRecipe: WashRecipe = {
      id: `rec-${Date.now()}`,
      recipeCode,
      recipeName,
      category,
      enzymeType,
      enzymeDoseGpl: Number(enzymeDoseGpl),
      aceticAcidGpl: Number(aceticAcidGpl),
      softenerGpl: Number(softenerGpl),
      temperatureC: Number(temperatureC),
      cycleMinutes: Number(cycleMinutes),
      phTarget,
      liquorRatio,
      targetHandFeel,
      approvedBy,
      status: 'ACTIVE',
    }

    saveWashRecipe(newRecipe)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden my-8">
        <div className="p-5 border-b border-black/10 flex items-center justify-between bg-[#FAF7F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Create Wash Chemical Recipe</h3>
              <p className="text-xs text-slate-500 font-medium">Standardized enzymatic & softening formulation</p>
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
                Recipe Code *
              </label>
              <input
                type="text"
                value={recipeCode}
                onChange={e => setRecipeCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as RecipeCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
              >
                <option value="BIO_POLISH">Bio-Polish Enzyme</option>
                <option value="SILICON_SOFT">Micro-Silicon Softener</option>
                <option value="VINTAGE_STONE">Vintage Stone Abrasion</option>
                <option value="DESIZE_NEUTRALIZE">Desize & Neutralize</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Recipe Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Bio-Polish Heavy Enzyme 55°C"
              value={recipeName}
              onChange={e => setRecipeName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
              Active Enzyme / Chemical *
            </label>
            <input
              type="text"
              value={enzymeType}
              onChange={e => setEnzymeType(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#FAF7F0] rounded-xl border border-black/10">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Enzyme (g/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={enzymeDoseGpl}
                onChange={e => setEnzymeDoseGpl(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Acetic Acid (g/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={aceticAcidGpl}
                onChange={e => setAceticAcidGpl(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Softener (g/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={softenerGpl}
                onChange={e => setSoftenerGpl(Number(e.target.value))}
                required
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-black/10 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperatureC}
                onChange={e => setTemperatureC(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Cycle (Minutes)
              </label>
              <input
                type="number"
                value={cycleMinutes}
                onChange={e => setCycleMinutes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                pH Buffer Target
              </label>
              <input
                type="text"
                value={phTarget}
                onChange={e => setPhTarget(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Target Hand-Feel Spec
              </label>
              <input
                type="text"
                value={targetHandFeel}
                onChange={e => setTargetHandFeel(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 uppercase mb-1">
                Approved Chemist
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={e => setApprovedBy(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white"
              />
            </div>
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
              <span>Save Wash Recipe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
