'use client'

import React, { useState } from 'react'
import {
  X,
  Users,
  Search,
  UserPlus,
  Phone,
  Trash2,
  CheckCircle2,
  Scissors,
  Box,
  Layers,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ReadyGoodsWorker, ReadyGoodsWorkerRole } from '../types/readyGoods'
import { deleteReadyGoodsWorker } from '../utils/readyGoodsStorage'

interface WorkerListModalProps {
  isOpen: boolean
  onClose: () => void
  workers: ReadyGoodsWorker[]
  onOpenAddModal: () => void
  onWorkersUpdated: () => void
}

export function WorkerListModal({
  isOpen,
  onClose,
  workers,
  onOpenAddModal,
  onWorkersUpdated
}: WorkerListModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | ReadyGoodsWorkerRole>('ALL')

  if (!isOpen) return null

  const filteredWorkers = workers.filter(w => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (w.worker_name || '').toLowerCase().includes(q) ||
      (w.phone_number || '').includes(q) ||
      (w.assigned_station || '').toLowerCase().includes(q)

    const matchesRole = roleFilter === 'ALL' || w.role === roleFilter

    return matchesSearch && matchesRole
  })

  const handleDelete = (workerId: string, name: string) => {
    if (confirm(`Remove worker "${name}" from floor operations?`)) {
      deleteReadyGoodsWorker(workerId)
      toast.success(`Worker "${name}" removed.`)
      onWorkersUpdated()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 bg-[#FAF7F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Floor Workers &amp; Stations
                </h3>
                <span className="text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 px-2 py-0.5 rounded-full">
                  {workers.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Registered checkers, carton packers, and dual-role specialists
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenAddModal()
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Worker</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-black/10 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 sm:p-4 border-b border-black/5 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, phone, or station..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-hidden focus:border-[#3A3564]"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/10">
            {(['ALL', 'CHECKER', 'PACKER', 'BOTH'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-[#3A3564] text-white'
                    : 'text-slate-600 hover:bg-[#FAF7F0]'
                }`}
              >
                {role === 'ALL' ? 'All' : role === 'BOTH' ? 'Dual' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Workers List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
          {filteredWorkers.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No matching floor workers found</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Register workers with Checker, Packer, or Dual roles.
              </p>
            </div>
          ) : (
            filteredWorkers.map(w => (
              <div
                key={w.id}
                className="p-3.5 rounded-xl border border-black/10 bg-white hover:border-black/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] shrink-0 font-bold text-xs">
                    {w.role === 'CHECKER' ? (
                      <Scissors className="w-4 h-4" />
                    ) : w.role === 'PACKER' ? (
                      <Box className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{w.worker_name}</h4>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                        w.role === 'CHECKER'
                          ? 'bg-blue-100 text-blue-800'
                          : w.role === 'PACKER'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {w.role === 'BOTH' ? 'CHECKER & PACKER' : w.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        Shift {w.shift}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{w.assigned_station}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {w.phone_number}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-800">
                      {w.inspected_pieces} pcs inspected • {w.packed_cartons} ctns packed
                    </div>
                  </div>

                  <Link
                    href={`/ready-goods/worker?workerId=${w.id}`}
                    className="p-1.5 rounded-lg border border-black/10 bg-[#FAF7F0] hover:bg-white text-[#3A3564] text-xs font-mono flex items-center gap-1"
                    title="Launch Worker Terminal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(w.id, w.worker_name)}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="Delete Worker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black/10 bg-[#FAF7F0] flex items-center justify-between text-xs text-slate-600">
          <span>Workers can log into the Floor Worker Terminal with their 10-digit mobile number.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-black/10 text-slate-800 font-bold hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
