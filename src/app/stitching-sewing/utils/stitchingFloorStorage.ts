import { StitchingWorker, StitchingTaskAllocation, StitchingSubmissionRecord } from '../types/stitching'

export const STITCHING_UPDATE_EVENT = 'stitching_floor_updated'

const WORKERS_KEY_PREFIX = 'zigza_stitching_workers_'
const TASKS_KEY_PREFIX = 'zigza_stitching_tasks_'
const HISTORY_KEY_PREFIX = 'zigza_stitching_history_'

export function getStitchingWorkersKey(companyName?: string): string {
  const norm = (companyName || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `${WORKERS_KEY_PREFIX}${norm}`
}

export function getStitchingTasksKey(companyName?: string): string {
  const norm = (companyName || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `${TASKS_KEY_PREFIX}${norm}`
}

export function getStitchingHistoryKey(companyName?: string): string {
  const norm = (companyName || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `${HISTORY_KEY_PREFIX}${norm}`
}

export function getStitchingWorkers(companyName?: string): StitchingWorker[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStitchingWorkersKey(companyName))
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStitchingWorker(worker: StitchingWorker, companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStitchingWorkersKey(companyName || worker.company_name)
    const list = getStitchingWorkers(companyName || worker.company_name)
    const existingIdx = list.findIndex(w => w.id === worker.id || (worker.phone_number && w.phone_number === worker.phone_number))
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...worker }
    } else {
      list.unshift(worker)
    }
    localStorage.setItem(key, JSON.stringify(list))
    window.dispatchEvent(new Event(STITCHING_UPDATE_EVENT))
  } catch (err) {
    console.warn('saveStitchingWorker storage error:', err)
  }
}

export function deleteStitchingWorker(workerId: string, companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStitchingWorkersKey(companyName)
    const list = getStitchingWorkers(companyName)
    const filtered = list.filter(w => w.id !== workerId && w.phone_number !== workerId)
    localStorage.setItem(key, JSON.stringify(filtered))
    window.dispatchEvent(new Event(STITCHING_UPDATE_EVENT))
  } catch (err) {
    console.warn('deleteStitchingWorker storage error:', err)
  }
}

export function getStitchingTaskAllocations(companyName?: string): StitchingTaskAllocation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStitchingTasksKey(companyName))
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveStitchingTaskAllocation(task: StitchingTaskAllocation, companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStitchingTasksKey(companyName || task.company_name)
    const list = getStitchingTaskAllocations(companyName || task.company_name)
    const existingIdx = list.findIndex(t => t.id === task.id || (task.task_ref && t.task_ref === task.task_ref))
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...task }
    } else {
      list.unshift(task)
    }
    localStorage.setItem(key, JSON.stringify(list))
    window.dispatchEvent(new Event(STITCHING_UPDATE_EVENT))
  } catch (err) {
    console.warn('saveStitchingTaskAllocation storage error:', err)
  }
}

export function updateStitchingTaskStatus(
  taskId: string,
  status: StitchingTaskAllocation['status'],
  completedQty?: number,
  notes?: string,
  companyName?: string
): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStitchingTasksKey(companyName)
    const list = getStitchingTaskAllocations(companyName)
    const existingIdx = list.findIndex(t => t.id === taskId || t.task_ref === taskId)
    if (existingIdx >= 0) {
      list[existingIdx].status = status
      if (completedQty !== undefined) {
        list[existingIdx].completed_quantity = completedQty
      }
      if (notes !== undefined) {
        list[existingIdx].notes = notes
      }
      if (status === 'IN_PROGRESS' && !list[existingIdx].started_at) {
        list[existingIdx].started_at = new Date().toISOString()
      }
      if (status === 'COMPLETED') {
        list[existingIdx].completed_at = new Date().toISOString()
      }
      localStorage.setItem(key, JSON.stringify(list))
      window.dispatchEvent(new Event(STITCHING_UPDATE_EVENT))
    }
  } catch (err) {
    console.warn('updateStitchingTaskStatus storage error:', err)
  }
}

export function getStitchingSubmissionHistory(companyName?: string): StitchingSubmissionRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStitchingHistoryKey(companyName))
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function recordStitchingSubmission(record: StitchingSubmissionRecord, companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStitchingHistoryKey(companyName || record.company_name)
    const list = getStitchingSubmissionHistory(companyName || record.company_name)
    list.unshift(record)
    localStorage.setItem(key, JSON.stringify(list))
    window.dispatchEvent(new Event(STITCHING_UPDATE_EVENT))
  } catch (err) {
    console.warn('recordStitchingSubmission storage error:', err)
  }
}

export function mergeStitchingTaskAllocations(
  serverTasks: StitchingTaskAllocation[],
  localTasks: StitchingTaskAllocation[],
  companyName?: string
): StitchingTaskAllocation[] {
  const map = new Map<string, StitchingTaskAllocation>()
  serverTasks.forEach(t => map.set(t.id, t))
  localTasks.forEach(t => map.set(t.id, t))
  const merged = Array.from(map.values())
  merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  return merged
}
