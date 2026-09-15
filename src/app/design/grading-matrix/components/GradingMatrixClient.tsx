'use client'

import { useState, useEffect } from 'react'
import { 
  Ruler, 
  Layers, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Download, 
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react'
import { GradingScheme, PointOfMeasure, SizeSystem } from '../../types/design'
import { getStoredGradingSchemes, saveStoredGradingScheme } from '../../utils/designStorage'
import { EmptyState } from '@/components/ui/EmptyState'

import { toast } from 'sonner'
import { createPomAction, deletePomAction } from '../../actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2, Loader2 } from 'lucide-react'

interface GradingMatrixClientProps {
  initialSchemes?: GradingScheme[]
}

export function GradingMatrixClient({ initialSchemes }: GradingMatrixClientProps = {}) {
  const [schemes, setSchemes] = useState<GradingScheme[]>(() => {
    if (initialSchemes && initialSchemes.length > 0) return initialSchemes
    return []
  })
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(() => {
    if (initialSchemes && initialSchemes.length > 0) return initialSchemes[0].id
    return 'scheme-adult-unisex'
  })
  const [isAddPomOpen, setIsAddPomOpen] = useState(false)
  const [isSubmittingPom, setIsSubmittingPom] = useState(false)
  const [pomToDelete, setPomToDelete] = useState<{ code: string; name: string } | null>(null)
  const [isDeletingPom, setIsDeletingPom] = useState(false)

  // New POM form state
  const [newPomCode, setNewPomCode] = useState('')
  const [newPomName, setNewPomName] = useState('')
  const [newTolerance, setNewTolerance] = useState('0.5')
  const [newBaseValue, setNewBaseValue] = useState('50.0')
  const [newGradeStep, setNewGradeStep] = useState('2.0')

  function loadSchemes() {
    const list = getStoredGradingSchemes()
    if (list && list.length > 0) {
      setSchemes(list)
    }
  }

  useEffect(() => {
    if (initialSchemes && initialSchemes.length > 0) {
      setSchemes(initialSchemes)
      if (!initialSchemes.some(s => s.id === selectedSchemeId)) {
        setSelectedSchemeId(initialSchemes[0].id)
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_design_grading_schemes', JSON.stringify(initialSchemes))
      }
    } else {
      loadSchemes()
    }
  }, [initialSchemes])

  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0]

  async function handleAddPom() {
    if (!currentScheme || !newPomName.trim()) {
      toast.error('Please enter a measurement description.')
      return
    }

    const pomCode = newPomCode.trim().toUpperCase() || `POM_${Date.now()}`
    const baseVal = Number(newBaseValue) || 50.0
    const stepVal = Number(newGradeStep) || 2.0
    const toleranceVal = Number(newTolerance) || 0.5
    const baseIdx = currentScheme.sizes.indexOf(currentScheme.base_size)
    const generatedSizes: Record<string, number> = {}

    currentScheme.sizes.forEach((sz, idx) => {
      const offset = idx - (baseIdx >= 0 ? baseIdx : 0)
      generatedSizes[sz] = Number((baseVal + offset * stepVal).toFixed(1))
    })

    const newPom: PointOfMeasure = {
      pom_code: pomCode,
      pom_name: newPomName.trim(),
      tolerance_cm: toleranceVal,
      grade_step_cm: stepVal,
      base_value_cm: baseVal,
      sizes: generatedSizes
    }

    setIsSubmittingPom(true)
    try {
      // 1. Call server action to write directly to Supabase design_poms & design_measurement_values
      const res = await createPomAction({
        tech_pack_id: currentScheme.id,
        pom_code: pomCode,
        pom_name: newPomName.trim(),
        tolerance_cm: toleranceVal,
        grade_step_cm: stepVal,
        base_value_cm: baseVal,
        base_size: currentScheme.base_size,
        sizes: currentScheme.sizes
      })

      if (!res.success) {
        toast.error(res.error || 'Failed to save POM to database.')
        setIsSubmittingPom(false)
        return
      }

      const updatedScheme: GradingScheme = {
        ...currentScheme,
        poms: [...currentScheme.poms.filter(p => p.pom_code !== pomCode), res.data || newPom]
      }

      setSchemes(prev => prev.map(s => s.id === currentScheme.id ? updatedScheme : s))
      saveStoredGradingScheme(updatedScheme)
      toast.success(`Point of Measure "${newPomName.trim()}" saved to Supabase!`)
      setIsAddPomOpen(false)
      setNewPomCode('')
      setNewPomName('')
    } catch (err: any) {
      toast.error(err?.message || 'Error saving POM')
    } finally {
      setIsSubmittingPom(false)
    }
  }

  async function handleDeletePomConfirm() {
    if (!pomToDelete || !currentScheme) return
    setIsDeletingPom(true)
    try {
      const res = await deletePomAction(currentScheme.id, pomToDelete.code)
      if (!res.success) {
        toast.error(res.error || 'Failed to delete POM.')
        setIsDeletingPom(false)
        return
      }

      const updatedScheme: GradingScheme = {
        ...currentScheme,
        poms: currentScheme.poms.filter(p => p.pom_code !== pomToDelete.code)
      }

      setSchemes(prev => prev.map(s => s.id === currentScheme.id ? updatedScheme : s))
      saveStoredGradingScheme(updatedScheme)
      toast.success(`POM "${pomToDelete.name}" deleted successfully.`)
      setPomToDelete(null)
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting POM')
    } finally {
      setIsDeletingPom(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Action Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shrink-0 shadow-2xs">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Dynamic Size Grading Matrix
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                ASTM D6961 / ISO 8559
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Standardized Points of Measure (POM), automated grade rule scaling & tolerance boundaries
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddPomOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add point of measure</span>
        </button>
      </div>

      {/* Dynamic Sizing Scheme Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {schemes.map(sch => (
          <button
            key={sch.id}
            onClick={() => setSelectedSchemeId(sch.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium tracking-tight transition-all shrink-0 cursor-pointer border ${
              selectedSchemeId === sch.id
                ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                : 'bg-white text-slate-700 border-black/10 hover:bg-slate-50'
            }`}
          >
            {sch.name}
          </button>
        ))}
      </div>

      {/* Scheme Metadata Banner */}
      {currentScheme && (
        <div className="bg-[#FAF7F0]/70 p-4 sm:p-5 rounded-2xl border border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-black/10 text-[#3A3564] flex items-center justify-center font-bold text-sm shadow-2xs">
              {currentScheme.base_size}
            </div>
            <div>
              <span className="font-semibold text-slate-900 block text-sm">
                Active system: {currentScheme.name}
              </span>
              <span className="text-xs text-slate-600">
                Base fit sample size: <strong className="text-slate-900 font-semibold">{currentScheme.base_size}</strong> • Graded sizes: {currentScheme.sizes.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-black/10 text-[#3A3564]">
              {currentScheme.poms.length} active POM rules
            </span>
          </div>
        </div>
      )}

      {/* Master Interactive Grading Table or Empty State */}
      {!currentScheme || currentScheme.poms.length === 0 ? (
        <EmptyState
          icon={Ruler}
          title="No POM rules defined"
          description="Add a measurement rule with base values and grade steps."
          actionLabel="Add point of measure"
          onAction={() => setIsAddPomOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/10 bg-[#FAF7F0]/70 text-slate-700 text-xs font-semibold">
                  <th className="py-3 px-4">Point of measure (POM)</th>
                  <th className="py-3 px-4 text-center">Tolerance (±)</th>
                  {currentScheme.sizes.map(sz => {
                    const isBase = sz === currentScheme.base_size
                    return (
                      <th
                        key={sz}
                        className={`py-3 px-3 text-center ${
                          isBase ? 'bg-[#3A3564] text-[#FAF7F0] font-semibold' : ''
                        }`}
                      >
                        {sz} {isBase && '(Base)'}
                      </th>
                    )
                  })}
                  <th className="py-3 px-4 text-right">Grade step</th>
                  <th className="py-3 px-3 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium text-slate-700 text-xs sm:text-sm">
                {currentScheme.poms.map(pom => (
                  <tr key={pom.pom_code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">{pom.pom_name}</span>
                      <span className="text-xs text-slate-500 font-mono uppercase">{pom.pom_code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-600 font-mono">
                      ± {pom.tolerance_cm.toFixed(2)} cm
                    </td>
                    {currentScheme.sizes.map(sz => {
                      const isBase = sz === currentScheme.base_size
                      const val = pom.sizes[sz] ?? pom.base_value_cm
                      return (
                        <td
                          key={sz}
                          className={`py-3.5 px-3 text-center font-mono text-xs sm:text-sm ${
                            isBase ? 'bg-[#FAF7F0] font-bold text-[#3A3564]' : 'text-slate-800'
                          }`}
                        >
                          {val.toFixed(1)}
                        </td>
                      )
                    })}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#3A3564] text-xs sm:text-sm">
                      +{pom.grade_step_cm.toFixed(1)} cm
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setPomToDelete({ code: pom.pom_code, name: pom.pom_name })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete POM"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add POM Modal */}
      {isAddPomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] flex items-center justify-center shadow-2xs">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add point of measure (POM)
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Append new measurement spec to {currentScheme?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPomOpen(false)}
                disabled={isSubmittingPom}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  POM code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BICEP_WIDTH"
                  value={newPomCode}
                  disabled={isSubmittingPom}
                  onChange={e => setNewPomCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm font-semibold text-slate-900 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-[#3A3564] disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Measurement description *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Upper Bicep Width (1 inch below armhole)"
                  value={newPomName}
                  disabled={isSubmittingPom}
                  onChange={e => setNewPomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564] disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Base value (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newBaseValue}
                    disabled={isSubmittingPom}
                    onChange={e => setNewBaseValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Grade step (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newGradeStep}
                    disabled={isSubmittingPom}
                    onChange={e => setNewGradeStep(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Tolerance (± cm) *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={newTolerance}
                    disabled={isSubmittingPom}
                    onChange={e => setNewTolerance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-sm font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564] disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F0]/40 border border-black/10 text-xs text-slate-600 space-y-1">
                <span className="font-semibold block text-slate-800">Automatic calibration</span>
                <p>Values for sizes ({currentScheme?.sizes.join(', ')}) will be auto-calculated relative to {currentScheme?.base_size} base value.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsAddPomOpen(false)}
                disabled={isSubmittingPom}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPom}
                disabled={isSubmittingPom}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-sm font-semibold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPom ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save POM to scheme</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!pomToDelete}
        title="Delete Point of Measure"
        description={`Are you sure you want to delete POM rule "${pomToDelete?.name}" (${pomToDelete?.code})? This measurement specification will be permanently removed.`}
        confirmText="Delete POM"
        variant="danger"
        isLoading={isDeletingPom}
        onConfirm={handleDeletePomConfirm}
        onClose={() => setPomToDelete(null)}
      />

    </div>
  )
}
