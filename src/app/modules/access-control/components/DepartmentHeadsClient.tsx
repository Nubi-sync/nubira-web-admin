'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
  Mail,
  UserCheck,
  Plus,
  ShieldCheck
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
  const owner = hubData?.owner || { name: 'Company Owner', email: '' }

  const isOwner = callerPowerLevel === 'OWNER'
  const isPM = callerPowerLevel === 'PRODUCTION_MANAGER'
  const canAppointHeads = isOwner || isPM

  // Local state for optimistic instant updates
  const [departmentHeadsList, setDepartmentHeadsList] = useState<DepartmentHeadItem[]>(() => hubData?.departmentHeads || [])
  const [productionManagersList, setProductionManagersList] = useState<ProductionManagerItem[]>(() => hubData?.productionManagers || [])
  const [workersList, setWorkersList] = useState<FloorWorkerItem[]>(() => hubData?.workers || [])

  useEffect(() => {
    if (hubData?.departmentHeads) setDepartmentHeadsList(hubData.departmentHeads)
    if (hubData?.productionManagers) setProductionManagersList(hubData.productionManagers)
    if (hubData?.workers) setWorkersList(hubData.workers)
  }, [hubData])

  // Search query
  const [searchQuery, setSearchQuery] = useState('')

  // Expand / Collapse state: strictly empty set by default (all closed as requested)
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(() => new Set())

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

  // Password reset modal (strictly Owner-only access)
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
    username?: string
    phone?: string
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    username: '',
    phone: ''
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

  // Clean Toast: White bg, black font, green tick (Single Notification)
  const showToast = (msg: string) => {
    try {
      toast.success(msg, {
        style: {
          backgroundColor: '#FFFFFF',
          color: '#0B1220',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          fontWeight: '600'
        },
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      })
    } catch (_) {}
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
      if (type === 'DEPARTMENT_HEAD') {
        setDepartmentHeadsList(prev => prev.map(h => h.id === id ? { ...h, isActive: !currentStatus } : h))
      } else if (type === 'PRODUCTION_MANAGER') {
        setProductionManagersList(prev => prev.map(pm => pm.id === id ? { ...pm, isActive: !currentStatus } : pm))
      } else if (type === 'WORKER') {
        setWorkersList(prev => prev.map(w => w.id === id ? { ...w, status: currentStatus ? 'INACTIVE' : 'ACTIVE' } : w))
      }
      showToast(`Status updated to ${currentStatus ? 'Inactive' : 'Active'}`)
      router.refresh()
    } else {
      showToast(res.error || 'Failed to update status')
    }
  }

  const handleDeleteStaff = async () => {
    if (!deleteConfirm.id) return
    setIsDeleting(true)
    const targetId = deleteConfirm.id
    const targetName = deleteConfirm.name
    const targetType = deleteConfirm.type

    const res = await deleteStaffMemberAction({
      id: targetId,
      type: targetType,
      divisionRoute: deleteConfirm.divisionRoute
    })
    setIsDeleting(false)

    if (res.success) {
      // Optimistically remove immediately from local state
      if (targetType === 'DEPARTMENT_HEAD') {
        setDepartmentHeadsList(prev => prev.filter(h => h.id !== targetId))
      } else if (targetType === 'PRODUCTION_MANAGER') {
        setProductionManagersList(prev => prev.filter(pm => pm.id !== targetId))
      } else if (targetType === 'WORKER') {
        setWorkersList(prev => prev.filter(w => w.id !== targetId))
      }

      setDeleteConfirm({ isOpen: false, id: '', name: '', type: 'DEPARTMENT_HEAD' })
      showToast(`${targetName} removed successfully`)
      router.refresh()
    } else {
      showToast(res.error || 'Failed to remove member')
    }
  }

  // Dynamic divisions with live heads
  const divisionsWithHeads = useMemo(() => {
    return divisions.map(div => {
      const headsForDivision = departmentHeadsList.filter(h => h.allowedModules.includes(div.route))
      return {
        ...div,
        appointedHead: headsForDivision[0] || null,
        secondaryHeads: headsForDivision.slice(1)
      }
    })
  }, [divisions, departmentHeadsList])

  // Group workers by division
  const workersByDivision = useMemo(() => {
    const map = new Map<string, FloorWorkerItem[]>()
    divisions.forEach(div => {
      map.set(div.route, [])
    })
    workersList.forEach(w => {
      const existing = map.get(w.departmentRoute) || []
      existing.push(w)
      map.set(w.departmentRoute, existing)
    })
    return map
  }, [divisions, workersList])

  // Filtered divisions based on search
  const filteredDivisions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return divisionsWithHeads

    return divisionsWithHeads.filter(div => {
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
  }, [divisionsWithHeads, searchQuery, workersByDivision])

  const primaryPM = productionManagersList[0] || null

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1536px] w-full mx-auto select-none text-[#0B1220]">
      

      {/* 1. Header Banner - Clean with Department Pill */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <ShieldCheck className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                Supervisor &amp; <span className="text-[#1D4ED8]">Workers</span>
              </h1>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                {divisions.length} Departments
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
              Factory leadership hierarchy, department heads, and floor worker roster for {companyName}.
            </p>
          </div>
        </div>

        {/* Right Search Input - Generous touch target & clear readability */}
        <div className="w-full sm:w-80 md:w-96 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments or staff..."
              className="min-h-[42px] w-full pl-10 pr-9 py-2 sm:py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium border border-slate-200 focus:border-[#0B1220] focus:ring-2 focus:ring-[#0B1220]/10 rounded-xl outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. ROW 1: Written About the Owner - No pill clutter */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Crown className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base sm:text-lg lg:text-xl font-bold text-[#0B1220]">
                {owner.name}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500">
                (Company Owner)
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-base text-slate-700 font-mono mt-1 flex-wrap">
              {owner.email && (
                <span className="flex items-center gap-1.5 font-sans font-medium text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  {owner.email}
                </span>
              )}
              {owner.phone && (
                <a href={`tel:+91${owner.phone}`} className="flex items-center gap-1.5 font-bold hover:underline text-[#0B1220]">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  +91 {owner.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Full Factory Authority
          </span>
        </div>
      </div>

      {/* 3. ROW 2: Written About the Production Manager - High Contrast & Large Touch Buttons */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shrink-0 shadow-2xs">
            <Factory className="w-6 h-6 text-[#0B1220]" />
          </div>
          <div>
            {primaryPM ? (
              <>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-[#0B1220]">
                    {primaryPM.name}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    (Production Manager)
                  </span>
                  <span className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border ${
                    primaryPM.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    • {primaryPM.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-base text-slate-700 font-mono mt-1 flex-wrap">
                  <a href={`tel:+91${primaryPM.phone}`} className="flex items-center gap-1.5 font-bold hover:underline text-[#0B1220]">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    +91 {primaryPM.phone}
                  </a>
                  {primaryPM.email && !primaryPM.email.endsWith('.local') && (
                    <span className="flex items-center gap-1.5 font-sans font-medium text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      {primaryPM.email}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-[#0B1220]">
                    Production Manager
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">
                    (Not Assigned)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  No Production Manager appointed yet. Owner can delegate factory-wide oversight.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
          {primaryPM ? (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setPasswordModal({
                      isOpen: true,
                      userId: primaryPM.id,
                      userName: primaryPM.name,
                      username: primaryPM.username,
                      phone: primaryPM.phone
                    })}
                    className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-[#0B1220] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Reset Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(primaryPM.id, 'PRODUCTION_MANAGER', primaryPM.isActive)}
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
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
                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
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
                className="w-full sm:w-auto min-h-[42px] px-4.5 py-2 sm:py-2.5 bg-[#0B1220] hover:bg-[#162032] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-[#14C8B4]" />
                <span>Appoint Production Manager</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* 4. SECTION HEADER: Departments & Staff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1220] font-[family-name:var(--font-heading)]">
            Factory Departments
          </h2>
          <span className="text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-[#14C8B4]/30">
            {filteredDivisions.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <button
            type="button"
            onClick={expandAll}
            className="min-h-[42px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="min-h-[42px] px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Table Column Header Guide for Perfect Vertical Alignment (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-5">Department</div>
        <div className="col-span-4">Department In-Charge</div>
        <div className="col-span-2 text-center">Floor Staff</div>
        <div className="col-span-1 text-right">Details</div>
      </div>

      {/* 5. DEPARTMENT ROWS: One by one aligned strictly in grid columns */}
      <div className="space-y-3.5">
        {filteredDivisions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base sm:text-lg font-bold text-[#0B1220]">No Matching Departments</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              No department, head, or worker matches "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="min-h-[44px] px-6 py-2.5 bg-[#0B1220] hover:bg-[#162032] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs inline-flex items-center justify-center cursor-pointer active:scale-[0.98]"
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
            const allHeadsForDiv = departmentHeadsList.filter(h => h.allowedModules.includes(div.route))
            const totalHeadsCount = allHeadsForDiv.length

            return (
              <div
                key={div.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* 1. Desktop Clickable Row Header - Strict 12-column CSS Grid Alignment */}
                <div
                  onClick={() => toggleExpand(div.route)}
                  className="hidden md:grid grid-cols-12 items-center gap-4 p-5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Column 1: Department Info (5 columns) */}
                  <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                      <IconComponent className="w-6 h-6 text-[#0B1220]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base lg:text-lg font-bold text-[#0B1220] truncate">
                        {div.name}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                        {div.defaultDesignation}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Department In-charge (4 columns) - Strictly aligned */}
                  <div className="col-span-4 min-w-0">
                    {totalHeadsCount > 0 && head ? (
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-[#0B1220] truncate flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#14C8B4] shrink-0" />
                          <span className="truncate">{head.displayName}</span>
                          {totalHeadsCount > 1 && (
                            <span className="text-xs text-slate-500 shrink-0 font-normal">
                              (+{totalHeadsCount - 1} more)
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-mono font-bold text-slate-700 truncate pl-4.5">
                          +91 {head.phone} {head.phone2 ? `• +91 ${head.phone2}` : ''}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-400">
                        Not Assigned
                      </div>
                    )}
                  </div>

                  {/* Column 3: Floor Staff Count (2 columns) - Strictly aligned */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm sm:text-base font-bold text-[#0B1220]">
                      {divWorkers.length} {divWorkers.length === 1 ? 'Worker' : 'Workers'}
                    </div>
                  </div>

                  {/* Column 4: Details / Chevron (1 column) */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className={`p-2 rounded-xl text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                    }`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* 2. Mobile Clickable Row Header (390px Viewport Ergonomics) */}
                <div
                  onClick={() => toggleExpand(div.route)}
                  className="block md:hidden p-4 sm:p-5 cursor-pointer select-none hover:bg-slate-50/60 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-black/15 flex items-center justify-center text-[#0B1220] shadow-2xs shrink-0">
                        <IconComponent className="w-5 h-5 text-[#0B1220]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold text-[#0B1220] truncate">
                          {div.name}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 truncate">
                          {div.defaultDesignation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {divWorkers.length} {divWorkers.length === 1 ? 'Worker' : 'Workers'}
                      </span>
                      <div className={`p-1.5 rounded-lg text-slate-400 group-hover:text-[#0B1220] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#0B1220]' : ''
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Sub-strip with In-charge details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-semibold text-slate-400 uppercase tracking-wide text-[11px] shrink-0">In-Charge:</span>
                      {totalHeadsCount > 0 && head ? (
                        <span className="font-bold text-[#0B1220] truncate flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#14C8B4] shrink-0" />
                          <span className="truncate">{head.displayName}</span>
                          {totalHeadsCount > 1 && (
                            <span className="text-slate-500 font-normal shrink-0">
                              (+{totalHeadsCount - 1})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Not Assigned</span>
                      )}
                    </div>
                    {totalHeadsCount > 0 && head && (
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        +91 {head.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* EXPANDED CONTENT UNDER ROW */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-[#F8FAFC]/70 p-4 sm:p-6 space-y-5 animate-in slide-in-from-top-1 duration-150">
                    
                    {/* SECTION A: Department In-charge Details */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-[#0B1220]">
                            Department In-charge ({totalHeadsCount})
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                            Supervisors and heads managing operations for {div.name}.
                          </p>
                        </div>

                        {canAppointHeads && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenAppointHead(div.route, head || undefined)
                            }}
                            className="w-full sm:w-auto min-h-[40px] sm:min-h-[42px] px-4.5 py-2 sm:py-2.5 bg-[#0B1220] hover:bg-[#162032] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                          >
                            <Plus className="w-4 h-4 text-[#14C8B4]" />
                            <span>{head ? 'Edit In-charge Details' : 'Assign Department Head'}</span>
                          </button>
                        )}
                      </div>

                      {totalHeadsCount > 0 ? (
                        <>
                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-500 bg-[#F8FAFC]">
                                  <th className="py-3 px-4 rounded-l-xl">Head Name</th>
                                  <th className="py-3 px-4">Mobile Contact</th>
                                  <th className="py-3 px-4">Designation</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm">
                                {allHeadsForDiv.map((h) => (
                                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-[#0B1220]">
                                      {h.displayName}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                      +91 {h.phone} {h.phone2 ? `• +91 ${h.phone2}` : ''}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                                        {h.designation}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(h.id, 'DEPARTMENT_HEAD', h.isActive)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                          h.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                        }`}
                                      >
                                        • {h.isActive ? 'Active' : 'Inactive'}
                                      </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {isOwner && (
                                          <button
                                            type="button"
                                            onClick={() => setPasswordModal({
                                              isOpen: true,
                                              userId: h.id,
                                              userName: h.displayName,
                                              username: h.username,
                                              phone: h.phone
                                            })}
                                            className="min-h-[40px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B1220] border border-slate-300/80 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                                            title="Reset Password"
                                          >
                                            <KeyRound className="w-4 h-4" />
                                            <span>Reset Password</span>
                                          </button>
                                        )}
                                        {canAppointHeads && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => handleOpenAppointHead(div.route, h)}
                                              className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                              title="Edit Details"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setDeleteConfirm({
                                                isOpen: true,
                                                id: h.id,
                                                name: h.displayName,
                                                type: 'DEPARTMENT_HEAD'
                                              })}
                                              className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                              title="Remove Head"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Dedicated Card List (No cramped tables on 390px screens) */}
                          <div className="block md:hidden space-y-3.5">
                            {allHeadsForDiv.map((h) => (
                              <div key={h.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-base font-bold text-[#0B1220]">
                                      {h.displayName}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                                      {h.designation}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(h.id, 'DEPARTMENT_HEAD', h.isActive)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                      h.isActive
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    • {h.isActive ? 'Active' : 'Inactive'}
                                  </button>
                                </div>

                                <div className="text-sm font-mono font-bold text-slate-800 space-y-1">
                                  <a href={`tel:+91${h.phone}`} className="flex items-center gap-2 hover:underline text-[#0B1220]">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                    +91 {h.phone}
                                  </a>
                                  {h.phone2 && (
                                    <a href={`tel:+91${h.phone2}`} className="flex items-center gap-2 text-xs text-slate-600 hover:underline">
                                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      +91 {h.phone2} (Secondary)
                                    </a>
                                  )}
                                </div>

                                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                                  {isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => setPasswordModal({
                                        isOpen: true,
                                        userId: h.id,
                                        userName: h.displayName,
                                        username: h.username,
                                        phone: h.phone
                                      })}
                                      className="flex-1 min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-[#0B1220] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                                    >
                                      <KeyRound className="w-4 h-4" />
                                      <span>Reset Password</span>
                                    </button>
                                  )}
                                  {canAppointHeads && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAppointHead(div.route, h)}
                                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0B1220] hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                        title="Edit Details"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirm({
                                          isOpen: true,
                                          id: h.id,
                                          name: h.displayName,
                                          type: 'DEPARTMENT_HEAD'
                                        })}
                                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                        title="Remove Head"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-dashed border-slate-300 text-center space-y-1.5">
                          <p className="text-sm font-semibold text-slate-600">
                            No Department Head assigned for {div.name} yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* SECTION B: Shop Floor Workers Roster */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-[#0B1220]">
                            Shop Floor Workers ({divWorkers.length})
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                            Staff assigned to {div.name}.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenAddWorker(div.route)}
                          className="w-full sm:w-auto min-h-[40px] sm:min-h-[42px] px-4.5 py-2 sm:py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <Plus className="w-4 h-4 text-white" />
                          <span>Add Worker</span>
                        </button>
                      </div>

                      {divWorkers.length > 0 ? (
                        <>
                          {/* Desktop Table View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-500 bg-[#F8FAFC]">
                                  <th className="py-3 px-4 rounded-l-xl">Worker Name</th>
                                  <th className="py-3 px-4">Mobile Contact</th>
                                  <th className="py-3 px-4">Role</th>
                                  <th className="py-3 px-4">Shift</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-sm">
                                {divWorkers.map(w => (
                                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-[#0B1220]">
                                      {w.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                                      +91 {w.phone}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                                        {w.role}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                                        {w.shift}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(w.id, 'WORKER', w.status === 'ACTIVE', div.route)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                          w.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                        }`}
                                      >
                                        • {w.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                      </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {isOwner && (
                                          <button
                                            type="button"
                                            onClick={() => setPasswordModal({
                                              isOpen: true,
                                              userId: w.id,
                                              userName: w.name,
                                              username: w.phone,
                                              phone: w.phone
                                            })}
                                            className="min-h-[40px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B1220] border border-slate-300/80 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
                                            title="Reset Password"
                                          >
                                            <KeyRound className="w-4 h-4" />
                                            <span>Reset Password</span>
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirm({
                                            isOpen: true,
                                            id: w.id,
                                            name: w.name,
                                            type: 'WORKER',
                                            divisionRoute: div.route
                                          })}
                                          className="min-w-[40px] min-h-[40px] p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                          title="Remove Worker"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Dedicated Card List (No cramped tables on 390px screens) */}
                          <div className="block md:hidden space-y-3.5">
                            {divWorkers.map(w => (
                              <div key={w.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-base font-bold text-[#0B1220]">
                                      {w.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-xs sm:text-sm font-semibold text-slate-700">
                                        {w.role}
                                      </span>
                                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                                        {w.shift}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(w.id, 'WORKER', w.status === 'ACTIVE', div.route)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                                      w.status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}
                                  >
                                    • {w.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                  </button>
                                </div>

                                <div className="text-sm font-mono font-bold text-slate-800">
                                  <a href={`tel:+91${w.phone}`} className="flex items-center gap-2 hover:underline text-[#0B1220]">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                    +91 {w.phone}
                                  </a>
                                </div>

                                <div className="pt-2.5 border-t border-slate-100 flex items-center gap-2">
                                  {isOwner && (
                                    <button
                                      type="button"
                                      onClick={() => setPasswordModal({
                                        isOpen: true,
                                        userId: w.id,
                                        userName: w.name,
                                        username: w.phone,
                                        phone: w.phone
                                      })}
                                      className="flex-1 min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-[#0B1220] rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                                    >
                                      <KeyRound className="w-4 h-4" />
                                      <span>Reset Password</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirm({
                                      isOpen: true,
                                      id: w.id,
                                      name: w.name,
                                      type: 'WORKER',
                                      divisionRoute: div.route
                                    })}
                                    className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center shadow-2xs active:scale-[0.98]"
                                    title="Remove Worker"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-dashed border-slate-300 text-center space-y-1.5">
                          <Users className="w-7 h-7 text-slate-300 mx-auto" />
                          <p className="text-sm font-semibold text-slate-600">
                            No shop floor workers registered under {div.name} yet.
                          </p>
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
        onSuccess={(savedPm?: ProductionManagerItem) => {
          if (savedPm) {
            setProductionManagersList([savedPm])
          }
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
        onSuccess={(savedHead?: DepartmentHeadItem) => {
          if (savedHead) {
            setDepartmentHeadsList(prev => {
              const exists = prev.some(h => h.id === savedHead.id)
              if (exists) {
                return prev.map(h => h.id === savedHead.id ? savedHead : h)
              }
              return [savedHead, ...prev]
            })
          }
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
        onSuccess={(savedWorker?: FloorWorkerItem) => {
          if (savedWorker) {
            setWorkersList(prev => {
              const exists = prev.some(w => w.id === savedWorker.id)
              if (exists) {
                return prev.map(w => w.id === savedWorker.id ? savedWorker : w)
              }
              return [savedWorker, ...prev]
            })
          }
          showToast('Shop floor worker registered successfully!')
          router.refresh()
        }}
        allowedDivisions={allowedDivisions}
        initialDivisionRoute={workerModalInitialRoute}
      />

      {/* 4. Reset Password Modal (strictly Owner-only) */}
      <ResetPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() => setPasswordModal({ isOpen: false, userId: '', userName: '', username: '', phone: '' })}
        headId={passwordModal.userId}
        headName={passwordModal.userName}
        username={passwordModal.username || ''}
        phone={passwordModal.phone}
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
        description={`Are you sure you want to remove ${deleteConfirm.name}? This action will revoke their access to the factory.`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  )
}
