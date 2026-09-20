import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEmployeeForm } from './components/CreateEmployeeForm'
import { EmployeeList } from './components/EmployeeList'
import { fetchEmployeesAction } from './actions'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { TvViewButton } from '@/components/ui/TvViewButton'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

interface EmployeesPageProps {
  forcedModule?: string
  moduleName?: string
}

export default async function EmployeesPage({ forcedModule, moduleName }: EmployeesPageProps = {}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const userRole = tenant.role.toUpperCase()
  const isSuperAdmin = tenant.isSuperAdmin || userRole === 'ADMIN'

  // If user is a Department Head (not SuperAdmin/Admin), strictly scope them to their assigned department
  const effectiveModule = forcedModule || (!isSuperAdmin ? (tenant.allowedDivisions?.[0] || '/stitching-sewing') : undefined)

  // Fetch employees (cached)
  const rawEmployees = await fetchEmployeesAction(tenant.companyName)

  const { ROLE_MODULE_MAPPING } = await import('@/lib/access-control')

  // Filter out current user, platform superadmin, and staff from other tenants
  let employees = (rawEmployees || []).filter(e => {
    if (e.id === user.id || e.role === 'PLATFORM_SUPERADMIN') return false
    const pCompany = (e.company_name || '').trim().toLowerCase()
    const currentCompany = (tenant.companyName || '').trim().toLowerCase()
    
    // Strict tenant isolation: only show staff belonging to this exact company
    if (pCompany !== currentCompany) {
      return false
    }
    return true
  })

  // If effectiveModule is active, isolate strictly to that module's staff
  if (effectiveModule) {
    employees = employees.filter(e => {
      const allowed = Array.isArray(e.allowed_modules) ? e.allowed_modules : []
      if (allowed.includes(effectiveModule)) return true
      const roleModules = ROLE_MODULE_MAPPING[e.role] || []
      return roleModules.includes(effectiveModule as any)
    })
  }

  const resolvedModuleName = moduleName || (effectiveModule === '/stitching-sewing' ? 'Stitching Floor' : undefined)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link 
            href={effectiveModule ? `${effectiveModule}/dashboard` : '/modules'} 
            className="hover:text-[#3A3564] transition-colors"
          >
            {resolvedModuleName || 'Workspace Hub'}
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Employees & Workers
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        {/* 2. Page Header */}
        <div 
          className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex items-center justify-between gap-4 transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10"
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900"
              >
                {resolvedModuleName ? `${resolvedModuleName} Staff & Workers` : 'Factory Staff & Worker Management'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                {resolvedModuleName 
                  ? `Manage operators, helpers, linemen, and workers assigned exclusively to ${resolvedModuleName}` 
                  : 'Manage factory workers across manufacturing divisions, assign floor roles, and maintain isolation'}
              </p>
            </div>
          </div>

          <TvViewButton />
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <CreateEmployeeForm 
              forcedModule={effectiveModule} 
              moduleTitle={resolvedModuleName}
              allowedDivisions={tenant.allowedDivisions}
            />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <EmployeeList 
              employees={employees || []} 
              forcedModule={effectiveModule}
              moduleTitle={resolvedModuleName}
              allowedDivisions={tenant.allowedDivisions}
            />
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
