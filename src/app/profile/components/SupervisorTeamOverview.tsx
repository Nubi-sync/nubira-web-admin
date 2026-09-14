'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  ShieldCheck,
  Boxes,
  Palette,
  Briefcase,
  Scissors,
  Printer,
  Sparkles,
  Layers,
  Waves,
  Flame,
  Wrench,
  Store,
  Truck,
  UserCheck
} from 'lucide-react'
import {
  DEPARTMENT_HEADS_CATALOG,
  ROLE_MODULE_MAPPING,
} from '@/lib/access-control'

export interface ProfileUser {
  id: string
  username: string
  role: string
  is_active?: boolean
  created_at?: string
  allowed_modules?: string[]
  is_head?: boolean
  designation?: string
  company_name?: string
}

interface SupervisorTeamOverviewProps {
  staff: ProfileUser[]
  allowedDivisions?: string[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Truck,
}

export function SupervisorTeamOverview({
  staff = [],
  allowedDivisions = [],
}: SupervisorTeamOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('ALL')

  // STRICT EXECUTIVE FILTER:
  // Only officially appointed Department Heads (is_head === true) must be displayed on Master Company Profile.
  // Floor workers, helpers, and unappointed staff belong exclusively in their specific module profiles.
  const executiveHeads = useMemo(() => {
    return staff.filter((u) => {
      const roleUpper = (u.role || '').toUpperCase()
      if (roleUpper === 'PLATFORM_SUPERADMIN') return false
      return Boolean(u.is_head)
    })
  }, [staff])

  // Resolve which active modules to display based on company subscription
  const activeModules = useMemo(() => {
    if (allowedDivisions.length > 0) {
      return DEPARTMENT_HEADS_CATALOG.filter((d) => allowedDivisions.includes(d.route))
    }
    return DEPARTMENT_HEADS_CATALOG.slice(0, 6)
  }, [allowedDivisions])

  // Helper to test if a user belongs to a specific module route
  const isUserInModule = (user: ProfileUser, route: string) => {
    if (Array.isArray(user.allowed_modules) && user.allowed_modules.includes(route)) {
      return true
    }
    const roleRoutes = ROLE_MODULE_MAPPING[user.role?.toUpperCase() || ''] || []
    return roleRoutes.includes(route as any)
  }

  // Calculate executive head counts per active module
  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeModules.forEach((mod) => {
      counts[mod.route] = executiveHeads.filter((u) => isUserInModule(u, mod.route)).length
    })
    return counts
  }, [activeModules, executiveHeads])

  // Filtered executive leadership directory
  const filteredExecutives = useMemo(() => {
    return executiveHeads.filter((s) => {
      const matchesSearch =
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.designation || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesModule =
        selectedModule === 'ALL' || isUserInModule(s, selectedModule)

      return matchesSearch && matchesModule
    })
  }, [executiveHeads, searchTerm, selectedModule])

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-2xs p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#FAF7F0] text-[#3A3564] border border-black/10 flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-[family-name:var(--font-heading)]">
                Department Heads & Division Leadership
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs">
                {executiveHeads.length} {executiveHeads.length === 1 ? 'Division Head' : 'Division Heads'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Executive department heads and division leadership appointed across your factory&apos;s active modules
            </p>
          </div>
        </div>
      </div>

      {/* Active Division Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {activeModules.map((dept) => {
          const Icon = ICON_MAP[dept.iconName] || Boxes
          const isSelected = selectedModule === dept.route
          const count = moduleCounts[dept.route] || 0
          const hasHead = count > 0

          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedModule(isSelected ? 'ALL' : dept.route)}
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
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : hasHead
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {hasHead ? 'Appointed' : 'Pending'}
                </span>
              </div>
              <div>
                <p
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                  title={dept.name}
                >
                  {dept.name.split('&')[0].trim()}
                </p>
                <p
                  className={`text-[11px] font-mono mt-1 ${
                    isSelected ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {count === 1 ? '1 Division Head' : `${count} Division Heads`}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3A3564]/20 focus:border-[#3A3564] bg-slate-50/50 font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Dynamic Division Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedModule('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              selectedModule === 'ALL'
                ? 'bg-[#3A3564] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
            }`}
          >
            All ({executiveHeads.length})
          </button>
          {activeModules.map((dept) => {
            const count = moduleCounts[dept.route] || 0
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedModule(dept.route)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  selectedModule === dept.route
                    ? 'bg-[#3A3564] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                }`}
              >
                {dept.name.split('&')[0].trim()} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Executive Directory Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-[#FAF7F0] border-b border-black/10 text-slate-600 font-mono font-bold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Department Head / In-Charge</th>
                <th className="py-3.5 px-4">Assigned Division</th>
                <th className="py-3.5 px-4">Official Executive Designation</th>
                <th className="py-3.5 px-4">Authority Status</th>
                <th className="py-3.5 px-4 text-right">Appointed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredExecutives.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <UserCheck className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No Department Heads appointed for this module yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Use the &quot;Appoint &amp; Manage Heads&quot; action above to designate a Department Head.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExecutives.map((user) => {
                  // Resolve user's primary assigned module
                  const assignedRoute =
                    user.allowed_modules?.[0] ||
                    ROLE_MODULE_MAPPING[user.role?.toUpperCase() || '']?.[0] ||
                    '/stitching-sewing'

                  const divisionDef = DEPARTMENT_HEADS_CATALOG.find((d) => d.route === assignedRoute)
                  const deptTitle = divisionDef?.name || 'General Manufacturing'
                  const DeptIcon = divisionDef ? ICON_MAP[divisionDef.iconName] || Boxes : Boxes

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
                          <div className="w-9 h-9 rounded-xl bg-[#FAF7F0] border border-black/10 text-[#3A3564] font-bold flex items-center justify-center shrink-0 text-xs uppercase shadow-2xs font-mono">
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
                        <span className="text-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                          <DeptIcon className="w-3.5 h-3.5 text-[#3A3564] shrink-0" />
                          <span>{deptTitle}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAF7F0] text-[#3A3564] border border-black/10 shadow-2xs font-mono">
                            {user.designation || user.role}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <ShieldCheck className="w-3 h-3" />
                            Head
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {user.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Authorized In-Charge
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
