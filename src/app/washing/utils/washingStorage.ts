'use client'

import {
  WashBatch,
  WashRecipe,
  WasherMachine,
  WaterAuditLog,
  ShrinkageQcRecord,
  FinishingHandover,
} from '../types/washing'
import {
  INITIAL_WASH_BATCHES,
  INITIAL_WASH_RECIPES,
  INITIAL_MACHINES,
  INITIAL_WATER_AUDITS,
  INITIAL_SHRINKAGE_QC,
  INITIAL_HANDOVERS,
} from '../data/initialData'

export const WASHING_UPDATE_EVENT = 'zigza:washing_updated'

const KEYS = {
  BATCHES: 'zigza_washing_batches_v1',
  RECIPES: 'zigza_washing_recipes_v1',
  MACHINES: 'zigza_washing_machines_v1',
  WATER_AUDITS: 'zigza_washing_water_audits_v1',
  SHRINKAGE_QC: 'zigza_washing_shrinkage_qc_v1',
  HANDOVERS: 'zigza_washing_handovers_v1',
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(WASHING_UPDATE_EVENT))
  }
}

// 1. Wash Batches
export function getWashBatches(): WashBatch[] {
  if (typeof window === 'undefined') return INITIAL_WASH_BATCHES
  try {
    const raw = localStorage.getItem(KEYS.BATCHES)
    if (!raw) {
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_WASH_BATCHES))
      return INITIAL_WASH_BATCHES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_WASH_BATCHES
  } catch (e) {
    console.error('Failed to parse wash batches from storage', e)
    return INITIAL_WASH_BATCHES
  }
}

export function saveWashBatch(batch: WashBatch): void {
  if (typeof window === 'undefined') return
  const current = getWashBatches()
  const idx = current.findIndex(b => b.id === batch.id)
  let updated: WashBatch[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = batch
  } else {
    updated = [batch, ...current]
  }
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(updated))
  emitUpdate()
}

export function updateBatchStatus(
  id: string,
  status: WashBatch['status'],
  additionalUpdates?: Partial<WashBatch>
): void {
  if (typeof window === 'undefined') return
  const current = getWashBatches()
  const updated = current.map(b => {
    if (b.id === id) {
      return {
        ...b,
        status,
        ...additionalUpdates,
      }
    }
    return b
  })
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(updated))
  emitUpdate()
}

