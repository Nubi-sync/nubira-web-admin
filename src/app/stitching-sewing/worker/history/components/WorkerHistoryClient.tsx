'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Scissors,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  DollarSign,
  TrendingUp,
  FileCheck
} from 'lucide-react'
import { StitchingTaskAllocation, StitchingWorker, StitchingSubmissionRecord } from '../../../types/stitching'
import {
  getStitchingTaskAllocations,
  getStitchingSubmissionHistory,
  mergeStitchingTaskAllocations
} from '../../../utils/stitchingFloorStorage'

interface WorkerHistoryClientProps {
  userEmail?: string
  userName?: string
  userPhone?: string
  userId?: string
  userRole?: string
  initialTasks?: StitchingTaskAllocation[]
  initialWorkers?: StitchingWorker[]
  companyName?: string
}

export function WorkerHistoryClient({
  userEmail,
  userName,
  userPhone,
  userId,
  userRole,
  initialTasks = [],
  companyName
}: WorkerHistoryClientProps) {
  const [tasks, setTasks] = useState<StitchingTaskAllocation[]>([])
  const [submissions, setSubmissions] = useState<StitchingSubmissionRecord[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const localTasks = getStitchingTaskAllocations(companyName)
    const merged = mergeStitchingTaskAllocations(initialTasks, localTasks, companyName)
    setTasks(merged)
    setSubmissions(getStitchingSubmissionHistory(companyName))
  }, [initialTasks, companyName])

  const normPhone = (userPhone || '').replace(/\D/g, '').slice(-10)
  const myTasks = tasks.filter(t => {
    const tPhone = (t.worker_phone || '').replace(/\D/g, '').slice(-10)
    if (normPhone && tPhone && tPhone === normPhone) return true
    if (userId && t.worker_id === userId) return true
    if (userName && t.worker_name && t.worker_name.toLowerCase() === userName.toLowerCase()) return true
    return false
  })

  const displayTasks = myTasks.length > 0 ? myTasks : tasks
  const completedTasks = displayTasks.filter(t => t.status === 'COMPLETED')

  const filtered = completedTasks.filter(t =>
    t.task_ref.toLowerCase().includes(search.toLowerCase()) ||
    t.lot_number.toLowerCase().includes(search.toLowerCase()) ||
    t.article_name.toLowerCase().includes(search.toLowerCase()) ||
    t.operation_type.toLowerCase().includes(search.toLowerCase())
  )

  const totalFinishedPieces = completedTasks.reduce((acc, t) => acc + (t.completed_quantity || 0), 0)
  const totalEarnedInr = completedTasks.reduce((acc, t) => acc + ((t.completed_quantity || 0) * (t.piece_rate_inr || 12)), 0)

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/stitching-sewing/worker"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
              Completed Sewing Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Verified finished lots and piece-rate wage log for {userName || 'Tailor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F0] border border-black/10 text-xs">
            <span className="text-slate-500 font-medium">Total Earned: </span>
            <span className="font-bold text-[#3A3564] font-mono text-sm">₹{totalEarnedInr.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Completed Lots</div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-2 font-mono">
            {completedTasks.length}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Verified Assembled Pieces</div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-slate-900 mt-2 font-mono">
            {totalFinishedPieces.toLocaleString()} pcs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/10 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Wages Credited</div>
          <div className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-[#3A3564] mt-2 font-mono">
            ₹{totalEarnedInr.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lot #, article, operation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{filtered.length} archived lots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-[#FAF7F0]">
                <th className="py-3 px-4">Lot / Ref</th>
                <th className="py-3 px-4">Article & Operation</th>
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Pieces Stitched</th>
                <th className="py-3 px-4">Piece Rate</th>
                <th className="py-3 px-4">Total Wage</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-500 font-medium">
                    No completed stitching records found.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.lot_number}
                      <div className="text-[10px] text-slate-400 font-normal">{t.task_ref}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.article_name}</div>
                      <div className="text-[11px] text-[#3A3564]">{t.operation_type}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {t.machine_type}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.completed_quantity} pcs
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      ₹{t.piece_rate_inr || 12}/pc
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#3A3564]">
                      ₹{((t.completed_quantity || 0) * (t.piece_rate_inr || 12)).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        VERIFIED
                      </span>
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
