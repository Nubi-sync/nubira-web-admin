'use client'

import {
  ReadyGoodsCarton,
  AqlAudit,
  HangtagVerification,
  ScaleWeightLog,
  GodownHandoverPallet,
  ReadyGoodsMetrics,
  CartonStatus,
  ReadyGoodsWorker,
  FinishingInspectionTask,
  InspectionChecklist,
  InspectionTaskStatus,
  PackingAssignment,
  PackingAssignmentStatus
} from '../types/readyGoods'
import {
  INITIAL_CARTONS,
  INITIAL_AQL_AUDITS,
  INITIAL_HANGTAG_SCANS,
  INITIAL_SCALE_LOGS,
  INITIAL_PALLETS,
  INITIAL_METRICS,
  INITIAL_READY_GOODS_WORKERS,
  INITIAL_INSPECTION_TASKS,
  INITIAL_PACKING_ASSIGNMENTS
} from '../data/initialData'

export const READY_GOODS_UPDATE_EVENT = 'zigza:ready_goods_updated'

const KEYS = {
  CARTONS: 'zigza_ready_goods_cartons_v2',
  AQL_AUDITS: 'zigza_ready_goods_aql_audits_v2',
  HANGTAG_SCANS: 'zigza_ready_goods_hangtag_scans_v2',
  SCALE_LOGS: 'zigza_ready_goods_scale_logs_v2',
  PALLETS: 'zigza_ready_goods_pallets_v2',
  METRICS: 'zigza_ready_goods_metrics_v2',
  WORKERS: 'zigza_ready_goods_workers_v1',
  INSPECTION_TASKS: 'zigza_ready_goods_inspection_tasks_v1',
  PACKING_ASSIGNMENTS: 'zigza_ready_goods_packing_assignments_v1'
}

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(READY_GOODS_UPDATE_EVENT))
  }
}

// ISO 2859-1 (AQL 2.5 Normal Level II Sampling Table)
export function calculateIso2859SampleSize(lotSize: number): {
  sampleSize: number
  maxMajorDefects: number // AQL 2.5
  maxMinorDefects: number // AQL 4.0
  criticalAllowed: number // Strict 0
} {
  let sampleSize = 200
  let maxMajor = 10
  let maxMinor = 14

  if (lotSize <= 8) {
    sampleSize = 2
    maxMajor = 0
    maxMinor = 0
  } else if (lotSize <= 15) {
    sampleSize = 3
    maxMajor = 0
    maxMinor = 0
  } else if (lotSize <= 25) {
    sampleSize = 5
    maxMajor = 0
    maxMinor = 1
  } else if (lotSize <= 50) {
    sampleSize = 8
    maxMajor = 0
    maxMinor = 1
  } else if (lotSize <= 90) {
    sampleSize = 13
    maxMajor = 1
    maxMinor = 1
  } else if (lotSize <= 150) {
    sampleSize = 20
    maxMajor = 1
    maxMinor = 2
  } else if (lotSize <= 280) {
    sampleSize = 32
    maxMajor = 2
    maxMinor = 3
  } else if (lotSize <= 500) {
    sampleSize = 50
    maxMajor = 3
    maxMinor = 5
  } else if (lotSize <= 1200) {
    sampleSize = 80
    maxMajor = 5
    maxMinor = 7
  } else if (lotSize <= 3200) {
    sampleSize = 125
    maxMajor = 7
    maxMinor = 10
  } else if (lotSize <= 10000) {
    sampleSize = 200
    maxMajor = 10
    maxMinor = 14
  } else if (lotSize <= 35000) {
    sampleSize = 315
    maxMajor = 14
    maxMinor = 21
  } else {
    sampleSize = 500
    maxMajor = 21
    maxMinor = 21
  }

  return {
    sampleSize,
    maxMajorDefects: maxMajor,
    maxMinorDefects: maxMinor,
    criticalAllowed: 0
  }
}

