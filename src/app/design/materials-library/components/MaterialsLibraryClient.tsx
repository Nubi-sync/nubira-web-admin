'use client'

import { useState, useEffect } from 'react'
import { 
  Layers, 
  Search, 
  Plus, 
  Filter, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Check, 
  Clock, 
  Building2,
  Compass,
  ArrowDownRight
} from 'lucide-react'
import { MaterialItem, MaterialType, MaterialStatus } from '../../types/design'
import { toast } from 'sonner'
import { getStoredMaterials, saveStoredMaterial } from '../../utils/designStorage'
import { createMaterialAction } from '../../actions'

interface MaterialsLibraryClientProps {
  initialMaterials?: MaterialItem[]
}

export function MaterialsLibraryClient({ initialMaterials }: MaterialsLibraryClientProps = {}) {
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    if (initialMaterials && initialMaterials.length > 0) return initialMaterials
    return []
  })
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // New Material form state
  const [materialCode, setMaterialCode] = useState('')
  const [materialName, setMaterialName] = useState('')
  const [type, setType] = useState<MaterialType>('FABRIC')
  const [construction, setConstruction] = useState('')
  const [composition, setComposition] = useState('')
  const [gsm, setGsm] = useState('380')
  const [shrinkLength, setShrinkLength] = useState('3.5')
  const [shrinkWidth, setShrinkWidth] = useState('1.5')
  const [spirality, setSpirality] = useState('2.0')
  const [needle, setNeedle] = useState('Ball Point 80/12 (SES)')
  const [mill, setMill] = useState('')
  const [leadDays, setLeadDays] = useState('14')

  function loadMaterials() {
    setMaterials(getStoredMaterials())
  }

  useEffect(() => {
    if (initialMaterials && initialMaterials.length > 0) {
      setMaterials(initialMaterials)
      if (typeof window !== 'undefined') {
        localStorage.setItem('zigza_design_materials', JSON.stringify(initialMaterials))
      }
    } else {
      loadMaterials()
    }
    const handler = () => loadMaterials()
    window.addEventListener('zigza_materials_updated', handler)
    return () => window.removeEventListener('zigza_materials_updated', handler)
  }, [initialMaterials])

  const filteredMaterials = materials.filter(m => {
    const matchesType = typeFilter === 'ALL' || m.type === typeFilter
    const matchesSearch = 
      m.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier_mill.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  async function handleSaveMaterial() {
    if (!materialName.trim()) return
    setIsSubmitting(true)

    const matCodeClean = materialCode.trim().toUpperCase() || `MAT-${Date.now().toString().slice(-4)}`
    const matTypeDB = type === 'FABRIC' ? 'KNIT_FABRIC' : type === 'TRIM' ? 'RIB_TRIM' : 'SEWING_THREAD'

    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      material_code: matCodeClean,
      material_name: materialName.trim(),
      type,
      construction: construction.trim() || 'Industrial Textile Standard',
      composition: composition.trim() || '100% Cotton',
      weight_gsm: type === 'FABRIC' ? Number(gsm) : undefined,
      shrinkage_length_pct: Number(shrinkLength),
      shrinkage_width_pct: Number(shrinkWidth),
      spirality_pct: Number(spirality),
      recommended_needle: needle.trim(),
      supplier_mill: mill.trim() || 'Certified Vendor Mill',
      lead_time_days: Number(leadDays),
      status: 'CERTIFIED'
    }

    const res = await createMaterialAction({
      material_code: matCodeClean,
      material_name: materialName.trim(),
      material_type: matTypeDB as any,
      composition: composition.trim() || '100% Cotton',
      nominal_gsm: Number(gsm) || 300,
      length_shrinkage_pct: Number(shrinkLength) || 3.5,
      width_shrinkage_pct: Number(shrinkWidth) || 1.5,
      spirality_pct: Number(spirality) || 1.0,
      recommended_needle: needle.trim()
    })

    if (res.success) {
      toast.success(`Material ${matCodeClean} saved to Supabase!`)
    } else {
      toast.error(res.error || 'Failed to save material to Supabase.')
    }

    saveStoredMaterial(newMat)
    loadMaterials()
    setIsSubmitting(false)
    setIsAddOpen(false)
    setMaterialCode('')
    setMaterialName('')
  }

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Fabric & Trims Technical Library
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
              {filteredMaterials.length} Validated Items
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            Certified textile constructions, shrinkage & spirality telemetry, and needle calibrations
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Material / Trim</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'FABRIC', 'TRIM', 'THREAD'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-tight transition-all shrink-0 cursor-pointer border ${
                typeFilter === t
                  ? 'bg-[#3A3564] text-[#FAF7F0] border-[#3A3564] shadow-2xs'
                  : 'bg-white text-slate-600 border-black/10 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL' ? 'All Materials' : `${t}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search fabric, mill or code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
          />
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.map(mat => (
          <div
            key={mat.id}
            className="bg-white rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-black/5 bg-[#FAF7F0]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-[#3A3564] px-2 py-0.5 rounded-md bg-white border border-black/10">
                  {mat.material_code}
                </span>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {mat.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {mat.material_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {mat.type} • {mat.construction}
                </p>
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="p-5 space-y-3.5 flex-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-black/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Fiber Composition
                </span>
                <p className="font-semibold text-slate-800">{mat.composition}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-black/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Shrink L%</span>
                  <span className="font-mono font-bold text-slate-800">
                    {mat.shrinkage_length_pct > 0 ? `-${mat.shrinkage_length_pct}%` : '0%'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-black/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Shrink W%</span>
                  <span className="font-mono font-bold text-slate-800">
                    {mat.shrinkage_width_pct > 0 ? `-${mat.shrinkage_width_pct}%` : '0%'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-black/5 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Spirality</span>
                  <span className="font-mono font-bold text-slate-800">
                    {mat.spirality_pct}%
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Recommended Needle Gauge
                </span>
                <span className="inline-block text-[11px] font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
                  {mat.recommended_needle}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{mat.supplier_mill}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{mat.lead_time_days}d Lead</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Material Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-black/15 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3A3564] text-[#FAF7F0] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Register Textile Spec
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Technical parameters, shrinkage allowances and needle calibrations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Material Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FAB-SJ-240"
                    value={materialCode}
                    onChange={e => setMaterialCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono font-bold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as MaterialType)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="FABRIC">Fabric (Shell / Lining)</option>
                    <option value="TRIM">Trim (Zipper, Button, Drawcord)</option>
                    <option value="THREAD">Sewing Thread Spec</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Commercial Material Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supercombed 100% Cotton French Terry"
                  value={materialName}
                  onChange={e => setMaterialName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Fiber Composition *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% Combed Compact Cotton 30s"
                  value={composition}
                  onChange={e => setComposition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs text-slate-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Shrink L (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={shrinkLength}
                    onChange={e => setShrinkLength(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Shrink W (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={shrinkWidth}
                    onChange={e => setShrinkWidth(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Spirality (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={spirality}
                    onChange={e => setSpirality(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-black/15 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Recommended Needle
                  </label>
                  <input
                    type="text"
                    value={needle}
                    onChange={e => setNeedle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    value={leadDays}
                    onChange={e => setLeadDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs font-mono text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-700 mb-1">
                  Supplier Mill Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vardhman Textiles Ltd."
                  value={mill}
                  onChange={e => setMill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 text-xs text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-black/10 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMaterial}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Material Specification</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
