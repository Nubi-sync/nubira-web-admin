'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Clock,
  CheckCircle2,
  Play,
  Layers,
  RefreshCw,
  History,
  Briefcase,
  AlertCircle,
  Plus,
  X,
  DollarSign,
  TrendingUp,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { StitchingTaskAllocation, StitchingWorker } from '../../types/stitching'
import {
  getStitchingTaskAllocations,
  getStitchingWorkers,
  updateStitchingTaskStatus,
  recordStitchingSubmission,
  mergeStitchingTaskAllocations,
  STITCHING_UPDATE_EVENT
} from '../../utils/stitchingFloorStorage'
import {
  saveStitchingTaskAllocationAction,
  fetchStitchingTaskAllocationsAction,
  submitStitchingWorkerProgressAction
} from '../../actions'

interface WorkerDashboardClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: StitchingTaskAllocation[]
  initialWorkers?: StitchingWorker[]
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
  const [tasks, setTasks] = useState<StitchingTaskAllocation[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE')
  const [submittingTask, setSubmittingTask] = useState<StitchingTaskAllocation | null>(null)
  const [submitPieces, setSubmitPieces] = useState<string>('50')
  const [rejectPieces, setRejectPieces] = useState<string>('0')
  const [submitNotes, setSubmitNotes] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const reloadData = () => {
    const localTasks = getStitchingTaskAllocations(companyName)
    const merged = mergeStitchingTaskAllocations(initialTasks, localTasks, companyName)
    setTasks(merged)
  }

  useEffect(() => {
    reloadData()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(STITCHING_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(STITCHING_UPDATE_EVENT, reloadData)
      }
    }
  }, [initialTasks, companyName])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const serverTasks = await fetchStitchingTaskAllocationsAction(companyName)
      const localTasks = getStitchingTaskAllocations(companyName)
      const merged = mergeStitchingTaskAllocations(serverTasks || [], localTasks, companyName)
      setTasks(merged)
      toast.success('Workstation updated with latest floor assignments.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Filter tasks assigned to this operator
  const normPhone = (userPhone || '').replace(/\D/g, '').slice(-10)
  const myTasks = tasks.filter(t => {
    const tPhone = (t.worker_phone || '').replace(/\D/g, '').slice(-10)
    if (normPhone && tPhone && tPhone === normPhone) return true
    if (userId && (t.worker_id === userId || (t as any).worker_user_id === userId)) return true
    if (userName && t.worker_name && t.worker_name.toLowerCase() === userName.toLowerCase()) return true
    return false
  })

  // Fallback: If no tasks specifically match, show company tasks for preview
  const displayTasks = myTasks.length > 0 ? myTasks : tasks

  const activeTasks = displayTasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = displayTasks.filter(t => t.status === 'COMPLETED')

  // Calculated stats
  const totalCompletedPieces = displayTasks.reduce((acc, t) => acc + (t.completed_quantity || 0), 0)
  const totalEarningsInr = displayTasks.reduce((acc, t) => acc + ((t.completed_quantity || 0) * (t.piece_rate_inr || 12)), 0)

  const handleStartTask = async (task: StitchingTaskAllocation) => {
    try {
      updateStitchingTaskStatus(task.id, 'IN_PROGRESS', undefined, undefined, companyName)
      await saveStitchingTaskAllocationAction({
        ...task,
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString()
      })
      toast.success(`Operation started for Lot ${task.lot_number}!`)
      reloadData()
    } catch {
      toast.error('Failed to start task.')
    }
  }

  const handleOpenSubmit = (task: StitchingTaskAllocation) => {
    setSubmittingTask(task)
    const remaining = Math.max((task.target_quantity || 0) - (task.completed_quantity || 0), 0)
    setSubmitPieces(String(Math.min(remaining || 50, 100)))
    setRejectPieces('0')
    setSubmitNotes('')
  }

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittingTask) return

    const completedNum = parseInt(submitPieces) || 0
    const rejectNum = parseInt(rejectPieces) || 0

    if (completedNum <= 0 && rejectNum <= 0) {
      toast.error('Please enter at least 1 completed or rejected piece.')
      return
    }

    setIsProcessing(true)

    try {
      const pieceRate = submittingTask.piece_rate_inr || 12
      const totalEarned = completedNum * pieceRate

      // Record in local history
      recordStitchingSubmission({
        id: `sub-${Date.now()}`,
        task_id: submittingTask.id,
        task_ref: submittingTask.task_ref,
        lot_number: submittingTask.lot_number,
        article_name: submittingTask.article_name,
        operation_type: submittingTask.operation_type || 'Full Assembly',
        worker_id: submittingTask.worker_id,
        worker_name: submittingTask.worker_name,
        completed_pieces: completedNum,
        rejected_pieces: rejectNum,
        piece_rate_inr: pieceRate,
        total_earned_inr: totalEarned,
        submitted_at: new Date().toISOString(),
        company_name: companyName,
        notes: submitNotes.trim() || undefined
      }, companyName)

      // Update task quantity in storage
      const newTotalCompleted = (submittingTask.completed_quantity || 0) + completedNum
      const isComplete = newTotalCompleted >= submittingTask.target_quantity
      updateStitchingTaskStatus(
        submittingTask.id,
        isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        newTotalCompleted,
        submitNotes || submittingTask.notes,
        companyName
      )

      // Save to server
      await submitStitchingWorkerProgressAction({
        taskId: submittingTask.id,
        taskRef: submittingTask.task_ref,
        completedPieces: completedNum,
        rejectedPieces: rejectNum,
        workerId: submittingTask.worker_id,
        workerName: submittingTask.worker_name,
        companyName,
        notes: submitNotes
      })

      toast.success(`Logged ${completedNum} pieces (+₹${totalEarned.toLocaleString()})!`)
      setSubmittingTask(null)
      reloadData()
    } catch {
      toast.error('Failed to submit progress.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Workstation Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center font-bold text-base font-mono shadow-2xs">
            {userName ? userName.slice(0, 2).toUpperCase() : 'TA'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {userName || 'Tailor Workstation'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live On Assembly
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Stitching & Sewing Floor Workstation • {companyName || 'Garment MES'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3A3564]' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Quotas'}</span>
          </button>
          <Link
            href="/stitching-sewing/worker/history"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#FAF7F0] hover:bg-slate-100 text-[#3A3564] border border-black/10 shadow-2xs transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Submission Log</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Active Quotas */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Assignments</span>
            <Scissors className="w-4 h-4 text-[#3A3564]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-2 font-mono">
            {activeTasks.length} <span className="text-xs font-normal text-slate-400">lots in queue</span>
          </div>
        </div>

        {/* Card 2: Total Stitched Pieces */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed Output</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-2 font-mono">
            {totalCompletedPieces.toLocaleString()} <span className="text-xs font-normal text-slate-400">pieces</span>
          </div>
        </div>

        {/* Card 3: Completed Lots */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed Lots</span>
            <TrendingUp className="w-4 h-4 text-[#3A3564]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[#3A3564] mt-2 font-mono">
            {completedTasks.length} <span className="text-xs font-normal text-slate-400">batches</span>
          </div>
        </div>

      </div>

      {/* 3. Task Tabs & Cards */}
      <div className="space-y-4">
        
        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'ACTIVE'
                ? 'bg-[#3A3564] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Active Allotments</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20">
              {activeTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'COMPLETED'
                ? 'bg-[#3A3564] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Completed Lots</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 text-slate-700">
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* Task Cards Grid */}
        {(activeTab === 'ACTIVE' ? activeTasks : completedTasks).length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/10 p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto mb-3">
              <Scissors className="w-6 h-6 text-[#3A3564]" />
            </div>
            <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-heading)]">
              {activeTab === 'ACTIVE' ? 'No Active Sewing Tasks in Queue' : 'No Completed Lots Yet'}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'ACTIVE'
                ? 'Your supervisor will assign cutting bundles and operations to your machine shortly.'
                : 'Finished lots with verified piece counts will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'ACTIVE' ? activeTasks : completedTasks).map(t => {
              const percent = t.target_quantity > 0 ? Math.min(Math.round((t.completed_quantity / t.target_quantity) * 100), 100) : 0
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-black/10 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#3A3564]/30 transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-[#FAF7F0] border border-black/10 text-[#3A3564] px-2.5 py-0.5 rounded-md">
                          {t.lot_number}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {t.task_ref}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.status === 'IN_PROGRESS'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Article & Operation */}
                    <div className="mt-3">
                      <h4 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] leading-tight">
                        {t.article_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-medium flex-wrap">
                        <span className="text-[#3A3564] font-semibold">{t.operation_type}</span>
                        <span>•</span>
                        <span className="text-slate-500">{t.machine_type}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-slate-900">
                          {t.completed_quantity} / {t.target_quantity} pcs
                        </span>
                        <span className="text-slate-500">{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percent === 100 ? 'bg-emerald-500' : 'bg-[#3A3564]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-600">
                        {t.source_department || 'Cutting Floor'}
                      </span>
                      <span className="font-mono text-slate-400">
                        {t.target_quantity - t.completed_quantity > 0 
                          ? `${t.target_quantity - t.completed_quantity} pcs remaining`
                          : 'Target completed'}
                      </span>
                    </div>

                    {t.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &ldquo;{t.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {t.status !== 'COMPLETED' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {t.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => handleStartTask(t)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2C274E] transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Sewing Task</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSubmit(t)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Submit Completed Pieces</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Submit Completed Units Modal */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0]">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Log Finished Pieces
                </h3>
                <p className="text-xs text-slate-500">
                  {submittingTask.lot_number} • {submittingTask.article_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmittingTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Finished Pieces Stitched (pcs) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={submitPieces}
                  onChange={(e) => setSubmitPieces(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Rejected / Alteration Units (pcs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={rejectPieces}
                  onChange={(e) => setRejectPieces(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Workstation Notes / Defect Reason
                </label>
                <textarea
                  rows={2}
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  placeholder="e.g. Broken needle replaced on armhole join."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2C274E] rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isProcessing ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
