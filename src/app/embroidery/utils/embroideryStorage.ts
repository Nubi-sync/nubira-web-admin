'use client'

import {
  EmbroideryDesign,
  EmbroideryMachineRun,
  StitchBillingLedger,
  ThreadConeItem,
  EmbroideryQcAudit,
} from '../types/embroidery'
import {
  INITIAL_EMBROIDERY_DESIGNS,
  INITIAL_MACHINE_RUNS,
  INITIAL_BILLING_LEDGERS,
  INITIAL_THREAD_CONES,
  INITIAL_QC_AUDITS,
} from '../data/initialData'

export const EMBROIDERY_UPDATE_EVENT = 'zigza:embroidery_updated'

const KEYS = {
  DESIGNS: 'zigza_embroidery_designs_v1',
  RUNS: 'zigza_embroidery_runs_v1',
  BILLING: 'zigza_embroidery_billing_v1',
  CONES: 'zigza_embroidery_cones_v1',
  QC: 'zigza_embroidery_qc_v1',
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EMBROIDERY_UPDATE_EVENT))
  }
}

// 1. Embroidery Designs (DST Files)
export function getEmbroideryDesigns(): EmbroideryDesign[] {
  if (typeof window === 'undefined') return INITIAL_EMBROIDERY_DESIGNS
  try {
    const raw = localStorage.getItem(KEYS.DESIGNS)
    if (!raw) {
      localStorage.setItem(KEYS.DESIGNS, JSON.stringify(INITIAL_EMBROIDERY_DESIGNS))
      return INITIAL_EMBROIDERY_DESIGNS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_EMBROIDERY_DESIGNS
  } catch (e) {
    console.error('Failed to parse embroidery designs from storage', e)
    return INITIAL_EMBROIDERY_DESIGNS
  }
}

export function saveEmbroideryDesign(design: EmbroideryDesign): void {
  if (typeof window === 'undefined') return
  const current = getEmbroideryDesigns()
  const idx = current.findIndex(d => d.id === design.id)
  let updated: EmbroideryDesign[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = design
  } else {
    updated = [design, ...current]
  }
  localStorage.setItem(KEYS.DESIGNS, JSON.stringify(updated))
  emitUpdate()
}

// 2. Machine Production Runs
export function getMachineRuns(): EmbroideryMachineRun[] {
  if (typeof window === 'undefined') return INITIAL_MACHINE_RUNS
  try {
    const raw = localStorage.getItem(KEYS.RUNS)
    if (!raw) {
      localStorage.setItem(KEYS.RUNS, JSON.stringify(INITIAL_MACHINE_RUNS))
      return INITIAL_MACHINE_RUNS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_MACHINE_RUNS
  } catch (e) {
    console.error('Failed to parse machine runs from storage', e)
    return INITIAL_MACHINE_RUNS
  }
}

export function saveMachineRun(run: EmbroideryMachineRun): void {
  if (typeof window === 'undefined') return
  const current = getMachineRuns()
  const idx = current.findIndex(r => r.id === run.id)
  let updated: EmbroideryMachineRun[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = run
  } else {
    updated = [run, ...current]
  }
  localStorage.setItem(KEYS.RUNS, JSON.stringify(updated))
  emitUpdate()
}

// 3. Stitch Billing Ledgers
export function getBillingLedgers(): StitchBillingLedger[] {
  if (typeof window === 'undefined') return INITIAL_BILLING_LEDGERS
  try {
    const raw = localStorage.getItem(KEYS.BILLING)
    if (!raw) {
      localStorage.setItem(KEYS.BILLING, JSON.stringify(INITIAL_BILLING_LEDGERS))
      return INITIAL_BILLING_LEDGERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_BILLING_LEDGERS
  } catch (e) {
    console.error('Failed to parse billing ledgers from storage', e)
    return INITIAL_BILLING_LEDGERS
  }
}

export function saveBillingLedger(ledger: StitchBillingLedger): void {
  if (typeof window === 'undefined') return
  const current = getBillingLedgers()
  const idx = current.findIndex(b => b.id === ledger.id)
  let updated: StitchBillingLedger[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = ledger
  } else {
    updated = [ledger, ...current]
  }
  localStorage.setItem(KEYS.BILLING, JSON.stringify(updated))
  emitUpdate()
}

// 4. Thread Store & Cones
export function getThreadCones(): ThreadConeItem[] {
  if (typeof window === 'undefined') return INITIAL_THREAD_CONES
  try {
    const raw = localStorage.getItem(KEYS.CONES)
    if (!raw) {
      localStorage.setItem(KEYS.CONES, JSON.stringify(INITIAL_THREAD_CONES))
      return INITIAL_THREAD_CONES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_THREAD_CONES
  } catch (e) {
    console.error('Failed to parse thread cones from storage', e)
    return INITIAL_THREAD_CONES
  }
}

export function saveThreadCone(cone: ThreadConeItem): void {
  if (typeof window === 'undefined') return
  const current = getThreadCones()
  const idx = current.findIndex(c => c.id === cone.id)
  let updated: ThreadConeItem[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = cone
  } else {
    updated = [cone, ...current]
  }
  localStorage.setItem(KEYS.CONES, JSON.stringify(updated))
  emitUpdate()
}

// 5. Embroidery QC Audits
export function getQcAudits(): EmbroideryQcAudit[] {
  if (typeof window === 'undefined') return INITIAL_QC_AUDITS
  try {
    const raw = localStorage.getItem(KEYS.QC)
    if (!raw) {
      localStorage.setItem(KEYS.QC, JSON.stringify(INITIAL_QC_AUDITS))
      return INITIAL_QC_AUDITS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_QC_AUDITS
  } catch (e) {
    console.error('Failed to parse QC audits from storage', e)
    return INITIAL_QC_AUDITS
  }
}

export function saveQcAudit(audit: EmbroideryQcAudit): void {
  if (typeof window === 'undefined') return
  const current = getQcAudits()
  const idx = current.findIndex(a => a.id === audit.id)
  let updated: EmbroideryQcAudit[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = audit
  } else {
    updated = [audit, ...current]
  }
  localStorage.setItem(KEYS.QC, JSON.stringify(updated))
  emitUpdate()
}
