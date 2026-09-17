'use client'

import React, { useState } from 'react'
import { 
  X, 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase
} from 'lucide-react'
import { toast } from 'sonner'
import { CuttingWorker } from '../types/cutting'
import { deleteCuttingWorker, saveCuttingWorker } from '../utils/cuttingStorage'

interface WorkerListModalProps {
  isOpen: boolean
  onClose: () => void
  workers: CuttingWorker[]
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
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  if (!isOpen) return null

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = 
      (w.worker_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.phone_number || '').includes(searchQuery) ||
      (w.role || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'ALL' || w.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove worker "${name}" from Cutting Floor roster?`)) {
      deleteCuttingWorker(id)
      toast.success(`Worker ${name} removed.`)
      onWorkersUpdated()
    }
  }

  const handleToggleStatus = (worker: CuttingWorker) => {
    const nextStatus: CuttingWorker['status'] = worker.status === 'ACTIVE' ? 'ON_LEAVE' : 'ACTIVE'
    saveCuttingWorker({ ...worker, status: nextStatus })
    toast.info(`${worker.worker_name} marked as ${nextStatus.replace(/_/g, ' ')}`)
    onWorkersUpdated()
  }

  const formatRoleLabel = (roleStr: string) => {
    return roleStr
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#FAF7F0] border-b border-black/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  Cutting Floor Workers Roster
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#3A3564] border border-black/10">
                  {workers.length} Registered
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Manage registered floor operators, shift assignments, and credentials
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
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-black/10 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-black/10 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by worker name, phone (+91), or role..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-black/10 bg-white focus:outline-hidden focus:border-[#3A3564]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'CUTTING_MASTER', 'SPREADING_OPERATOR', 'KNIFE_CUTTER', 'BUNDLER'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  roleFilter === r
                    ? 'bg-[#3A3564] text-white'
                    : 'bg-white text-slate-700 border border-black/10 hover:bg-slate-100'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : formatRoleLabel(r)}
              </button>
            ))}
          </div>
        </div>

        {/* Worker Cards / Table Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filteredWorkers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
              <p className="text-sm font-semibold">No workers found matching your query.</p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenAddModal()
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#3A3564] hover:underline"
              >
                <span>Register a new worker</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredWorkers.map(worker => {
                const isOnline = worker.status === 'ACTIVE'

                return (
                  <div
                    key={worker.id}
                    className="p-4 rounded-2xl border border-black/10 bg-[#FAF7F0]/40 hover:bg-[#FAF7F0] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center font-bold text-sm text-[#3A3564] shadow-2xs shrink-0">
                          {worker.worker_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {worker.worker_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>+91 {worker.phone_number}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(worker)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {worker.status.replace(/_/g, ' ')}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-black/10 text-[11px] font-bold text-[#3A3564]">
                          {formatRoleLabel(worker.role)}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {worker.shift ? `${worker.shift} Shift` : 'Morning Shift'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(worker.id, worker.worker_name)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove worker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-black/10 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Worker portal login URL: <strong>/cutting/login</strong> (in employee portal)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
