'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Settings, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Sliders, 
  Layers, 
  Ruler, 
  Scissors, 
  FileCheck2, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Loader2,
  Tag,
  Boxes
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  BodyPartCode, 
  BOMComponentCode, 
  GarmentTemplate, 
  BOMComponentType 
} from '../../types/design'
import { 
  createBodyPartCodeAction, 
  deleteBodyPartCodeAction, 
  createBOMComponentCodeAction, 
  deleteBOMComponentCodeAction, 
  createGarmentTemplateAction, 
  deleteGarmentTemplateAction 
} from '../../actions'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface PHSettingsClientProps {
  initialBodyCodes: BodyPartCode[]
  initialBOMCodes: BOMComponentCode[]
  initialTemplates: GarmentTemplate[]
  companyName: string
  currentUserId: string
  userRole?: string
}

export function PHSettingsClient({
  initialBodyCodes,
  initialBOMCodes,
  initialTemplates,
  companyName,
  currentUserId,
  userRole
}: PHSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'BODY_PARTS' | 'BOM_CODES' | 'TEMPLATES'>('BODY_PARTS')

  // Body Part Codes State
  const [bodyCodes, setBodyCodes] = useState<BodyPartCode[]>(initialBodyCodes)
  const [newBodyCode, setNewBodyCode] = useState('')
  const [newBodyName, setNewBodyName] = useState('')
  const [isAddingBodyCode, setIsAddingBodyCode] = useState(false)

  // BOM Component Codes State
  const [bomCodes, setBomCodes] = useState<BOMComponentCode[]>(initialBOMCodes)
  const [newBOMType, setNewBOMType] = useState<BOMComponentType>('BUTTON')
  const [newBOMSpec, setNewBOMSpec] = useState('')
  const [newBOMCode, setNewBOMCode] = useState('')
  const [isAddingBOMCode, setIsAddingBOMCode] = useState(false)

  // Templates State
  const [templates, setTemplates] = useState<GarmentTemplate[]>(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<GarmentTemplate | null>(initialTemplates[0] || null)
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false)
  const [newTemplateType, setNewTemplateType] = useState('')
  const [newTemplateParts, setNewTemplateParts] = useState<{ code: string; name: string; default_tolerance: number; default_grade_step: number }[]>([
    { code: 'CH', name: 'Chest Width', default_tolerance: 1.0, default_grade_step: 2.5 },
    { code: 'BL', name: 'Body Length', default_tolerance: 1.0, default_grade_step: 2.0 }
  ])
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<{ type: 'BODY' | 'BOM' | 'TEMPLATE'; id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Suggested Preset Helpers
  const BODY_PRESETS = [
    { code: 'BC', name: 'Bicep Circumference' },
    { code: 'Ch1', name: 'Chest Width (1" below armhole)' },
    { code: 'SL', name: 'Sleeve Length' },
    { code: 'BL', name: 'Body Length (HSP to Hem)' },
    { code: 'SH', name: 'Across Shoulder' },
    { code: 'NK', name: 'Neck Width' },
    { code: 'WST', name: 'Waist Width' },
    { code: 'HIP', name: 'Hip Width' },
    { code: 'TH', name: 'Thigh Width' },
    { code: 'IN', name: 'Inseam Length' }
  ]

  const BOM_PRESETS = [
    { type: 'BUTTON' as BOMComponentType, spec: 'Red Horn Button 24L', code: 'BTN-RED-24L' },
    { type: 'BUTTON' as BOMComponentType, spec: 'Mother of Pearl 18L', code: 'BTN-MOP-18L' },
    { type: 'SLEEVE' as BOMComponentType, spec: 'Cut Sleeve / Raglan Finish', code: 'SLV-CUT-01' },
    { type: 'SLEEVE' as BOMComponentType, spec: 'Full Sleeve with 2x2 Rib Cuff', code: 'SLV-FULL-RIB' },
    { type: 'COLLAR' as BOMComponentType, spec: 'Flatknit Rib Collar 4.5cm', code: 'CLR-RIB-45' },
    { type: 'ZIPPER' as BOMComponentType, spec: 'YKK #5 Antique Brass Metal', code: 'ZIP-YKK-M5' },
    { type: 'TRIM' as BOMComponentType, spec: 'Braided Cotton Drawcord with Metal Aglets', code: 'TRM-DRW-01' }
  ]

  async function handleAddBodyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!newBodyCode.trim() || !newBodyName.trim()) {
      toast.error('Code and body part name are required.')
      return
    }

    setIsAddingBodyCode(true)
    try {
      const res = await createBodyPartCodeAction({
        ph_user_id: currentUserId,
        company_name: companyName,
        code: newBodyCode.trim().toUpperCase(),
        body_part_name: newBodyName.trim()
      })

      if (res.success && res.data) {
        toast.success(`Code ${res.data.code} (${res.data.body_part_name}) added.`)
        setBodyCodes(prev => [...prev, res.data!])
        setNewBodyCode('')
        setNewBodyName('')
      } else {
        toast.error(res.error || 'Failed to add body part code.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred.')
    } finally {
      setIsAddingBodyCode(false)
    }
  }

  async function handleAddBOMCode(e: React.FormEvent) {
    e.preventDefault()
    if (!newBOMSpec.trim()) {
      toast.error('Component specification is required.')
      return
    }

    setIsAddingBOMCode(true)
    try {
      const res = await createBOMComponentCodeAction({
        ph_user_id: currentUserId,
        company_name: companyName,
        component_type: newBOMType,
        component_spec: newBOMSpec.trim(),
        code: newBOMCode.trim().toUpperCase() || undefined
      })

      if (res.success && res.data) {
        toast.success(`BOM Component "${res.data.component_spec}" added.`)
        setBomCodes(prev => [...prev, res.data!])
        setNewBOMSpec('')
        setNewBOMCode('')
      } else {
        toast.error(res.error || 'Failed to add BOM code.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred.')
    } finally {
      setIsAddingBOMCode(false)
    }
  }

  async function handleCreateTemplateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newTemplateType.trim()) {
      toast.error('Garment type is required.')
      return
    }

    setIsSavingTemplate(true)
    try {
      const res = await createGarmentTemplateAction({
        garment_type: newTemplateType.trim(),
        body_parts: newTemplateParts,
        bom_defaults: [],
        ph_user_id: currentUserId,
        company_name: companyName
      })

      if (res.success && res.data) {
        toast.success(`Garment template for ${newTemplateType} created!`)
        setTemplates(prev => [...prev, res.data!])
        setSelectedTemplate(res.data!)
        setIsCreateTemplateOpen(false)
        setNewTemplateType('')
      } else {
        toast.error(res.error || 'Failed to save template.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving template.')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      if (itemToDelete.type === 'BODY') {
        const res = await deleteBodyPartCodeAction(itemToDelete.id)
        if (res.success) {
          toast.success('Body part code deleted.')
          setBodyCodes(prev => prev.filter(b => b.id !== itemToDelete.id))
        } else toast.error(res.error || 'Failed to delete.')
      } else if (itemToDelete.type === 'BOM') {
        const res = await deleteBOMComponentCodeAction(itemToDelete.id)
        if (res.success) {
          toast.success('BOM component code deleted.')
          setBomCodes(prev => prev.filter(b => b.id !== itemToDelete.id))
        } else toast.error(res.error || 'Failed to delete.')
      } else if (itemToDelete.type === 'TEMPLATE') {
        const res = await deleteGarmentTemplateAction(itemToDelete.id)
        if (res.success) {
          toast.success('Template deleted.')
          setTemplates(prev => prev.filter(t => t.id !== itemToDelete.id))
          if (selectedTemplate?.id === itemToDelete.id) {
            setSelectedTemplate(templates[0] || null)
          }
        } else toast.error(res.error || 'Failed to delete template.')
      }
      setItemToDelete(null)
    } catch (err: any) {
      toast.error(err.message || 'Error during deletion.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Hierarchy Trail */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/design" className="hover:text-[#3A3564] transition-colors">
          Design Studio
        </Link>
        <span>/</span>
        <span>Configuration</span>
        <span>/</span>
        <span className="font-bold text-slate-900">PH Settings</span>
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <Settings className="w-5 h-5 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Provisional Head Studio Settings
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                PH Privileged
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Configure standardized code-words for body parts (e.g. BC = Bicep), BOM trims (buttons, sleeves), and auto-fill garment templates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            Admin Workspace
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
        <button
          onClick={() => setActiveTab('BODY_PARTS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'BODY_PARTS'
              ? 'bg-[#3A3564] text-[#FAF7F0] shadow-2xs'
              : 'bg-white text-slate-600 border border-black/10 hover:bg-[#FAF7F0]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            <span>1. Body Part Code-Words</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {bodyCodes.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('BOM_CODES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'BOM_CODES'
              ? 'bg-[#3A3564] text-[#FAF7F0] shadow-2xs'
              : 'bg-white text-slate-600 border border-black/10 hover:bg-[#FAF7F0]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4" />
            <span>2. BOM Component Codes</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {bomCodes.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'TEMPLATES'
              ? 'bg-[#3A3564] text-[#FAF7F0] shadow-2xs'
              : 'bg-white text-slate-600 border border-black/10 hover:bg-[#FAF7F0]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Garment Templates (Auto-Fill)</span>
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
              {templates.length}
            </span>
          </div>
        </button>
      </div>

      {/* TAB 1: BODY PART CODE-WORDS */}
      {activeTab === 'BODY_PARTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Code Form */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <Plus className="w-4 h-4 text-[#3A3564]" />
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Add Body Part Code
              </h2>
            </div>

            <form onSubmit={handleAddBodyCode} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Code-Word <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BC, Ch1, SL, NK"
                  value={newBodyCode}
                  onChange={e => setNewBodyCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 font-mono font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Full Body Part Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bicep Width, Chest Circumference"
                  value={newBodyName}
                  onChange={e => setNewBodyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingBodyCode}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {isAddingBodyCode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Code-Word</span>
              </button>
            </form>

            {/* Suggested Presets */}
            <div className="pt-3 border-t border-black/5 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Quick Presets (Click to Fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BODY_PRESETS.map(p => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => {
                      setNewBodyCode(p.code)
                      setNewBodyName(p.name)
                    }}
                    className="text-xs px-2 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 font-mono font-semibold transition-all cursor-pointer"
                  >
                    {p.code}: {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Defined Codes */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Defined Body Part Code-Words
                </h2>
                <p className="text-xs text-slate-500">
                  These abbreviations are auto-used across POM grading tables and Tech-Packs
                </p>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                {bodyCodes.length} Codes
              </span>
            </div>

            {bodyCodes.length === 0 ? (
              <EmptyState
                icon={Ruler}
                title="No custom body part codes yet"
                description="Add code-words like BC (Bicep) or Ch1 (Chest) to streamline tech-pack generation."
              />
            ) : (
              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Full Body Part Description</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-slate-700">
                    {bodyCodes.map(bc => (
                      <tr key={bc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-black/10">
                            {bc.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {bc.body_part_name}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setItemToDelete({ type: 'BODY', id: bc.id, name: `${bc.code} (${bc.body_part_name})` })}
                            className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOM COMPONENT CODES */}
      {activeTab === 'BOM_CODES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add BOM Component Form */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-black/5">
              <Plus className="w-4 h-4 text-[#3A3564]" />
              <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Add BOM Component
              </h2>
            </div>

            <form onSubmit={handleAddBOMCode} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Component Type <span className="text-rose-600">*</span>
                </label>
                <select
                  value={newBOMType}
                  onChange={e => setNewBOMType(e.target.value as BOMComponentType)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                >
                  <option value="BUTTON">BUTTON (Buttons & Rivets)</option>
                  <option value="SLEEVE">SLEEVE (Sleeve Type & Rib)</option>
                  <option value="COLLAR">COLLAR (Collar & Neckbands)</option>
                  <option value="TRIM">TRIM (Drawcords, Eyelets, Badges)</option>
                  <option value="ZIPPER">ZIPPER (Zippers & Sliders)</option>
                  <option value="FABRIC">FABRIC (Fabric Specification)</option>
                  <option value="THREAD">THREAD (Sewing Thread Spec)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Component Spec / Description <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Horn Button 24L, Cut Sleeve..."
                  value={newBOMSpec}
                  onChange={e => setNewBOMSpec(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Optional Short Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. BTN-RED-24, SLV-CUT-01"
                  value={newBOMCode}
                  onChange={e => setNewBOMCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <button
                type="submit"
                disabled={isAddingBOMCode}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {isAddingBOMCode && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save BOM Component</span>
              </button>
            </form>

            {/* Suggested Presets */}
            <div className="pt-3 border-t border-black/5 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Quick Presets:
              </span>
              <div className="flex flex-col gap-1.5">
                {BOM_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNewBOMType(p.type)
                      setNewBOMSpec(p.spec)
                      setNewBOMCode(p.code)
                    }}
                    className="text-left text-xs p-2 rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] text-slate-800 border border-black/10 transition-all cursor-pointer"
                  >
                    <span className="font-bold text-[#3A3564] block">{p.type}</span>
                    <span>{p.spec}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List of Defined BOM Codes */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Standardized BOM Component Registry
                </h2>
                <p className="text-xs text-slate-500">
                  Used by Merchandising & Sourcing to match Tech-Pack specifications
                </p>
              </div>
              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                {bomCodes.length} Components
              </span>
            </div>

            {bomCodes.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No BOM component codes defined"
                description="Add components like buttons, zippers, sleeve finishes, and collar trims."
              />
            ) : (
              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Component Specification</th>
                      <th className="py-3 px-4">Short Code</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-slate-700">
                    {bomCodes.map(bom => (
                      <tr key={bom.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {bom.component_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {bom.component_spec}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#3A3564]">
                          {bom.code ? (
                            <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-black/10 font-bold">
                              {bom.code}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setItemToDelete({ type: 'BOM', id: bom.id, name: bom.component_spec })}
                            className="p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Component"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GARMENT AUTO-FILL TEMPLATES */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Garment Silhouette Templates (Auto-Fill Engine)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                When you select a garment silhouette (e.g. T-Shirt, Hoodie, Suit) during Tech-Pack creation, standard body parts and BOM trims automatically populate.
              </p>
            </div>

            <button
              onClick={() => setIsCreateTemplateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Custom Template</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map(tmpl => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-2xs ${
                  selectedTemplate?.id === tmpl.id
                    ? 'bg-[#FAF7F0] border-[#3A3564] ring-2 ring-[#3A3564]/10'
                    : 'bg-white border-black/10 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-base font-[family-name:var(--font-heading)]">
                      {tmpl.garment_type}
                    </span>
                    {tmpl.is_system_template ? (
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        System Default
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-[#3A3564] text-[#FAF7F0]">
                        Custom PH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {tmpl.body_parts.length} Body Parts Configured
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tmpl.body_parts.slice(0, 4).map(bp => (
                      <span key={bp.code} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white border border-black/10 text-slate-700">
                        {bp.code}
                      </span>
                    ))}
                    {tmpl.body_parts.length > 4 && (
                      <span className="text-[11px] font-mono text-slate-500 self-center">
                        +{tmpl.body_parts.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {!tmpl.is_system_template && (
                  <div className="pt-3 border-t border-black/5 mt-3 flex justify-end">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setItemToDelete({ type: 'TEMPLATE', id: tmpl.id, name: tmpl.garment_type })
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold p-1 hover:bg-rose-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detailed View for Selected Template */}
          {selectedTemplate && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#3A3564]" />
                  <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Auto-Fill Schema for &ldquo;{selectedTemplate.garment_type}&rdquo;
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {selectedTemplate.body_parts.length} Point-of-Measure (POM) Rules
                </span>
              </div>

              <div className="overflow-x-auto border border-black/10 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#FAF7F0] text-slate-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">POM Code</th>
                      <th className="py-3 px-4">Measurement Location</th>
                      <th className="py-3 px-4">Default Tolerance (&plusmn; cm)</th>
                      <th className="py-3 px-4">Default Grade Step (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 text-slate-700">
                    {selectedTemplate.body_parts.map((bp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                          <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-black/10">
                            {bp.code}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {bp.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-700">
                          &plusmn; {bp.default_tolerance} cm
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-700">
                          {bp.default_grade_step} cm
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Custom Template Modal */}
      {isCreateTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-black/10 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Create Custom Garment Template
                </h2>
              </div>
              <button
                onClick={() => setIsCreateTemplateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplateSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Garment Silhouette Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bomber Jacket, Kimono, Cargo Shorts"
                  value={newTemplateType}
                  onChange={e => setNewTemplateType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3A3564]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800">
                    Template Body Parts:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewTemplateParts(prev => [...prev, { code: 'POM', name: 'New Measure', default_tolerance: 1.0, default_grade_step: 2.0 }])
                    }}
                    className="text-xs font-bold text-[#3A3564] hover:underline cursor-pointer"
                  >
                    + Add Row
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newTemplateParts.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Code"
                        value={p.code}
                        onChange={e => {
                          const val = e.target.value
                          setNewTemplateParts(prev => prev.map((item, i) => i === idx ? { ...item, code: val.toUpperCase() } : item))
                        }}
                        className="w-20 px-2 py-1.5 rounded-lg border border-black/10 font-mono text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Name"
                        value={p.name}
                        onChange={e => {
                          const val = e.target.value
                          setNewTemplateParts(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item))
                        }}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-black/10 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setNewTemplateParts(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemplate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] text-[#FAF7F0] text-xs font-bold hover:bg-[#2A2649] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingTemplate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title={`Delete "${itemToDelete?.name}"?`}
        description={`Are you sure you want to permanently delete this ${itemToDelete?.type?.toLowerCase()} definition?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirmed}
        onClose={() => {
          if (!isDeleting) setItemToDelete(null)
        }}
      />
    </div>
  )
}
