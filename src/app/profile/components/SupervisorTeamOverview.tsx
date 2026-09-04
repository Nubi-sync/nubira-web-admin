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
  UserCheck,
  ShieldAlert,
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
  { label: string; department: string; icon: any; color: string; bg: string; border: string }
> = {
  LINEMAN: {
    label: 'Lineman',
    department: 'Stitching Department',
    icon: Scissors,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  MENDING: {
    label: 'Mending',
    department: 'Matrix / Mending Floor',
    icon: Layers,
    color: 'text-indigo-800',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  PRODUCTION: {
    label: 'QC / Production',
    department: 'Finishing & QC Floor',
    icon: CheckCircle2,
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  STORE: {
    label: 'Store / Godown',
    department: 'Godown & Raw Materials',
    icon: Package,
    color: 'text-sky-800',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  DISPATCH: {
    label: 'Dispatch / Packing',
    department: 'Final Packing & Dispatch',
    icon: Truck,
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  PRODUCTION_MANAGER: {
    label: 'Prod Manager',
    department: 'Plant Operations Management',
    icon: Briefcase,
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
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
      color: 'text-amber-700',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/80',
    },
    {
      key: 'MENDING',
      title: 'Mending (Matrix)',
      count: counts.mending,
      icon: Layers,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200/80',
    },
    {
      key: 'PRODUCTION',
      title: 'QC & Finishing',
      count: counts.qc,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200/80',
    },
    {
      key: 'STORE',
      title: 'Store & Godown',
      count: counts.store,
      icon: Package,
      color: 'text-sky-700',
      bg: 'bg-sky-50/80',
      border: 'border-sky-200/80',
    },
    {
      key: 'DISPATCH',
      title: 'Dispatch & Packing',
      count: counts.dispatch,
      icon: Truck,
      color: 'text-purple-700',
      bg: 'bg-purple-50/80',
      border: 'border-purple-200/80',
    },
    {
      key: 'PRODUCTION_MANAGER',
      title: 'Prod Managers',
      count: counts.prodManager,
      icon: Briefcase,
      color: 'text-rose-700',
      bg: 'bg-rose-50/80',
      border: 'border-rose-200/80',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Supervisors & Factory Team
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#3A3564] text-white">
                {counts.total} Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live department distribution & supervisor access directory
            </p>
          </div>
        </div>

        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#3A3564] bg-[#FAF7F0] hover:bg-[#F2ECE1] border border-black/10 shadow-2xs transition-all w-fit"
        >
          Manage Staff & Logins
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Department Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {departmentCards.map((dept) => {
          const Icon = dept.icon
          const isSelected = selectedRole === dept.key
          return (
            <button
              key={dept.key}
              onClick={() => setSelectedRole(isSelected ? 'ALL' : dept.key)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'ring-2 ring-[#3A3564] shadow-sm ' + dept.bg + ' ' + dept.border
                  : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-white shadow-2xs' : 'bg-white/80 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${dept.color}`} />
                </div>
                <span className="text-lg font-black font-mono text-slate-900">
                  {dept.count}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-700 truncate leading-tight">
                {dept.title}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {dept.count === 1 ? '1 supervisor' : `${dept.count} supervisors`}
              </p>
            </button>
          )
        })}
      </div>

      {/* Supervisors Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supervisor by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRole === 'ALL'
                ? 'bg-[#3A3564] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({supervisors.length})
          </button>
          {['LINEMAN', 'MENDING', 'PRODUCTION', 'STORE', 'DISPATCH', 'PRODUCTION_MANAGER'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === role
                  ? 'bg-[#3A3564] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ROLE_META[role]?.label || role}
            </button>
          ))}
        </div>
      </div>

      {/* Supervisor Directory Table */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Supervisor User</th>
                <th className="py-3 px-4">Department / Module</th>
                <th className="py-3 px-4">Access Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSupervisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-500" />
                    No supervisors found matching &quot;{searchTerm || selectedRole}&quot;
                  </td>
                </tr>
              ) : (
                filteredSupervisors.map((user) => {
                  const roleUpper = (user.role || '').toUpperCase()
                  const meta = ROLE_META[roleUpper] || {
                    label: user.role || 'Staff',
                    department: 'General Operations',
                    icon: Users,
                    color: 'text-slate-800',
                    bg: 'bg-slate-100',
                    border: 'border-slate-200',
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
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 uppercase">
                            {user.username.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {user.username}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              UID: {user.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">
                          {meta.department}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${meta.bg} ${meta.color} ${meta.border}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {user.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500">
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
