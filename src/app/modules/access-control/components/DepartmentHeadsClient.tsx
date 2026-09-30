'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Crown,
  Factory,
  Users,
  Wrench,
  Plus,
  Search,
  X,
  Phone,
  KeyRound,
  Trash2,
  PowerOff,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Boxes,
  Waves,
  Flame,
  Store,
  Truck,
  Eye,
  Check,
  UserCheck
} from 'lucide-react'
import {
  SupervisorHubData,
  DepartmentHeadItem,
  ProductionManagerItem,
  FloorWorkerItem,
  DivisionWithHeadStatus,
  deleteStaffMemberAction,
  toggleStaffStatusAction
} from '../actions'
import { AppointProductionManagerModal } from './AppointProductionManagerModal'
import { AppointDepartmentHeadModal } from './AppointDepartmentHeadModal'
import { AddWorkerModal } from './AddWorkerModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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

interface DepartmentHeadsClientProps {
  hubData?: SupervisorHubData
  // Backward compatibility
  initialDivisions?: DivisionWithHeadStatus[]
  allowedDivisions?: string[]
  tenantName?: string
  isSuperAdmin?: boolean
}

export function DepartmentHeadsClient({
  hubData,
  initialDivisions,
  allowedDivisions: legacyAllowedDivisions,
  tenantName: legacyTenantName,
  isSuperAdmin: legacyIsSuperAdmin
}: DepartmentHeadsClientProps) {
  const router = useRouter()

  // Resolve base data from hubData or fallbacks
  const callerPowerLevel = hubData?.callerPowerLevel || (legacyIsSuperAdmin ? 'OWNER' : 'DEPARTMENT_HEAD')
  const companyName = hubData?.tenantName || legacyTenantName || 'Apparel Factory'
  const allowedDivisions = hubData?.allowedDivisions || legacyAllowedDivisions || []
  const divisions = hubData?.divisions || initialDivisions || []
  const productionManagers = hubData?.productionManagers || []
  const departmentHeads = hubData?.departmentHeads || []
  const workers = hubData?.workers || []
  const owner = hubData?.owner || { name: 'Company Owner', email: '' }

  // Navigation tab inside this view
  const [activeTab, setActiveTab] = useState<'HEADS' | 'MANAGERS' | 'WORKERS'>('HEADS')
  const [searchQuery, setSearchQuery] = useState('')
  const [workerDepartmentFilter, setWorkerDepartmentFilter] = useState<string>('ALL')

  // Modals state
  const [isPmModalOpen, setIsPmModalOpen] = useState(false)
  const [isHeadModalOpen, setIsHeadModalOpen] = useState(false)
  const [selectedHeadForEdit, setSelectedHeadForEdit] = useState<DepartmentHeadItem | null>(null)
  const [headModalInitialRoute, setHeadModalInitialRoute] = useState<string | undefined>(undefined)

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false)
  const [workerModalInitialRoute, setWorkerModalInitialRoute] = useState<string | undefined>(undefined)

  // Password reset modal
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
    username: string
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    username: ''
  })

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    id: string
    name: string
    type: 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'WORKER'
    divisionRoute?: string
  }>({
    isOpen: false,
    id: '',
    name: '',
    type: 'DEPARTMENT_HEAD'
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Quick Toast Notification
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Filtered Department Heads / Divisions
  const filteredDivisions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return divisions
    return divisions.filter(div => {
      const nameMatch = div.name.toLowerCase().includes(q)
      const headMatch = div.appointedHead?.displayName.toLowerCase().includes(q) ||
        div.appointedHead?.phone.includes(q) ||
        (div.appointedHead?.phone2 && div.appointedHead.phone2.includes(q))
      return nameMatch || headMatch
    })
  }, [divisions, searchQuery])

  // Filtered Production Managers
  const filteredPms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return productionManagers
    return productionManagers.filter(pm =>
      pm.name.toLowerCase().includes(q) ||
      pm.phone.includes(q) ||
      (pm.email && pm.email.toLowerCase().includes(q))
    )
  }, [productionManagers, searchQuery])

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return workers.filter(w => {
      const deptMatch = workerDepartmentFilter === 'ALL' || w.departmentRoute === workerDepartmentFilter
      const textMatch = !q ||
        w.name.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.departmentName.toLowerCase().includes(q)
      return deptMatch && textMatch
    })
  }, [workers, searchQuery, workerDepartmentFilter])

  // Handlers
  const handleOpenAssignHead = (route?: string, head?: DepartmentHeadItem | null) => {
    setSelectedHeadForEdit(head || null)
    setHeadModalInitialRoute(route)
    setIsHeadModalOpen(true)
  }

  const handleOpenAddWorker = (route?: string) => {
    setWorkerModalInitialRoute(route)
    setIsWorkerModalOpen(true)
  }

  const handleToggleStatus = async (
    id: string,
    type: 'PRODUCTION_MANAGER' | 'DEPARTMENT_HEAD' | 'WORKER',
    currentStatus: boolean,
    divisionRoute?: string
  ) => {
    const res = await toggleStaffStatusAction({
      id,
      type,
      currentStatus,
      divisionRoute
    })
    if (res.success) {
      showToast('Status updated successfully')
      router.refresh()
    } else {
      showToast(res.error || 'Failed to update status')
    }
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    const res = await deleteStaffMemberAction({
      id: deleteConfirm.id,
      type: deleteConfirm.type,
      divisionRoute: deleteConfirm.divisionRoute
    })
    setIsDeleting(false)
    setDeleteConfirm(prev => ({ ...prev, isOpen: false }))

    if (res.success) {
      showToast('Staff removed successfully')
      router.refresh()
    } else {
      showToast(res.error || 'Failed to remove staff')
    }
  }

  const canAppointPm = callerPowerLevel === 'OWNER'
  const canAppointHead = callerPowerLevel === 'OWNER' || callerPowerLevel === 'PRODUCTION_MANAGER'
  const canAddWorker = callerPowerLevel === 'OWNER' || callerPowerLevel === 'PRODUCTION_MANAGER' || callerPowerLevel === 'DEPARTMENT_HEAD'

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1536px] w-full mx-auto space-y-6 text-[#0B1220] select-none">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-[#0B1220] text-white text-xs font-bold rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#14C8B4]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
              Supervisor &amp; Workers
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-2xs">
              4 Divisions of Power
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {companyName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Strict multi-tier RBAC for plant operations, supervisor roles, and floor staff.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canAppointPm && (
            <button
              type="button"
              onClick={() => setIsPmModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Factory className="w-3.5 h-3.5 text-[#14C8B4]" />
              <span>+ Production Manager</span>
            </button>
          )}

          {canAppointHead && (
            <button
              type="button"
              onClick={() => handleOpenAssignHead()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F0FDFA] hover:bg-teal-50 text-[#0B1220] border border-[#14C8B4]/40 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-[#0B1220]" />
              <span>+ Department Head</span>
            </button>
          )}

          {canAddWorker && (
            <button
              type="button"
              onClick={() => handleOpenAddWorker()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Worker</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Glanceable 4-Tier Power Structure Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Tier 1: Owner */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase font-bold text-amber-700">Tier 1: Owner</div>
            <div className="text-xs font-extrabold text-[#0B1220] truncate">{owner.name || 'Company Owner'}</div>
            <div className="text-[10px] text-slate-400 font-mono">Super Admin</div>
          </div>
        </div>

        {/* Tier 2: Production Manager */}
        <div 
          onClick={() => setActiveTab('MANAGERS')}
          className={`p-3.5 rounded-2xl bg-white border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            activeTab === 'MANAGERS' ? 'border-[#0B1220] ring-1 ring-[#0B1220]/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 flex items-center justify-center shrink-0">
            <Factory className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase font-bold text-teal-700">Tier 2: Production Mgr</div>
            <div className="text-xs font-extrabold text-[#0B1220]">{productionManagers.length} Appointed</div>
            <div className="text-[10px] text-slate-400 font-mono">Factory Wide</div>
          </div>
        </div>

        {/* Tier 3: Department Heads */}
        <div 
          onClick={() => setActiveTab('HEADS')}
          className={`p-3.5 rounded-2xl bg-white border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            activeTab === 'HEADS' ? 'border-[#0B1220] ring-1 ring-[#0B1220]/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase font-bold text-blue-700">Tier 3: Dept Heads</div>
            <div className="text-xs font-extrabold text-[#0B1220]">{departmentHeads.length} of {divisions.length} Units</div>
            <div className="text-[10px] text-slate-400 font-mono">Floor Incharges</div>
          </div>
        </div>

        {/* Tier 4: Floor Workers */}
        <div 
          onClick={() => setActiveTab('WORKERS')}
          className={`p-3.5 rounded-2xl bg-white border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            activeTab === 'WORKERS' ? 'border-[#0B1220] ring-1 ring-[#0B1220]/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-600">Tier 4: Floor Staff</div>
            <div className="text-xs font-extrabold text-[#0B1220]">{workers.length} Active Workers</div>
            <div className="text-[10px] text-slate-400 font-mono">Shop Floor Roster</div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Controls & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* View Switcher Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('HEADS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HEADS'
                ? 'bg-white text-[#0B1220] shadow-xs'
                : 'text-slate-600 hover:text-[#0B1220]'
            }`}
          >
            <span>Department Heads ({divisions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MANAGERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MANAGERS'
                ? 'bg-white text-[#0B1220] shadow-xs'
                : 'text-slate-600 hover:text-[#0B1220]'
            }`}
          >
            <span>Production Managers ({productionManagers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WORKERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'WORKERS'
                ? 'bg-white text-[#0B1220] shadow-xs'
                : 'text-slate-600 hover:text-[#0B1220]'
            }`}
          >
            <span>Shop Floor Workers ({workers.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone..."
            className="w-full pl-10 pr-8 py-2 bg-white text-xs font-medium text-[#0B1220] placeholder:text-slate-400 border border-slate-200 focus:border-[#0B1220] rounded-xl outline-none shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Tab Views */}

      {/* ======================================================== */}
      {/* VIEW A: DEPARTMENT HEADS                                 */}
      {/* ======================================================== */}
      {activeTab === 'HEADS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDivisions.map((div) => {
            const head = div.appointedHead
            const IconComponent = DIVISION_ICONS[div.iconName] || Layers

            return (
              <div
                key={div.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
              >
                {/* Division Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] shadow-2xs">
                        <IconComponent className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0B1220] tracking-tight">
                          {div.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          {div.code}
                        </span>
                      </div>
                    </div>

                    {head ? (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                        head.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {head.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        VACANT
                      </span>
                    )}
                  </div>

                  {/* Appointed Head Details or Vacant State */}
                  {head ? (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-[#0B1220] flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#14C8B4]" />
                          <span>{head.displayName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {head.designation}
                        </div>
                      </div>

                      {/* Phone Numbers (1 or 2) */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {head.phone && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{head.phone}</span>
                          </span>
                        )}
                        {head.phone2 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500">
                            <span>Alt: {head.phone2}</span>
                          </span>
                        )}
                      </div>

                      {/* Permissions Tags */}
                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-[#F0FDFA] text-teal-800 border border-[#14C8B4]/20">
                          {head.allowedModules.length} Modules Hub
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {head.allowedTabs.length} Tabs Allowed
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-1">
                      <p className="text-xs text-slate-400 font-medium">No head currently assigned</p>
                      <p className="text-[11px] text-slate-400">Owner / PM can appoint department lead</p>
                    </div>
                  )}
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  {head ? (
                    <>
                      {/* Left: Password and Status actions */}
                      <div className="flex items-center gap-1">
                        {canAppointHead && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPasswordModal({
                                isOpen: true,
                                userId: head.id,
                                userName: head.displayName,
                                username: head.username
                              })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(head.id, 'DEPARTMENT_HEAD', head.isActive)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                head.isActive
                                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-rose-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={head.isActive ? 'Suspend Head' : 'Activate Head'}
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({
                                isOpen: true,
                                id: head.id,
                                name: head.displayName,
                                type: 'DEPARTMENT_HEAD'
                              })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Head"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Right: Edit & Add Worker */}
                      <div className="flex items-center gap-2">
                        {canAddWorker && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddWorker(div.route)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            + Worker
                          </button>
                        )}
                        {canAppointHead && (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignHead(div.route, head)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between">
                      {canAddWorker && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddWorker(div.route)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          + Worker
                        </button>
                      )}
                      {canAppointHead && (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignHead(div.route, null)}
                          className="ml-auto px-3.5 py-1.5 bg-[#0B1220] hover:bg-[#162032] text-white text-[11px] font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Assign Head
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: PRODUCTION MANAGERS                              */}
      {/* ======================================================== */}
      {activeTab === 'MANAGERS' && (
        <div className="space-y-4">
          {filteredPms.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] mx-auto shadow-xs">
                <Factory className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                No Production Managers Appointed
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Company Owner has super admin authority to appoint a Production Manager to oversee whole-plant operations.
              </p>
              {canAppointPm && (
                <button
                  type="button"
                  onClick={() => setIsPmModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#14C8B4]" />
                  <span>Appoint Production Manager</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPms.map((pm) => (
                <div
                  key={pm.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#0B1220] text-white flex items-center justify-center shadow-xs">
                          <Factory className="w-5 h-5 text-[#14C8B4]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-[#0B1220]">
                            {pm.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            {pm.username}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        pm.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {pm.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pm.phone || 'No phone'}</span>
                      </div>
                      {pm.email && !pm.email.endsWith('.local') && (
                        <div className="text-xs text-slate-500 truncate">
                          {pm.email}
                        </div>
                      )}
                      <div className="pt-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F0FDFA] text-teal-800 border border-[#14C8B4]/20 font-bold">
                          All Modules &amp; Tabs Permitted
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPasswordModal({
                        isOpen: true,
                        userId: pm.id,
                        userName: pm.name,
                        username: pm.username
                      })}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>

                    {canAppointPm && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pm.id, 'PRODUCTION_MANAGER', pm.isActive)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title={pm.isActive ? 'Suspend' : 'Activate'}
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({
                            isOpen: true,
                            id: pm.id,
                            name: pm.name,
                            type: 'PRODUCTION_MANAGER'
                          })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove Production Manager"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW C: SHOP FLOOR WORKERS                               */}
      {/* ======================================================== */}
      {activeTab === 'WORKERS' && (
        <div className="space-y-4">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setWorkerDepartmentFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                workerDepartmentFilter === 'ALL'
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Divisions ({workers.length})
            </button>
            {divisions.map((div) => {
              const count = workers.filter(w => w.departmentRoute === div.route).length
              return (
                <button
                  key={div.route}
                  type="button"
                  onClick={() => setWorkerDepartmentFilter(div.route)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    workerDepartmentFilter === div.route
                      ? 'bg-[#0B1220] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {div.name} ({count})
                </button>
              )
            })}
          </div>

          {filteredWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                <Wrench className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0B1220]">
                No Workers Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Owner, Production Manager, and Department Heads can register shop floor staff.
              </p>
              {canAddWorker && (
                <button
                  type="button"
                  onClick={() => handleOpenAddWorker(workerDepartmentFilter !== 'ALL' ? workerDepartmentFilter : undefined)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#14C8B4]" />
                  <span>Add Floor Worker</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Worker Name</th>
                      <th className="py-3 px-4 font-bold">Department</th>
                      <th className="py-3 px-4 font-bold">Skill / Role</th>
                      <th className="py-3 px-4 font-bold">Mobile</th>
                      <th className="py-3 px-4 font-bold">Shift</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorkers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0B1220]">
                          {worker.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#F0FDFA] text-teal-800 border border-[#14C8B4]/20 font-medium">
                            {worker.departmentName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {worker.role}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {worker.phone}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">
                          {worker.shift}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            worker.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(worker.id, 'WORKER', worker.status === 'ACTIVE', worker.departmentRoute)}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Toggle status"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm({
                                isOpen: true,
                                id: worker.id,
                                name: worker.name,
                                type: 'WORKER',
                                divisionRoute: worker.departmentRoute
                              })}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Remove worker"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* Appoint Production Manager Modal (2 steps max) */}
      <AppointProductionManagerModal
        isOpen={isPmModalOpen}
        onClose={() => setIsPmModalOpen(false)}
        onSuccess={() => {
          showToast('Production Manager appointed successfully')
          router.refresh()
        }}
      />

      {/* Appoint Department Head Modal (2 steps max) */}
      <AppointDepartmentHeadModal
        isOpen={isHeadModalOpen}
        onClose={() => {
          setIsHeadModalOpen(false)
          setSelectedHeadForEdit(null)
          setHeadModalInitialRoute(undefined)
        }}
        onSuccess={() => {
          showToast(selectedHeadForEdit ? 'Department Head updated' : 'Department Head appointed')
          router.refresh()
        }}
        existingHead={selectedHeadForEdit}
        allowedDivisions={allowedDivisions}
        initialDivisionRoute={headModalInitialRoute}
      />

      {/* Add Worker Modal (1 step) */}
      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false)
          setWorkerModalInitialRoute(undefined)
        }}
        onSuccess={() => {
          showToast('Worker added successfully')
          router.refresh()
        }}
        allowedDivisions={allowedDivisions}
        initialDivisionRoute={workerModalInitialRoute}
      />

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
        headId={passwordModal.userId}
        headName={passwordModal.userName}
        username={passwordModal.username}
        onSuccess={() => showToast('Password updated successfully')}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Remove ${deleteConfirm.name}?`}
        description="This action will revoke login access and remove this staff member from your company roster."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  )
}
