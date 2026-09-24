'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wind,
  Clock,
  CheckCircle2,
  Play,
  RefreshCw,
  History,
  Check,
  Flame,
  Bell
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents, broadcastFloorEvent } from '@/utils/floorRealtime'
import { IronTaskAllocation, IronWorker } from '../../types/iron'
import {
  getIronTaskAllocations,
  updateIronTaskStatus,
  mergeIronTaskAllocations,
  IRON_FLOOR_UPDATE_EVENT
} from '../../utils/ironFloorStorage'
import { saveIronTaskAllocationAction, fetchIronTaskAllocationsAction } from '../../actions'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: IronTaskAllocation[]
  initialWorkers?: IronWorker[]
  companyName?: string
}

export function WorkerDashboardClient({
  userEmail,
  userName,
  userPhone,
  userId,
  userRole,
  initialTasks = [],
  initialWorkers = [],
  companyName
}: WorkerDashboardClientProps) {
  const [tasks, setTasks] = useState<IronTaskAllocation[]>(initialTasks)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'offline'>('offline')

  const reloadData = () => {
    const merged = mergeIronTaskAllocations(initialTasks, companyName)
    setTasks(merged)
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(IRON_FLOOR_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(IRON_FLOOR_UPDATE_EVENT, reloadData)
      }
    }
  }, [initialTasks, companyName])

  // Real-time WebSocket sync & notifications subscription
  useEffect(() => {
    setUnreadCount(getUnreadNotificationCount(companyName, 'iron'))
    const handleNotifUpdate = () => {
      setUnreadCount(getUnreadNotificationCount(companyName, 'iron'))
    }

    if (typeof window !== 'undefined') {
      window.addEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleNotifUpdate)
    }

    const unsub = subscribeToFloorEvents({
      companyName,
      onStatusChange: (status) => setWsStatus(status),
      onRefresh: () => reloadData(),
      onEvent: (event) => {
        reloadData()
        handleNotifUpdate()
        if (event.eventType === 'TASK_ALLOCATED' || event.eventType === 'TASK_VERIFIED') {
          toast.info(event.title, { description: event.message })
        }
      }
    })

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLOOR_NOTIFICATIONS_UPDATE_EVENT, handleNotifUpdate)
      }
      unsub()
    }
  }, [companyName])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const serverTasks = await fetchIronTaskAllocationsAction(companyName)
      const merged = mergeIronTaskAllocations(serverTasks || [], companyName)
      setTasks(merged)
      toast.success('Workstation updated with latest steam pressing assignments.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Filter tasks for this presser
  const phone10 = (userPhone || userEmail?.split('@')[0] || '').replace(/\D/g, '').slice(-10)
  const nameClean = (userName || '').toLowerCase().trim()

  const myTasks = tasks.filter(t => {
    if (userId && t.worker_id === userId) return true
    if (phone10 && t.worker_phone && t.worker_phone.replace(/\D/g, '').slice(-10) === phone10) return true
    if (nameClean && t.worker_name && t.worker_name.toLowerCase().trim() === nameClean) return true
    return false
  })

  // Fallback if not assigned specifically: show active tasks
  const displayTasks = myTasks.length > 0 ? myTasks : tasks.filter(t => t.status !== 'VERIFIED_COMPLETED')

  const activeQueue = displayTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS')
  const completedQueue = displayTasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED_COMPLETED')

  const totalAssignedPieces = displayTasks.reduce((acc, t) => acc + Number(t.pieces_to_press || 0), 0)
  const totalCompletedPieces = completedQueue.reduce((acc, t) => acc + Number(t.completed_pieces || t.pieces_to_press || 0), 0)

  // Handlers for starting and completing pressing cycles
  const handleStartCycle = async (task: IronTaskAllocation) => {
    const updated = updateIronTaskStatus(task.id, 'IN_PROGRESS', {
      started_at: new Date().toISOString()
    })
    setTasks(updated)
    const taskObj = updated.find(t => t.id === task.id || t.task_ref === task.task_ref)
    if (taskObj) {
      await saveIronTaskAllocationAction(taskObj)
    }
    toast.success(`Started pressing run for #${task.task_ref}!`)
  }

  const handleCompleteCycle = async (task: IronTaskAllocation) => {
    const updated = updateIronTaskStatus(task.id, 'COMPLETED', {
      completed_pieces: task.pieces_to_press,
      completed_at: new Date().toISOString()
    })
    setTasks(updated)
    const taskObj = updated.find(t => t.id === task.id || t.task_ref === task.task_ref)
    if (taskObj) {
      await saveIronTaskAllocationAction(taskObj)

      // Broadcast WebSocket floor event
      broadcastFloorEvent({
        eventType: 'PROGRESS_SUBMITTED',
        sourceModule: 'iron',
        title: `Ironing Run Finished: ${taskObj.worker_name || 'Presser'}`,
        message: `${taskObj.worker_name || 'Presser'} steam pressed ${taskObj.pieces_to_press.toLocaleString('en-IN')} pcs of Article ${taskObj.article_number} (Buck ${taskObj.machine_table || 'Table 01'}). Ready for supervisor finish QC.`,
        articleNumber: taskObj.article_number,
        buyerName: taskObj.buyer_name,
        workerName: taskObj.worker_name,
        pieces: taskObj.pieces_to_press,
        companyName
      })
    }
    toast.success(`Completed #${task.task_ref}! Submitted for supervisor verification.`)
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <Wind className="w-6 h-6 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                {userName || 'Iron Presser Workstation'}
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Floor Terminal • {companyName || 'Ironing Floor'} • {displayTasks.length} Assigned Tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time Live Feed Notification Button */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs cursor-pointer"
            title="Open Live Department Feed & Audit Log"
          >
            <Bell className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Live Feed</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black text-white bg-rose-500 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          </button>

          <Link
            href="/iron/worker/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] border border-black/10 text-xs font-mono font-bold transition-all shadow-2xs"
          >
            <History className="w-3.5 h-3.5" />
            <span>Shift History</span>
          </Link>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs"
            title="Sync latest tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-slate-400">
              Active Queue (Target)
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
              {totalAssignedPieces.toLocaleString('en-IN')} pcs
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {activeQueue.length} batches pending
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
            <Clock className="w-6 h-6 text-[#3A3564]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-slate-400">
              Pressed &amp; Handed Over
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
              {totalCompletedPieces.toLocaleString('en-IN')} pcs
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {completedQueue.length} batches processed
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            Floor Workstation Tasks ({activeQueue.length} Active)
          </h2>
        </div>

        {displayTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Wind className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-sm font-bold text-slate-700">No active steam ironing tasks allocated</div>
            <p className="text-xs text-slate-400 mt-1">
              Check back when floor supervisor assigns pressing batches.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map(task => {
              const isAssigned = task.status === 'PENDING'
              const isInProgress = task.status === 'IN_PROGRESS'
              const isCompleted = task.status === 'COMPLETED' || task.status === 'VERIFIED_COMPLETED'

              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 rounded-2xl border border-black/10 bg-[#FAF7F0]/30 hover:bg-[#FAF7F0]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-900">
                        #{task.task_ref}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                        {task.article_number}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {task.buyer_name}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono flex items-center gap-3 flex-wrap">
                      <span>• Table: {task.machine_table || 'Table 01'}</span>
                      <span>• Temp: {task.iron_temp_c ? `${task.iron_temp_c}°C` : '150°C'}</span>
                      <span>• Target: <strong>{task.pieces_to_press.toLocaleString('en-IN')} pcs</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isAssigned && (
                      <button
                        type="button"
                        onClick={() => handleStartCycle(task)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Pressing</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => handleCompleteCycle(task)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{task.status === 'VERIFIED_COMPLETED' ? 'Verified Done' : 'Awaiting Supervisor Sign-off'}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Floor Realtime Notification Side Nav Drawer */}
      <FloorNotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        companyName={companyName}
        currentModule="iron"
      />

    </div>
  )
}
