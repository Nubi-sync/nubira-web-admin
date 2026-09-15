'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  KeyRound,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Scissors,
  Printer,
  Boxes,
  Waves,
  Flame,
  Wrench,
  Store,
  Truck,
  Briefcase,
  Palette,
  PowerOff,
  Trash2
} from 'lucide-react'
import {
  DivisionWithHeadStatus,
  DepartmentHeadItem,
  toggleDepartmentHeadStatusAction,
  deleteDepartmentHeadAction
} from '../actions'
import { AppointHeadModal } from './AppointHeadModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { DEPARTMENT_HEADS_CATALOG } from '@/lib/access-control'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface DepartmentHeadsClientProps {
  initialDivisions: DivisionWithHeadStatus[]
  allowedDivisions?: string[]
  tenantName: string
  isSuperAdmin: boolean
}

const DIVISION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Boxes,
  Wrench,
  Store,
  Truck
}

export function DepartmentHeadsClient({
  initialDivisions,
  allowedDivisions,
  tenantName,
  isSuperAdmin
}: DepartmentHeadsClientProps) {
  const [divisions, setDivisions] = useState<DivisionWithHeadStatus[]>(initialDivisions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')

  // Modal States
  const [selectedHeadForEdit, setSelectedHeadForEdit] = useState<DepartmentHeadItem | null>(null)
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false)
  const [headToDelete, setHeadToDelete] = useState<DepartmentHeadItem | null>(null)
  const [isDeletingHead, setIsDeletingHead] = useState(false)

  // Password Modal
  const [passwordModalData, setPasswordModalData] = useState<{
    isOpen: boolean
    headId: string
    headName: string
    username: string
  }>({
    isOpen: false,
    headId: '',
    headName: '',
    username: ''
  })

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Derive strictly the list of UNIQUE APPOINTED DEPARTMENT HEADS
  const appointedHeads = useMemo(() => {
    const map = new Map<string, DepartmentHeadItem>()
    divisions.forEach(div => {
      if (div.appointedHead) {
        map.set(div.appointedHead.id, div.appointedHead)
      }
      if (div.secondaryHeads) {
        div.secondaryHeads.forEach(sh => map.set(sh.id, sh))
      }
    })
    return Array.from(map.values())
  }, [divisions])

  // Calculate how many distinct divisions are actively covered
  const coveredDivisionsCount = useMemo(() => {
    const coveredRoutes = new Set<string>()
    appointedHeads.forEach(head => {
      head.allowedModules.forEach(r => coveredRoutes.add(r))
    })
    return coveredRoutes.size
  }, [appointedHeads])

  // Filtered Appointed Heads based on search & status
  const filteredHeads = useMemo(() => {
    return appointedHeads.filter(head => {
      // Status filter
      if (filterStatus === 'ACTIVE' && !head.isActive) return false
      if (filterStatus === 'SUSPENDED' && head.isActive) return false

      // Search query filter
      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase().trim()
      const matchesName = head.displayName.toLowerCase().includes(term)
      const matchesUser = head.username.toLowerCase().includes(term)
      const matchesDesig = head.designation.toLowerCase().includes(term)
      const matchesDiv = head.allowedModules.some(m => m.toLowerCase().includes(term))

      return matchesName || matchesUser || matchesDesig || matchesDiv
    })
  }, [appointedHeads, filterStatus, searchTerm])

  const handleOpenAppointModal = (head: DepartmentHeadItem | null = null) => {
    setSelectedHeadForEdit(head)
    setIsAppointModalOpen(true)
  }

  const handleOpenPasswordModal = (head: DepartmentHeadItem) => {
    setPasswordModalData({
      isOpen: true,
      headId: head.id,
      headName: head.displayName,
      username: head.username
    })
  }

  const handleToggleStatus = async (head: DepartmentHeadItem) => {
    try {
      const res = await toggleDepartmentHeadStatusAction(head.id, !head.isActive)
      if (res.success) {
        setDivisions(prev =>
          prev.map(d => {
            if (d.appointedHead?.id === head.id) {
              return {
                ...d,
                appointedHead: { ...d.appointedHead, isActive: !head.isActive }
              }
            }
            return d
          })
        )
        showToast(`Head "${head.displayName}" is now ${head.isActive ? 'Suspended' : 'Active'}`)
      }
    } catch (_) {}
  }

  const handleDeleteHead = (head: DepartmentHeadItem) => {
    setHeadToDelete(head)
  }

  const handleConfirmDeleteHead = async () => {
    if (!headToDelete) return
    setIsDeletingHead(true)
    try {
      const res = await deleteDepartmentHeadAction(headToDelete.id)
      if (res.success) {
        setDivisions(prev =>
          prev.map(d => {
            if (d.appointedHead?.id === headToDelete.id) {
              return { ...d, appointedHead: null }
            }
            return d
          })
        )
        showToast(`Head "${headToDelete.displayName}" removed`)
        setHeadToDelete(null)
      }
    } catch (_) {} finally {
      setIsDeletingHead(false)
    }
  }

  const activeCount = appointedHeads.filter(h => h.isActive).length
  const suspendedCount = appointedHeads.filter(h => !h.isActive).length

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 text-[#14140F]">
      
      {/* 1. Breadcrumb Hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors font-medium">
            Workspace Hub
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">
            Department Heads & Incharges (RBAC)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            {tenantName}
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
            Executive RBAC
          </span>
        </div>
      </div>

      {/* 2. Page Top Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-[family-name:var(--font-heading)] tracking-tight">
              Department Heads & Incharges
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Official division incharges and department heads appointed by company admin.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAppointModal(null)}
            className="px-5 py-2.5 sm:py-3 bg-[#3A3564] hover:bg-[#2A2649] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Appoint Department Head</span>
          </button>
        </div>
      </div>

      {/* 3. Executive Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
              Appointed Heads
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {appointedHeads.length} Assigned
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center border border-black/10 shadow-2xs shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
              Divisions Covered
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {coveredDivisionsCount} of {divisions.length} Units
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center border border-black/10 shadow-2xs shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-black/10 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
              Unassigned Divisions
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              {Math.max(0, divisions.length - coveredDivisionsCount)} Units Pending
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] flex items-center justify-center border border-black/10 shadow-2xs shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-black/10 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            All Appointed ({appointedHeads.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('SUSPENDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'SUSPENDED'
                ? 'bg-white text-slate-900 shadow-xs border border-black/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Suspended ({suspendedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search appointed head or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3A3564] focus:ring-2 focus:ring-[#3A3564]/10 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
        </div>
      </div>

      {/* 5. Appointed Heads Cards Grid / Empty State */}
      {filteredHeads.length === 0 ? (
        <EmptyState
          variant="seamless"
          icon={ShieldCheck}
          title={searchTerm ? 'No matching department heads found' : 'No department heads appointed yet'}
          description={
            searchTerm
              ? 'Try adjusting your search query or switching active status filters.'
              : 'Appoint official division incharges to assign leadership authority across your manufacturing units.'
          }
          actionLabel={searchTerm ? undefined : '+ Appoint Department Head'}
          onAction={searchTerm ? undefined : () => handleOpenAppointModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredHeads.map(head => {
            const assignedDivisions = head.allowedModules
              .map(route => DEPARTMENT_HEADS_CATALOG.find(d => d.route === route))
              .filter(Boolean)

            return (
              <div
                key={head.id}
                className="bg-white rounded-2xl border border-black/10 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top: Head Name, Designation, Status */}
                <div className="p-5 pb-3.5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 font-mono font-extrabold text-sm shadow-2xs">
                        {head.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 font-[family-name:var(--font-heading)] leading-snug truncate">
                            {head.displayName}
                          </h3>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              head.isActive ? 'bg-[#3A3564]' : 'bg-slate-400'
                            }`}
                          />
                        </div>
                        <span className="text-xs font-semibold text-[#3A3564] block mt-0.5 truncate">
                          {head.designation}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ${
                        head.isActive
                          ? 'bg-[#FAF7F0] text-[#3A3564] border border-black/10'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {head.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  {/* Credentials / Login Info */}
                  <div className="p-3 bg-[#FAF7F0]/60 border border-black/10 rounded-xl text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] uppercase tracking-wider text-slate-500">Login User:</span>
                      <strong className="text-slate-900 font-bold">{head.username}</strong>
                    </div>
                    {head.phone && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">Phone:</span>
                        <strong className="text-slate-800">+91 {head.phone}</strong>
                      </div>
                    )}
                  </div>

                  {/* Assigned Department Divisions Badges */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Assigned Department Authority ({head.allowedModules.length} Units)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {assignedDivisions.map(div => {
                        if (!div) return null
                        const IconComp = DIVISION_ICONS[div.iconName] || Layers

                        return (
                          <span
                            key={div.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 text-xs font-semibold text-slate-900 transition-colors shadow-2xs"
                          >
                            <IconComp className="w-3.5 h-3.5 text-[#3A3564]" />
                            <span>Unit {div.code}: {div.name.split('&')[0].trim()}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-[#FAFAF8] border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenAppointModal(head)}
                    className="text-xs font-bold text-[#3A3564] hover:underline px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Edit Permissions
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal(head)}
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                      title="Reset Password"
                      aria-label="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(head)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        head.isActive
                          ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                          : 'text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0]'
                      }`}
                      title={head.isActive ? 'Suspend Head' : 'Activate Head'}
                      aria-label={head.isActive ? 'Suspend Head' : 'Activate Head'}
                    >
                      <PowerOff className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteHead(head)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Head"
                      aria-label="Remove Head"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Appoint & Edit Head Modal */}
      <AppointHeadModal
        isOpen={isAppointModalOpen}
        onClose={() => setIsAppointModalOpen(false)}
        division={null}
        existingHead={selectedHeadForEdit}
        allowedDivisions={allowedDivisions || divisions.map(d => d.route)}
        tenantName={tenantName}
        onSuccess={() => {
          showToast('Department Head saved successfully')
          window.location.reload()
        }}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={passwordModalData.isOpen}
        onClose={() => setPasswordModalData(prev => ({ ...prev, isOpen: false }))}
        headId={passwordModalData.headId}
        headName={passwordModalData.headName}
        username={passwordModalData.username}
        onSuccess={() => {
          showToast('Password reset successfully')
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 px-4 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!headToDelete}
        title={`Remove Head "${headToDelete?.displayName}"?`}
        description={`Are you sure you want to remove Department Head "${headToDelete?.displayName}" (@${headToDelete?.username})? This will immediately revoke their administrative access across assigned divisions.`}
        confirmText="Yes, Remove Head"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingHead}
        onConfirm={handleConfirmDeleteHead}
        onClose={() => {
          if (!isDeletingHead) setHeadToDelete(null)
        }}
      />

    </div>
  )
}
