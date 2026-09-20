'use client'

import { 
  IronWorker, 
  IronTaskAllocation, 
  IronAllocationStatus 
} from '../types/iron'

export const IRON_FLOOR_UPDATE_EVENT = 'zigza_iron_floor_update'

function emitUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(IRON_FLOOR_UPDATE_EVENT))
  }
}

// =============================================================================
// 1. IRON FLOOR WORKERS
// =============================================================================
const WORKERS_KEY = 'zigza_iron_workers_v1'

export const INITIAL_IRON_WORKERS: IronWorker[] = []

export function getIronWorkers(companyName?: string): IronWorker[] {
  if (typeof window === 'undefined') return INITIAL_IRON_WORKERS
  try {
    const stored = localStorage.getItem(WORKERS_KEY)
    if (!stored) {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_IRON_WORKERS))
      return INITIAL_IRON_WORKERS
    }
    const parsed = JSON.parse(stored)
    const list = Array.isArray(parsed) ? parsed : INITIAL_IRON_WORKERS
    if (!companyName || !companyName.trim()) return list
    const target = companyName.trim().toLowerCase()
    return list.filter(w => (w.company_name || '').trim().toLowerCase() === target)
  } catch {
    return INITIAL_IRON_WORKERS
  }
}

export function saveIronWorker(worker: Partial<IronWorker> & { id: string; worker_name: string; phone_number: string }): IronWorker[] {
  const current = getIronWorkers()
  const index = current.findIndex(w => w.id === worker.id || w.phone_number === worker.phone_number)
  let updated: IronWorker[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = { ...current[index], ...worker, updated_at: new Date().toISOString() } as IronWorker
  } else {
    updated = [{ ...(worker as IronWorker), created_at: worker.created_at || new Date().toISOString() }, ...current]
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function deleteIronWorker(id: string): IronWorker[] {
  const current = getIronWorkers()
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
// 2. IRONING TASK ALLOCATIONS (Spreadsheet Matrix)
// =============================================================================
const ALLOCATIONS_KEY = 'zigza_iron_task_allocations_v1'

export const INITIAL_TASK_ALLOCATIONS: IronTaskAllocation[] = []

export function isLegacyIronTask(t: any): boolean {
  if (!t) return true
  const rawRef = (t?.task_ref || t?.id || '').trim().toUpperCase()
  const ref = rawRef.replace(/^#/, '')
  if (ref.startsWith('BA-') || ref.startsWith('IRN-TSK') || ref.includes('IRN-TSK')) return true
  if (t?.article_number && t.article_number.trim() === 'DEMO-101') return true
  return false
}

export function getIronTaskAllocations(companyName?: string): IronTaskAllocation[] {
  if (typeof window === 'undefined') return INITIAL_TASK_ALLOCATIONS
  try {
    const stored = localStorage.getItem(ALLOCATIONS_KEY)
    if (!stored) {
      localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(INITIAL_TASK_ALLOCATIONS))
      return INITIAL_TASK_ALLOCATIONS
    }
    const parsed = JSON.parse(stored)
    let list = Array.isArray(parsed) ? parsed : INITIAL_TASK_ALLOCATIONS
    const filtered = list.filter(t => !isLegacyIronTask(t))
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

export function saveIronTaskAllocation(task: IronTaskAllocation): IronTaskAllocation[] {
  const current = getIronTaskAllocations()
  const index = current.findIndex(t => t.id === task.id || t.task_ref === task.task_ref)
  let updated: IronTaskAllocation[]
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

export function updateIronTaskStatus(id: string, status: IronAllocationStatus, extraData?: any): IronTaskAllocation[] {
  const current = getIronTaskAllocations()
  const exists = current.some(t => t.id === id || t.task_ref === id)
  
  let baseList = current
  if (!exists && extraData?.task) {
    baseList = [extraData.task, ...current]
  }

  let updated = baseList.map(t => {
    if (t.id === id || t.task_ref === id) {
      const isCompleted = status === 'COMPLETED' || status === 'VERIFIED_COMPLETED'
      let dueTime = extraData?.due_time || (t as any).due_time
      let startedAt = extraData?.started_at || (t as any).started_at
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
        completed_pieces: isCompleted ? t.pieces_to_press : (status === 'IN_PROGRESS' ? (t.completed_pieces || 0) : 0),
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
    const isCompleted = status === 'COMPLETED' || status === 'VERIFIED_COMPLETED'
    if (isCompleted) {
      const workers = getIronWorkers()
      const wIdx = workers.findIndex(w => w.id === targetTask.worker_id || w.worker_name === targetTask.worker_name)
      if (wIdx >= 0) {
        (workers[wIdx] as any).completed_pieces = ((workers[wIdx] as any).completed_pieces || 0) + Number(targetTask.pieces_to_press)
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

export function deleteIronTaskAllocation(id: string): IronTaskAllocation[] {
  const current = getIronTaskAllocations()
  const updated = current.filter(t => t.id !== id && t.task_ref !== id)
  if (typeof window !== 'undefined') {
    localStorage.setItem(ALLOCATIONS_KEY, JSON.stringify(updated))
  }
  emitUpdate()
  return updated
}

export function mergeIronTaskAllocations(serverList: any[] = [], companyName?: string): IronTaskAllocation[] {
  if (typeof window === 'undefined') return serverList
  try {
    const targetComp = (companyName || '').trim().toLowerCase()
    const scopedServer = targetComp
      ? serverList.filter(t => (t?.company_name || '').trim().toLowerCase() === targetComp)
      : serverList

    const local = getIronTaskAllocations(companyName)
    const map = new Map<string, IronTaskAllocation>()

    // 1. Process server allocations (canonical DB source)
    scopedServer.forEach(s => {
      if (!s) return
      const key = s.task_ref || s.id
      map.set(key, {
        id: s.id || key,
        task_ref: s.task_ref || key,
        cutting_allocation_id: s.cutting_allocation_id,
        buyer_id: s.buyer_id,
        buyer_name: s.buyer_name || 'Direct Buyer',
        article_number: s.article_number,
        article_name: s.article_name,
        worker_id: s.worker_id,
        worker_name: s.worker_name || 'Finishing Presser',
        worker_phone: s.worker_phone,
        machine_table: s.machine_table || s.table_number || 'Steam Table 01 (Vacuum)',
        pieces_to_press: Number(s.pieces_to_press || s.pieces_to_wash || s.pieces_to_embroider || s.pieces_to_print) || 0,
        completed_pieces: Number(s.completed_pieces) || 0,
        alloted_hours: Number(s.alloted_hours) || 4.0,
        shift: s.shift || 'SHIFT_1',
        iron_temp_c: Number(s.iron_temp_c) || 150,
        company_name: s.company_name || companyName,
        status: (s.status as IronAllocationStatus) || 'PENDING',
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
