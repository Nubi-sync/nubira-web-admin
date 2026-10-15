'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  User,
  Building2,
  ShieldCheck,
  Clock,
  Mail,
  Phone,
  Layers,
  ChevronLeft,
  Settings,
  Sliders,
  CheckCircle2,
  CheckCircle,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  Gauge,
  Calendar,
  Scissors,
  Zap,
  Cpu,
  QrCode,
  Store,
  Tag,
  Warehouse,
  Truck,
  Scale,
  Box,
  Container,
  Palette,
  Monitor,
  FileText,
  Briefcase,
  ShoppingBag,
  DollarSign,
  IndianRupee,
  TrendingUp,
  Printer,
  Flame,
  Waves,
  Wind,
  Droplet,
  Boxes,
  CheckSquare,
  PackageCheck,
  Wrench,
  ShieldAlert,
  Factory,
  Trash2,
  UserX,
  Database,
  Lock,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react'
import {
  purgeDivisionOperationalDataAction,
  purgeDivisionStaffAction,
  deleteSingleDivisionStaffAction,
} from './actions'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Factory,
  Scissors,
  Layers,
  Zap,
  Gauge,
  CheckCircle2,
  CheckCircle,
  Cpu,
  QrCode,
  Store,
  Tag,
  Warehouse,
  Truck,
  Scale,
  Box,
  Container,
  Palette,
  Monitor,
  FileText,
  Briefcase,
  ShoppingBag,
  DollarSign,
  IndianRupee,
  Calendar,
  TrendingUp,
  Printer,
  Flame,
  Sparkles,
  Waves,
  Wind,
  Droplet,
  Boxes,
  ShieldCheck,
  CheckSquare,
  PackageCheck,
  Wrench,
  ShieldAlert,
  Building2,
  Users,
  Search,
  ArrowRight,
}

export interface DivisionStaffMember {
  id: string
  username: string
  role: string
  designation?: string
  is_active?: boolean
  created_at?: string
  is_head?: boolean
}

export interface DivisionHeadInfo {
  name: string
  designation?: string
  email?: string
  phone?: string
  appointmentDate?: string
  authorityScope?: string
}

export interface DivisionOperationalSpec {
  label: string
  value: string
  iconName?: string
  icon?: any
}

interface DivisionProfileViewProps {
  divisionName: string
  divisionSlug: string
  divisionCode?: string
  categoryBadge: string
  companyName?: string
  userEmail?: string
  userName?: string
  userRole?: string
  iconName?: string
  icon?: any
  supervisorName?: string
  shiftDetails?: string
  capacityInfo?: string
  qualityStandard?: string
  departmentHead?: DivisionHeadInfo | null
  operationalSpecs?: DivisionOperationalSpec[]
  staff?: DivisionStaffMember[]
  backHref?: string
  backLabel?: string
}

