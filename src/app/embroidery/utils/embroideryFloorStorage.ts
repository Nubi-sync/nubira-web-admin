'use client'

import { 
  EmbroideryWorker, 
  EmbroideryTaskAllocation, 
  EmbroideryAllocationStatus 
} from '../types/embroidery'

export const EMBROIDERY_FLOOR_UPDATE_EVENT = 'zigza_embroidery_floor_update'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EMBROIDERY_FLOOR_UPDATE_EVENT))
  }
}

// =============================================================================
// 1. EMBROIDERY FLOOR WORKERS
// =============================================================================
const WORKERS_KEY = 'zigza_embroidery_workers_v1'

export const INITIAL_EMBROIDERY_WORKERS: EmbroideryWorker[] = []

export function getEmbroideryWorkers(companyName?: string): EmbroideryWorker[] {
  if (typeof window === 'undefined') return INITIAL_EMBROIDERY_WORKERS
  try {
    const stored = localStorage.getItem(WORKERS_KEY)
    if (!stored) {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_EMBROIDERY_WORKERS))
      return INITIAL_EMBROIDERY_WORKERS
    }
    const parsed = JSON.parse(stored)
    const list = Array.isArray(parsed) ? parsed : INITIAL_EMBROIDERY_WORKERS
    if (!companyName || !companyName.trim()) return list
    const target = companyName.trim().toLowerCase()
    return list.filter(w => (w.company_name || '').trim().toLowerCase() === target)
  } catch {
    return INITIAL_EMBROIDERY_WORKERS
  }
}

