'use client'

import React, { useState } from 'react'
import { X, Users, Search, Phone, Scissors, Trash2, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { StitchingWorker } from '../types/stitching'
import { deleteStitchingWorker } from '../utils/stitchingFloorStorage'
import { deleteStitchingWorkerAction } from '../actions'

interface WorkerListModalProps {
  isOpen: boolean
  onClose: () => void
  workers: StitchingWorker[]
  onOpenAddWorker: () => void
  onWorkerDeleted?: (workerId: string) => void
  companyName?: string
}

export function WorkerListModal({
  isOpen,
  onClose,
  workers,
  onOpenAddWorker,
  onWorkerDeleted,
  companyName
}: WorkerListModalProps) {
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!isOpen) return null

  const filtered = workers.filter(w =>
    w.worker_name.toLowerCase().includes(search.toLowerCase()) ||
    w.phone_number.includes(search) ||
    (w.machine_specialty && w.machine_specialty.toLowerCase().includes(search.toLowerCase())) ||
    (w.role && w.role.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = async (worker: StitchingWorker) => {
    if (!confirm(`Are you sure you want to remove tailor "${worker.worker_name}" from the floor roster?`)) {
      return
    }

    setDeletingId(worker.id)
    try {
      deleteStitchingWorker(worker.id, companyName)
      await deleteStitchingWorkerAction(worker.id)
      toast.success(`Removed tailor "${worker.worker_name}".`)
      onWorkerDeleted?.(worker.id)
    } catch {
      toast.error('Failed to remove worker.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#FAF7F0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3A3564] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Sewing Tailors & Operators Roster
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {workers.length} registered tailoring specialists on sewing assembly line
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tailor by name, phone, machine specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] text-slate-900"
            />
          </div>
          <button
            onClick={() => {
              onClose()
              onOpenAddWorker()
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#3A3564] hover:bg-[#2C274E] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tailor</span>
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] mx-auto mb-3">
                <Scissors className="w-6 h-6 text-[#3A3564]" />
              </div>
              <p className="text-sm font-bold text-slate-800 font-[family-name:var(--font-heading)]">
                {search ? 'No tailors match your search' : 'No Tailors Registered Yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click &quot;Add Tailor&quot; above to register sewing operators and issue floor credentials.
              </p>
            </div>
          ) : (
            filtered.map(w => (
              <div key={w.id} className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center font-bold text-[#3A3564] text-xs font-mono shrink-0 shadow-2xs">
                    {w.worker_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)] truncate">
                        {w.worker_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        {w.status || 'ACTIVE'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-bold">
                        ₹{w.piece_rate_inr || 12}/pc
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        +91 {w.phone_number}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium truncate max-w-[220px]">
                        {w.machine_specialty || w.assigned_machine || 'Single Needle'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 capitalize">{w.shift?.toLowerCase()} shift</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(w)}
                    disabled={deletingId === w.id}
                    title="Remove Tailor"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-[#FAFAF8] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total: {filtered.length} tailors</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}
