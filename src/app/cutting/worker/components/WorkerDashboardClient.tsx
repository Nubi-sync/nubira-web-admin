'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Scissors,
  Clock,
  CheckCircle2,
  Play,
  Check,
  Building2,
  Layers,
  Phone,
  ArrowRight,
  RefreshCw,
  History,
  Briefcase,
  AlertCircle,
  ClipboardList,
  User,
  ShieldCheck,
  TableProperties
} from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker, CuttingTaskAllocation } from '../../types/cutting'
import {
  getCuttingWorkers,
  getCuttingTaskAllocations,
  updateCuttingTaskStatus,
  CUTTING_UPDATE_EVENT
} from '../../utils/cuttingStorage'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
}

export function WorkerDashboardClient({
  userEmail,
  userName,
  userPhone,
  userId,
  userRole
}: WorkerDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [tasks, setTasks] = useState<CuttingTaskAllocation[]>([])
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>(
    tabParam === 'history' ? 'HISTORY' : 'CURRENT'
  )
  const [isSyncing, setIsSyncing] = useState(false)

  // Load and refresh task allocations
  const reloadData = () => {
    const allTasks = getCuttingTaskAllocations()
    setTasks(allTasks)
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(CUTTING_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(CUTTING_UPDATE_EVENT, reloadData)
      }
    }
  }, [])

  // Sync tab with URL query parameter
  useEffect(() => {
    if (tabParam === 'history' && activeTab !== 'HISTORY') {
      setActiveTab('HISTORY')
    } else if (tabParam !== 'history' && activeTab === 'HISTORY' && !tabParam) {
      setActiveTab('CURRENT')
    }
  }, [tabParam])

  const handleManualSync = () => {
    setIsSyncing(true)
    reloadData()
    setTimeout(() => {
      setIsSyncing(false)
      toast.success('Workstation updated with latest floor assignments.')
    }, 400)
  }

  // Normalized phone and username for strict user filtering
  const normPhone = (userPhone || '').replace(/\D/g, '').slice(-10)
  const normName = (userName || '').trim().toLowerCase()

  // Filter tasks strictly belonging to THIS logged in operator
  const myTasks = tasks.filter(t => {
    // 1. Phone match
    if (normPhone && t.worker_phone) {
      const taskPhone = t.worker_phone.replace(/\D/g, '').slice(-10)
      if (taskPhone === normPhone) return true
    }
    // 2. Worker name match
    if (normName && t.worker_name) {
      if (t.worker_name.trim().toLowerCase() === normName) return true
    }
    // 3. Worker id match
    if (userId && t.worker_id === userId) return true

    // Fallback: If no strict filter matched because it's local dev preview, show all tasks for this worker
    return false
  })

  // If newly assigned or in local storage without strict phone link, fallback to tasks assigned to this operator name
  const effectiveTasks = myTasks.length > 0 ? myTasks : tasks.filter(t => {
    if (!normName) return true
    return t.worker_name?.toLowerCase().includes(normName)
  })

  // Active current assignments: ASSIGNED, IN_PROGRESS, WORKER_COMPLETED
  const currentTasks = effectiveTasks.filter(t => t.status !== 'VERIFIED_COMPLETED' && t.status !== 'COMPLETED')

  // Completed history: VERIFIED_COMPLETED or COMPLETED
  const historyTasks = effectiveTasks.filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')

  // Executive Metric Counts
  const activeAssignments = currentTasks
  const inReviewCount = effectiveTasks.filter(t => t.status === 'WORKER_COMPLETED').length
  const totalVerifiedPiecesCut = historyTasks.reduce((sum, t) => sum + (Number(t.completed_pieces || t.pieces_to_cut) || 0), 0)
  const activePiecesTarget = currentTasks.reduce((sum, t) => sum + (Number(t.pieces_to_cut) || 0), 0)

  // Worker Action 1: Start Cutting
  const handleStartCutting = (taskId: string, taskRef: string, tableName: string) => {
    const updated = updateCuttingTaskStatus(taskId, 'IN_PROGRESS')
    setTasks(updated)
    toast.success(`Task #${taskRef} started! Table station ${tableName || 'Table 01'} is now active.`)
  }

  // Worker Action 2: Mark Complete (Submit for Head of Dept Verification)
  const handleMarkComplete = (taskId: string, taskRef: string, pieces: number) => {
    const updated = updateCuttingTaskStatus(taskId, 'WORKER_COMPLETED')
    setTasks(updated)
    toast.success(`Task #${taskRef} completed (${pieces.toLocaleString('en-IN')} pcs)! Submitted to Head of Dept for Verification & Sign-Off.`)
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
          <span className="font-bold text-slate-900">
            {activeTab === 'CURRENT' ? 'Active Assignments' : 'Completed History'}
          </span>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Layer 2: Encapsulated Top Header Card (Designer Style) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 shadow-2xs">
            <Scissors className="w-6 h-6 text-[#3A3564]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Welcome, {userName || 'Cutting Operator'}
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                {activeAssignments.length} Active Tasks
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Your assigned garment cutting piece quotas, vacuum table stations, and shift sign-off desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs font-mono font-bold text-[#3A3564] shadow-2xs">
            {userPhone ? `+91 ${userPhone}` : userEmail}
          </span>
        </div>
      </div>

      {/* Layer 3: Executive Metrics Strip (Unified 4-Box Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TASKS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <ClipboardList className="w-4 h-4 text-[#3A3564]" />
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

        {/* Metric 2: Target */}
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
              Pieces to Cut
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
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Verified Pieces Cut
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 font-[family-name:var(--font-heading)] mt-0.5">
              {totalVerifiedPiecesCut.toLocaleString('en-IN')} <span className="text-xs font-normal text-emerald-600">Pcs</span>
            </div>
          </div>
        </div>

      </div>

      {/* Layer 4: Two Side Nav Workstation (Current Work vs Completed History) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Navigation */}
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-black/10 shadow-2xs space-y-2 lg:sticky lg:top-6">
          <div className="px-3 py-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Workstation Views
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('CURRENT')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'CURRENT'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-700 hover:bg-[#FAF7F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Current Work</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'CURRENT' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {activeAssignments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`w-full text-left px-4 py-3.5 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'HISTORY'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'text-slate-700 hover:bg-[#FAF7F0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 shrink-0" />
              <span>Completed History</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'HISTORY' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {historyTasks.length}
            </span>
          </button>
        </div>

        {/* Right Main Panel */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* TAB 1: CURRENT WORK */}
          {activeTab === 'CURRENT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Active Cutting Tasks
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Execute fabric plies, start vacuum tables, and submit when finished
                  </p>
                </div>
              </div>

              {currentTasks.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-black/10 shadow-2xs text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">All Cutting Tasks Cleared</h3>
                  <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                    You have no pending cutting allocations in your queue. New assignments from the Head of Department will appear here.
                  </p>
                </div>
              ) : (
                currentTasks.map(task => {
                  const isAssigned = task.status === 'ASSIGNED'
                  const isInProgress = task.status === 'IN_PROGRESS'
                  const isWorkerCompleted = task.status === 'WORKER_COMPLETED'

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
                            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
                              Assigned • Ready on Floor
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-[#3A3564] border border-indigo-200 text-xs font-mono font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                              Cutting Live ({task.table_number || 'Table 01'})
                            </span>
                          )}
                          {isWorkerCompleted && (
                            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              Completed • In Head Review
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
                            {task.pieces_to_cut.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">Pcs</span>
                          </div>
                        </div>

                        {/* 2. Assigned Table */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Vacuum Station
                          </span>
                          <div className="text-xl font-black font-mono text-[#3A3564] mt-1">
                            {task.table_number || 'Table 01'}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">Cutter Bed Station</span>
                        </div>

                        {/* 3. Alloted Hours & Deadline */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-black/5 flex flex-col justify-between">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#3A3564]" />
                            <span>Target Time</span>
                          </span>
                          <div className="text-xl font-black font-mono text-slate-900 mt-1">
                            {task.alloted_hours} Hours
                          </div>
                          <span className="text-[11px] text-emerald-700 font-mono font-bold">
                            Due: {formatDeadline(task.due_time, task.alloted_hours)}
                          </span>
                        </div>

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
                            onClick={() => handleStartCutting(task.id, task.task_ref, task.table_number)}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Cutting on {task.table_number || 'Table 01'}</span>
                          </button>
                        )}

                        {isInProgress && (
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(task.id, task.task_ref, task.pieces_to_cut)}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>✓ Mark as Complete ({task.pieces_to_cut.toLocaleString('en-IN')} Pcs Cut)</span>
                          </button>
                        )}

                        {isWorkerCompleted && (
                          <div className="text-xs font-mono font-bold text-amber-800 flex items-center gap-2 bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-200">
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
          )}

          {/* TAB 2: COMPLETED HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                    Completed &amp; Verified History
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Past cutting jobs verified and signed off by the Head of Department
                  </p>
                </div>
              </div>

              {historyTasks.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-black/10 shadow-2xs text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-2">
                    <History className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Verified History Records Yet</h3>
                  <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                    Once the Head of Department clicks &quot;Verify &amp; Done&quot; on your completed tasks, they will appear in this history archive.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-black/10 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[11px] tracking-wider border-b border-black/10">
                        <tr>
                          <th className="py-3 px-4 font-bold"># Task Ref</th>
                          <th className="py-3 px-4 font-bold">Article &amp; Buyer</th>
                          <th className="py-3 px-4 font-bold">Station</th>
                          <th className="py-3 px-4 font-bold text-right">Cut Pieces</th>
                          <th className="py-3 px-4 font-bold">Verified Sign-Off</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 font-medium">
                        {historyTasks.map(task => (
                          <tr key={task.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              #{task.task_ref}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              <div className="font-bold text-slate-900">{task.article_number}</div>
                              <div className="text-[11px] text-slate-500">{task.buyer_name}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                              {task.table_number || 'Table 01'}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-700">
                              +{task.pieces_to_cut.toLocaleString('en-IN')} Pcs
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Verified &amp; Handed Over
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
