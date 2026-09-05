'use client'

import React from 'react'
import { 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Gauge, 
  Scissors, 
  Layers, 
  ArrowRightLeft,
  Calendar
} from 'lucide-react'

export type WorkerAssignmentItem = {
  id: string
  allotment_id?: string
  lineman_id?: string
  article_id?: string
  worker_name: string
  assigned_qty: number
  completed_qty?: number
  color?: string
  size?: string
  operation_name?: string
  status?: string
  notes?: string | null
  assigned_at?: string | null
  completed_at?: string | null
  entry_date?: string | null
}

interface WorkerAssignmentsTableProps {
  assignments: WorkerAssignmentItem[]
  stitchingRate?: number | string
  targetQty?: number
}

export function WorkerAssignmentsTable({
  assignments,
  stitchingRate = 0,
  targetQty = 0
}: WorkerAssignmentsTableProps) {
  const rateNum = Number(stitchingRate) || 0

  if (!assignments || assignments.length === 0) {
    return (
      <div className="py-8 px-4 text-center bg-white rounded-xl border border-black/10 shadow-2xs space-y-2">
        <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 mx-auto flex items-center justify-center shadow-2xs">
          <User className="w-5 h-5 text-[#3A3564]" />
        </div>
        <p className="text-xs font-bold text-slate-800">No Tailor Operations Assigned Yet</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
          The Lineman Supervisor has not assigned worker batches from the sewing floor app for this article yet.
        </p>
      </div>
    )
  }

  // Calculate Metrics
  const uniqueWorkers = Array.from(new Set(assignments.map(a => a.worker_name?.trim()).filter(Boolean)))
  const totalAssignedPcs = assignments.reduce((sum, a) => sum + (Number(a.assigned_qty) || 0), 0)
  const totalCompletedPcs = assignments.reduce((sum, a) => {
    const isDone = a.status === 'DONE'
    const cQty = a.completed_qty !== undefined && a.completed_qty !== null 
      ? Number(a.completed_qty) 
      : (isDone ? Number(a.assigned_qty) : 0)
    return sum + cQty
  }, 0)

  const progressPercent = totalAssignedPcs > 0 
    ? Math.min(Math.round((totalCompletedPcs / totalAssignedPcs) * 100), 100) 
    : 0

  const totalWages = totalCompletedPcs * rateNum

  // Helper: Format Time (e.g. 09:30 AM, 05 Sep)
  const formatTime = (iso?: string | null) => {
    if (!iso) return '-'
    try {
      const d = new Date(iso)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return '-'
    }
  }

  // Helper: Calculate Duration
  const calculateDuration = (startIso?: string | null, endIso?: string | null, status?: string) => {
    if (!startIso) return '-'
    try {
      const start = new Date(startIso).getTime()
      if (isNaN(start)) return '-'

      let end = endIso ? new Date(endIso).getTime() : 0
      if (!end || isNaN(end)) {
        if (status === 'DONE') {
          return 'Completed'
        }
        end = Date.now()
      }

      const diffMs = end - start
      if (diffMs <= 0) return '< 1 min'

      const totalMins = Math.floor(diffMs / (1000 * 60))
      const hours = Math.floor(totalMins / 60)
      const mins = totalMins % 60

      if (hours === 0) {
        return `${mins}m`
      }
      return `${hours}h ${mins}m`
    } catch {
      return '-'
    }
  }

  // Helper: Parse Station & Borrowed from Notes
  const parseOperationDetails = (notesStr?: string | null, defaultOp?: string) => {
    const raw = notesStr || ''
    let station = defaultOp || 'STITCHING'
    let isBorrowed = false
    let borrowedFrom = ''

    if (raw.includes('[OVERLOCK]')) station = 'OVERLOCK'
    else if (raw.includes('[FIVE_THREAD]')) station = '5-THREAD SAFETY'
    else if (raw.includes('[FLATLOCK]')) station = 'FLATLOCK / RIB'
    else if (raw.includes('[LOCKING]')) station = 'LOCKING / SINGLE'

    if (raw.includes('[BORROWED:')) {
      isBorrowed = true
      const match = raw.match(/\[BORROWED:\s*(.*?)\]/)
      if (match && match[1]) borrowedFrom = match[1]
    }

    return { station, isBorrowed, borrowedFrom }
  }

  return (
    <div className="space-y-3">
      {/* 1. Tailor Operations KPI Summary Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
            Active Tailors
          </span>
          <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#3A3564]" />
            <span>{uniqueWorkers.length} Tailors</span>
            <span className="text-[10.5px] font-normal text-slate-400">({assignments.length} batches)</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
            Total Completed
          </span>
          <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalCompletedPcs.toLocaleString()} / {totalAssignedPcs.toLocaleString()} pcs</span>
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
            Floor Progress
          </span>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  progressPercent >= 100 ? 'bg-emerald-500' : 'bg-[#3A3564]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono font-bold text-xs text-slate-700">{progressPercent}%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-white border border-black/10 shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
            Earned Piece-Rate
          </span>
          <p className="text-sm font-extrabold text-emerald-700 mt-0.5 font-mono">
            {rateNum > 0 ? `₹${totalWages.toLocaleString()}` : 'Rate not set'}
            {rateNum > 0 && <span className="text-[10px] text-slate-400 font-normal ml-1">(₹{rateNum}/pc)</span>}
          </p>
        </div>
      </div>

      {/* 2. Interactive Tailor Assignment Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F0] border-b border-black/10 text-[#3A3564]">
              <th className="py-2.5 px-3.5 font-extrabold uppercase tracking-wider text-slate-700 min-w-[150px]">
                Tailor / Worker
              </th>
              <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-slate-700 min-w-[120px]">
                Machine Station
              </th>
              <th className="py-2.5 px-3 font-extrabold uppercase tracking-wider text-slate-700 min-w-[130px]">
                Color & Size
              </th>
              <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-[#3A3564] min-w-[100px]">
                Output / Target
              </th>
              <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-slate-700 min-w-[90px]">
                Assigned At
              </th>
              <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-slate-700 min-w-[90px]">
                Completed At
              </th>
              <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-[#3A3564] min-w-[85px]">
                Duration
              </th>
              <th className="py-2.5 px-3 text-center font-extrabold uppercase tracking-wider text-slate-700 min-w-[80px]">
                Status
              </th>
              {rateNum > 0 && (
                <th className="py-2.5 px-3.5 text-right font-extrabold uppercase tracking-wider text-emerald-800 min-w-[85px]">
                  Wages
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((ass) => {
              const { station, isBorrowed, borrowedFrom } = parseOperationDetails(ass.notes, ass.operation_name)
              const isDone = ass.status === 'DONE'
              const aQty = Number(ass.assigned_qty) || 0
              const cQty = ass.completed_qty !== undefined && ass.completed_qty !== null 
                ? Number(ass.completed_qty) 
                : (isDone ? aQty : 0)
              
              const batchPercent = aQty > 0 ? Math.min(Math.round((cQty / aQty) * 100), 100) : 0
              const durationStr = calculateDuration(ass.assigned_at, ass.completed_at, ass.status)
              const batchWage = cQty * rateNum

              return (
                <tr key={ass.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Worker Name & Borrowed Tag */}
                  <td className="py-2.5 px-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10.5px] text-slate-700 shrink-0">
                        {ass.worker_name ? ass.worker_name.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 truncate block">
                          {ass.worker_name || 'Unassigned Worker'}
                        </span>
                        {isBorrowed && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5">
                            <ArrowRightLeft className="w-2.5 h-2.5 shrink-0" />
                            <span>{borrowedFrom || 'Other Line'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Machine Operation Badge */}
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      <Scissors className="w-3 h-3 text-slate-500" />
                      <span>{station}</span>
                    </span>
                  </td>

                  {/* Color & Size Variant */}
                  <td className="py-2.5 px-3">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-[#3A3564] shrink-0" />
                      <span className="truncate max-w-[90px]">{ass.color || 'Standard'}</span>
                      {ass.size && <span className="text-[#3A3564]">({ass.size})</span>}
                    </div>
                  </td>

                  {/* Output vs Target Count */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono font-extrabold text-xs text-slate-900">
                        {cQty} <span className="text-slate-400 font-normal">/ {aQty} pcs</span>
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${batchPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Assigned Time */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                    {formatTime(ass.assigned_at)}
                  </td>

                  {/* Completed Time */}
                  <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                    {formatTime(ass.completed_at)}
                  </td>

                  {/* Duration Taken */}
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-xs text-[#3A3564]">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{durationStr}</span>
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold uppercase border ${
                      isDone 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : ass.status === 'IN_PROGRESS' 
                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{isDone ? 'Done' : ass.status || 'Pending'}</span>
                    </span>
                  </td>

                  {/* Individual Wage Amount */}
                  {rateNum > 0 && (
                    <td className="py-2.5 px-3.5 text-right font-mono font-extrabold text-emerald-700 text-xs">
                      ₹{batchWage.toLocaleString()}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
