'use client'

import React, { useState } from 'react'
import { 
  X, 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { IronWorker, IronWorkerRole } from '../types/iron'
import { deleteIronWorker, saveIronWorker } from '../utils/ironFloorStorage'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteIronWorkerAction } from '../actions'

interface WorkerListModalProps {
  isOpen: boolean
  onClose: () => void
  workers: IronWorker[]
  onOpenAddModal: () => void
  onWorkersUpdated: () => void
  onDeleteWorker?: (workerId: string) => Promise<void>
}

const ROLE_LABELS: Record<string, string> = {
  FINISHING_PRESSER: 'Finishing Presser (Steam Table)',
  STEAM_OPERATOR: 'Steam Boiler Operator',
  VACUUM_TABLE_PRESSER: 'Vacuum Buck Presser',
  PACKING_PRESSER: 'Pre-Packing Final Touch Presser',
  HEAD_PRESSER: 'Head Presser & Verifier',
  QUALITY_PRESSER: 'Shine & Glaze QC Auditor'
}

export function WorkerListModal({
  isOpen,
  onClose,
  workers,
  onOpenAddModal,
  onWorkersUpdated,
  onDeleteWorker
}: WorkerListModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [workerToDelete, setWorkerToDelete] = useState<IronWorker | null>(null)
  const [isDeletingWorker, setIsDeletingWorker] = useState(false)

  if (!isOpen) return null

  const filteredWorkers = workers.filter(w => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      (w.worker_name || '').toLowerCase().includes(q) ||
      (w.phone_number || '').includes(q) ||
      (w.roles || []).some(r => r.toLowerCase().includes(q)) ||
      (w.role || '').toLowerCase().includes(q)

    const matchesRole = 
      roleFilter === 'ALL' || 
      (w.roles && w.roles.includes(roleFilter as IronWorkerRole)) ||
      (w.role && w.role.includes(roleFilter))

    return matchesSearch && matchesRole
  })

  const handleConfirmDeleteWorker = async () => {
    if (!workerToDelete) return
    try {
      setIsDeletingWorker(true)
      deleteIronWorker(workerToDelete.id)
      if (workerToDelete.worker_name) deleteIronWorker(workerToDelete.worker_name)
      if (workerToDelete.phone_number) deleteIronWorker(workerToDelete.phone_number)

      if (onDeleteWorker) {
        await onDeleteWorker(workerToDelete.id)
      } else {
        await deleteIronWorkerAction(workerToDelete.id)
      }

      toast.success(`Presser "${workerToDelete.worker_name}" removed from iron roster.`)
      onWorkersUpdated()
    } catch (err) {
      console.error('Failed to remove presser:', err)
      toast.error('Failed to remove presser.')
    } finally {
      setIsDeletingWorker(false)
      setWorkerToDelete(null)
    }
  }

  const handleToggleStatus = (worker: IronWorker) => {
    const nextStatus = !worker.is_active
    saveIronWorker({ ...worker, is_active: nextStatus })
    toast.info(`${worker.worker_name} marked as ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`)
    onWorkersUpdated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-[#FAF7F0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center text-[#3A3564] shadow-2xs">
              <Users className="w-5 h-5 text-[#3A3564]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                Ironing Floor Pressers &amp; Roster
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {workers.length} registered steam iron and vacuum buck pressers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-black/5 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, table..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-black/10 bg-white focus:outline-hidden focus:border-[#3A3564]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-black/10 bg-white font-mono font-bold text-slate-700"
            >
              <option value="ALL">All Roles ({workers.length})</option>
              <option value="FINISHING_PRESSER">Finishing Pressers</option>
              <option value="VACUUM_TABLE_PRESSER">Vacuum Pressers</option>
              <option value="STEAM_OPERATOR">Steam Operators</option>
              <option value="HEAD_PRESSER">Head Pressers</option>
            </select>

            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenAddModal()
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3A3564] hover:bg-[#2C274E] text-white text-xs font-mono font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Presser</span>
            </button>
          </div>
        </div>

        {/* Worker Table / List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-black/5">
          {filteredWorkers.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">No iron pressers found</div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {workers.length === 0 
                  ? 'No pressers registered for this company yet. Click "+ Add Presser" to enroll staff.' 
                  : 'Try adjusting your search or role filters.'}
              </p>
            </div>
          ) : (
            filteredWorkers.map(worker => (
              <div key={worker.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-black/10 flex items-center justify-center text-[#3A3564] font-mono font-black text-sm shrink-0">
                    {worker.worker_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{worker.worker_name}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        worker.is_active !== false 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {worker.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        +91 {worker.phone_number}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(worker.roles || (worker.role ? [worker.role] : ['FINISHING_PRESSER'])).map((r, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {ROLE_LABELS[r] || String(r).replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(worker)}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-black/10 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                  >
                    Toggle Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerToDelete(worker)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete presser"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-black/10 bg-[#FAF7F0]/40 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Total Pressers: {workers.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Confirm Delete Worker Dialog */}
      <ConfirmDialog
        isOpen={Boolean(workerToDelete)}
        title="Remove Iron Presser?"
        description={`Are you sure you want to remove "${workerToDelete?.worker_name}" (+91 ${workerToDelete?.phone_number}) from the active floor roster?`}
        confirmText={isDeletingWorker ? 'Removing...' : 'Remove Presser'}
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingWorker}
        onConfirm={handleConfirmDeleteWorker}
        onClose={() => setWorkerToDelete(null)}
      />

    </div>
  )
}
