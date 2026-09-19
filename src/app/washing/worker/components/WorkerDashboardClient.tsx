'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Waves,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  RefreshCw,
  History,
  Briefcase,
  AlertCircle,
  Cpu,
  User,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { WashingTaskAllocation, WashingWorker } from '../../types/washing'
import {
  getWashingTaskAllocations,
  getWashingWorkers,
  updateWashingTaskStatus,
  mergeWashingTaskAllocations,
  WASHING_FLOOR_UPDATE_EVENT
} from '../../utils/washingFloorStorage'
import { saveWashingTaskAllocationAction, fetchWashingTaskAllocationsAction } from '../../actions'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: WashingTaskAllocation[]
  initialWorkers?: WashingWorker[]
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
  const [tasks, setTasks] = useState<WashingTaskAllocation[]>(initialTasks)
  const [isSyncing, setIsSyncing] = useState(false)
  const [now, setNow] = useState<number>(Date.now())
  const [selectedTask, setSelectedTask] = useState<WashingTaskAllocation | null>(null)
  const [activeTab, setActiveTab] = useState<'TASKS' | 'KPI'>('TASKS')

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const reloadData = () => {
    const merged = mergeWashingTaskAllocations(initialTasks, companyName)
    setTasks(merged)
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(WASHING_FLOOR_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(WASHING_FLOOR_UPDATE_EVENT, reloadData)
      }
    }
  }, [initialTasks, companyName])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const serverTasks = await fetchWashingTaskAllocationsAction(companyName)
      const merged = mergeWashingTaskAllocations(serverTasks || [], companyName)
      setTasks(merged)
      toast.success('Workstation updated with latest washing assignments.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Filter tasks for this worker
  const phone10 = (userPhone || userEmail?.split('@')[0] || '').replace(/\D/g, '').slice(-10)
  const nameClean = (userName || '').toLowerCase().trim()

  const myTasks = tasks.filter(t => {
    if (userId && t.worker_id === userId) return true
    if (phone10 && t.worker_phone && t.worker_phone.replace(/\D/g, '').slice(-10) === phone10) return true
    if (nameClean && t.worker_name && t.worker_name.toLowerCase().trim() === nameClean) return true
    return false
  })

  // Fallback if not assigned specifically: show active washing tasks
  const displayTasks = myTasks.length > 0 ? myTasks : tasks.filter(t => t.status !== 'VERIFIED_COMPLETED')

  const activeQueue = displayTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
  const completedQueue = displayTasks.filter(t => t.status === 'WORKER_COMPLETED' || t.status === 'VERIFIED_COMPLETED')

  const totalAssignedPieces = displayTasks.reduce((acc, t) => acc + Number(t.pieces_to_wash || 0), 0)
  const totalCompletedPieces = completedQueue.reduce((acc, t) => acc + Number(t.completed_pieces || t.pieces_to_wash || 0), 0)

  // Handlers for starting and completing washing cycles
  const handleStartCycle = async (task: WashingTaskAllocation) => {
    const updated = updateWashingTaskStatus(task.id, 'IN_PROGRESS', {
      started_at: new Date().toISOString()
    })
    setTasks(updated)
    const taskObj = updated.find(t => t.id === task.id || t.task_ref === task.task_ref)
    if (taskObj) {
      await saveWashingTaskAllocationAction(taskObj)
    }
    toast.success(`Started wash cycle for #${task.task_ref}!`)
  }

  const handleCompleteCycle = async (task: WashingTaskAllocation) => {
    const updated = updateWashingTaskStatus(task.id, 'WORKER_COMPLETED', {
      completed_pieces: task.pieces_to_wash,
      completed_at: new Date().toISOString()
    })
    setTasks(updated)
    const taskObj = updated.find(t => t.id === task.id || t.task_ref === task.task_ref)
    if (taskObj) {
      await saveWashingTaskAllocationAction(taskObj)
    }
    toast.success(`Completed #${task.task_ref}! Submitted for supervisor verification.`)
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                {userName || 'Washing Operator Workstation'}
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Terminal
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Floor Terminal • {companyName || 'Washing Floor'} • {displayTasks.length} Assigned Tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/washing/worker/history"
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
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-slate-400">
              Washed &amp; Handed Over
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
            <Waves className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <div className="text-sm font-bold text-slate-700">No active washing tasks allocated</div>
            <p className="text-xs text-slate-400 mt-1">
              Check back when floor supervisor assigns wash batches.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTasks.map(task => {
              const isAssigned = task.status === 'ASSIGNED'
              const isInProgress = task.status === 'IN_PROGRESS'
              const isCompleted = task.status === 'WORKER_COMPLETED' || task.status === 'VERIFIED_COMPLETED'

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
                      <span>• Unit: {task.table_number || 'Washer 01'}</span>
                      <span>• Recipe: {task.wash_recipe || 'Bio-Enzyme Wash 55°C'}</span>
                      <span>• Target: <strong>{task.pieces_to_wash.toLocaleString('en-IN')} pcs</strong></span>
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
                        <span>Start Wash</span>
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

    </div>
  )
}
