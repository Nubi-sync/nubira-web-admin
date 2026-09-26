'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PackageCheck,
  ChevronLeft,
  Boxes,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Warehouse,
  ExternalLink,
  Bot,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Wrench
} from 'lucide-react'
import { toast } from 'sonner'
import { subscribeToFloorEvents } from '@/utils/floorRealtime'
import {
  ReadyGoodsWorker,
  FinishingInspectionTask,
  PackingAssignment,
  ReadyGoodsCarton
} from '../../types/readyGoods'
import {
  getReadyGoodsWorkers,
  getFinishingInspectionTasks,
  getPackingAssignments,
  updatePackingAssignmentStatus,
  deletePackingAssignment,
  getReadyGoodsCartons,
  READY_GOODS_UPDATE_EVENT
} from '../../utils/readyGoodsStorage'
import { AddWorkerModal } from '../../components/AddWorkerModal'
import { WorkerListModal } from '../../components/WorkerListModal'
import { AssignPackingModal } from '../../components/AssignPackingModal'

interface PackingGoodsClientProps {
  userEmail?: string
  isSuperAdmin?: boolean
  companyName?: string
}

export function PackingGoodsClient({
  userEmail,
  isSuperAdmin = true,
  companyName
}: PackingGoodsClientProps) {
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [assignments, setAssignments] = useState<PackingAssignment[]>([])
  const [cartons, setCartons] = useState<ReadyGoodsCarton[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PACKING' | 'PACKED' | 'DISPATCHED'>('ALL')

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [isWorkerListOpen, setIsWorkerListOpen] = useState(false)

  const reloadData = () => {
    setWorkers(getReadyGoodsWorkers(companyName))
    setTasks(getFinishingInspectionTasks(companyName))
    setAssignments(getPackingAssignments(companyName))
    setCartons(getReadyGoodsCartons())
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

  // WebSocket sync
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

  // Approved lots passed from QC available to pack
  const passedFromQcTasks = tasks.filter(t => t.status === 'PASSED_TO_PACKING')
  const totalApprovedPcs = passedFromQcTasks.reduce((sum, t) => sum + (t.pieces_count || 0), 0)

  // Active Packers count
  const activePackersCount = workers.filter(w => w.role === 'PACKER' || w.role === 'BOTH').length

  // Total Cartons Packed
  const totalCartonsPacked = assignments
    .filter(a => a.status === 'PACKED_SEALED' || a.status === 'DISPATCHED_TO_GODOWN')
    .reduce((sum, a) => sum + a.cartons_count, 0) || cartons.length

  // Filter assignments
  const filteredAssignments = assignments.filter(asn => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      asn.assignment_code.toLowerCase().includes(q) ||
      asn.order_number.toLowerCase().includes(q) ||
      asn.buyer.toLowerCase().includes(q) ||
      asn.style_name.toLowerCase().includes(q) ||
      asn.packer_worker_name.toLowerCase().includes(q) ||
      asn.carton_prefix.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (statusFilter === 'IN_PACKING') {
      return asn.status === 'ASSIGNED' || asn.status === 'IN_PACKING'
    } else if (statusFilter === 'PACKED') {
      return asn.status === 'PACKED_SEALED'
    } else if (statusFilter === 'DISPATCHED') {
      return asn.status === 'DISPATCHED_TO_GODOWN'
    }
    return true
  })

  const handleMarkPacked = (id: string, code: string) => {
    updatePackingAssignmentStatus(id, 'PACKED_SEALED')
    toast.success(`Assignment #${code} marked as packed & sealed!`)
    reloadData()
  }

  const handleDispatchGodown = (id: string, code: string, bay: string) => {
    updatePackingAssignmentStatus(id, 'DISPATCHED_TO_GODOWN')
    toast.success(`Cartons from #${code} dispatched to Central Godown ${bay}!`)
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
          <Link
            href="/ready-goods"
            className="text-xs font-mono font-bold text-[#3A3564] hover:underline"
          >
            Alteration &amp; Quality Clinic
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Packing Goods
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ready-goods"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F0] border border-black/10 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>&larr; Alteration &amp; Quality Clinic</span>
          </Link>
        </div>
      </div>

      {/* 2. Module Title Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Packing Goods &amp; Carton Allocation
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Assign workers to pack QC-approved garments into export cartons with piece ratio, carton labels, and godown dispatch
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Assign Packing Task</span>
          </button>

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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-[#FAF7F0] text-xs font-mono font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
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
        
        {/* Box 1: Approved for Packing */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Approved for Packing
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {totalApprovedPcs}
          </div>
        </div>

        {/* Box 2: Active Packers */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Packers
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {activePackersCount}
          </div>
        </div>

        {/* Box 3: Cartons Packed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Cartons Packed
            </span>
            <div className="w-10 h-10 rounded-xl border border-black/10 bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center shadow-2xs">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono text-slate-900">
            {totalCartonsPacked}
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
            placeholder="Search by assignment #, buyer, style, packer, or carton barcode..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#3A3564]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-black/10 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Tasks', count: assignments.length },
            { id: 'IN_PACKING', label: 'In Packing', count: assignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PACKING').length },
            { id: 'PACKED', label: 'Packed & Sealed', count: assignments.filter(a => a.status === 'PACKED_SEALED').length },
            { id: 'DISPATCHED', label: 'In Godown', count: assignments.filter(a => a.status === 'DISPATCHED_TO_GODOWN').length }
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

      {/* 5. Active Packing Floor Allocations Table */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Floor Packing Assignments &amp; Master Carton Manifest
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({filteredAssignments.length} assignments)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAssignModalOpen(true)}
            className="text-xs text-[#3A3564] font-bold hover:underline cursor-pointer"
          >
            + New Assignment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-black/10 text-slate-700 font-mono font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Assignment #</th>
                <th className="py-3 px-4">Order &amp; Buyer</th>
                <th className="py-3 px-4">Style &amp; Spec</th>
                <th className="py-3 px-4">Assigned Packer</th>
                <th className="py-3 px-4">Cartons &amp; Pieces</th>
                <th className="py-3 px-4">Godown Bay</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    No packing assignments found. Click "+ Assign Packing Task" above to allocate approved garments.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map(asn => (
                  <tr key={asn.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Assignment Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#3A3564]">#{asn.assignment_code}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Lot: {asn.task_code}</div>
                    </td>

                    {/* Order & Buyer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{asn.buyer}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{asn.order_number}</div>
                    </td>

                    {/* Style & Spec */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[180px]">{asn.style_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Size {asn.size} • {asn.color}</div>
                    </td>

                    {/* Assigned Packer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] font-bold text-[10px]">
                          {asn.packer_worker_name.slice(0, 1)}
                        </div>
                        <span className="font-semibold text-slate-800">{asn.packer_worker_name}</span>
                      </div>
                    </td>

                    {/* Cartons & Pieces */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {asn.cartons_count} Cartons • {asn.pieces_per_carton} pcs/ctn
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700 font-bold">
                        Total: {asn.total_pieces} pcs
                      </div>
                    </td>

                    {/* Godown Bay */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800">
                        {asn.target_godown_bay}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {asn.status === 'IN_PACKING' || asn.status === 'ASSIGNED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>In Packing</span>
                        </span>
                      ) : asn.status === 'PACKED_SEALED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Packed &amp; Sealed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                          <Warehouse className="w-3 h-3" />
                          <span>In Godown</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {(asn.status === 'ASSIGNED' || asn.status === 'IN_PACKING') && (
                        <button
                          type="button"
                          onClick={() => handleMarkPacked(asn.id, asn.assignment_code)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Packed</span>
                        </button>
                      )}

                      {asn.status === 'PACKED_SEALED' && (
                        <button
                          type="button"
                          onClick={() => handleDispatchGodown(asn.id, asn.assignment_code, asn.target_godown_bay)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>Send to Godown</span>
                        </button>
                      )}

                      <span className="text-[11px] font-mono text-slate-400">
                        {asn.carton_numbers[0]}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AssignPackingModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        passedTasks={passedFromQcTasks}
        workers={workers}
        companyName={companyName}
        onAssignmentCreated={() => reloadData()}
      />

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
    </div>
  )
}
