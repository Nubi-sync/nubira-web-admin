'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  ChevronLeft,
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
  ExternalLink,
  TableProperties
} from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker, CuttingTaskAllocation, CuttingAllocationStatus } from '../../types/cutting'
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
}

export function WorkerDashboardClient({
  userEmail,
  userName,
  userPhone
}: WorkerDashboardClientProps) {
  const [workers, setWorkers] = useState<CuttingWorker[]>([])
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('')
  const [tasks, setTasks] = useState<CuttingTaskAllocation[]>([])
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT')
  const [isSyncing, setIsSyncing] = useState(false)

  const reloadData = () => {
    const allWorkers = getCuttingWorkers()
    setWorkers(allWorkers)
    const allTasks = getCuttingTaskAllocations()
    setTasks(allTasks)

    if (allWorkers.length > 0 && !selectedWorkerId) {
      setSelectedWorkerId(allWorkers[0].id)
    }
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

  const handleManualSync = () => {
    setIsSyncing(true)
    reloadData()
    setTimeout(() => {
      setIsSyncing(false)
      toast.success('Tasks synchronized with Head of Department.')
    }, 400)
  }

  // Determine current selected worker
  const activeWorker = workers.find(w => w.id === selectedWorkerId) || (workers.length > 0 ? workers[0] : null)

  // Filter tasks for this worker
  const workerTasks = tasks.filter(t => {
    if (!activeWorker) return false
    return t.worker_id === activeWorker.id || (t.worker_name && t.worker_name.toLowerCase() === activeWorker.worker_name.toLowerCase())
  })

  // Current tasks: ASSIGNED, IN_PROGRESS, WORKER_COMPLETED
  const currentTasks = workerTasks.filter(t => t.status !== 'VERIFIED_COMPLETED')

  // History tasks: VERIFIED_COMPLETED (or past completed jobs)
  const historyTasks = workerTasks.filter(t => t.status === 'VERIFIED_COMPLETED')

  // Summary Metrics
  const totalPiecesCut = historyTasks.reduce((sum, t) => sum + (Number(t.completed_pieces || t.pieces_to_cut) || 0), 0)
  const activePiecesTarget = currentTasks.reduce((sum, t) => sum + (Number(t.pieces_to_cut) || 0), 0)

  // Worker Action 1: Start Cutting
  const handleStartCutting = (taskId: string, taskRef: string) => {
    const updated = updateCuttingTaskStatus(taskId, 'IN_PROGRESS')
    setTasks(updated)
    toast.success(`Task #${taskRef} started! Table is now active.`)
  }

  // Worker Action 2: Mark Complete (Submit for Head of Dept Verification)
  const handleMarkComplete = (taskId: string, taskRef: string) => {
    const updated = updateCuttingTaskStatus(taskId, 'WORKER_COMPLETED')
    setTasks(updated)
    toast.success(`Task #${taskRef} completed! Submitted to Head of Dept for Verification & Sign-Off.`)
  }

  // Format Time
  const formatDeadline = (isoTime: string) => {
    if (!isoTime) return 'End of Shift'
    try {
      const d = new Date(isoTime)
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
        ', ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'End of Shift'
    }
  }

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Breadcrumb & Return to Supervisor Desk */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/cutting"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Cutting &amp; Lay Floor Desk</span>
          </Link>
          <span className="text-slate-400 font-mono text-xs">/</span>
          <span className="text-xs font-mono font-bold text-slate-900">Operator Portal</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Floor Workstation Live
          </span>
        </div>
      </div>

      {/* Operator Identity & Switcher Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-black/10 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#3A3564] text-white flex items-center justify-center font-black text-lg shadow-xs shrink-0">
            {activeWorker ? activeWorker.worker_name.slice(0, 2).toUpperCase() : 'OP'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-[family-name:var(--font-heading)]">
                {activeWorker ? activeWorker.worker_name : 'Cutting Floor Operator'}
              </h1>
              {activeWorker && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                  +91 {activeWorker.phone_number}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {activeWorker?.roles && activeWorker.roles.length > 0 ? (
                activeWorker.roles.map((r, i) => (
                  <span key={i} className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {r.replace(/_/g, ' ')}
                  </span>
                ))
              ) : (
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {activeWorker?.role || 'Knife Cutter'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Worker Switcher & Sync */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          {workers.length > 1 && (
            <div className="flex items-center gap-2 bg-[#FAF7F0] px-3 py-2 rounded-2xl border border-black/10">
              <span className="text-xs font-mono font-bold text-slate-500 whitespace-nowrap">Operator:</span>
              <select
                value={selectedWorkerId}
                onChange={e => setSelectedWorkerId(e.target.value)}
                className="bg-white px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-black/10 text-slate-900 focus:outline-hidden"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.worker_name} (+91 {w.phone_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="p-2.5 rounded-2xl border border-black/10 bg-[#FAF7F0] hover:bg-[#F2ECE1] text-[#3A3564] transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0"
            title="Refresh latest task assignments"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* 2 Big Visual Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Active Target */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Assigned Queue (In-Progress)
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 mt-1">
              {activePiecesTarget.toLocaleString('en-IN')} <span className="text-base font-normal text-slate-500">Pcs</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {currentTasks.length} active cutting jobs allocated
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs shrink-0">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        {/* Total Verified Cut */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Verified Pieces Cut
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-700 mt-1">
              {totalPiecesCut.toLocaleString('en-IN')} <span className="text-base font-normal text-slate-500">Pcs</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {historyTasks.length} jobs verified &amp; completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Content Area with 2 Side Nav Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Nav (Current Work vs History) */}
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-black/10 shadow-2xs space-y-2 lg:sticky lg:top-6">
          <div className="px-3 py-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Workspace Views
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
              {currentTasks.length}
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

        {/* Right Main Panel: Highly Visual Task Cards */}
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
                    Execute fabric plies, start vacuum beds, and submit when finished
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
                    You have no pending tasks in your queue. New assignments from the Head of Department will appear here automatically.
                  </p>
                </div>
              ) : (
                currentTasks.map(task => {
                  const isAssigned = task.status === 'ASSIGNED'
                  const isInProgress = task.status === 'IN_PROGRESS'
                  const isWorkerCompleted = task.status === 'WORKER_COMPLETED' || task.status === 'COMPLETED'

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-3xl border border-black/10 shadow-2xs overflow-hidden transition-all hover:shadow-md"
                    >
                      {/* Task Card Header */}
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
                              Assigned • Ready to Start
                            </span>
                          )}
                          {isInProgress && (
                            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-[#3A3564] border border-indigo-200 text-xs font-mono font-bold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                              Cutting In Progress ({task.table_number || 'Table 01'})
                            </span>
                          )}
                          {isWorkerCompleted && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Completed • Awaiting Head of Dept Sign-Off
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
                          <span className="text-[11px] text-slate-500 font-mono">Automated Cutter Bed</span>
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
                            Due: {formatDeadline(task.due_time)}
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
                            onClick={() => handleStartCutting(task.id, task.task_ref)}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Cutting on {task.table_number || 'Table 01'}</span>
                          </button>
                        )}

                        {isInProgress && (
                          <button
                            type="button"
                            onClick={() => handleMarkComplete(task.id, task.task_ref)}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>✓ Mark as Complete ({task.pieces_to_cut.toLocaleString('en-IN')} Pcs Cut)</span>
                          </button>
                        )}

                        {isWorkerCompleted && (
                          <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>Submitted to Head of Dept • Waiting for final sign-off &amp; piece move</span>
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
                    Past jobs verified and signed off by the Head of Department
                  </p>
                </div>
              </div>

              {historyTasks.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-black/10 shadow-2xs text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-2">
                    <History className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No History Records Yet</h3>
                  <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                    Completed jobs verified by the Head of Department will appear in this history log.
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
