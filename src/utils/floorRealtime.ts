import { createClient } from './supabase/client'
import { saveFloorNotification, FloorRealtimeEvent, FloorModule } from './floorNotificationsStorage'

export type { FloorRealtimeEvent, FloorModule }

type FloorEventListener = (event: FloorRealtimeEvent) => void
type FloorRefreshListener = (sourceModule?: FloorModule) => void

class FloorRealtimeManager {
  private static instance: FloorRealtimeManager | null = null
  private supabase = createClient()
  private activeChannel: any = null
  private currentChannelName: string = ''
  private broadcastBus: BroadcastChannel | null = null
  private eventListeners: Set<FloorEventListener> = new Set()
  private refreshListeners: Set<FloorRefreshListener> = new Set()
  private isSubscribed: boolean = false
  private connectionStatus: 'connected' | 'connecting' | 'offline' = 'offline'
  private statusListeners: Set<(status: 'connected' | 'connecting' | 'offline') => void> = new Set()

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastBus = new BroadcastChannel('nubira_floor_realtime_bus')
          this.broadcastBus.onmessage = (msgEvent) => {
            if (msgEvent.data && msgEvent.data.type === 'FLOOR_EVENT') {
              this.handleIncomingEvent(msgEvent.data.payload, false)
            } else if (msgEvent.data && msgEvent.data.type === 'FLOOR_REFRESH') {
              this.triggerRefresh(msgEvent.data.sourceModule, false)
            }
          }
        }
      } catch (err) {
        console.warn('[FloorRealtime] BroadcastChannel init error:', err)
      }
    }
  }

  public static getInstance(): FloorRealtimeManager {
    if (!FloorRealtimeManager.instance) {
      FloorRealtimeManager.instance = new FloorRealtimeManager()
    }
    return FloorRealtimeManager.instance
  }

  public init(companyName?: string) {
    if (typeof window === 'undefined') return
    const cleanCompany = (companyName || 'global').trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
    const channelName = `nubira_floor_${cleanCompany}`

    if (this.activeChannel && this.currentChannelName === channelName && this.isSubscribed) {
      return
    }

    if (this.activeChannel) {
      try {
        this.supabase.removeChannel(this.activeChannel)
      } catch {}
      this.activeChannel = null
      this.isSubscribed = false
    }

    this.currentChannelName = channelName
    this.updateStatus('connecting')

    try {
      const channel = this.supabase.channel(channelName, {
        config: {
          broadcast: { self: true }
        }
      })

      // 1. Listen for custom floor broadcast events (Submissions, transfers, sign-offs)
      channel.on('broadcast', { event: 'floor_activity' }, ({ payload }) => {
        if (payload) {
          this.handleIncomingEvent(payload, false)
        }
      })

      // 2. Listen to PostgreSQL changes on tables across design, merchandising, and all factory floors
      const tables = [
        'design_briefs',
        'tech_packs',
        'orders',
        'buyers',
        'cutting_task_allocations',
        'printing_task_allocations',
        'embroidery_task_allocations',
        'stitching_task_allocations',
        'washing_task_allocations',
        'iron_task_allocations'
      ]

      tables.forEach(tableName => {
        channel.on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (change) => {
          let mod: FloorModule = 'cutting'
          if (tableName.includes('brief') || tableName.includes('tech_pack')) mod = 'design'
          else if (tableName.includes('order') || tableName.includes('buyer')) mod = 'merchandising'
          else if (tableName.includes('printing')) mod = 'printing'
          else if (tableName.includes('embroidery')) mod = 'embroidery'
          else if (tableName.includes('stitching')) mod = 'stitching'
          else if (tableName.includes('washing')) mod = 'washing'
          else if (tableName.includes('iron')) mod = 'iron'

          // Also auto-synthesize an audit event if insert or update with meaningful status
          const rec: any = change.new || change.old || {}
          if (change.eventType === 'UPDATE' && rec.status) {
            const isCompleted = rec.status === 'COMPLETED' || rec.status === 'VERIFIED_COMPLETED'
            const isWorkerDone = rec.status === 'WORKER_COMPLETED'
            if (isCompleted || isWorkerDone) {
              const syntheticEvent: FloorRealtimeEvent = {
                id: `evt-pg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                timestamp: new Date().toISOString(),
                eventType: isCompleted ? 'TASK_VERIFIED' : 'PROGRESS_SUBMITTED',
                sourceModule: mod,
                companyName,
                title: `${mod.toUpperCase()} Update`,
                message: `${rec.worker_name || 'Worker'} ${isCompleted ? 'verified' : 'completed'} ${rec.completed_pieces || rec.completed_quantity || rec.target_quantity || ''} pcs of Article ${rec.article_number || rec.article_name || ''}`.trim(),
                articleNumber: rec.article_number || rec.article_name,
                workerName: rec.worker_name,
                pieces: Number(rec.completed_pieces || rec.completed_quantity || 0),
                taskRef: rec.task_ref,
                status: rec.status
              }
              this.handleIncomingEvent(syntheticEvent, false)
              return
            }
          }

          // Trigger live refresh in listening dashboards
          this.triggerRefresh(mod, true)
        })
      })

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true
          this.updateStatus('connected')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          this.isSubscribed = false
          this.updateStatus('offline')
        }
      })

      this.activeChannel = channel
    } catch (err) {
      console.warn('[FloorRealtime] Channel subscription error:', err)
      this.updateStatus('offline')
    }
  }

  private updateStatus(status: 'connected' | 'connecting' | 'offline') {
    this.connectionStatus = status
    this.statusListeners.forEach(listener => listener(status))
  }

  private handleIncomingEvent(event: FloorRealtimeEvent, shouldBroadcast: boolean = false) {
    if (!event || !event.id) return

    // Save to persistent notification history
    try {
      saveFloorNotification(event)
    } catch (err) {
      console.error('[FloorRealtime] Failed to save notification:', err)
    }

    // Notify registered event listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (e) {
        console.error('[FloorRealtime] Listener error:', e)
      }
    })

    // Also trigger floor re-fetch
    this.triggerRefresh(event.sourceModule, false)

    if (shouldBroadcast) {
      this.broadcast(event)
    }
  }

  private triggerRefresh(sourceModule?: FloorModule, broadcastToTabs: boolean = true) {
    this.refreshListeners.forEach(listener => {
      try {
        listener(sourceModule)
      } catch (e) {
        console.error('[FloorRealtime] Refresh listener error:', e)
      }
    })

    if (broadcastToTabs && this.broadcastBus) {
      try {
        this.broadcastBus.postMessage({ type: 'FLOOR_REFRESH', sourceModule })
      } catch {}
    }
  }

  public async broadcast(event: Omit<FloorRealtimeEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const fullEvent: FloorRealtimeEvent = {
      id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: event.timestamp || new Date().toISOString(),
      ...event
    }

    // 1. Save and notify locally first
    this.handleIncomingEvent(fullEvent, false)

    // 2. Broadcast across local browser tabs
    if (this.broadcastBus) {
      try {
        this.broadcastBus.postMessage({ type: 'FLOOR_EVENT', payload: fullEvent })
      } catch {}
    }

    // 3. Broadcast over Supabase WebSocket channel to remote devices
    if (this.activeChannel) {
      try {
        await this.activeChannel.send({
          type: 'broadcast',
          event: 'floor_activity',
          payload: fullEvent
        })
      } catch (err) {
        console.warn('[FloorRealtime] WebSocket broadcast send failed:', err)
      }
    }

    return fullEvent
  }

  public subscribe(callbacks: {
    onEvent?: FloorEventListener
    onRefresh?: FloorRefreshListener
    onStatus?: (status: 'connected' | 'connecting' | 'offline') => void
  }): () => void {
    const { onEvent, onRefresh, onStatus } = callbacks

    if (onEvent) this.eventListeners.add(onEvent)
    if (onRefresh) this.refreshListeners.add(onRefresh)
    if (onStatus) {
      this.statusListeners.add(onStatus)
      onStatus(this.connectionStatus)
    }

    return () => {
      if (onEvent) this.eventListeners.delete(onEvent)
      if (onRefresh) this.refreshListeners.delete(onRefresh)
      if (onStatus) this.statusListeners.delete(onStatus)
    }
  }

  public getStatus(): 'connected' | 'connecting' | 'offline' {
    return this.connectionStatus
  }
}

// Export singleton helper methods
export const floorRealtime = FloorRealtimeManager.getInstance()

export function broadcastFloorEvent(event: Omit<FloorRealtimeEvent, 'id' | 'timestamp'>): Promise<FloorRealtimeEvent> {
  return floorRealtime.broadcast(event)
}

export function subscribeToFloorEvents(options: {
  companyName?: string
  onEvent?: (event: FloorRealtimeEvent) => void
  onRefresh?: (sourceModule?: FloorModule) => void
  onStatusChange?: (status: 'connected' | 'connecting' | 'offline') => void
}): () => void {
  floorRealtime.init(options.companyName)
  return floorRealtime.subscribe({
    onEvent: options.onEvent,
    onRefresh: options.onRefresh,
    onStatus: options.onStatusChange
  })
}
