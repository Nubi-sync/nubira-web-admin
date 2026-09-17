'use client'

import {
  LaySheet,
  CutBundle,
  MarkerEfficiency,
  PanelQCAudit,
  PanelQcAudit,
  EndBitRemnant,
  CuttingTable,
  FabricRollStaging,
  EndLossRemnant
} from '../types/cutting'
import {
  INITIAL_CUTTING_TABLES,
  INITIAL_LAY_SHEETS,
  INITIAL_CUT_BUNDLES,
  INITIAL_MARKERS,
  INITIAL_PANEL_QC_AUDITS,
  INITIAL_END_BITS,
  INITIAL_FABRIC_ROLLS,
  INITIAL_END_LOSS_REMNANTS,
  INITIAL_PANEL_AUDITS
} from '../data/mockData'

const TABLES_KEY = 'zigza_cutting_tables_v3'
const LAYS_KEY = 'zigza_cutting_lays_v3'
const BUNDLES_KEY = 'zigza_cutting_bundles_v3'
const MARKERS_KEY = 'zigza_cutting_markers_v3'
const QC_KEY = 'zigza_cutting_qc_v3'
const ENDBITS_KEY = 'zigza_cutting_endbits_v3'
const ROLLS_KEY = 'zigza_cutting_rolls_v3'
const ENDLOSS_KEY = 'zigza_cutting_endloss_v3'
const AUDITS_KEY = 'zigza_cutting_audits_v3'

export const CUTTING_UPDATE_EVENT = 'zigza:cutting_updated'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CUTTING_UPDATE_EVENT))
  }
}

// 1. Cutting Tables
export function getCuttingTables(): CuttingTable[] {
  if (typeof window === 'undefined') return INITIAL_CUTTING_TABLES
  try {
    const stored = localStorage.getItem(TABLES_KEY)
    if (!stored) {
      localStorage.setItem(TABLES_KEY, JSON.stringify(INITIAL_CUTTING_TABLES))
      return INITIAL_CUTTING_TABLES
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_CUTTING_TABLES
  } catch {
    return INITIAL_CUTTING_TABLES
  }
}

export function saveCuttingTables(tables: CuttingTable[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables))
  emitUpdate()
}

