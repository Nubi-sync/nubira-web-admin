export type FloorModule = 
  | 'design'
  | 'merchandising'
  | 'cutting' 
  | 'printing' 
  | 'embroidery' 
  | 'stitching' 
  | 'washing' 
  | 'iron' 
  | 'ready-goods'
  | 'alter'
  | 'all'

export type FloorEventType = 
  | 'TASK_ALLOCATED' 
  | 'TASK_STARTED' 
  | 'PROGRESS_SUBMITTED' 
  | 'TASK_VERIFIED' 
  | 'STAGE_TRANSFER' 
  | 'TASK_DELETED'
  | 'BRIEF_CREATED'
  | 'BRIEF_REVIEWED'
  | 'TECHPACK_CREATED'
  | 'ORDER_CREATED'
  | 'BUYER_CREATED'

export interface FloorRealtimeEvent {
  id: string
  timestamp: string
  eventType: FloorEventType
  sourceModule: FloorModule
  targetModule?: FloorModule
  companyName?: string
  title: string
  message: string
  articleNumber?: string
  buyerName?: string
  workerName?: string
  pieces?: number
  taskRef?: string
  status?: string
  isRead?: boolean
  metadata?: Record<string, any>
}

export const FLOOR_NOTIFICATIONS_UPDATE_EVENT = 'nubira_floor_notifications_updated'

const MAX_NOTIFICATIONS = 200

function getStorageKey(companyName?: string): string {
  const cleanCompany = (companyName || 'all').trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
  return `nubira_floor_notifications_${cleanCompany}`
}

export function getFloorNotifications(companyName?: string, filterModule?: FloorModule): FloorRealtimeEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(getStorageKey(companyName))
    if (!raw) return []
    const list: FloorRealtimeEvent[] = JSON.parse(raw)
    if (!Array.isArray(list)) return []

    if (!filterModule || filterModule === 'all') {
      return list
    }

    return list.filter(item => 
      item.sourceModule === filterModule || 
      item.targetModule === filterModule
    )
  } catch (err) {
    console.warn('[FloorNotifications] Error reading notifications:', err)
    return []
  }
}

export function saveFloorNotification(event: FloorRealtimeEvent): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(event.companyName)
    const existing = getFloorNotifications(event.companyName)

    // Deduplicate by ID
    const filtered = existing.filter(n => n.id !== event.id)
    const updated = [{ ...event, isRead: false }, ...filtered].slice(0, MAX_NOTIFICATIONS)

    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(FLOOR_NOTIFICATIONS_UPDATE_EVENT, { detail: event }))
  } catch (err) {
    console.warn('[FloorNotifications] Error saving notification:', err)
  }
}

export function markAllNotificationsAsRead(companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(companyName)
    const existing = getFloorNotifications(companyName)
    const updated = existing.map(item => ({ ...item, isRead: true }))
    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(FLOOR_NOTIFICATIONS_UPDATE_EVENT))
  } catch (err) {
    console.warn('[FloorNotifications] Error marking read:', err)
  }
}

export function markNotificationAsRead(id: string, companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(companyName)
    const existing = getFloorNotifications(companyName)
    const updated = existing.map(item => item.id === id ? { ...item, isRead: true } : item)
    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent(FLOOR_NOTIFICATIONS_UPDATE_EVENT))
  } catch (err) {
    console.warn('[FloorNotifications] Error marking single read:', err)
  }
}

export function getUnreadNotificationCount(companyName?: string, filterModule?: FloorModule): number {
  const items = getFloorNotifications(companyName, filterModule)
  return items.filter(n => !n.isRead).length
}

export function clearFloorNotifications(companyName?: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getStorageKey(companyName)
    localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent(FLOOR_NOTIFICATIONS_UPDATE_EVENT))
  } catch (err) {
    console.warn('[FloorNotifications] Error clearing notifications:', err)
  }
}
