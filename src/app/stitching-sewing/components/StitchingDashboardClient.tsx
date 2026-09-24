'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  Sparkles,
  TrendingUp,
  Store,
  DollarSign,
  AlertCircle,
  PauseCircle,
  RefreshCw,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker, StitchingTaskAllocation, StitchingTaskStatus } from '../types/stitching'
import {
  getStitchingWorkers,
  getStitchingTaskAllocations,
  updateStitchingTaskStatus,
  mergeStitchingTaskAllocations,
  STITCHING_UPDATE_EVENT
} from '../utils/stitchingFloorStorage'
import {
  fetchStitchingWorkersAction,
  fetchStitchingTaskAllocationsAction,
  updateStitchingTaskStatusAction
} from '../actions'
import { AddWorkerModal } from './AddWorkerModal'
import { WorkerListModal } from './WorkerListModal'
import { AddTaskAllocationModal } from './AddTaskAllocationModal'

interface StitchingDashboardClientProps {
  companyName?: string
  initialWorkers?: StitchingWorker[]
  initialTasks?: StitchingTaskAllocation[]
}

export function StitchingDashboardClient({
  companyName,
  initialWorkers = [],
  initialTasks = []
}: StitchingDashboardClientProps) {
  const [workers, setWorkers] = useState<StitchingWorker[]>(initialWorkers)
  const [tasks, setTasks] = useState<StitchingTaskAllocation[]>(initialTasks)
  const [statusFilter, setStatusFilter] = useState<'ALL' | StitchingTaskStatus>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const reloadData = () => {
    const localWorkers = getStitchingWorkers(companyName)
    const localTasks = getStitchingTaskAllocations(companyName)
    
    // Merge workers
    const workerMap = new Map<string, StitchingWorker>()
    initialWorkers.forEach(w => workerMap.set(w.id, w))
    localWorkers.forEach(w => workerMap.set(w.id, w))
    setWorkers(Array.from(workerMap.values()))

    // Merge tasks
    const merged = mergeStitchingTaskAllocations(initialTasks, localTasks, companyName)
    setTasks(merged)
  }

  useEffect(() => {
    reloadData()
    if (typeof window !== 'undefined') {
      window.addEventListener(STITCHING_UPDATE_EVENT, reloadData)
      window.addEventListener('storage', reloadData)
      return () => {
        window.removeEventListener(STITCHING_UPDATE_EVENT, reloadData)
        window.removeEventListener('storage', reloadData)
      }
    }
  }, [initialWorkers, initialTasks, companyName])

  const handleManualRefresh = async () => {
    setIsSyncing(true)
    try {
      const [serverWorkers, serverTasks] = await Promise.all([
        fetchStitchingWorkersAction(companyName),
        fetchStitchingTaskAllocationsAction(companyName)
      ])
      const localWorkers = getStitchingWorkers(companyName)
      const localTasks = getStitchingTaskAllocations(companyName)

      const workerMap = new Map<string, StitchingWorker>()
      ;(serverWorkers || []).forEach(w => workerMap.set(w.id, w))
      localWorkers.forEach(w => workerMap.set(w.id, w))
      setWorkers(Array.from(workerMap.values()))

      const merged = mergeStitchingTaskAllocations(serverTasks || [], localTasks, companyName)
      setTasks(merged)
      toast.success('Stitching floor synchronized with database.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: StitchingTaskStatus) => {
    try {
      updateStitchingTaskStatus(taskId, newStatus, undefined, undefined, companyName)
      await updateStitchingTaskStatusAction(taskId, newStatus)
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}.`)
      reloadData()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  // Derived Metrics
  const totalTargetPieces = tasks.reduce((sum, t) => sum + (t.target_quantity || 0), 0)
  const totalCompletedPieces = tasks.reduce((sum, t) => sum + (t.completed_quantity || 0), 0)
  const totalPieceRateValue = tasks.reduce((sum, t) => sum + ((t.completed_quantity || 0) * (t.piece_rate_inr || 0)), 0)
  const activeTailorsCount = workers.filter(w => w.status === 'ACTIVE').length
  const completionRate = totalTargetPieces > 0 ? Math.round((totalCompletedPieces / totalTargetPieces) * 100) : 0

  const filteredTasks = tasks.filter(t => {
    const matchesSearch =
      t.task_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lot_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.article_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.worker_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.operation_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.machine_type.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false
    if (statusFilter === 'ALL') return true
    return t.status === statusFilter
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto text-[#09090b]">
      
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
            Workspace Hub
          </Link>
          <span>/</span>
          <span>Division 06</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Stitching & Sewing Assembly Floor</span>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#3A3564]' : ''}`} />
          <span className="text-[11px] font-semibold">{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
        </button>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Stitching & Sewing Floor
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#FAF7F0] text-[#3A3564] border border-black/10">
                Division 06 • Standard Floor
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              Live sewing line assembly, operator piece-rate allotments & quality checkpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => setIsWorkerListOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Manage Tailors ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddTaskOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Sewing Task</span>
          </button>
        </div>
      </div>

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Tasks in Queue */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Floor Allocations</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Lots & Bundles
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {tasks.length}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>In-Progress: {tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
            <span>Pending: {tasks.filter(t => t.status === 'PENDING').length}</span>
          </div>
        </div>

        {/* Metric 2: Active Tailors */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Floor Roster</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Tailors
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {activeTailorsCount}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            {workers.length} operators on floor roster
          </div>
        </div>

        {/* Metric 3: Output Pieces */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{completionRate}% Completed</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Assembled Output
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono">
              {totalCompletedPieces.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {totalTargetPieces.toLocaleString()} pcs</span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#3A3564] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: Piece-Rate Value */}
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564]">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Wages & Wages</span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Piece-Rate Value
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-1 font-mono text-[#3A3564]">
              ₹{totalPieceRateValue.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500">
            Across {totalCompletedPieces} verified assembled units
          </div>
        </div>

      </div>

      {/* 4. Main Tasks & Queue Container */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Toolbar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {(['ALL', 'IN_PROGRESS', 'PENDING', 'COMPLETED'] as const).map(tab => {
              const label = tab === 'ALL' ? 'All Allocations' : tab.replace('_', ' ')
              const count = tab === 'ALL' ? tasks.length : tasks.filter(t => t.status === tab).length
              const active = statusFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-xs flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#3A3564] text-white shadow-2xs font-bold'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lot, article, tailor, operation..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                <th className="py-3 px-4">Lot / Task Ref</th>
                <th className="py-3 px-4">Article & Operation</th>
                <th className="py-3 px-4">Assigned Tailor & Machine</th>
                <th className="py-3 px-4">Progress Quota</th>
                <th className="py-3 px-4">Piece Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
                        <Scissors className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                          {searchQuery || statusFilter !== 'ALL' ? 'No Matching Tasks Found' : 'No Sewing Tasks Allocated Yet'}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {searchQuery || statusFilter !== 'ALL'
                            ? 'Try searching with a different term or resetting the status filter.'
                            : 'Click "Assign Sewing Task" above to allocate garment bundles, piece rates, and operations to your tailors.'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setIsAddTaskOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] rounded-xl shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Assign First Sewing Task</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(t => {
                  const percent = t.target_quantity > 0 ? Math.min(Math.round((t.completed_quantity / t.target_quantity) * 100), 100) : 0
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* 1. Lot & Task Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold font-mono text-slate-900 text-xs">
                          {t.lot_number}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {t.task_ref}
                        </div>
                      </td>

                      {/* 2. Article & Operation */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                          {t.article_name}
                        </div>
                        <div className="text-[11px] text-[#3A3564] font-medium mt-0.5 truncate max-w-[200px]">
                          {t.operation_type}
                        </div>
                      </td>

                      {/* 3. Assigned Tailor & Machine */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-xs">
                          {t.worker_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                          {t.machine_type}
                        </div>
                      </td>

                      {/* 4. Progress Quota */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono font-bold text-slate-900">
                            {t.completed_quantity} / {t.target_quantity} pcs
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-slate-500">
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent === 100 ? 'bg-emerald-500' : 'bg-[#3A3564]'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* 5. Piece Rate */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          ₹{t.piece_rate_inr || 12}/pc
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Total: ₹{((t.target_quantity || 0) * (t.piece_rate_inr || 12)).toLocaleString()}
                        </div>
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-3.5 px-4">
                        {t.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                            <Check className="w-3 h-3" />
                            COMPLETED
                          </span>
                        ) : t.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold font-mono">
                            <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                            IN PROGRESS
                          </span>
                        ) : t.status === 'ON_HOLD' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold font-mono">
                            <PauseCircle className="w-3 h-3" />
                            ON HOLD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold font-mono">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* 7. Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status !== 'IN_PROGRESS' && t.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(t.id, 'IN_PROGRESS')}
                              title="Start Work"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {t.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(t.id, 'COMPLETED')}
                              title="Mark Completed"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onSuccess={() => reloadData()}
        companyName={companyName}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddWorker={() => setIsAddWorkerOpen(true)}
        onWorkerDeleted={() => reloadData()}
        companyName={companyName}
      />

      <AddTaskAllocationModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        workers={workers}
        onSuccess={() => reloadData()}
        onOpenAddWorkerModal={() => setIsAddWorkerOpen(true)}
        companyName={companyName}
      />

    </div>
  )
}