// 1. Ready Goods Cartons
export function getReadyGoodsCartons(): ReadyGoodsCarton[] {
  if (typeof window === 'undefined') return INITIAL_CARTONS
  try {
    const raw = localStorage.getItem(KEYS.CARTONS)
    if (!raw) {
      localStorage.setItem(KEYS.CARTONS, JSON.stringify(INITIAL_CARTONS))
      return INITIAL_CARTONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_CARTONS
  } catch (e) {
    console.error('Failed to parse cartons from storage', e)
    return INITIAL_CARTONS
  }
}

export function saveReadyGoodsCarton(carton: ReadyGoodsCarton): void {
  if (typeof window === 'undefined') return
  const current = getReadyGoodsCartons()
  const idx = current.findIndex(c => c.id === carton.id || c.cartonNumber === carton.cartonNumber)
  let updated: ReadyGoodsCarton[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = carton
  } else {
    updated = [carton, ...current]
  }
  localStorage.setItem(KEYS.CARTONS, JSON.stringify(updated))
  emitUpdate()
}

export function updateCartonStatus(cartonId: string, newStatus: CartonStatus): void {
  if (typeof window === 'undefined') return
  const current = getReadyGoodsCartons()
  const idx = current.findIndex(c => c.id === cartonId || c.cartonNumber === cartonId)
  if (idx >= 0) {
    const updated = [...current]
    updated[idx] = {
      ...updated[idx],
      status: newStatus,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    }
    localStorage.setItem(KEYS.CARTONS, JSON.stringify(updated))
    emitUpdate()
  }
}

// 2. AQL Audits (Triggers Carton Status Transition)
export function getAqlAudits(): AqlAudit[] {
  if (typeof window === 'undefined') return INITIAL_AQL_AUDITS
  try {
    const raw = localStorage.getItem(KEYS.AQL_AUDITS)
    if (!raw) {
      localStorage.setItem(KEYS.AQL_AUDITS, JSON.stringify(INITIAL_AQL_AUDITS))
      return INITIAL_AQL_AUDITS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_AQL_AUDITS
  } catch (e) {
    console.error('Failed to parse AQL audits from storage', e)
    return INITIAL_AQL_AUDITS
  }
}

export function saveAqlAudit(audit: AqlAudit): void {
  if (typeof window === 'undefined') return
  const current = getAqlAudits()
  const idx = current.findIndex(a => a.id === audit.id || a.auditNumber === audit.auditNumber)
  let updated: AqlAudit[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = audit
  } else {
    updated = [audit, ...current]
  }
  localStorage.setItem(KEYS.AQL_AUDITS, JSON.stringify(updated))

  // Automated Carton Status Transition per ISO 2859 standard
  if (audit.cartonId) {
    if (audit.auditDecision === 'PASS') {
      updateCartonStatus(audit.cartonId, 'AQL_AUDIT_PASSED')
    } else if (audit.auditDecision === 'REJECT_QUARANTINE') {
      updateCartonStatus(audit.cartonId, 'QUARANTINED_AQL_FAILED')
    } else if (audit.auditDecision === 'RE_AUDIT') {
      updateCartonStatus(audit.cartonId, 'PACKED')
    }
  }

  emitUpdate()
}

// 3. Hangtag Scans & Polybag Verification
export function getHangtagScans(): HangtagVerification[] {
  if (typeof window === 'undefined') return INITIAL_HANGTAG_SCANS
  try {
    const raw = localStorage.getItem(KEYS.HANGTAG_SCANS)
    if (!raw) {
      localStorage.setItem(KEYS.HANGTAG_SCANS, JSON.stringify(INITIAL_HANGTAG_SCANS))
      return INITIAL_HANGTAG_SCANS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_HANGTAG_SCANS
  } catch (e) {
    console.error('Failed to parse hangtag scans from storage', e)
    return INITIAL_HANGTAG_SCANS
  }
}

export function saveHangtagScan(scan: HangtagVerification): void {
  if (typeof window === 'undefined') return
  const current = getHangtagScans()
  const updated = [scan, ...current]
  localStorage.setItem(KEYS.HANGTAG_SCANS, JSON.stringify(updated))
  emitUpdate()
}

// 4. Scale Weight Logs
export function getScaleLogs(): ScaleWeightLog[] {
  if (typeof window === 'undefined') return INITIAL_SCALE_LOGS
  try {
    const raw = localStorage.getItem(KEYS.SCALE_LOGS)
    if (!raw) {
      localStorage.setItem(KEYS.SCALE_LOGS, JSON.stringify(INITIAL_SCALE_LOGS))
      return INITIAL_SCALE_LOGS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_SCALE_LOGS
  } catch (e) {
    console.error('Failed to parse scale logs from storage', e)
    return INITIAL_SCALE_LOGS
  }
}

export function saveScaleLog(log: ScaleWeightLog): void {
  if (typeof window === 'undefined') return
  const current = getScaleLogs()
  const updated = [log, ...current]
  localStorage.setItem(KEYS.SCALE_LOGS, JSON.stringify(updated))
  emitUpdate()
}

// 5. Pallet Handovers
export function getHandoverPallets(): GodownHandoverPallet[] {
  if (typeof window === 'undefined') return INITIAL_PALLETS
  try {
    const raw = localStorage.getItem(KEYS.PALLETS)
    if (!raw) {
      localStorage.setItem(KEYS.PALLETS, JSON.stringify(INITIAL_PALLETS))
      return INITIAL_PALLETS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_PALLETS
  } catch (e) {
    console.error('Failed to parse pallets from storage', e)
    return INITIAL_PALLETS
  }
}

export function saveHandoverPallet(pallet: GodownHandoverPallet): void {
  if (typeof window === 'undefined') return
  const current = getHandoverPallets()
  const idx = current.findIndex(p => p.id === pallet.id || p.palletCode === pallet.palletCode)
  let updated: GodownHandoverPallet[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = pallet
  } else {
    updated = [pallet, ...current]
  }
  localStorage.setItem(KEYS.PALLETS, JSON.stringify(updated))

  // Mark all member cartons as SHIPPED
  if (Array.isArray(pallet.cartonIds)) {
    pallet.cartonIds.forEach(id => {
      updateCartonStatus(id, 'SHIPPED')
    })
  }

  emitUpdate()
}

// 6. Metrics
export function getReadyGoodsMetrics(): ReadyGoodsMetrics {
  if (typeof window === 'undefined') return INITIAL_METRICS
  try {
    const raw = localStorage.getItem(KEYS.METRICS)
    if (!raw) {
      localStorage.setItem(KEYS.METRICS, JSON.stringify(INITIAL_METRICS))
      return INITIAL_METRICS
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : INITIAL_METRICS
  } catch (e) {
    console.error('Failed to parse metrics from storage', e)
    return INITIAL_METRICS
  }
}

// 7. Floor Workers (Checkers, Packers, Both)
export function getReadyGoodsWorkers(companyName?: string): ReadyGoodsWorker[] {
  if (typeof window === 'undefined') return INITIAL_READY_GOODS_WORKERS
  try {
    const raw = localStorage.getItem(KEYS.WORKERS)
    if (!raw) {
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(INITIAL_READY_GOODS_WORKERS))
      return INITIAL_READY_GOODS_WORKERS
    }
    const parsed = JSON.parse(raw)
    const list: ReadyGoodsWorker[] = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_READY_GOODS_WORKERS
    if (companyName) {
      const cleanComp = companyName.trim().toLowerCase()
      return list.filter(w => !w.company_name || w.company_name.trim().toLowerCase() === cleanComp)
    }
    return list
  } catch (e) {
    console.error('Failed to parse workers from storage', e)
    return INITIAL_READY_GOODS_WORKERS
  }
}

export function saveReadyGoodsWorker(worker: ReadyGoodsWorker): ReadyGoodsWorker[] {
  if (typeof window === 'undefined') return [worker]
  const current = getReadyGoodsWorkers()
  const idx = current.findIndex(w => w.id === worker.id || (w.phone_number && w.phone_number === worker.phone_number))
  let updated: ReadyGoodsWorker[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = { ...current[idx], ...worker }
  } else {
    updated = [worker, ...current]
  }
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(updated))
  emitUpdate()
  return updated
}

export function deleteReadyGoodsWorker(id: string): ReadyGoodsWorker[] {
  if (typeof window === 'undefined') return []
  const current = getReadyGoodsWorkers()
  const updated = current.filter(w => w.id !== id)
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(updated))
  emitUpdate()
  return updated
}


// 8. Finishing Quality Inspection Tasks (Incoming from Washing & Iron)
export function getFinishingInspectionTasks(companyName?: string): FinishingInspectionTask[] {
  if (typeof window === 'undefined') return INITIAL_INSPECTION_TASKS
  try {
    const raw = localStorage.getItem(KEYS.INSPECTION_TASKS)
    if (!raw) {
      localStorage.setItem(KEYS.INSPECTION_TASKS, JSON.stringify(INITIAL_INSPECTION_TASKS))
      return INITIAL_INSPECTION_TASKS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INSPECTION_TASKS
  } catch (e) {
    console.error('Failed to parse inspection tasks from storage', e)
    return INITIAL_INSPECTION_TASKS
  }
}

export function saveFinishingInspectionTask(task: FinishingInspectionTask): FinishingInspectionTask[] {
  if (typeof window === 'undefined') return [task]
  const current = getFinishingInspectionTasks()
  const idx = current.findIndex(t => t.id === task.id || t.task_code === task.task_code)
  let updated: FinishingInspectionTask[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = { ...current[idx], ...task, updated_at: new Date().toISOString() }
  } else {
    updated = [task, ...current]
  }
  localStorage.setItem(KEYS.INSPECTION_TASKS, JSON.stringify(updated))
  emitUpdate()
  return updated
}

export function updateFinishingInspectionStatus(
  taskId: string,
  status: InspectionTaskStatus,
  updates?: Partial<FinishingInspectionTask>
): FinishingInspectionTask[] {
  if (typeof window === 'undefined') return []
  const current = getFinishingInspectionTasks()
  const updated = current.map(t => {
    if (t.id === taskId || t.task_code === taskId) {
      return {
        ...t,
        status,
        ...updates,
        updated_at: new Date().toISOString()
      }
    }
    return t
  })
  localStorage.setItem(KEYS.INSPECTION_TASKS, JSON.stringify(updated))
  emitUpdate()
  return updated
}

export function submitQualityInspectionResult(params: {
  taskId: string
  workerId: string
  workerName: string
  checklist: InspectionChecklist
  decision: 'APPROVE' | 'REJECT_TO_ALTER'
  defectNotes?: string
  defectCategory?: string
}): FinishingInspectionTask[] {
  const { taskId, workerId, workerName, checklist, decision, defectNotes, defectCategory } = params

  const newStatus: InspectionTaskStatus = decision === 'APPROVE' ? 'PASSED_TO_PACKING' : 'REJECTED_TO_ALTERATION'
  const altTicketId = decision === 'REJECT_TO_ALTER' ? `ALT-${Math.floor(1000 + Math.random() * 9000)}` : undefined

  // Update inspection task
  const updatedTasks = updateFinishingInspectionStatus(taskId, newStatus, {
    checklist,
    checked_by_worker_id: workerId,
    checked_by_worker_name: workerName,
    defect_notes: defectNotes,
    defect_category: defectCategory,
    alteration_ticket_id: altTicketId,
    completed_at: new Date().toISOString()
  })

  // Increment worker's inspected pieces count
  const task = updatedTasks.find(t => t.id === taskId || t.task_code === taskId)
  const pieceCount = task?.pieces_count || 1
  const workers = getReadyGoodsWorkers()
  const workerIdx = workers.findIndex(w => w.id === workerId || w.worker_name === workerName)
  if (workerIdx >= 0) {
    workers[workerIdx] = {
      ...workers[workerIdx],
      inspected_pieces: (workers[workerIdx].inspected_pieces || 0) + pieceCount
    }
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers))
  }

  emitUpdate()
  return updatedTasks
}

// -----------------------------------------------------------------------------
// PACKING ASSIGNMENTS STORAGE
// -----------------------------------------------------------------------------

export function getPackingAssignments(companyName?: string): PackingAssignment[] {
  if (typeof window === 'undefined') return INITIAL_PACKING_ASSIGNMENTS
  try {
    const raw = localStorage.getItem(KEYS.PACKING_ASSIGNMENTS)
    if (!raw) {
      localStorage.setItem(KEYS.PACKING_ASSIGNMENTS, JSON.stringify(INITIAL_PACKING_ASSIGNMENTS))
      return INITIAL_PACKING_ASSIGNMENTS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PACKING_ASSIGNMENTS
  } catch (e) {
    console.error('Failed to parse packing assignments from storage', e)
    return INITIAL_PACKING_ASSIGNMENTS
  }
}

export function savePackingAssignment(assignment: PackingAssignment): PackingAssignment[] {
  if (typeof window === 'undefined') return [assignment]
  const current = getPackingAssignments()
  const idx = current.findIndex(a => a.id === assignment.id || a.assignment_code === assignment.assignment_code)
  let updated: PackingAssignment[]
  if (idx >= 0) {
    updated = [...current]
    updated[idx] = { ...current[idx], ...assignment }
  } else {
    updated = [assignment, ...current]
  }
  localStorage.setItem(KEYS.PACKING_ASSIGNMENTS, JSON.stringify(updated))

  // Also auto-generate carton records if newly assigned
  try {
    const cartons = getReadyGoodsCartons()
    const newCartons: ReadyGoodsCarton[] = assignment.carton_numbers.map((cNum, i) => ({
      id: `ctn-${assignment.id}-${i + 1}`,
      cartonNumber: cNum,
      orderId: assignment.order_number,
      orderNumber: assignment.order_number,
      buyer: assignment.buyer,
      styleName: assignment.style_name,
      color: assignment.color,
      totalPieces: assignment.pieces_per_carton,
      sizeBreakdown: { [assignment.size]: assignment.pieces_per_carton },
      packedBundleIds: [assignment.task_code],
      measuredGrossWeightKg: assignment.gross_weight_per_carton_kg || 12.0,
      expectedGrossWeightKg: assignment.gross_weight_per_carton_kg || 12.0,
      weightVarianceKg: 0,
      status: 'PACKED',
      godownBay: assignment.target_godown_bay || 'BAY_3',
      dimensionsCm: '60x40x40',
      cbmVolume: 0.096,
      sealedBy: assignment.packer_worker_name,
      createdAt: new Date().toISOString()
    }))

    // Filter out duplicates
    const nonDuplicates = newCartons.filter(nc => !cartons.some(c => c.cartonNumber === nc.cartonNumber))
    if (nonDuplicates.length > 0) {
      const allCartons = [...nonDuplicates, ...cartons]
      localStorage.setItem(KEYS.CARTONS, JSON.stringify(allCartons))
    }
  } catch (err) {
    console.warn('Auto-carton generation note:', err)
  }

  // Update inspection task status to PACKED_IN_CARTON if all pieces packed
  try {
    updateFinishingInspectionStatus(assignment.inspection_task_id, 'PACKED_IN_CARTON', {
      packed_carton_id: assignment.assignment_code
    })
  } catch (err) {}

  emitUpdate()
  return updated
}

export function updatePackingAssignmentStatus(
  id: string,
  status: PackingAssignmentStatus,
  updates?: Partial<PackingAssignment>
): PackingAssignment[] {
  if (typeof window === 'undefined') return []
  const current = getPackingAssignments()
  const updated = current.map(a => {
    if (a.id === id || a.assignment_code === id) {
      return {
        ...a,
        status,
        ...updates,
        completed_at: status === 'PACKED_SEALED' || status === 'DISPATCHED_TO_GODOWN' ? new Date().toISOString() : a.completed_at
      }
    }
    return a
  })
  localStorage.setItem(KEYS.PACKING_ASSIGNMENTS, JSON.stringify(updated))

  // If status is marked PACKED_SEALED, increment the packer's packed_cartons count
  if (status === 'PACKED_SEALED' || status === 'DISPATCHED_TO_GODOWN') {
    const assignment = current.find(a => a.id === id || a.assignment_code === id)
    if (assignment) {
      const workers = getReadyGoodsWorkers()
      const workerIdx = workers.findIndex(w => w.id === assignment.packer_worker_id || w.worker_name === assignment.packer_worker_name)
      if (workerIdx >= 0) {
        workers[workerIdx] = {
          ...workers[workerIdx],
          packed_cartons: (workers[workerIdx].packed_cartons || 0) + assignment.cartons_count
        }
        localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers))
      }
    }
  }

  emitUpdate()
  return updated
}

export function deletePackingAssignment(id: string): PackingAssignment[] {
  if (typeof window === 'undefined') return []
  const current = getPackingAssignments()
  const filtered = current.filter(a => a.id !== id && a.assignment_code !== id)
  localStorage.setItem(KEYS.PACKING_ASSIGNMENTS, JSON.stringify(filtered))
  emitUpdate()
  return filtered
}
