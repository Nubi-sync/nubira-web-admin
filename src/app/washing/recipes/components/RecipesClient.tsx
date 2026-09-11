'use client'

import { useState, useEffect } from 'react'
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Thermometer,
  ShieldCheck,
  Droplet
} from 'lucide-react'
import { WashRecipe, RecipeCategory } from '../../types/washing'
import { getWashRecipes, WASHING_UPDATE_EVENT } from '../../utils/washingStorage'
import { CreateRecipeModal } from './CreateRecipeModal'

export function RecipesClient() {
  const [recipes, setRecipes] = useState<WashRecipe[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  function loadRecipes() {
    setRecipes(getWashRecipes())
  }

  useEffect(() => {
    loadRecipes()
    const handleUpdate = () => loadRecipes()
    window.addEventListener(WASHING_UPDATE_EVENT, handleUpdate)
    return () => window.removeEventListener(WASHING_UPDATE_EVENT, handleUpdate)
  }, [])

  const filtered = recipes.filter(r => {
    const matchesSearch =
      r.recipeName.toLowerCase().includes(search.toLowerCase()) ||
      r.recipeCode.toLowerCase().includes(search.toLowerCase()) ||
      r.enzymeType.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Action & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, chemical agents, codes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 text-[11px] font-mono font-bold">
            {['ALL', 'BIO_POLISH', 'SILICON_SOFT', 'VINTAGE_STONE', 'DESIZE_NEUTRALIZE'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Recipe</span>
          </button>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(r => (
          <div
            key={r.id}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4 hover:border-[#3A3564]/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-black/10">
                    {r.recipeCode}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    {r.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 mt-1.5">{r.recipeName}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Target: <strong className="text-slate-700">{r.targetHandFeel}</strong>
                </p>
              </div>

              <span className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0">
                <FlaskConical className="w-4 h-4" />
              </span>
            </div>

            {/* Chemical Formulation Breakdown */}
            <div className="bg-[#FAF7F0]/60 p-3.5 rounded-xl border border-black/10 space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                Active Chemical Dosing (Standard M:L {r.liquorRatio})
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-white p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-500 block">Enzyme</span>
                  <span className="font-mono font-bold text-[#3A3564]">{r.enzymeDoseGpl} g/L</span>
                  <span className="text-[10px] text-slate-400 block truncate">{r.enzymeType}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-500 block">Acetic Acid</span>
                  <span className="font-mono font-bold text-slate-800">{r.aceticAcidGpl} g/L</span>
                  <span className="text-[10px] text-slate-400 block">Buffer {r.phTarget}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-black/5">
                  <span className="text-[10px] text-slate-500 block">Silicon Softener</span>
                  <span className="font-mono font-bold text-slate-800">{r.softenerGpl} g/L</span>
                  <span className="text-[10px] text-slate-400 block">Silk finish</span>
                </div>
              </div>
            </div>

            {/* Cycle Parameters */}
            <div className="grid grid-cols-3 gap-2 text-xs border-t border-black/5 pt-3">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#3A3564]" />
                <span>{r.cycleMinutes} min cycle</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>{r.temperatureC}°C wash</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Droplet className="w-3.5 h-3.5 text-blue-600" />
                <span>pH {r.phTarget}</span>
              </div>
            </div>

            {/* Approver Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-black/5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved: {r.approvedBy}</span>
              </span>
              <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>

      <CreateRecipeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
