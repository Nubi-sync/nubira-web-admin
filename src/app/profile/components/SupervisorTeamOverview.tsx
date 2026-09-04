'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Scissors,
  Layers,
  CheckCircle2,
  Package,
  Truck,
  Briefcase,
  Search,
  ExternalLink,
} from 'lucide-react'

export interface ProfileUser {
  id: string
  username: string
  role: string
  is_active?: boolean
  created_at?: string
}

interface SupervisorTeamOverviewProps {
  staff: ProfileUser[]
}

const ROLE_META: Record<
  string,
  { label: string; department: string; icon: React.ComponentType<{ className?: string }> }
> = {
  LINEMAN: {
    label: 'Lineman',
    department: 'Stitching Department',
    icon: Scissors,
  },
  MENDING: {
    label: 'Mending',
    department: 'Matrix / Mending Floor',
    icon: Layers,
  },
  PRODUCTION: {
    label: 'QC / Finishing',
    department: 'Finishing & QC Floor',
    icon: CheckCircle2,
  },
  STORE: {
    label: 'Store / Godown',
    department: 'Godown & Raw Materials',
    icon: Package,
  },
  DISPATCH: {
    label: 'Dispatch / Packing',
    department: 'Final Packing & Dispatch',
    icon: Truck,
  },
  PRODUCTION_MANAGER: {
    label: 'Prod Manager',
    department: 'Plant Operations Management',
    icon: Briefcase,
  },
}

export function SupervisorTeamOverview({ staff }: SupervisorTeamOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('ALL')

  // Filter out ADMIN from the supervisor listing
  const supervisors = staff.filter(
    (u) => (u.role || '').toUpperCase() !== 'ADMIN'
  )

  const counts = {
    total: supervisors.length,
    lineman: supervisors.filter((u) => u.role?.toUpperCase() === 'LINEMAN').length,
    mending: supervisors.filter((u) => u.role?.toUpperCase() === 'MENDING').length,
    qc: supervisors.filter((u) => u.role?.toUpperCase() === 'PRODUCTION').length,
    store: supervisors.filter((u) => u.role?.toUpperCase() === 'STORE').length,
    dispatch: supervisors.filter((u) => u.role?.toUpperCase() === 'DISPATCH').length,
    prodManager: supervisors.filter((u) => u.role?.toUpperCase() === 'PRODUCTION_MANAGER').length,
  }

  const filteredSupervisors = supervisors.filter((s) => {
    const matchesSearch =
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole =
      selectedRole === 'ALL' || s.role?.toUpperCase() === selectedRole
    return matchesSearch && matchesRole
  })

  const departmentCards = [
    {
      key: 'LINEMAN',
      title: 'Stitching (Lineman)',
      count: counts.lineman,
      icon: Scissors,
    },
    {
      key: 'MENDING',
      title: 'Mending (Matrix)',
      count: counts.mending,
      icon: Layers,
    },
    {
      key: 'PRODUCTION',
      title: 'QC & Finishing',
      count: counts.qc,
      icon: CheckCircle2,
    },
    {
      key: 'STORE',
      title: 'Store & Godown',
      count: counts.store,
      icon: Package,
    },
    {
      key: 'DISPATCH',
      title: 'Dispatch & Packing',
      count: counts.dispatch,
      icon: Truck,
    },
    {
      key: 'PRODUCTION_MANAGER',
      title: 'Prod Managers',
      count: counts.prodManager,
      icon: Briefcase,
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Supervisors & Factory Team
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                {counts.total} Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Live floor distribution and supervisor personnel directory
            </p>
          </div>
        </div>

        <Link
          href="/employees"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all w-fit cursor-pointer"
        >
          <span>Manage Staff & Logins</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Department Breakdown Cards (Unified Minimal Palette, Zero Rainbow Colors) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {departmentCards.map((dept) => {
          const Icon = dept.icon
          const isSelected = selectedRole === dept.key
          return (
            <button
              key={dept.key}
              type="button"
              onClick={() => setSelectedRole(isSelected ? 'ALL' : dept.key)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[#3A3564] border-[#3A3564] text-white shadow-md ring-2 ring-[#3A3564]/30'
                  : 'bg-slate-50/70 hover:bg-[#FAF7F0] border-slate-200/80 hover:border-[#3A3564]/30 text-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-white/15 text-white border border-white/20 shadow-2xs'
                      : 'bg-white text-[#3A3564] border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {dept.count}
                </span>
              </div>
              <div>
                <p
                  className={`text-xs font-bold leading-tight truncate ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {dept.title}
                </p>
                <p
                  className={`text-[11px] font-mono mt-1 ${
                    isSelected ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {dept.count === 1 ? '1 supervisor' : `${dept.count} supervisors`}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Supervisors Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedRole('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              selectedRole === 'ALL'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
            }`}
          >
            All ({supervisors.length})
          </button>
          {['LINEMAN', 'MENDING', 'PRODUCTION', 'STORE', 'DISPATCH', 'PRODUCTION_MANAGER'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                selectedRole === role
                  ? 'bg-[#3A3564] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              {ROLE_META[role]?.label || role}
            </button>
          ))}
        </div>
      </div>

      {/* Supervisor Directory Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Supervisor User</th>
                <th className="py-3.5 px-4">Department / Module</th>
                <th className="py-3.5 px-4">Access Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredSupervisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No supervisor records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try searching with different terms or selecting another role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSupervisors.map((user) => {
                  const roleUpper = (user.role || '').toUpperCase()
                  const meta = ROLE_META[roleUpper] || {
                    label: user.role || 'Staff',
                    department: 'General Operations',
                    icon: Users,
                  }
                  const RoleIcon = meta.icon
                  const formattedDate = user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Active'

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] font-bold flex items-center justify-center shrink-0 text-xs uppercase shadow-2xs">
                            {user.username.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {user.username}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              UID: {user.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 font-semibold text-xs sm:text-sm">
                          {meta.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs font-mono">
                          <RoleIcon className="w-3.5 h-3.5 text-[#3A3564]" />
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 font-mono">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-500 text-xs">
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
  )
}