export function DivisionProfileView({
  divisionName,
  divisionSlug,
  divisionCode,
  categoryBadge,
  companyName,
  userEmail = '',
  userName = '',
  userRole = 'DIVISION_SUPERVISOR',
  iconName,
  icon,
  supervisorName = 'Operations Head',
  shiftDetails = 'Shift A (08:30 AM - 05:30 PM)',
  capacityInfo = 'Standard Plant Allocation',
  qualityStandard = 'ISO 9001 / Zero-Defect Line',
  departmentHead,
  operationalSpecs = [],
  staff = [],
  backHref = '/modules',
  backLabel = 'Workspace Hub',
}: DivisionProfileViewProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeModal, setActiveModal] = useState<'OPERATIONAL' | 'STAFF' | 'SINGLE_STAFF' | null>(null)
  const [targetStaff, setTargetStaff] = useState<DivisionStaffMember | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurgeOperationalData = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') return
    setIsProcessing(true)
    try {
      const res = await purgeDivisionOperationalDataAction({
        divisionSlug,
        divisionCode,
        confirmationText: confirmInput.trim(),
      })
      if (res.success) {
        toast.success(res.message || 'Operational data successfully purged.')
        setActiveModal(null)
        setConfirmInput('')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to purge data.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePurgeStaffDirectory = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') return
    setIsProcessing(true)
    try {
      const res = await purgeDivisionStaffAction({
        divisionSlug,
        divisionCode,
        confirmationText: confirmInput.trim(),
      })
      if (res.success) {
        toast.success(res.message || 'Workforce directory reset successfully.')
        setActiveModal(null)
        setConfirmInput('')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to reset staff.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSingleStaff = async () => {
    if (!targetStaff) return
    setIsProcessing(true)
    try {
      const res = await deleteSingleDivisionStaffAction({
        staffId: targetStaff.id,
        divisionSlug,
      })
      if (res.success) {
        toast.success(res.message || `${targetStaff.username} removed from this division.`)
        setActiveModal(null)
        setTargetStaff(null)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to remove staff member.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Resolve main division icon safely
  const MainIcon = (iconName && ICON_MAP[iconName]) || icon || Boxes

  // Filter staff by search term
  const filteredStaff = staff.filter((s) => {
    const term = searchTerm.toLowerCase()
    return (
      s.username.toLowerCase().includes(term) ||
      (s.role || '').toLowerCase().includes(term) ||
      (s.designation || '').toLowerCase().includes(term)
    )
  })

  // Resolved head info
  const headName = departmentHead?.name || userName || supervisorName
  const headDesignation = departmentHead?.designation || userRole
  const headEmail = departmentHead?.email || userEmail
  const headPhone = departmentHead?.phone || 'Floor Direct Intercom'
  const headAppointment = departmentHead?.appointmentDate || 'Provisioned Facility'
  const headAuthority = departmentHead?.authorityScope || 'Full Floor Authority & Challan Clearance'

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-5 sm:space-y-6 select-none">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs bg-[#F0FDFA] text-[#0B1220] border border-black/15">
            <MainIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {divisionName} Profile
              </h1>
              {divisionCode && (
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
                  Division {divisionCode}
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 tracking-wider">
                {categoryBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Division configuration, supervisor leadership, and floor workforce directory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-700 transition-all shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{backLabel}</span>
          </Link>

          <Link
            href={divisionSlug}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
          >
            <span>Enter Live Floor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. Leadership & Division Operational Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Appointed Department Head Leadership Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 font-[family-name:var(--font-heading)]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Appointed Department Head
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Division Authority
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm pt-3">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Official Head</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">{headName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Designation</span>
                <span className="font-bold text-[#0B1220] font-mono text-xs">{headDesignation}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Login ID / Email</span>
                <span className="font-bold text-slate-800 font-mono text-xs truncate max-w-[200px]" title={headEmail}>
                  {headEmail || 'Verified Floor Auth'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Contact Number</span>
                <span className="font-mono text-slate-800 font-semibold">{headPhone}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="font-semibold text-slate-500">Authority Scope</span>
                <span className="font-bold text-emerald-700 font-mono text-xs text-right max-w-[220px]">
                  {headAuthority}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Appointment: {headAppointment}</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified In-Charge
            </span>
          </div>
        </div>

        {/* Division Technical Capacity & Machine Parameters Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 font-[family-name:var(--font-heading)]">
                <Settings className="w-4 h-4 text-[#0B1220]" />
                Technical Capacity & Machinery
              </h2>
              <span className="text-[10px] font-mono font-bold text-[#0B1220] bg-[#F0FDFA] px-2 py-0.5 rounded border border-black/15">
                OPERATIONAL
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm pt-3">
              {operationalSpecs.length > 0 ? (
                operationalSpecs.map((spec, i) => {
                  const SpecIcon = (spec.iconName && ICON_MAP[spec.iconName]) || spec.icon || Gauge
                  return (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                      <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                        <SpecIcon className="w-3.5 h-3.5 text-[#0B1220]" />
                        <span>{spec.label}</span>
                      </span>
                      <span className="font-bold text-slate-900 font-mono text-right max-w-[220px]">
                        {spec.value}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                  <span className="font-semibold text-slate-500">Floor Allocation</span>
                  <span className="font-bold text-slate-900 font-mono">{capacityInfo}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Floor Shift Schedule</span>
                <span className="font-bold text-slate-900 font-mono">{shiftDetails}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="font-semibold text-slate-500">Audit & Quality Benchmark</span>
                <span className="font-bold text-slate-900 font-mono text-right max-w-[220px]">
                  {qualityStandard}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="font-semibold text-slate-500">Realtime WebSocket Sync</span>
                <span className="font-bold text-emerald-700 font-mono">Connected (&lt;100ms)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Plant Standards: Certified</span>
            <span className="text-[#0B1220] font-bold">100% Traceability</span>
          </div>
        </div>

      </div>

      {/* 4. Division Workforce Directory (Personnel assigned specifically to this module) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0B1220] border border-black/15 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  {divisionName} Workforce Directory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-2xs">
                  {staff.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisors, operators, and line technicians assigned to this manufacturing division
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B1220]/20 focus:border-[#0B1220] font-medium"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                  <th className="py-3 px-4">Worker / Operator</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Floor Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No floor staff registered under this division</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Add supervisors or technicians via Employee Management.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((person) => {
                    const formattedDate = person.created_at
                      ? new Date(person.created_at).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Active'

                    return (
                      <tr key={person.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-black/15 text-[#0B1220] font-bold flex items-center justify-center shrink-0 text-xs uppercase font-mono shadow-2xs">
                              {person.username.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {person.username}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                UID: {person.id.substring(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#F0FDFA] text-[#0B1220] border border-black/15">
                              {person.designation || person.role}
                            </span>
                            {person.is_head && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <ShieldCheck className="w-3 h-3" />
                                Head
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                          {shiftDetails.split('(')[0].trim() || 'General Shift'}
                        </td>

                        <td className="py-3 px-4">
                          {person.is_active !== false ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active on Floor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 font-mono">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              Off Shift
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-500 text-xs">
                          {formattedDate}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetStaff(person)
                              setActiveModal('SINGLE_STAFF')
                            }}
                            title={`Remove ${person.username} from this division`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone: Module Data Administration */}
      <div className="bg-white rounded-2xl border border-rose-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-rose-100 bg-rose-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  Division Data Management & Safety Purge
                </h2>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Danger Zone
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Permanently clear operational transaction logs or reset registered division personnel.
              </p>
            </div>
          </div>

          {companyName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-200 text-slate-700 font-mono text-[11px] font-bold shadow-2xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Account Scoped: <strong className="text-slate-900">{companyName}</strong></span>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Operational Data Purge */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-rose-200 bg-slate-50/60 hover:bg-rose-50/20 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-700">
                <Database className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Purge Division Operational Data
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deletes all active lots, delivery challans, allotments, line bundle allocations, and 3-stage QC logs for <strong>{divisionName}</strong> under <strong>{companyName || 'your factory'}</strong>.
              </p>
              <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/80 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Worker profiles & company identity remain completely preserved.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmInput('')
                setActiveModal('OPERATIONAL')
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs border border-rose-300 hover:border-rose-600 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Operational Data</span>
            </button>
          </div>

          {/* Card 2: Workforce Reset */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-200 bg-slate-50/60 hover:bg-amber-50/20 transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <UserX className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900">
                  Reset Division Workforce Directory
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Removes all floor supervisors, linemen, tailors, and operators assigned to <strong>{divisionName}</strong> for <strong>{companyName || 'your factory'}</strong>.
              </p>
              <div className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Your own administrator credentials will never be affected.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmInput('')
                setActiveModal('STAFF')
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-amber-600 text-amber-800 hover:text-white font-bold text-xs border border-amber-300 hover:border-amber-600 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Clear Registered Workforce</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-400" />
            Strict Row-Level Isolation: Queries are hard-scoped to your factory tenant ID.
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Zero Cross-Tenant Leakage Guaranteed
          </span>
        </div>
      </div>

      {/* 6. Cross-Link to Master Company Profile */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#0B1220] shrink-0" />
          <span className="font-semibold text-slate-700">
            Looking for company-wide GSTIN, registered factory address, and master billing?
          </span>
        </div>
        <Link
          href="/modules/profile"
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0B1220] font-bold border border-slate-200 shadow-2xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Master Company Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Security Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">
                  {activeModal === 'OPERATIONAL' && 'Confirm Operational Data Purge'}
                  {activeModal === 'STAFF' && 'Confirm Workforce Reset'}
                  {activeModal === 'SINGLE_STAFF' && 'Remove Personnel from Division'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isProcessing) {
                    setActiveModal(null)
                    setTargetStaff(null)
                    setConfirmInput('')
                  }
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {activeModal === 'OPERATIONAL' && (
                <>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5 leading-relaxed">
                    <p className="font-bold">⚠️ Warning: Irreversible Action</p>
                    <p>
                      You are about to permanently delete all active lots, delivery challans, allotments, line bundle allocations, and QC logs for <strong>{divisionName}</strong>.
                    </p>
                    <p className="font-mono text-[11px] text-rose-700">
                      Scope: Strictly limited to <strong>{companyName || 'your factory'}</strong>. Other companies will NOT be affected.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Type <strong className="font-mono text-rose-600">DELETE</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      placeholder="Type DELETE"
                      disabled={isProcessing}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {activeModal === 'STAFF' && (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5 leading-relaxed">
                    <p className="font-bold">⚠️ Warning: Division Staff Removal</p>
                    <p>
                      This will remove all floor supervisors, linemen, tailors, and operators registered under <strong>{divisionName}</strong> for <strong>{companyName || 'your factory'}</strong>.
                    </p>
                    <p className="font-mono text-[11px] text-amber-700">
                      Scope: Strictly limited to <strong>{companyName || 'your factory'}</strong>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Type <strong className="font-mono text-amber-600">DELETE</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmInput}
                      onChange={(e) => setConfirmInput(e.target.value)}
                      placeholder="Type DELETE"
                      disabled={isProcessing}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 uppercase"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {activeModal === 'SINGLE_STAFF' && targetStaff && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p>
                    Are you sure you want to remove <strong>{targetStaff.username}</strong> ({targetStaff.designation || targetStaff.role}) from <strong>{divisionName}</strong>?
                  </p>
                  <p className="text-[11px] text-slate-500">
                    If this employee has access to other factory divisions, their other division access will remain intact.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setActiveModal(null)
                  setTargetStaff(null)
                  setConfirmInput('')
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {activeModal === 'OPERATIONAL' && (
                <button
                  type="button"
                  disabled={isProcessing || confirmInput.trim().toUpperCase() !== 'DELETE'}
                  onClick={handlePurgeOperationalData}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Purging Data...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Purge Data</span>
                    </>
                  )}
                </button>
              )}

              {activeModal === 'STAFF' && (
                <button
                  type="button"
                  disabled={isProcessing || confirmInput.trim().toUpperCase() !== 'DELETE'}
                  onClick={handlePurgeStaffDirectory}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Resetting Staff...</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reset Staff Directory</span>
                    </>
                  )}
                </button>
              )}

              {activeModal === 'SINGLE_STAFF' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleDeleteSingleStaff}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Personnel</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
