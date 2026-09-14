'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'

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
}: DivisionProfileViewProps) {
  const [searchTerm, setSearchTerm] = useState('')

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
      
      {/* 1. Breadcrumbs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          <Link href={divisionSlug} className="hover:text-[#3A3564] transition-colors">
            {divisionName}
          </Link>
          <span>/</span>
          <span className="text-slate-900">Division Profile</span>
          {companyName && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-black/10">
                <Building2 className="w-3 h-3" />
                {companyName}
              </span>
            </>
          )}
        </div>

        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold text-slate-700 hover:text-[#3A3564] hover:bg-[#FAF7F0] transition-all shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Workspace Hub</span>
        </Link>
      </div>

      {/* 2. Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
            <MainIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                {divisionName} Profile
              </h1>
              {divisionCode && (
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                  Division {divisionCode}
                </span>
              )}
              <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 tracking-wider">
                {categoryBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
              Division configuration, supervisor leadership, and floor workforce directory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href={divisionSlug}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3A3564] hover:bg-[#2A2649] transition-all shadow-xs cursor-pointer active:scale-[0.98]"
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
                <span className="font-bold text-[#3A3564] font-mono text-xs">{headDesignation}</span>
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
                <Settings className="w-4 h-4 text-[#3A3564]" />
                Technical Capacity & Machinery
              </h2>
              <span className="text-[10px] font-mono font-bold text-[#3A3564] bg-[#FAF7F0] px-2 py-0.5 rounded border border-black/10">
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
                        <SpecIcon className="w-3.5 h-3.5 text-[#3A3564]" />
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
            <span className="text-[#3A3564] font-bold">100% Traceability</span>
          </div>
        </div>

      </div>

      {/* 4. Division Workforce Directory (Personnel assigned specifically to this module) */}
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                  {divisionName} Workforce Directory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs">
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
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] font-medium"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                  <th className="py-3 px-4">Worker / Operator</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Floor Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
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
                            <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-black/10 text-[#3A3564] font-bold flex items-center justify-center shrink-0 text-xs uppercase font-mono shadow-2xs">
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10">
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
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Cross-Link to Master Company Profile */}
      <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-black/10 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-[#3A3564] shrink-0" />
          <span className="font-semibold text-slate-700">
            Looking for company-wide GSTIN, registered factory address, and master billing?
          </span>
        </div>
        <Link
          href="/modules/profile"
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#3A3564] font-bold border border-black/10 shadow-2xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>Master Company Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  )
}