// 2. Wash Recipes
export function getWashRecipes(): WashRecipe[] {
  if (typeof window === 'undefined') return INITIAL_WASH_RECIPES
  try {
    const raw = localStorage.getItem(KEYS.RECIPES)
    if (!raw) {
      localStorage.setItem(KEYS.RECIPES, JSON.stringify(INITIAL_WASH_RECIPES))
      return INITIAL_WASH_RECIPES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_WASH_RECIPES
  } catch (e) {
    console.error('Failed to parse wash recipes from storage', e)
    return INITIAL_WASH_RECIPES
  }
}

export function saveWashRecipe(recipe: WashRecipe): void {
  if (typeof window === 'undefined') return
  const current = getWashRecipes()
  const idx = current.findIndex(r => r.id === recipe.id)
  let updated: WashRecipe[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = recipe
  } else {
    updated = [recipe, ...current]
  }
  localStorage.setItem(KEYS.RECIPES, JSON.stringify(updated))
  emitUpdate()
}

// 3. Machines Matrix
export function getWasherMachines(): WasherMachine[] {
  if (typeof window === 'undefined') return INITIAL_MACHINES
  try {
    const raw = localStorage.getItem(KEYS.MACHINES)
    if (!raw) {
      localStorage.setItem(KEYS.MACHINES, JSON.stringify(INITIAL_MACHINES))
      return INITIAL_MACHINES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_MACHINES
  } catch (e) {
    console.error('Failed to parse washer machines from storage', e)
    return INITIAL_MACHINES
  }
}

export function saveWasherMachine(machine: WasherMachine): void {
  if (typeof window === 'undefined') return
  const current = getWasherMachines()
  const idx = current.findIndex(m => m.id === machine.id)
  let updated: WasherMachine[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = machine
  } else {
    updated = [...current, machine]
  }
  localStorage.setItem(KEYS.MACHINES, JSON.stringify(updated))
  emitUpdate()
}

// 4. Water Audit Logs
export function getWaterAuditLogs(): WaterAuditLog[] {
  if (typeof window === 'undefined') return INITIAL_WATER_AUDITS
  try {
    const raw = localStorage.getItem(KEYS.WATER_AUDITS)
    if (!raw) {
      localStorage.setItem(KEYS.WATER_AUDITS, JSON.stringify(INITIAL_WATER_AUDITS))
      return INITIAL_WATER_AUDITS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_WATER_AUDITS
  } catch (e) {
    console.error('Failed to parse water audit logs from storage', e)
    return INITIAL_WATER_AUDITS
  }
}

export function saveWaterAuditLog(log: WaterAuditLog): void {
  if (typeof window === 'undefined') return
  const current = getWaterAuditLogs()
  const idx = current.findIndex(l => l.id === log.id)
  let updated: WaterAuditLog[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = log
  } else {
    updated = [log, ...current]
  }
  localStorage.setItem(KEYS.WATER_AUDITS, JSON.stringify(updated))
  emitUpdate()
}

// 5. Shrinkage QC Records
export function getShrinkageQcRecords(): ShrinkageQcRecord[] {
  if (typeof window === 'undefined') return INITIAL_SHRINKAGE_QC
  try {
    const raw = localStorage.getItem(KEYS.SHRINKAGE_QC)
    if (!raw) {
      localStorage.setItem(KEYS.SHRINKAGE_QC, JSON.stringify(INITIAL_SHRINKAGE_QC))
      return INITIAL_SHRINKAGE_QC
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SHRINKAGE_QC
  } catch (e) {
    console.error('Failed to parse shrinkage QC records from storage', e)
    return INITIAL_SHRINKAGE_QC
  }
}

export function saveShrinkageQcRecord(record: ShrinkageQcRecord): void {
  if (typeof window === 'undefined') return
  const current = getShrinkageQcRecords()
  const idx = current.findIndex(r => r.id === record.id)
  let updated: ShrinkageQcRecord[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = record
  } else {
    updated = [record, ...current]
  }
  localStorage.setItem(KEYS.SHRINKAGE_QC, JSON.stringify(updated))

  // Also update corresponding batch if found
  if (record.batchId) {
    const batches = getWashBatches()
    const target = batches.find(b => b.id === record.batchId || b.batchNumber === record.batchNumber)
    if (target) {
      const batchStatus = record.qcStatus === 'CRITICAL_FAIL' ? 'FAILED' : 'PASSED'
      updateBatchStatus(target.id, batchStatus, {
        measuredShrinkageLengthPct: record.avgLengthShrinkPct,
        measuredShrinkageWidthPct: record.avgWidthShrinkPct,
        colorfastnessRating: record.colorfastnessRating,
      })
    }
  }

  emitUpdate()
}

// 6. Finishing Handovers
export function getFinishingHandovers(): FinishingHandover[] {
  if (typeof window === 'undefined') return INITIAL_HANDOVERS
  try {
    const raw = localStorage.getItem(KEYS.HANDOVERS)
    if (!raw) {
      localStorage.setItem(KEYS.HANDOVERS, JSON.stringify(INITIAL_HANDOVERS))
      return INITIAL_HANDOVERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_HANDOVERS
  } catch (e) {
    console.error('Failed to parse finishing handovers from storage', e)
    return INITIAL_HANDOVERS
  }
}

export function saveFinishingHandover(handover: FinishingHandover): void {
  if (typeof window === 'undefined') return
  const current = getFinishingHandovers()
  const idx = current.findIndex(h => h.id === handover.id)
  let updated: FinishingHandover[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = handover
  } else {
    updated = [handover, ...current]
  }
  localStorage.setItem(KEYS.HANDOVERS, JSON.stringify(updated))
  emitUpdate()
}
