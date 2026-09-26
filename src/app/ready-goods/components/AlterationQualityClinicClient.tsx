'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Wrench,
  ChevronLeft,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Check,
  PackageCheck,
  Bot,
  UserPlus,
  Users,
  Printer,
  Sparkles,
  Waves,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Box
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents } from '@/utils/floorRealtime'
import {
  ReadyGoodsWorker,
  FinishingInspectionTask,
  InspectionTaskStatus
} from '../types/readyGoods'
import {
  getReadyGoodsWorkers,
  getFinishingInspectionTasks,
  updateFinishingInspectionStatus,
  READY_GOODS_UPDATE_EVENT
} from '../utils/readyGoodsStorage'
import { AddWorkerModal } from './AddWorkerModal'
import { WorkerListModal } from './WorkerListModal'
import { InspectLotModal } from './InspectLotModal'

interface AlterationQualityClinicClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  companyName?: string
}

export function AlterationQualityClinicClient({
  userEmail,
  isSuperAdmin = true,
  companyName
}: AlterationQualityClinicClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ALTERATION' | 'PASSED'>('ALL')
  
  // Modals
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)
  const [selectedTaskToInspect, setSelectedTaskToInspect] = useState<FinishingInspectionTask | null>(null)

  const reloadData = () => {
    setWorkers(getReadyGoodsWorkers(companyName))
    setTasks(getFinishingInspectionTasks(companyName))
  }

  useEffect(() => {
    reloadData()

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', reloadData)
      window.addEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      return () => {
        window.removeEventListener('storage', reloadData)
        window.removeEventListener(READY_GOODS_UPDATE_EVENT, reloadData)
      }
    }
  }, [companyName])

  // WebSocket real-time subscription
  useEffect(() => {
    const unsub = subscribeToFloorEvents({
      companyName,
      onRefresh: () => reloadData(),
      onEvent: (event) => {
        reloadData()
        if (event.eventType === 'TASK_ALLOCATED' || event.eventType === 'TASK_VERIFIED') {
          toast.info(event.title, { description: event.message })
        }
      }
    })
    return () => unsub()
  }, [companyName])

  // Metrics (Clean 3-box elements: Title, Icon, Pure Number ONLY)
  const pendingCount = tasks.filter(t => t.status === 'PENDING_CHECK' || t.status === 'IN_CHECKING').length
  const alterationCount = tasks.filter(t => t.status === 'REJECTED_TO_ALTERATION').length
  const passedToPackingCount = tasks.filter(t => t.status === 'PASSED_TO_PACKING').length

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      task.task_code.toLowerCase().includes(q) ||
      task.order_number.toLowerCase().includes(q) ||
      task.buyer.toLowerCase().includes(q) ||
      task.style_name.toLowerCase().includes(q) ||
      task.color.toLowerCase().includes(q) ||
      task.wash_batch_ref.toLowerCase().includes(q) ||
      task.iron_station_ref.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (statusFilter === 'PENDING') {
      return task.status === 'PENDING_CHECK' || task.status === 'IN_CHECKING'
    } else if (statusFilter === 'ALTERATION') {
      return task.status === 'REJECTED_TO_ALTERATION'
    } else if (statusFilter === 'PASSED') {
      return task.status === 'PASSED_TO_PACKING' || task.status === 'PACKED_IN_CARTON'
    }
    return true
  })

  // Mark alteration repaired & return to checking
  const handleMarkRepaired = (taskId: string, taskCode: string) => {
    updateFinishingInspectionStatus(taskId, 'IN_CHECKING', {
      origin_stage: 'REPAIRED_ALTERATION_REINSPECTION',
      defect_notes: 'Repaired by Alteration Master Desk - Ready for re-check'
    })
    toast.success(`Lot #${taskCode} marked repaired! Returned to checking queue.`)
    reloadData()
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
      
      {/* 1. Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <>
              <Link
                href="/modules"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-[#FAF7F0] hover:bg-white text-xs font-mono font-bold text-[#3A3564] transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Workspace Hub</span>
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Division 09 • Quality Clinic &amp; Export Packing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ready-goods/packing"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
          >
            <PackageCheck className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Go to Packing Goods &rarr;</span>
          </Link>
        </div>
      </div>

      {/* 2. Module Title Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Alteration &amp; Quality Clinic
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Post-wash &amp; steam iron inspection, tech-pack criteria verification, defect alteration, and packing clearance
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsWorkerListOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-mono font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>Worker List ({workers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddWorkerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Worker</span>
          </button>

          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Worker Terminal</span>
          </Link>

          <Link
            href="/ready-goods/zigza-ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F0] hover:bg-white border border-black/10 text-xs font-bold text-[#3A3564] transition-colors shadow-2xs"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Zigza AI</span>
          </Link>
        </div>
      </div>

      {/* 3. Summary Metric Boxes (STRICTLY 3 ELEMENTS: Title, Icon, Pure Number) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Box 1: Inspection Queue */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Inspection Queue
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {pendingCount}
          </div>
        </div>

        {/* Box 2: Alteration Rework */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Alteration Rework
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {alterationCount}
          </div>
        </div>

        {/* Box 3: Passed for Packing */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Passed for Packing
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {passedToPackingCount}
          </div>
        </div>

      </div>

      {/* 4. Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by lot #, buyer, style, wash batch, or iron station..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Lots', count: tasks.length },
            { id: 'PENDING', label: 'Pending Check', count: pendingCount },
            { id: 'ALTERATION', label: 'In Alteration', count: alterationCount },
            { id: 'PASSED', label: 'Passed to Packing', count: passedToPackingCount }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Incoming Post-Wash & Iron Quality Checking Lots Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Garments Arriving from Washing &amp; Steam Pressing
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({filteredTasks.length} lots)
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Check &rarr; Approve &rarr; Passes to Packing Goods
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Lot # / Order</th>
                <th className="py-3 px-4">Buyer &amp; Style</th>
                <th className="py-3 px-4">Pieces &amp; Size</th>
                <th className="py-3 px-4">Wash &amp; Iron Origin</th>
                <th className="py-3 px-4">Tech-Pack Criteria</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No garment lots matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isPending = task.status === 'PENDING_CHECK' || task.status === 'IN_CHECKING'
                  const isAlteration = task.status === 'REJECTED_TO_ALTERATION'
                  const isPassed = task.status === 'PASSED_TO_PACKING' || task.status === 'PACKED_IN_CARTON'

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Lot & Order */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#3A3564]">#{task.task_code}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{task.order_number}</div>
                      </td>

                      {/* Buyer & Style */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{task.buyer}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{task.style_name}</div>
                      </td>

                      {/* Pieces & Size */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">{task.pieces_count} pcs</div>
                        <div className="text-[11px] text-slate-500 font-mono">Size {task.size} • {task.color}</div>
                      </td>

                      {/* Wash & Iron Origin */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-800">
                          <Waves className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{task.wash_batch_ref}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{task.iron_station_ref}</span>
                        </div>
                      </td>

                      {/* Tech-Pack Criteria */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 flex-wrap max-w-[240px]">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Cutting
                          </span>
                          {task.has_printing && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono">
                              Printing
                            </span>
                          )}
                          {task.has_embroidery && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono">
                              Embroidery
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Washing
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                            Ironing
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending Check</span>
                          </span>
                        )}
                        {isAlteration && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>In Alteration</span>
                            </span>
                            {task.defect_category && (
                              <div className="text-[10px] font-mono text-rose-600 truncate max-w-[120px]">
                                {task.defect_category}
                              </div>
                            )}
                          </div>
                        )}
                        {isPassed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passed to Packing</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => setSelectedTaskToInspect(task)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Inspect &amp; Verify</span>
                          </button>
                        )}
                        {isAlteration && (
                          <button
                            type="button"
                            onClick={() => handleMarkRepaired(task.id, task.task_code)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Mark Mended</span>
                          </button>
                        )}
                        {isPassed && (
                          <Link
                            href="/ready-goods/packing"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer"
                          >
                            <span>Open Packing &rarr;</span>
                          </Link>
                        )}
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
        companyName={companyName}
        onWorkerAdded={() => reloadData()}
      />

      <WorkerListModal
        isOpen={isWorkerListOpen}
        onClose={() => setIsWorkerListOpen(false)}
        workers={workers}
        onOpenAddModal={() => setIsAddWorkerOpen(true)}
        onWorkersUpdated={() => reloadData()}
      />

      <InspectLotModal
        isOpen={!!selectedTaskToInspect}
        onClose={() => setSelectedTaskToInspect(null)}
        task={selectedTaskToInspect}
        workers={workers}
        companyName={companyName}
        onInspectionCompleted={() => reloadData()}
      />
    </div>
  )
}
