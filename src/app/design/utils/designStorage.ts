import { TechPack, SampleApproval, GradingScheme, MaterialItem } from '../types/design'
import { INITIAL_TECH_PACKS, INITIAL_SAMPLE_APPROVALS, INITIAL_GRADING_SCHEMES, INITIAL_MATERIALS } from '../data/initialData'

const TECH_PACKS_KEY = 'zigza_design_tech_packs'
const SAMPLE_APPROVALS_KEY = 'zigza_design_sample_approvals'
const GRADING_SCHEMES_KEY = 'zigza_design_grading_schemes'
const MATERIALS_KEY = 'zigza_design_materials'

export function getStoredTechPacks(): TechPack[] {
  if (typeof window === 'undefined') return INITIAL_TECH_PACKS
  try {
    const raw = localStorage.getItem(TECH_PACKS_KEY)
    if (!raw) {
      localStorage.setItem(TECH_PACKS_KEY, JSON.stringify(INITIAL_TECH_PACKS))
      return INITIAL_TECH_PACKS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_TECH_PACKS
  }
}

export function saveStoredTechPack(pack: TechPack): TechPack[] {
  if (typeof window === 'undefined') return [pack]
  const list = getStoredTechPacks()
  const idx = list.findIndex(item => item.id === pack.id || item.style_number === pack.style_number)
  let updated: TechPack[]
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = { ...pack, updated_at: new Date().toISOString() }
  } else {
    updated = [pack, ...list]
  }
  localStorage.setItem(TECH_PACKS_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('zigza_tech_packs_updated', { detail: updated }))
  return updated
}

export function getStoredSampleApprovals(): SampleApproval[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_APPROVALS
  try {
    const raw = localStorage.getItem(SAMPLE_APPROVALS_KEY)
    if (!raw) {
      localStorage.setItem(SAMPLE_APPROVALS_KEY, JSON.stringify(INITIAL_SAMPLE_APPROVALS))
      return INITIAL_SAMPLE_APPROVALS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SAMPLE_APPROVALS
  }
}

export function saveStoredSampleApproval(approval: SampleApproval): SampleApproval[] {
  if (typeof window === 'undefined') return [approval]
  const list = getStoredSampleApprovals()
  const idx = list.findIndex(item => item.id === approval.id)
  let updated: SampleApproval[]
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = approval
  } else {
    updated = [approval, ...list]
  }
  localStorage.setItem(SAMPLE_APPROVALS_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('zigza_sample_approvals_updated', { detail: updated }))
  return updated
}

export function getStoredGradingSchemes(): GradingScheme[] {
  if (typeof window === 'undefined') return INITIAL_GRADING_SCHEMES
  try {
    const raw = localStorage.getItem(GRADING_SCHEMES_KEY)
    if (!raw) {
      localStorage.setItem(GRADING_SCHEMES_KEY, JSON.stringify(INITIAL_GRADING_SCHEMES))
      return INITIAL_GRADING_SCHEMES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_GRADING_SCHEMES
  }
}

export function saveStoredGradingScheme(scheme: GradingScheme): GradingScheme[] {
  if (typeof window === 'undefined') return [scheme]
  const list = getStoredGradingSchemes()
  const idx = list.findIndex(item => item.id === scheme.id)
  let updated: GradingScheme[]
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = scheme
  } else {
    updated = [...list, scheme]
  }
  localStorage.setItem(GRADING_SCHEMES_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('zigza_grading_schemes_updated', { detail: updated }))
  return updated
}

export function getStoredMaterials(): MaterialItem[] {
  if (typeof window === 'undefined') return INITIAL_MATERIALS
  try {
    const raw = localStorage.getItem(MATERIALS_KEY)
    if (!raw) {
      localStorage.setItem(MATERIALS_KEY, JSON.stringify(INITIAL_MATERIALS))
      return INITIAL_MATERIALS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_MATERIALS
  }
}

export function saveStoredMaterial(material: MaterialItem): MaterialItem[] {
  if (typeof window === 'undefined') return [material]
  const list = getStoredMaterials()
  const idx = list.findIndex(item => item.id === material.id || item.material_code === material.material_code)
  let updated: MaterialItem[]
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = material
  } else {
    updated = [material, ...list]
  }
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('zigza_materials_updated', { detail: updated }))
  return updated
}