export function saveEmbroideryWorker(worker: Partial<EmbroideryWorker> & { id: string; worker_name: string; phone_number: string }): EmbroideryWorker[] {
  const current = getEmbroideryWorkers()
  const index = current.findIndex(w => w.id === worker.id || w.phone_number === worker.phone_number)
  let updated: EmbroideryWorker[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = { ...current[index], ...worker, updated_at: new Date().toISOString() } as EmbroideryWorker
  } else {
    updated = [{ ...(worker as EmbroideryWorker), created_at: worker.created_at || new Date().toISOString() }, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteEmbroideryWorker(id: string): EmbroideryWorker[] {
  const current = getEmbroideryWorkers()
  const rawDigits = id.replace(/\D/g, '')
  const phone10 = rawDigits.length >= 10 ? rawDigits.slice(-10) : ''
  const idClean = id.trim().toLowerCase()

  const updated = current.filter(w => {
    if (w.id === id) return false
    if (w.worker_name && (w.worker_name.toLowerCase() === idClean || idClean.includes(w.worker_name.toLowerCase()))) return false
    if (w.phone_number) {
      const wPhoneDigits = w.phone_number.replace(/\D/g, '').slice(-10)
      if (w.phone_number === id || (phone10 && wPhoneDigits === phone10)) return false
    }
    return true
  })

  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// =============================================================================
// 2. EMBROIDERY TASK ALLOCATIONS (Spreadsheet Matrix)
// =============================================================================
const ALLOCATIONS_KEY = 'zigza_embroidery_task_allocations_v1'

export const INITIAL_TASK_ALLOCATIONS: EmbroideryTaskAllocation[] = []

export function isLegacyEmbroideryTask(t: any): boolean {
  if (!t) return true
  const rawRef = (t?.task_ref || t?.id || '').trim().toUpperCase()
  const ref = rawRef.replace(/^#/, '')
  if (ref.startsWith('BA-') || ref.startsWith('EMB-TSK') || ref.includes('EMB-TSK')) return true
  if (t?.article_number && t.article_number.trim() === 'DEMO-101') return true
  return false
}

export function getEmbroideryTaskAllocations(companyName?: string): EmbroideryTaskAllocation[] {
  if (typeof window === 'undefined') return INITIAL_TASK_ALLOCATIONS
  try {
    const stored = localStorage.getItem(ALLOCATIONS_KEY)
    if (!stored) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(INITIAL_TASK_ALLOCATIONS))
      return INITIAL_TASK_ALLOCATIONS
    }
    const parsed = JSON.parse(stored)
    let list = Array.isArray(parsed) ? parsed : INITIAL_TASK_ALLOCATIONS

    const filtered = list.filter(t => !isLegacyEmbroideryTask(t))
    if (filtered.length !== list.length) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(filtered))
      list = filtered
    }

    if (!companyName || !companyName.trim()) return list
    const target = companyName.trim().toLowerCase()
    return list.filter(t => (t.company_name || '').trim().toLowerCase() === target)
  } catch {
    return INITIAL_TASK_ALLOCATIONS
  }
}

export function saveEmbroideryTaskAllocation(task: EmbroideryTaskAllocation): EmbroideryTaskAllocation[] {
  if (isLegacyEmbroideryTask(task)) return getEmbroideryTaskAllocations()
  const current = getEmbroideryTaskAllocations()
  const index = current.findIndex(t => t.id === task.id || t.task_ref === task.task_ref)
  let updated: EmbroideryTaskAllocation[]
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

export function updateEmbroideryTaskStatus(id: string, status: EmbroideryAllocationStatus, extraData?: any): EmbroideryTaskAllocation[] {
  const current = getEmbroideryTaskAllocations()
  const exists = current.some(t => t.id === id || t.task_ref === id)
  
  let baseList = current
  if (!exists && extraData?.task) {
    baseList = [extraData.task, ...current]
  }

  let updated = baseList.map(t => {
    if (t.id === id || t.task_ref === id) {
      const isCompleted = status === 'COMPLETED' || status === 'WORKER_COMPLETED' || status === 'VERIFIED_COMPLETED'
      let dueTime = extraData?.due_time || t.due_time
      let startedAt = extraData?.started_at || t.started_at
      if (status === 'IN_PROGRESS' && !startedAt) {
        startedAt = new Date().toISOString()
        const hours = Number(t.alloted_hours) || 4.0
        dueTime = new Date(Date.now() + hours * 3600 * 1000).toISOString()
      }
      return {
        ...t,
        status,
        started_at: startedAt,
        due_time: dueTime,
        completed_pieces: isCompleted ? (Number(extraData?.completed_pieces) || t.pieces_to_embroider) : (status === 'IN_PROGRESS' ? (t.completed_pieces || 0) : 0),
        ...(status === 'VERIFIED_COMPLETED' ? { completed_at: new Date().toISOString() } : {}),
        ...(extraData || {}),
        updated_at: new Date().toISOString()
      }
    }
    return t
  })

  // If still not found and extraData provided, construct entry
  if (!updated.some(t => t.id === id || t.task_ref === id) && extraData) {
    const isCompleted = status === 'COMPLETED' || status === 'WORKER_COMPLETED' || status === 'VERIFIED_COMPLETED'
    const newTask: any = {
      id,
      task_ref: id,
      ...extraData,
      status,
      completed_pieces: isCompleted ? (extraData.pieces_to_embroider || 0) : 0,
      updated_at: new Date().toISOString()
    }
    updated = [newTask, ...updated]
  }

  updated = updated.filter(t => !isLegacyEmbroideryTask(t))

  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function mergeEmbroideryTaskAllocations(
  serverList: any[] = [],
  localList: any[] = [],
  companyName?: string
): EmbroideryTaskAllocation[] {
  const taskMap = new Map<string, any>()
  const targetCompany = (companyName || '').trim().toLowerCase()

  const scopedServer = (targetCompany
    ? serverList.filter(t => (t?.company_name || '').trim().toLowerCase() === targetCompany)
    : serverList
  ).filter(t => !isLegacyEmbroideryTask(t))

  const scopedLocal = (targetCompany
    ? localList.filter(t => (t?.company_name || '').trim().toLowerCase() === targetCompany)
    : localList
  ).filter(t => !isLegacyEmbroideryTask(t))

  // 1. Process server allocations first (canonical DB source)
  scopedServer.forEach(t => {
    if (!t) return
    const key = (t.task_ref || t.id || '').trim().toUpperCase()
    if (key) taskMap.set(key, t)
  })

  // 2. Merge local allocations safely without overriding authoritative server state
  scopedLocal.forEach(localT => {
    if (!localT || isLegacyEmbroideryTask(localT)) return
    const key = (localT.task_ref || localT.id || '').trim().toUpperCase()
    if (!key) return

    const existing = taskMap.get(key)
    if (!existing) {
      if (scopedServer.length === 0) {
        taskMap.set(key, localT)
      }
    } else {
      taskMap.set(key, {
        ...localT,
        ...existing,
        id: existing.id || localT.id,
        task_ref: existing.task_ref || localT.task_ref,
        status: existing.status,
        completed_pieces: Number(existing.completed_pieces) || 0,
        pieces_to_embroider: Number(existing.pieces_to_embroider) || Number(localT.pieces_to_embroider) || 0,
        updated_at: existing.updated_at || new Date().toISOString()
      })
    }
  })

  const merged = Array.from(taskMap.values())

  // Sync back to local storage preserving other tenants
  if (typeof window !== 'undefined') {
    try {
      if (targetCompany) {
        const rawAll = localStorage.getItem(ALLOCATIONS_KEY)
        const allParsed: any[] = rawAll ? JSON.parse(rawAll) : []
        const otherTenantsTasks = Array.isArray(allParsed)
          ? allParsed.filter(t => (t?.company_name || '').trim().toLowerCase() !== targetCompany && !isLegacyEmbroideryTask(t))
          : []
        localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify([...merged, ...otherTenantsTasks]))
      } else {
        localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(merged))
      }
    } catch (_) {}
  }

  return merged
}

export function deleteEmbroideryTaskAllocation(id: string): EmbroideryTaskAllocation[] {
  const current = getEmbroideryTaskAllocations()
  const updated = current.filter(t => t.id !== id && t.task_ref !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

// =============================================================================
// 3. EMBROIDERY MACHINES & STATIONS
// =============================================================================
const MACHINES_KEY = 'zigza_embroidery_machines_v1'

export const INITIAL_EMBROIDERY_MACHINES = [
  'Machine 01 (Tajima 20-Head)',
  'Machine 02 (Tajima 12-Head)',
  'Machine 03 (Barudan 15-Head)',
  'Machine 04 (SWF Multi-Head)'
]

export function getEmbroideryMachines(): string[] {
  if (typeof window === 'undefined') return INITIAL_EMBROIDERY_MACHINES
  try {
    const stored = localStorage.getItem(MACHINES_KEY)
    if (!stored) {
      localStorage.setItem(MACHINES_KEY, JSON.stringify(INITIAL_EMBROIDERY_MACHINES))
      return INITIAL_EMBROIDERY_MACHINES
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EMBROIDERY_MACHINES
  } catch {
    return INITIAL_EMBROIDERY_MACHINES
  }
}

export function saveEmbroideryMachines(machines: string[]): string[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MACHINES_KEY, JSON.stringify(machines))
  }
  emitUpdate()
  return machines
}