// 2. Lay Sheets
export function getLaySheets(): LaySheet[] {
  if (typeof window === 'undefined') return INITIAL_LAY_SHEETS
  try {
    const stored = localStorage.getItem(LAYS_KEY)
    if (!stored) {
      localStorage.setItem(LAYS_KEY, JSON.stringify(INITIAL_LAY_SHEETS))
      return INITIAL_LAY_SHEETS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_LAY_SHEETS
  } catch {
    return INITIAL_LAY_SHEETS
  }
}

export function saveLaySheet(lay: LaySheet): LaySheet[] {
  const current = getLaySheets()
  const index = current.findIndex(item => item.id === lay.id)
  let updated: LaySheet[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = lay
  } else {
    updated = [lay, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAYS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 3. Cut Bundles
export function getCutBundles(): CutBundle[] {
  if (typeof window === 'undefined') return INITIAL_CUT_BUNDLES
  try {
    const stored = localStorage.getItem(BUNDLES_KEY)
    if (!stored) {
      localStorage.setItem(BUNDLES_KEY, JSON.stringify(INITIAL_CUT_BUNDLES))
      return INITIAL_CUT_BUNDLES
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_CUT_BUNDLES
  } catch {
    return INITIAL_CUT_BUNDLES
  }
}

export function saveCutBundle(bundle: CutBundle): CutBundle[] {
  const current = getCutBundles()
  const index = current.findIndex(item => item.id === bundle.id)
  let updated: CutBundle[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = bundle
  } else {
    updated = [bundle, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function bulkAddCutBundles(newBundles: CutBundle[]): CutBundle[] {
  const current = getCutBundles()
  const updated = [...newBundles, ...current]
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 4. Markers
export function getMarkers(): MarkerEfficiency[] {
  if (typeof window === 'undefined') return INITIAL_MARKERS
  try {
    const stored = localStorage.getItem(MARKERS_KEY)
    if (!stored) {
      localStorage.setItem(MARKERS_KEY, JSON.stringify(INITIAL_MARKERS))
      return INITIAL_MARKERS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_MARKERS
  } catch {
    return INITIAL_MARKERS
  }
}

export function saveMarker(marker: MarkerEfficiency): MarkerEfficiency[] {
  const current = getMarkers()
  const index = current.findIndex(item => item.id === marker.id)
  let updated: MarkerEfficiency[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = marker
  } else {
    updated = [marker, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(MARKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 5. Panel QC Audits (Legacy PanelQCAudit)
export function getPanelQcAudits(): PanelQCAudit[] {
  if (typeof window === 'undefined') return INITIAL_PANEL_QC_AUDITS
  try {
    const stored = localStorage.getItem(QC_KEY)
    if (!stored) {
      localStorage.setItem(QC_KEY, JSON.stringify(INITIAL_PANEL_QC_AUDITS))
      return INITIAL_PANEL_QC_AUDITS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_PANEL_QC_AUDITS
  } catch {
    return INITIAL_PANEL_QC_AUDITS
  }
}

export function savePanelQcAudit(audit: PanelQCAudit): PanelQCAudit[] {
  const current = getPanelQcAudits()
  const index = current.findIndex(item => item.id === audit.id)
  let updated: PanelQCAudit[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = audit
  } else {
    updated = [audit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(QC_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 6. End Bits Remnants (Legacy EndBitRemnant)
export function getEndBits(): EndBitRemnant[] {
  if (typeof window === 'undefined') return INITIAL_END_BITS
  try {
    const stored = localStorage.getItem(ENDBITS_KEY)
    if (!stored) {
      localStorage.setItem(ENDBITS_KEY, JSON.stringify(INITIAL_END_BITS))
      return INITIAL_END_BITS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_END_BITS
  } catch {
    return INITIAL_END_BITS
  }
}

export function saveEndBit(endBit: EndBitRemnant): EndBitRemnant[] {
  const current = getEndBits()
  const index = current.findIndex(item => item.id === endBit.id)
  let updated: EndBitRemnant[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = endBit
  } else {
    updated = [endBit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ENDBITS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 7. Fabric Roll Staging & Relaxation
export function getFabricRolls(): FabricRollStaging[] {
  if (typeof window === 'undefined') return INITIAL_FABRIC_ROLLS
  try {
    const stored = localStorage.getItem(ROLLS_KEY)
    if (!stored) {
      localStorage.setItem(ROLLS_KEY, JSON.stringify(INITIAL_FABRIC_ROLLS))
      return INITIAL_FABRIC_ROLLS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_FABRIC_ROLLS
  } catch {
    return INITIAL_FABRIC_ROLLS
  }
}

export function saveFabricRoll(roll: FabricRollStaging): FabricRollStaging[] {
  const current = getFabricRolls()
  const index = current.findIndex(item => item.id === roll.id)
  let updated: FabricRollStaging[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = roll
  } else {
    updated = [roll, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROLLS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 8. End-Loss Remnants
export function getEndLossRemnants(): EndLossRemnant[] {
  if (typeof window === 'undefined') return INITIAL_END_LOSS_REMNANTS
  try {
    const stored = localStorage.getItem(ENDLOSS_KEY)
    if (!stored) {
      localStorage.setItem(ENDLOSS_KEY, JSON.stringify(INITIAL_END_LOSS_REMNANTS))
      return INITIAL_END_LOSS_REMNANTS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_END_LOSS_REMNANTS
  } catch {
    return INITIAL_END_LOSS_REMNANTS
  }
}

export function saveEndLossRemnant(remnant: EndLossRemnant): EndLossRemnant[] {
  const current = getEndLossRemnants()
  const index = current.findIndex(item => item.id === remnant.id)
  let updated: EndLossRemnant[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = remnant
  } else {
    updated = [remnant, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ENDLOSS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// 9. Panel QC Audits (Interactive PanelQcAudit)
export function getPanelAudits(): PanelQcAudit[] {
  if (typeof window === 'undefined') return INITIAL_PANEL_AUDITS
  try {
    const stored = localStorage.getItem(AUDITS_KEY)
    if (!stored) {
      localStorage.setItem(AUDITS_KEY, JSON.stringify(INITIAL_PANEL_AUDITS))
      return INITIAL_PANEL_AUDITS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_PANEL_AUDITS
  } catch {
    return INITIAL_PANEL_AUDITS
  }
}

export function savePanelAudit(audit: PanelQcAudit): PanelQcAudit[] {
  const current = getPanelAudits()
  const index = current.findIndex(item => item.id === audit.id)
  let updated: PanelQcAudit[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = audit
  } else {
    updated = [audit, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUDITS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// =============================================================================
// 10. CUTTING WORKERS (Floor Operators & Shift Leads)
// =============================================================================
const WORKERS_KEY = 'zigza_cutting_workers_v2'

export const INITIAL_CUTTING_WORKERS: any[] = []

export function getCuttingWorkers(): any[] {
  if (typeof window === 'undefined') return INITIAL_CUTTING_WORKERS
  try {
    const stored = localStorage.getItem(WORKERS_KEY)
    if (!stored) {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_CUTTING_WORKERS))
      return INITIAL_CUTTING_WORKERS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_CUTTING_WORKERS
  } catch {
    return INITIAL_CUTTING_WORKERS
  }
}

export function saveCuttingWorker(worker: any): any[] {
  const current = getCuttingWorkers()
  const index = current.findIndex(w => w.id === worker.id || w.phone_number === worker.phone_number)
  let updated: any[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = { ...current[index], ...worker, updated_at: new Date().toISOString() }
  } else {
    updated = [{ ...worker, created_at: worker.created_at || new Date().toISOString() }, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteCuttingWorker(id: string): any[] {
  const current = getCuttingWorkers()
  const updated = current.filter(w => w.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// =============================================================================
// 11. CUTTING TASK ALLOCATIONS (Spreadsheet Matrix)
// =============================================================================
const ALLOCATIONS_KEY = 'zigza_cutting_task_allocations_v1'

export const INITIAL_TASK_ALLOCATIONS: any[] = []

export function getCuttingTaskAllocations(): any[] {
  if (typeof window === 'undefined') return INITIAL_TASK_ALLOCATIONS
  try {
    const stored = localStorage.getItem(ALLOCATIONS_KEY)
    if (!stored) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(INITIAL_TASK_ALLOCATIONS))
      return INITIAL_TASK_ALLOCATIONS
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : INITIAL_TASK_ALLOCATIONS
  } catch {
    return INITIAL_TASK_ALLOCATIONS
  }
}

export function saveCuttingTaskAllocation(task: any): any[] {
  const current = getCuttingTaskAllocations()
  const index = current.findIndex(t => t.id === task.id || t.task_ref === task.task_ref)
  let updated: any[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = { ...current[index], ...task, updated_at: new Date().toISOString() }
  } else {
    updated = [{ ...task, created_at: task.created_at || new Date().toISOString() }, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function updateCuttingTaskStatus(id: string, status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'): any[] {
  const current = getCuttingTaskAllocations()
  const updated = current.map(t => {
    if (t.id === id) {
      return {
        ...t,
        status,
        completed_pieces: status === 'COMPLETED' ? t.pieces_to_cut : (status === 'IN_PROGRESS' ? Math.floor(t.pieces_to_cut * 0.5) : 0),
        updated_at: new Date().toISOString()
      }
    }
    return t
  })
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteCuttingTaskAllocation(id: string): any[] {
  const current = getCuttingTaskAllocations()
  const updated = current.filter(t => t.id !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}
