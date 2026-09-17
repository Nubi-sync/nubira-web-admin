'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  Clock,
  CheckCircle2,
  Layers,
  RefreshCw,
  History,
  Briefcase,
  Search,
  ExternalLink,
  Calendar,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { CuttingTaskAllocation, CuttingWorker } from '../../../types/cutting'
import {
  getCuttingTaskAllocations,
  getCuttingWorkers,
  CUTTING_UPDATE_EVENT
} from '../../../utils/cuttingStorage'
import { fetchCuttingTaskAllocationsAction } from '../../../actions'

interface WorkerHistoryClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: CuttingTaskAllocation[]
  initialWorkers?: CuttingWorker[]
}

export function WorkerHistoryClient({
  userEmail,
  userName,
  userPhone,
  userId,
  userRole,
  initialTasks = [],
  initialWorkers = []
}: WorkerHistoryClientProps) {
  const [tasks, setTasks] = useState<CuttingTaskAllocation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Merge server and local task allocations
  const reloadData = () => {
    const localTasks = getCuttingTaskAllocations()
    const taskMap = new Map<string, CuttingTaskAllocation>()

    // Server tasks
    initialTasks.forEach(t => {
      if (t && (t.id || t.task_ref)) {
        const key = t.id || t.task_ref
        taskMap.set(key, t)
      }
    })

    // Local tasks overlay
    localTasks.forEach(t => {
      if (t && (t.id || t.task_ref)) {
        const key = t.id || t.task_ref
        taskMap.set(key, { ...(taskMap.get(key) || {}), ...t })
      }
    })

    setTasks(Array.from(taskMap.values()))
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
  }, [initialTasks])

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      const serverTasks = await fetchCuttingTaskAllocationsAction()
      const localTasks = getCuttingTaskAllocations()
      const taskMap = new Map<string, CuttingTaskAllocation>()
      serverTasks.forEach((t: any) => { if (t?.id || t?.task_ref) taskMap.set(t.id || t.task_ref, t) })
      localTasks.forEach(t => { if (t?.id || t?.task_ref) taskMap.set(t.id || t.task_ref, { ...(taskMap.get(t.id || t.task_ref) || {}), ...t }) })
      setTasks(Array.from(taskMap.values()))
      toast.success('Workstation history updated from cloud database.')
    } catch {
      reloadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Normalized phone
  const normPhone = (userPhone || '').replace(/\D/g, '').slice(-10)

  // 1. Auto-resolve real name if generic
  let displayWorkerName = userName || 'Cutting Operator'
  const isGeneric = (n?: string) => !n || ['floor operator', 'cutting operator', 'cutting floor operator'].includes(n.trim().toLowerCase())

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
          const localWorkers = getCuttingWorkers()
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

  // Normalized resolved real name for strict matching
  const resolvedNormName = !isGeneric(displayWorkerName) ? displayWorkerName.trim().toLowerCase() : ''

  // Filter tasks strictly belonging to THIS logged in operator
  const myTasks = tasks.filter(t => {
    const taskPhoneNorm = (t.worker_phone || '').replace(/\D/g, '').slice(-10)

    // 1. If user has phone and task has phone, phone MUST match
    if (normPhone && taskPhoneNorm) {
      return taskPhoneNorm === normPhone
    }

    // 2. Worker auth id match
    if (userId && t.worker_id === userId) return true

    // 3. Match on exact name only if neither has phone or phones match
    if (resolvedNormName && t.worker_name) {
      if (taskPhoneNorm && normPhone && taskPhoneNorm !== normPhone) return false
      const taskName = t.worker_name.trim().toLowerCase()
      return taskName === resolvedNormName
    }

    return false
  })

  // Strictly show this operator's tasks (or all tasks only if SuperAdmin)
  const isSuperAdmin = userRole === 'PLATFORM_SUPERADMIN' || userRole === 'ADMIN'
  const effectiveTasks = (isSuperAdmin && myTasks.length === 0) ? tasks : myTasks

  // Completed history: VERIFIED_COMPLETED or COMPLETED
  const historyTasks = effectiveTasks.filter(t => t.status === 'VERIFIED_COMPLETED' || t.status === 'COMPLETED')

  // Search filter
  const filteredHistory = historyTasks.filter(t => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (t.task_ref || '').toLowerCase().includes(q) ||
      (t.article_number || '').toLowerCase().includes(q) ||
      (t.buyer_name || '').toLowerCase().includes(q) ||
      (t.table_number || '').toLowerCase().includes(q)
    )
  })

  // Executive Metric Counts
  const totalVerifiedPiecesCut = historyTasks.reduce((sum, t) => sum + (Number(t.completed_pieces || t.pieces_to_cut) || 0), 0)
  const uniqueArticlesCount = new Set(historyTasks.map(t => t.article_number)).size
  const activeAssignmentsCount = effectiveTasks.filter(t => t.status !== 'VERIFIED_COMPLETED' && t.status !== 'COMPLETED').length

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recently'
    try {
      const d = new Date(isoStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Layer 1: Breadcrumb Trail */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Floor Workstation</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Completed History</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cutting/worker"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Active Work ({activeAssignmentsCount})</span>
          </Link>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs cursor-pointer"
            title="Refresh history from cloud database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Layer 2: Encapsulated Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
            <History className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                Completed &amp; Verified History
              </h1>
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs tracking-wider">
                {historyTasks.length} Signed Off
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Garment cutting assignments completed by <strong>{displayWorkerName}</strong> and verified by the Head of Department
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
        
        {/* Metric 1: Verified Pieces */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              OUTPUT
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

        {/* Metric 2: Completed Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              TASKS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Check className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Jobs Signed Off
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {historyTasks.length}
            </div>
          </div>
        </div>

        {/* Metric 3: Unique Articles */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              STYLES
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Layers className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Unique Articles
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 font-[family-name:var(--font-heading)] mt-0.5">
              {uniqueArticlesCount}
            </div>
          </div>
        </div>

        {/* Metric 4: Quality & Handover */}
        <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
              AUDIT
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4 text-[#3A3564]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Sign-Off Desk
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#3A3564] font-[family-name:var(--font-heading)] mt-0.5">
              100% <span className="text-xs font-normal text-slate-500">Verified</span>
            </div>
          </div>
        </div>

      </div>

      {/* Layer 4: Main Content Panel (Full Width, Searchable History Table) */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xs overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0]/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by task #, article style, buyer, station..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:border-[#3A3564]"
            />
          </div>

          <div className="text-xs font-mono text-slate-500">
            Showing <strong>{filteredHistory.length}</strong> of <strong>{historyTasks.length}</strong> archived sign-offs
          </div>
        </div>

        {/* History Table */}
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto mb-2">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? 'No matching history records' : 'No Verified History Records Yet'}
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Once the Head of Department clicks "Verify & Done" on your completed tasks, they will appear in this history archive.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#FAF7F0] text-[#3A3564] font-mono uppercase text-[11px] tracking-wider border-b border-black/10">
                <tr>
                  <th className="py-3 px-4 font-bold"># Task Ref</th>
                  <th className="py-3 px-4 font-bold">Article &amp; Buyer</th>
                  <th className="py-3 px-4 font-bold">Vacuum Station</th>
                  <th className="py-3 px-4 font-bold text-right">Cut Pieces</th>
                  <th className="py-3 px-4 font-bold">Target Time</th>
                  <th className="py-3 px-4 font-bold">Verified Sign-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {filteredHistory.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-black/10 text-[#3A3564]">
                        #{task.task_ref}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{task.article_number}</div>
                      <div className="text-[11px] text-slate-500">{task.buyer_name} • {task.article_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {task.table_number || 'Table 01'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-700">
                      +{task.pieces_to_cut.toLocaleString('en-IN')} Pcs
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {task.alloted_hours} Hours
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verified &amp; Handed Over
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}
