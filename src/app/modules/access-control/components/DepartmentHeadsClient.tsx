'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Crown,
  Factory,
  Users,
  Search,
  X,
  Phone,
  KeyRound,
  Trash2,
  PowerOff,
  Edit2,
  CheckCircle2,
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
  Wrench,
  ChevronDown,
  UserPlus,
  Mail,
  UserCheck,
  Plus,
  ShieldCheck,
  Sparkle
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

  // Base data resolution
  const callerPowerLevel = hubData?.callerPowerLevel || (legacyIsSuperAdmin ? 'OWNER' : 'DEPARTMENT_HEAD')
  const companyName = hubData?.tenantName || legacyTenantName || 'Apparel Factory'
  const allowedDivisions = hubData?.allowedDivisions || legacyAllowedDivisions || []
  const divisions = hubData?.divisions || initialDivisions || []
  const productionManagers = hubData?.productionManagers || []
  const departmentHeads = hubData?.departmentHeads || []
  const workers = hubData?.workers || []
  const owner = hubData?.owner || { name: 'Company Owner', email: '' }

  const isOwner = callerPowerLevel === 'OWNER'
  const isPM = callerPowerLevel === 'PRODUCTION_MANAGER'
  const canAppointHeads = isOwner || isPM
  const canAppointPM = isOwner

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  // Expand / Collapse state: allow multiple open, default open first or all
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(() => {
    // Open first 2 divisions by default for immediate preview, or user can expand any
    return new Set(divisions.slice(0, 2).map(d => d.route))
  })

  const toggleExpand = (route: string) => {
    setExpandedRoutes(prev => {
      const next = new Set(prev)
      if (next.has(route)) {
        next.delete(route)
      } else {
        next.add(route)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedRoutes(new Set(divisions.map(d => d.route)))
  }

  const collapseAll = () => {
    setExpandedRoutes(new Set())
  }

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

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Action handlers
  const handleOpenAppointHead = (route?: string, head?: DepartmentHeadItem) => {
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
    const res = await toggleStaffStatusAction({ id, type, currentStatus, divisionRoute })
    if (res.success) {
      showToast(`Status updated to ${currentStatus ? 'Inactive' : 'Active'}`)
      router.refresh()
    } else {
      showToast(res.error || 'Failed to update status')
    }
  }

  const handleDeleteStaff = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    const res = await deleteStaffMemberAction({
      id: deleteConfirm.id,
      type: deleteConfirm.type,
      divisionRoute: deleteConfirm.divisionRoute
    })
    setIsDeleting(false)
    if (res.success) {
      showToast(`${deleteConfirm.name} removed successfully`)
      setDeleteConfirm({ isOpen: false, id: '', name: '', type: 'DEPARTMENT_HEAD' })
      router.refresh()
    } else {
      showToast(res.error || 'Failed to remove member')
    }
  }

  // Group workers by division
  const workersByDivision = useMemo(() => {
    const map = new Map<string, FloorWorkerItem[]>()
    divisions.forEach(div => {
      map.set(div.route, [])
    })
    workers.forEach(w => {
      const existing = map.get(w.departmentRoute) || []
      existing.push(w)
      map.set(w.departmentRoute, existing)
    })
    return map
  }, [divisions, workers])

  // Filtered divisions based on search
  const filteredDivisions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return divisions

    return divisions.filter(div => {
      const nameMatch = div.name.toLowerCase().includes(q)
      const headNameMatch = div.appointedHead?.displayName.toLowerCase().includes(q) ||
        div.appointedHead?.username.toLowerCase().includes(q) ||
        div.appointedHead?.phone.includes(q) ||
        div.appointedHead?.phone2?.includes(q)
      
      const divWorkers = workersByDivision.get(div.route) || []
      const workerMatch = divWorkers.some(w => 
        w.name.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.role.toLowerCase().includes(q)
      )

      return nameMatch || headNameMatch || workerMatch
    })
  }, [divisions, searchQuery, workersByDivision])

  const primaryPM = productionManagers[0] || null

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-[#0B1220] text-white text-sm font-bold shadow-2xl flex items-center gap-2 border border-[#14C8B4]/40 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#14C8B4]" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. Header Banner - Matching Exact Module Hub Layout */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
            <ShieldCheck className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Supervisor &amp; <span className="text-[#1D4ED8]">Workers</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 shadow-xs tracking-wider">
                {divisions.length} Operating Units
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)]">
              Factory leadership hierarchy, department heads, and floor worker roster for {companyName}.
            </p>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="w-full sm:w-72 md:w-80 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department, head, worker..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] rounded-xl outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. ROW 1: Written About the Owner (Tier 1) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Crown className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-[#0B1220]">
                {owner.name}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#0B1220] text-white tracking-wider">
                Tier 1 • Owner
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-mono mt-0.5 flex-wrap">
              {owner.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {owner.email}
                </span>
              )}
              {owner.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  +91 {owner.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Full Factory Authority
          </span>
        </div>
      </div>

      {/* 3. ROW 2: Written About the Production Manager (Tier 2) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Factory className="w-5 h-5 text-[#0B1220]" />
          </div>
          <div>
            {primaryPM ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-bold text-[#0B1220]">
                    {primaryPM.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#0B1220] text-white tracking-wider">
                    Tier 2 • Production Manager
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    primaryPM.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {primaryPM.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-mono mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {primaryPM.phone}
                  </span>
                  {primaryPM.email && !primaryPM.email.endsWith('.local') && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {primaryPM.email}
                    </span>
                  )}
                  <span className="text-slate-400">• Factory-wide authority</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-[#0B1220]">
                    Production Manager
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tracking-wider">
                    Unassigned
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  No Production Manager appointed yet. Owner can delegate factory-wide oversight of department heads and floor workers.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {primaryPM ? (
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setPasswordModal({
                      isOpen: true,
                      userId: primaryPM.id,
                      userName: primaryPM.name,
                      username: primaryPM.username
                    })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B1220] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(primaryPM.id, 'PRODUCTION_MANAGER', primaryPM.isActive)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer"
                    title={primaryPM.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <PowerOff className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({
                      isOpen: true,
                      id: primaryPM.id,
                      name: primaryPM.name,
                      type: 'PRODUCTION_MANAGER'
                    })}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Production Manager"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            isOwner && (
              <button
                type="button"
                onClick={() => setIsPmModalOpen(true)}
                className="px-4 py-2 bg-[#0B1220] hover:bg-[#162032] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-[#14C8B4]" />
                <span>+ Appoint Production Manager</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 4. SECTION HEADER: Departments & Workers List */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">
            Purchased Operating Departments ({filteredDivisions.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Click any department row to expand its assigned Department Head and shop floor worker roster.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 5. DEPARTMENT ROWS: One by one aligned, expanding downwards on click */}
      <div className="space-y-3">
        {filteredDivisions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#0B1220]">No Matching Departments</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              No division, department head, or worker matches "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-[#0B1220] text-white text-xs font-bold rounded-xl"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          filteredDivisions.map(div => {
            const isExpanded = expandedRoutes.has(div.route)
            const IconComponent = DIVISION_ICONS[div.iconName] || Layers
            const divWorkers = workersByDivision.get(div.route) || []
            const head = div.appointedHead

            return (
              <div
                key={div.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* Clickable Row Header - Click anywhere to toggle */}
                <div
                  onClick={() => toggleExpand(div.route)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  {/* Left: Department Icon & Title */}
                  <div className="flex items-center gap-3.5 min-w-[260px]">
                    <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                      <IconComponent className="w-5 h-5 text-[#0B1220]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[#0B1220] tracking-tight">
                          {div.name}
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {div.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {div.defaultDesignation}
                      </p>
                    </div>
                  </div>

                  {/* Center: Head Summary & Workers Pill */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {head ? (
                      <div className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#14C8B4] shrink-0" />
                        <span className="font-bold text-[#0B1220]">{head.displayName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-600">+91 {head.phone}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-xl italic">
                        No Head Assigned
                      </span>
                    )}

                    <span className="bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#0B1220]" />
                      <span>{divWorkers.length} {divWorkers.length === 1 ? 'Worker' : 'Workers'}</span>
                    </span>
                  </div>

                  {/* Right: Expand Indicator */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <span className="text-xs font-bold text-slate-600">
                      {isExpanded ? 'Hide' : 'View Roster'}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-700 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 bg-[#0B1220] text-white' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* EXPANDED CONTENT UNDER ROW */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-[#F8FAFC]/70 p-5 sm:p-6 space-y-6 animate-in slide-in-from-top-1 duration-150">
                    
                    {/* SECTION A: Department Head Permissions Dossier (Tier 3) */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#0B1220] text-white">
                            Tier 3
                          </span>
                          <h4 className="text-base font-bold text-[#0B1220]">
                            Department In-charge (Head)
                          </h4>
                          {head && (
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              head.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {head.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          )}
                        </div>

                        {canAppointHeads && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenAppointHead(div.route, head || undefined)
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-[#0B1220] text-[#0B1220] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{head ? 'Edit Head Permissions' : '+ Appoint Department Head'}</span>
                          </button>
                        )}
                      </div>

                      {head ? (
                        <div className="space-y-3.5">
                          {/* Profile row */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/60 text-xs">
                            <div>
                              <span className="text-slate-400 font-medium block">Head Name &amp; User</span>
                              <span className="text-sm font-bold text-[#0B1220] block">{head.displayName}</span>
                              <span className="text-slate-500 font-mono">@{head.username}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium block">Contact Numbers</span>
                              <span className="font-mono font-bold text-slate-800 block">+91 {head.phone}</span>
                              {head.phone2 && (
                                <span className="font-mono text-slate-600 block">+91 {head.phone2} (Alt)</span>
                              )}
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium block">System Login</span>
                              <span className="font-mono text-slate-700 truncate block">{head.email}</span>
                            </div>
                          </div>

                          {/* Allowed Modules & Tabs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="font-bold text-slate-700 block mb-1.5 uppercase font-mono tracking-wider">
                                Allowed Modules ({head.allowedModules.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {head.allowedModules.map(mRoute => {
                                  const catItem = divisions.find(d => d.route === mRoute)
                                  return (
                                    <span
                                      key={mRoute}
                                      className="font-semibold bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30 px-2.5 py-1 rounded-lg"
                                    >
                                      {catItem?.name || mRoute}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>

                            <div>
                              <span className="font-bold text-slate-700 block mb-1.5 uppercase font-mono tracking-wider">
                                Top Tabs Visibility ({head.allowedTabs.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {head.allowedTabs.map(tab => (
                                  <span
                                    key={tab}
                                    className="font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                                  >
                                    {tab}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Head Actions */}
                          {canAppointHeads && (
                            <div className="pt-2 flex items-center gap-2 border-t border-slate-100 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setPasswordModal({
                                  isOpen: true,
                                  userId: head.id,
                                  userName: head.displayName,
                                  username: head.username
                                })}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B1220] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(head.id, 'DEPARTMENT_HEAD', head.isActive)}
                                className="p-2 rounded-xl text-slate-500 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer"
                                title={head.isActive ? 'Deactivate' : 'Activate'}
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
                                className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ml-auto"
                                title="Remove Department Head"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#F8FAFC] rounded-xl p-4 border border-dashed border-slate-300 text-center space-y-2">
                          <p className="text-xs sm:text-sm text-slate-500">
                            No Department Head assigned for {div.name} yet.
                          </p>
                          {canAppointHeads && (
                            <button
                              type="button"
                              onClick={() => handleOpenAppointHead(div.route)}
                              className="px-3.5 py-1.5 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#14C8B4]" />
                              <span>Assign Head for {div.name}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* SECTION B: Shop Floor Workers Roster (Tier 4) */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#0B1220] text-white">
                            Tier 4
                          </span>
                          <h4 className="text-base font-bold text-[#0B1220]">
                            Shop Floor Workers ({divWorkers.length})
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenAddWorker(div.route)}
                          className="px-3 py-1.5 bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#14C8B4]" />
                          <span>+ Add Worker</span>
                        </button>
                      </div>

                      {divWorkers.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-[#F8FAFC]">
                                <th className="py-2.5 px-3 rounded-l-lg">Worker Name</th>
                                <th className="py-2.5 px-3">Mobile Contact</th>
                                <th className="py-2.5 px-3">Role</th>
                                <th className="py-2.5 px-3">Shift</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                              {divWorkers.map(w => (
                                <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-2.5 px-3 font-bold text-[#0B1220]">
                                    {w.name}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                                    +91 {w.phone}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {w.role}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {w.shift}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(w.id, 'WORKER', w.status === 'ACTIVE', div.route)}
                                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                        w.status === 'ACTIVE'
                                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                      }`}
                                    >
                                      {w.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                                    </button>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirm({
                                        isOpen: true,
                                        id: w.id,
                                        name: w.name,
                                        type: 'WORKER',
                                        divisionRoute: div.route
                                      })}
                                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer inline-flex"
                                      title="Remove Worker"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-[#F8FAFC] rounded-xl p-6 border border-dashed border-slate-300 text-center space-y-2">
                          <Users className="w-7 h-7 text-slate-300 mx-auto" />
                          <p className="text-xs sm:text-sm text-slate-500">
                            No shop floor workers registered under {div.name} yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddWorker(div.route)}
                            className="px-3.5 py-1.5 bg-[#0B1220] hover:bg-[#162032] text-white text-xs font-bold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#14C8B4]" />
                            <span>Register First Worker</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )
          })
        )}
      </div>

      {/* MODALS */}
      {/* 1. Appoint Production Manager Modal (2 Steps) */}
      <AppointProductionManagerModal
        isOpen={isPmModalOpen}
        onClose={() => setIsPmModalOpen(false)}
        onSuccess={() => {
          showToast('Production Manager appointed successfully!')
          router.refresh()
        }}
      />

      {/* 2. Appoint Department Head Modal (2 Steps) */}
      <AppointDepartmentHeadModal
        isOpen={isHeadModalOpen}
        onClose={() => {
          setIsHeadModalOpen(false)
          setSelectedHeadForEdit(null)
          setHeadModalInitialRoute(undefined)
        }}
        onSuccess={() => {
          showToast(selectedHeadForEdit ? 'Department Head updated successfully!' : 'Department Head appointed successfully!')
          router.refresh()
        }}
        existingHead={selectedHeadForEdit}
        allowedDivisions={allowedDivisions}
        initialDivisionRoute={headModalInitialRoute}
      />

      {/* 3. Add Worker Modal */}
      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false)
          setWorkerModalInitialRoute(undefined)
        }}
        onSuccess={() => {
          showToast('Shop floor worker registered successfully!')
          router.refresh()
        }}
        allowedDivisions={allowedDivisions}
        initialDivisionRoute={workerModalInitialRoute}
      />

      {/* 4. Reset Password Modal */}
      <ResetPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, userId: '', userName: '', username: '' })}
        headId={passwordModal.userId}
        headName={passwordModal.userName}
        username={passwordModal.username}
        onSuccess={() => {
          showToast('Password updated successfully!')
          router.refresh()
        }}
      />

      {/* 5. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '', type: 'DEPARTMENT_HEAD' })}
        onConfirm={handleDeleteStaff}
        isLoading={isDeleting}
        title={`Remove ${deleteConfirm.name}?`}
        description={`Are you sure you want to remove ${deleteConfirm.name}? This action cannot be undone and will revoke their factory access.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  )
}
