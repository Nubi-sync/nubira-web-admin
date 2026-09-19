'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Printer,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  RefreshCw,
  History,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { PrintingTaskAllocation, PrintingWorker } from '../../types/printing'
import {
  getPrintingTaskAllocations,
  getPrintingWorkers,
  updatePrintingTaskStatus,
  mergePrintingTaskAllocations,
  PRINTING_FLOOR_UPDATE_EVENT
} from '../../utils/printingFloorStorage'
import { savePrintingTaskAllocationAction, fetchPrintingTaskAllocationsAction } from '../../actions'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: PrintingTaskAllocation[]
  initialWorkers?: PrintingWorker[]
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
  const [tasks, setTasks] = useState<PrintingTaskAllocation[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [now, setNow] = useState<number>(Date.now())

  // Real-time 1-second interval ticker for live print countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Merge server and local task allocations
  const reloadData = () => {
    const localTasks = getPrintingTaskAllocations()
    const merged = mergePrintingTaskAllocations(initialTasks, localTasks)
    setTasks(merged)
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(PRINTING_FLOOR_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(PRINTING_FLOOR_UPDATE_EVENT, reloadData)
      }
    }
  }, [initialTasks])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const companyFilter = companyName
      const serverTasks = await fetchPrintingTaskAllocationsAction(companyFilter)
      const localTasks = getPrintingTaskAllocations()
      const merged = mergePrintingTaskAllocations(serverTasks || [], localTasks)
      setTasks(merged)
      toast.success('Workstation updated with latest printing assignments.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Normalized phone
  const normPhone = (userPhone || '').replace(/\D/g, '').slice(-10)

  // Auto-resolve real name if generic
  let displayWorkerName = userName || 'Printing Operator'
  const isGeneric = (n?: string) => !n || ['floor operator', 'printing operator', 'printing floor operator'].includes(n.trim().toLowerCase())

  if (isGeneric(userName)) {
    const foundFromTask = tasks.find(t => {
      if (normPhone && t.worker_phone) {
        const tp = t.worker_phone.replace(/\D/g, '').slice(-10)
        if (tp === normPhone) return true
      }
      if (userId && t.worker_id === userId) return true
      return false
    })

    if (foundFromTask?.worker_name) {
      displayWorkerName = foundFromTask.worker_name
    } else {
      let foundWorker = initialWorkers.find(w => {
        if (normPhone && w.phone_number) {
          const wp = w.phone_number.replace(/\D/g, '').slice(-10)
          if (wp === normPhone) return true
        }
        if (userId && (w.worker_user_id === userId || w.id === userId)) return true
        return false
      })

      if (!foundWorker) {
        try {
          const localWorkers = getPrintingWorkers()
          foundWorker = localWorkers.find(w => {
            if (normPhone && w.phone_number) {
              const wp = w.phone_number.replace(/\D/g, '').slice(-10)
              if (wp === normPhone) return true
            }
            if (userId && (w.worker_user_id === userId || w.id === userId)) return true
            return false
          })
        } catch (_) {}
      }

      if (foundWorker?.worker_name) {
        displayWorkerName = foundWorker.worker_name
      }
    }
  }

  const resolvedNormName = !isGeneric(displayWorkerName) ? displayWorkerName.trim().toLowerCase() : ''

  // Filter tasks strictly belonging to THIS logged in operator
  const myTasks = tasks.filter(t => {
    const taskPhoneNorm = (t.worker_phone || '').replace(/\D/g, '').slice(-10)

    if (normPhone && taskPhoneNorm) {
      return taskPhoneNorm === normPhone
    }

    if (userId && t.worker_id === userId) return true

    if (resolvedNormName && t.worker_name) {
      if (taskPhoneNorm && normPhone && taskPhoneNorm !== normPhone) return false
      const taskName = t.worker_name.trim().toLowerCase()
      return taskName === resolvedNormName
    }

    return false
  })

  const isSuperAdmin = userRole === 'PLATFORM_SUPERADMIN' || userRole === 'ADMIN'
  const effectiveTasks = (isSuperAdmin && myTasks.length === 0) ? tasks : myTasks

  const currentTasks = effectiveTasks.filter(t => t.status !== 'VERIFIED_COMPLETED' && t.status !== 'COMPLETED')
  const historyTasks = effectiveTasks.filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')

  // Executive Metric Counts
  const activeAssignments = currentTasks
  const inReviewCount = effectiveTasks.filter(t => t.status === 'WORKER_COMPLETED').length
  const totalVerifiedPiecesPrinted = historyTasks.reduce((sum, t) => sum + (Number(t.completed_pieces || t.pieces_to_print) || 0), 0)
  const activePiecesTarget = currentTasks.reduce((sum, t) => sum + (Number(t.pieces_to_print) || 0), 0)

  // Real-time Countdown Calculator
  const getRemainingTime = (dueIso?: string, allotedHours = 4, startedIso?: string) => {
    if (!dueIso && !startedIso) {
      const totalSecs = Math.round(allotedHours * 3600)
      const h = Math.floor(totalSecs / 3600)
      const m = Math.floor((totalSecs % 3600) / 60)
      const s = totalSecs % 60
      return {
        formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        isExpired: false,
        totalSecondsLeft: totalSecs
      }
    }

    const dueTime = dueIso ? new Date(dueIso).getTime() : (new Date(startedIso!).getTime() + allotedHours * 3600 * 1000)
    const diffMs = dueTime - now

    if (diffMs <= 0) {
      return {
        formatted: '00:00:00',
        isExpired: true,
        totalSecondsLeft: 0
      }
    }

    const diffSecs = Math.floor(diffMs / 1000)
    const h = Math.floor(diffSecs / 3600)
    const m = Math.floor((diffSecs % 3600) / 60)
    const s = diffSecs % 60

    return {
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
      isExpired: false,
      totalSecondsLeft: diffSecs
    }
  }

  // Worker Action 1: Start Printing (Starts countdown timer)
  const handleStartPrinting = async (taskId: string, taskRef: string, tableName?: string, allotedHours = 4) => {
    const startedAt = new Date().toISOString()
    const dueTime = new Date(Date.now() + (allotedHours || 4) * 3600 * 1000).toISOString()
    const existingTask = tasks.find(t => t.id === taskId || t.task_ref === taskRef)

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId || t.task_ref === taskRef) {
        return {
          ...t,
          status: 'IN_PROGRESS' as const,
          started_at: startedAt,
          due_time: dueTime,
          table_number: tableName || t.table_number || 'Print Table 01',
          updated_at: new Date().toISOString()
        }
      }
      return t
    })
    setTasks(updatedTasks)

    updatePrintingTaskStatus(taskId, 'IN_PROGRESS', {
      task: existingTask,
      started_at: startedAt,
      due_time: dueTime,
      table_number: tableName || existingTask?.table_number || 'Print Table 01'
    })

    const taskObj = updatedTasks.find(t => t.id === taskId || t.task_ref === taskRef)
    if (taskObj) {
      await savePrintingTaskAllocationAction(taskObj)
    }

    toast.success(`Task #${taskRef} started! ${allotedHours} hr printing countdown timer is running on ${tableName || 'Print Table 01'}.`)
  }

  // Worker Action 2: Finish Work (Submits for Head of Dept Verification)
  const handleFinishWork = async (taskId: string, taskRef: string, pieces: number) => {
    const existingTask = tasks.find(t => t.id === taskId || t.task_ref === taskRef)

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId || t.task_ref === taskRef) {
        return {
          ...t,
          status: 'WORKER_COMPLETED' as const,
          completed_pieces: pieces,
          updated_at: new Date().toISOString()
        }
      }
      return t
    })
    setTasks(updatedTasks)

    updatePrintingTaskStatus(taskId, 'WORKER_COMPLETED', {
      task: existingTask,
      completed_pieces: pieces
    })

    const taskObj = updatedTasks.find(t => t.id === taskId || t.task_ref === taskRef)
    if (taskObj) {
      await savePrintingTaskAllocationAction(taskObj)
    }

    toast.success(`Work finished for Task #${taskRef} (${pieces.toLocaleString('en-IN')} pcs)! Submitted to Head of Dept for Verification.`)
  }

  // Format Time
  const formatDeadline = (isoTime: string, allotedHours: number) => {
    if (!isoTime) return `${allotedHours} Hrs Target`
    try {
      const d = new Date(isoTime)
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
        ', ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return `${allotedHours} Hrs Target`
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Layer 1: Breadcrumb Hierarchy Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Floor Workstation</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Active Assignments</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/printing/worker/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Completed History ({historyTasks.length})</span>
          </Link>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
            title="Refresh floor assignments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Layer 2: Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <Printer className="w-6 h-6 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Welcome, {displayWorkerName}
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {userRole ? userRole.replace(/_/g, ' ') : 'Printing Floor Operator'}
              </span>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-slate-900 border border-black/10 shadow-2xs tracking-wider">
                {activeAssignments.length} Active Tasks
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Your assigned garment print quotas, table/carousel stations, and shift sign-off desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            {userPhone ? `+91 ${userPhone}` : userEmail}
          </span>
        </div>
      </div>

      {/* Layer 3: Executive Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Active Jobs */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TASKS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Briefcase className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Active Jobs
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {activeAssignments.length}
            </div>
          </div>
        </div>

        {/* Metric 2: Total Pieces Assigned */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TARGET
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Pieces to Print
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {activePiecesTarget.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pcs</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Stage 02 In Head Review */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              STAGE 02
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              In Head Review
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {inReviewCount}
            </div>
          </div>
        </div>

        {/* Metric 4: Cleared & Verified */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              CLEARED
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Verified Pieces Printed
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {totalVerifiedPiecesPrinted.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pcs</span>
            </div>
          </div>
        </div>

      </div>

      {/* Layer 4: Main Active Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Active Printing Tasks
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Execute screen print tables, start carousels, and submit when finished
            </p>
          </div>
        </div>

        {currentTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-black/10 shadow-2xs text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <CheckCircle2 className="w-7 h-7 text-[#3A3564]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">All Printing Tasks Cleared</h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              You have no pending print allocations in your queue. New assignments from the Head of Department will appear here.
            </p>
          </div>
        ) : (
          currentTasks.map(task => {
            const isAssigned = task.status === 'ASSIGNED'
            const isInProgress = task.status === 'IN_PROGRESS'
            const isWorkerCompleted = task.status === 'WORKER_COMPLETED'
            const remaining = getRemainingTime(task.due_time, task.alloted_hours, task.started_at)

            return (
              <div
                key={task.id}
                className="bg-white rounded-3xl border border-black/10 shadow-2xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Task Header */}
                <div className="p-5 sm:p-6 border-b border-black/10 bg-[#FAF7F0]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm px-3 py-1 rounded-xl bg-white border border-black/10 text-[#3A3564] shadow-2xs">
                      #{task.task_ref}
                    </span>
                    <div>
                      <div className="font-mono font-black text-base text-slate-900">
                        {task.article_number}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {task.buyer_name} • {task.article_name}
                      </div>
                    </div>
                  </div>

                  {/* Live Status Badge */}
                  <div>
                    {isAssigned && (
                      <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Assigned • Ready on Floor
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-3 py-1 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 text-xs font-mono font-bold flex items-center gap-2 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-[#3A3564] animate-ping" />
                        <span>Printing Live ({task.table_number || 'Print Table 01'}) • {remaining.formatted}</span>
                      </span>
                    )}
                    {isWorkerCompleted && (
                      <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Pending Dept Head Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Body Grid */}
                <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white">
                  
                  {/* 1. Target Pieces */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Target Pieces
                    </span>
                    <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                      {task.pieces_to_print.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pcs</span>
                    </div>
                  </div>

                  {/* 2. Assigned Station */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Print Station
                    </span>
                    <div className="text-xl font-black font-mono text-[#3A3564] mt-1">
                      {task.table_number || 'Print Table 01'}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Floor Machine Station</span>
                  </div>

                  {/* 3. Alloted Hours & Live Countdown Timer */}
                  {isInProgress ? (
                    <div className="p-4 rounded-2xl bg-[#FAF7F0]/80 border border-black/10 flex flex-col justify-between shadow-2xs">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-[#3A3564] animate-spin" />
                        <span>Timer Remaining</span>
                      </span>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 flex items-baseline gap-1.5">
                        <span>{remaining.formatted}</span>
                        <span className="text-xs font-normal text-slate-500 font-sans">Left</span>
                      </div>
                      <span className="text-[11px] text-slate-900 font-mono font-bold">
                        Target: {task.alloted_hours} Hrs • Due: {formatDeadline(task.due_time, task.alloted_hours)}
                      </span>
                    </div>
                  ) : isWorkerCompleted ? (
                    <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3A3564]" />
                        <span>Shift Status</span>
                      </span>
                      <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
                        {task.alloted_hours} Hours
                      </div>
                      <span className="text-[11px] text-amber-800 font-mono font-bold">
                        Work Finished • Pending Sign-Off
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3A3564]" />
                        <span>Target Time</span>
                      </span>
                      <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1">
                        {task.alloted_hours} Hours
                      </div>
                      <span className="text-[11px] text-slate-900 font-mono font-bold">
                        Due: {formatDeadline(task.due_time, task.alloted_hours)}
                      </span>
                    </div>
                  )}

                </div>

                {/* Shift Notes if any */}
                {task.notes && (
                  <div className="px-6 py-2.5 bg-amber-50/40 border-t border-black/5 text-xs text-amber-900 font-mono flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Instructions: {task.notes}</span>
                  </div>
                )}

                {/* Action Bar */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-t border-black/10 flex items-center justify-end gap-3">
                  {isAssigned && (
                    <button
                      type="button"
                      onClick={() => handleStartPrinting(task.id, task.task_ref, task.table_number, task.alloted_hours)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Printing on {task.table_number || 'Print Table 01'}</span>
                    </button>
                  )}

                  {isInProgress && (
                    <button
                      type="button"
                      onClick={() => handleFinishWork(task.id, task.task_ref, task.pieces_to_print)}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>✓ Finish Work ({task.pieces_to_print.toLocaleString('en-IN')} Pcs Printed)</span>
                    </button>
                  )}

                  {isWorkerCompleted && (
                    <div className="text-xs font-mono font-bold text-amber-900 flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200 shadow-2xs">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Submitted to Head of Dept • Awaiting Verification &amp; Sign-Off</span>
                    </div>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>

    </div>
  )
}
