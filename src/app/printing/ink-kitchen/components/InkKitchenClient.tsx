'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Palette,
  ChevronLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { InkRecipe, PrintTechnique } from '../../types/printing'
import { getInkRecipes, saveInkRecipe, PRINTING_UPDATE_EVENT } from '../../utils/printingStorage'
import { CreateRecipeModal } from './CreateRecipeModal'

export function InkKitchenClient() {
  const [recipes, setRecipes] = useState<InkRecipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [techniqueFilter, setTechniqueFilter] = useState<string>('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const reloadData = () => {
    setRecipes(getInkRecipes())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener(PRINTING_UPDATE_EVENT, reloadData)
    return () => window.removeEventListener(PRINTING_UPDATE_EVENT, reloadData)
  }, [])

  const filteredRecipes = recipes.filter(r => {
    const matchesTechnique = techniqueFilter === 'ALL' || r.technique === techniqueFilter
    const matchesSearch =
      r.recipe_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.color_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pantone_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prepared_by.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTechnique && matchesSearch
  })

  // Executive KPI calculations
  const totalRecipes = recipes.length
  const totalVolumeKg = recipes.reduce((acc, r) => acc + r.batch_volume_kg, 0)
  const oekoTexCertifiedCount = recipes.filter(r => r.eco_compliance === 'OEKO-TEX Standard 100').length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/printing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Floor Dashboard</span>
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-slate-900">Ink Kitchen & Recipes</span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Formulate New Recipe</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Ink Kitchen & Formulation Chemistry
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15">
                Exact Chemical Grams Ledger
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Plastisol, water-based, discharge, and puff formulations with viscosity tests (cps) and OEKO-TEX / GOTS eco compliance.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Active Shade Recipes
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            {totalRecipes} Formulations
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Calibrated for bulk table runs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Total Batched Volume
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-emerald-700 font-mono">
            {totalVolumeKg.toFixed(1)} kg Prepared
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Ready in color kitchen buckets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Eco Compliance SLA
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-[#3A3564] font-mono">
            100% Certified
          </div>
          <p className="text-xs text-emerald-700 font-medium">OEKO-TEX & GOTS 6.0 verified</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs">
          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Standard Viscosity
          </span>
          <div className="text-2xl sm:text-[28px] font-bold text-slate-900 font-mono">
            12k–18k cps
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Controlled shear-thinning index</p>
        </div>
      </div>

      {/* 4. Filter Toolbar & Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 flex-wrap bg-[#FAF7F0]/30">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'PLASTISOL', 'WATER_BASED', 'DISCHARGE', 'HIGH_DENSITY'].map(tech => (
              <button
                key={tech}
                onClick={() => setTechniqueFilter(tech)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  techniqueFilter === tech
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-[#3A3564] border border-black/10 hover:bg-[#FAF7F0]'
                }`}
              >
                {tech.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipe, color, chemist..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white border border-black/10 focus:outline-none focus:ring-1 focus:ring-[#3A3564] text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F0]/60 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Recipe Code</th>
                <th className="py-3 px-4">Color & Pantone</th>
                <th className="py-3 px-4">Technique</th>
                <th className="py-3 px-4">Formula Breakdown (1,000g)</th>
                <th className="py-3 px-4">Viscosity</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4">Eco Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-900">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map(rcp => (
                  <tr key={rcp.id} className="hover:bg-[#FAF7F0]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {rcp.recipe_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{rcp.color_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{rcp.pantone_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {rcp.technique}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      <div className="text-slate-700">
                        Binder: <span className="font-bold text-slate-900">{rcp.base_binder_grams}g</span> • Pigment: <span className="font-bold text-slate-900">{rcp.pigment_concentrate_grams}g</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Fixer: {rcp.fixer_crosslinker_grams}g • Retarder: {rcp.retarder_grams}g
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {rcp.viscosity_cps.toLocaleString()} cps
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      {rcp.batch_volume_kg} kg
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rcp.eco_compliance}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rcp.prepared_by}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No ink recipes match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateRecipeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reloadData}
      />
    </div>
  )
}
