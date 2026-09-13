import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateEmployeeForm } from './components/CreateEmployeeForm'
import { EmployeeList } from './components/EmployeeList'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { TvViewButton } from '@/components/ui/TvViewButton'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isProvisionedTenant = tenant.isProvisionedTenant && tenant.companyName !== 'Nubira Creation'

  // Restrict Store Supervisors from admin employee management
  const userRole = tenant.role.toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch employees
  const { data: rawEmployees } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  const employees = isProvisionedTenant
    ? (rawEmployees || []).filter(e => e.id === user.id || (e.username && e.username.toUpperCase().includes(tenant.companyName.toUpperCase())))
    : (rawEmployees || [])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/stitching-sewing/dashboard" className="hover:text-[#3A3564] transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">
            Employees
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
                Employees & Staff Management
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Manage factory workers, assign floor roles, and reset authentication credentials
              </p>
            </div>
          </div>

          <TvViewButton />
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <CreateEmployeeForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <EmployeeList employees={employees || []} />
          </div>
        </div>

      </div>
    </AdminShell>
  )
}
