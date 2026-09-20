'use client'

import { 
  WashingWorker, 
  WashingTaskAllocation, 
  WashingAllocationStatus 
} from '../types/washing'

export const WASHING_FLOOR_UPDATE_EVENT = 'zigza_washing_floor_update'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(WASHING_FLOOR_UPDATE_EVENT))
  }
}

// =============================================================================
// 1. WASHING FLOOR WORKERS
// =============================================================================
const WORKERS_KEY = 'zigza_washing_workers_v1'

export const INITIAL_WASHING_WORKERS: WashingWorker[] = []

export function getWashingWorkers(companyName?: string): WashingWorker[] {
  if (typeof window === 'undefined') return INITIAL_WASHING_WORKERS
  try {
    const stored = localStorage.getItem(WORKERS_KEY)
    if (!stored) {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_WASHING_WORKERS))
      return INITIAL_WASHING_WORKERS
    }
    const parsed = JSON.parse(stored)
    const list = Array.isArray(parsed) ? parsed : INITIAL_WASHING_WORKERS
    if (!companyName || !companyName.trim()) return list
    const target = companyName.trim().toLowerCase()
    return list.filter(w => (w.company_name || '').trim().toLowerCase() === target)
  } catch {
    return INITIAL_WASHING_WORKERS
  }
}

