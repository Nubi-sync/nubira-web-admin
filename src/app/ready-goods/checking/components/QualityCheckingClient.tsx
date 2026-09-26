'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Flame,
  Printer,
  Sparkles,
  ExternalLink,
  Users,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import { FinishingInspectionTask, ReadyGoodsWorker } from '../../types/readyGoods'
import {
  getFinishingInspectionTasks,
  getReadyGoodsWorkers,
  READY_GOODS_UPDATE_EVENT
} from '../../utils/readyGoodsStorage'

interface QualityCheckingClientProps {
  companyName?: string
}

export function QualityCheckingClient({ companyName }: QualityCheckingClientProps) {
  const [tasks, setTasks] = useState<FinishingInspectionTask[]>([])
  const [workers, setWorkers] = useState<ReadyGoodsWorker[]>([])
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PASSED' | 'ALTERATION'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const reloadData = () => {
    setTasks(getFinishingInspectionTasks(companyName))
    setWorkers(getReadyGoodsWorkers(companyName))
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

  // Metrics
  const totalLots = tasks.length
  const pendingLots = tasks.filter(t => t.status === 'PENDING_CHECK' || t.status === 'IN_CHECKING').length
  const passedLots = tasks.filter(t => t.status === 'PASSED_TO_PACKING' || t.status === 'PACKED_IN_CARTON').length
  const alterLots = tasks.filter(t => t.status === 'REJECTED_TO_ALTERATION').length
  const activeCheckers = workers.filter(w => w.role === 'CHECKER' || w.role === 'BOTH').length

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'PENDING' && t.status !== 'PENDING_CHECK' && t.status !== 'IN_CHECKING') return false
    if (statusFilter === 'PASSED' && t.status !== 'PASSED_TO_PACKING' && t.status !== 'PACKED_IN_CARTON') return false
    if (statusFilter === 'ALTERATION' && t.status !== 'REJECTED_TO_ALTERATION') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchesCode = t.task_code.toLowerCase().includes(q)
      const matchesStyle = t.style_name.toLowerCase().includes(q)
      const matchesBuyer = t.buyer.toLowerCase().includes(q)
      return matchesCode || matchesStyle || matchesBuyer
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#3A3564] uppercase tracking-wider mb-1">
            <Scissors className="w-4 h-4" />
            <span>Finishing Floor Quality Inspection Table</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
            Post-Wash & Iron Quality Checking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Incoming garments from Industrial Washing & Steam Pressing audited for Cutting, Printing, Embroidery, Wash, and Ironing precision.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/ready-goods/workers"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-black bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Checkers ({activeCheckers})</span>
          </Link>
          <Link
            href="/ready-goods/worker"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3A3564] hover:bg-[#2A2649] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span>Launch Checker Terminal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <span className="text-xs font-medium text-slate-500 block mb-1">Incoming Lots</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalLots}</span>
          <span className="text-[11px] text-slate-400 block mt-1">From Wash & Pressing</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Pending Inspection</span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-700 font-mono">{pendingLots}</span>
          <span className="text-[11px] text-slate-400 block mt-1">At Checking Tables</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Approved to Pack</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{passedLots}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Passed All 5 Checks</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-black/15">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Alteration Rework</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-extrabold text-rose-700 font-mono">{alterLots}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Mending & Repair</span>
        </div>
      </div>

      {/* Main Inspection Lots Table */}
      <div className="p-4 bg-white rounded-2xl border border-black/15 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Lots ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({pendingLots})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PASSED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'PASSED' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Passed to Packing ({passedLots})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALTERATION')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALTERATION' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              In Alteration ({alterLots})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lot, article, or buyer..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#3A3564]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Lot ID</th>
                <th className="py-3 px-4">Article Style</th>
                <th className="py-3 px-4">Origin Batch</th>
                <th className="py-3 px-4">Tech-Pack Specs</th>
                <th className="py-3 px-4">Verification Checklist</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No inspection lots found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-[#3A3564]">
                      #{task.task_code}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{task.style_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {task.buyer} • {task.pieces_count} pcs ({task.size})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <Waves className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{task.wash_batch_ref}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10.5px] mt-0.5">
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{task.iron_station_ref}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {task.has_printing && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Print
                          </span>
                        )}
                        {task.has_embroidery && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Embroidery
                          </span>
                        )}
                        {!task.has_printing && !task.has_embroidery && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Plain
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className={`px-1 rounded ${task.checklist.cutting_done_right ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          CUT
                        </span>
                        {task.has_printing && (
                          <span className={`px-1 rounded ${task.checklist.printing_done_right ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                            PRN
                          </span>
                        )}
                        {task.has_embroidery && (
                          <span className={`px-1 rounded ${task.checklist.embroidery_done_right ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                            EMB
                          </span>
                        )}
                        <span className={`px-1 rounded ${task.checklist.washing_done_right ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          WSH
                        </span>
                        <span className={`px-1 rounded ${task.checklist.iron_done_right ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          IRN
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {task.status === 'PENDING_CHECK' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending Check
                        </span>
                      )}
                      {task.status === 'IN_CHECKING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          In Inspection
                        </span>
                      )}
                      {task.status === 'PASSED_TO_PACKING' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ready for Packing
                        </span>
                      )}
                      {task.status === 'PACKED_IN_CARTON' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          Packed in Carton
                        </span>
                      )}
                      {task.status === 'REJECTED_TO_ALTERATION' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          In Alteration Clinic
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/ready-goods/worker"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
                      >
                        <span>Audit in Terminal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