export function saveWashingWorker(worker: Partial<WashingWorker> & { id: string; worker_name: string; phone_number: string }): WashingWorker[] {
  const current = getWashingWorkers()
  const index = current.findIndex(w => w.id === worker.id || w.phone_number === worker.phone_number)
  let updated: WashingWorker[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = { ...current[index], ...worker, updated_at: new Date().toISOString() } as WashingWorker
  } else {
    updated = [{ ...(worker as WashingWorker), created_at: worker.created_at || new Date().toISOString() }, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteWashingWorker(id: string): WashingWorker[] {
  const current = getWashingWorkers()
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
// 2. WASHING TASK ALLOCATIONS (Spreadsheet Matrix)
// =============================================================================
const ALLOCATIONS_KEY = 'zigza_washing_task_allocations_v1'

export const INITIAL_TASK_ALLOCATIONS: WashingTaskAllocation[] = []

export function isLegacyWashingTask(t: any): boolean {
  if (!t) return true
  const rawRef = (t?.task_ref || t?.id || '').trim().toUpperCase()
  const ref = rawRef.replace(/^#/, '')
  if (ref.startsWith('BA-') || ref.startsWith('WSH-TSK') || ref.includes('WSH-TSK')) return true
  if (t?.article_number && t.article_number.trim() === 'DEMO-101') return true
  return false
}

export function getWashingTaskAllocations(companyName?: string): WashingTaskAllocation[] {
  if (typeof window === 'undefined') return INITIAL_TASK_ALLOCATIONS
  try {
    const stored = localStorage.getItem(ALLOCATIONS_KEY)
    if (!stored) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(INITIAL_TASK_ALLOCATIONS))
      return INITIAL_TASK_ALLOCATIONS
    }
    const parsed = JSON.parse(stored)
    let list = Array.isArray(parsed) ? parsed : INITIAL_TASK_ALLOCATIONS
    const filtered = list.filter(t => !isLegacyWashingTask(t))
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

export function saveWashingTaskAllocation(task: WashingTaskAllocation): WashingTaskAllocation[] {
  const current = getWashingTaskAllocations()
  const index = current.findIndex(t => t.id === task.id || t.task_ref === task.task_ref)
  let updated: WashingTaskAllocation[]
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

export function updateWashingTaskStatus(id: string, status: WashingAllocationStatus, extraData?: any): WashingTaskAllocation[] {
  const current = getWashingTaskAllocations()
  const exists = current.some(t => t.id === id || t.task_ref === id)
  
  let baseList = current
  if (!exists && extraData?.task) {
    baseList = [extraData.task, ...current]
  }

  let updated = baseList.map(t => {
    if (t.id === id || t.task_ref === id) {
      const isCompleted = status === 'WORKER_COMPLETED' || status === 'VERIFIED_COMPLETED'
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
        completed_pieces: isCompleted ? t.pieces_to_wash : (status === 'IN_PROGRESS' ? (t.completed_pieces || 0) : 0),
        ...(status === 'VERIFIED_COMPLETED' ? { completed_at: new Date().toISOString() } : {}),
        ...(extraData || {}),
        updated_at: new Date().toISOString()
      }
    }
    return t
  })

  // Sync worker metrics
  const targetTask = updated.find(t => t.id === id || t.task_ref === id)
  if (targetTask && targetTask.worker_name) {
    const isCompleted = status === 'WORKER_COMPLETED' || status === 'VERIFIED_COMPLETED'
    if (isCompleted) {
      const workers = getWashingWorkers()
      const wIdx = workers.findIndex(w => w.id === targetTask.worker_id || w.worker_name === targetTask.worker_name)
      if (wIdx >= 0) {
        workers[wIdx].completed_pieces = (workers[wIdx].completed_pieces || 0) + Number(targetTask.pieces_to_wash)
        if (typeof window !== 'undefined') {
          localStorage.setItem(WORKERS_KEY, JSON.stringify(workers))
        }
      }
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteWashingTaskAllocation(id: string): WashingTaskAllocation[] {
  const current = getWashingTaskAllocations()
  const updated = current.filter(t => t.id !== id && t.task_ref !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function mergeWashingTaskAllocations(serverList: any[] = [], companyName?: string): WashingTaskAllocation[] {
  if (typeof window === 'undefined') return serverList
  try {
    const targetComp = (companyName || '').trim().toLowerCase()
    const scopedServer = targetComp
      ? serverList.filter(t => (t?.company_name || '').trim().toLowerCase() === targetComp)
      : serverList

    const local = getWashingTaskAllocations(companyName)
    const map = new Map<string, WashingTaskAllocation>()

    // 1. Process server allocations (canonical DB source)
    scopedServer.forEach(s => {
      if (!s) return
      const key = s.task_ref || s.id
      map.set(key, {
        id: s.id || key,
        task_ref: s.task_ref || key,
        buyer_id: s.buyer_id,
        buyer_name: s.buyer_name || 'Direct Buyer',
        article_number: s.article_number,
        article_name: s.article_name,
        worker_id: s.worker_id,
        worker_name: s.worker_name || 'Floor Operator',
        worker_phone: s.worker_phone,
        table_number: s.table_number || s.machine_number || 'Washer 01 (Tumbler 600kg)',
        machine_number: s.machine_number,
        pieces_to_wash: Number(s.pieces_to_wash || s.pieces_to_embroider || s.pieces_to_print) || 0,
        completed_pieces: Number(s.completed_pieces) || 0,
        alloted_hours: Number(s.alloted_hours) || 4.0,
        due_time: s.due_time,
        wash_recipe: s.wash_recipe || 'Bio-Enzyme Wash 55°C',
        notes: s.notes,
        company_name: s.company_name || companyName,
        status: (s.status as WashingAllocationStatus) || 'ASSIGNED',
        assigned_at: s.assigned_at,
        completed_at: s.completed_at,
        created_at: s.created_at,
        updated_at: s.updated_at
      })
    })

    // 2. Local updates override older timestamps
    local.forEach(l => {
      const key = l.task_ref || l.id
      const existing = map.get(key)
      if (!existing) {
        map.set(key, l)
      } else {
        const localTime = new Date(l.updated_at || l.created_at || 0).getTime()
        const serverTime = new Date(existing.updated_at || existing.created_at || 0).getTime()
        if (localTime >= serverTime) {
          map.set(key, { ...existing, ...l })
        }
      }
    })

    const merged = Array.from(map.values())
    
    // Sync back to local storage preserving other tenants safely
    if (typeof window !== 'undefined') {
      try {
        if (targetComp) {
          const rawAll = localStorage.getItem(ALLOCATIONS_KEY)
          const allParsed: any[] = rawAll ? JSON.parse(rawAll) : []
          const otherTenantsTasks = Array.isArray(allParsed)
            ? allParsed.filter(t => (t?.company_name || '').trim().toLowerCase() !== targetComp)
            : []
          localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify([...merged, ...otherTenantsTasks]))
        } else if (merged.length > 0) {
          localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(merged))
        }
      } catch (_) {}
    }

    return merged
  } catch {
    return serverList
  }
}
