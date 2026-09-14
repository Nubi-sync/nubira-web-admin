import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { AdminIdentityCard } from '@/app/profile/components/AdminIdentityCard'
import { SupervisorTeamOverview, ProfileUser } from '@/app/profile/components/SupervisorTeamOverview'
import { AccountDeletionDangerZone } from '@/app/profile/components/AccountDeletionDangerZone'
import { StaffProfileView } from '@/app/profile/components/StaffProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ROLE_MODULE_MAPPING } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function ModuleCompanyProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve the user's authenticated tenant organization and role
  const tenant = await resolveUserTenant(user)
  const userRole = tenant.role.toUpperCase()

  const isStoreUser =
    userRole === 'STORE' ||
    userRole === 'STORE_SUPERVISOR' ||
    userRole === 'GODOWN' ||
    user.email?.toLowerCase().startsWith('store@') ||
    user.email?.toLowerCase() === 'store'

  // Only operational floor staff users without administrative standing route to StaffProfileView
  const isStaffUser = !tenant.isSuperAdmin && (
    isStoreUser ||
    (userRole !== 'ADMIN' &&
      userRole !== 'SUPERADMIN' &&
      userRole !== 'PLATFORM_SUPERADMIN' &&
      user.email !== 'admin@nubira.local')
  )

  // If operational floor staff, render staff profile scoped to their assigned company
  if (isStaffUser) {
    return (
      <AdminShell userEmail={user.email} userRole={userRole}>
        <StaffProfileView
          user={user}
          profile={{ username: tenant.customUsername, role: userRole }}
          companyName={tenant.companyName}
        />
      </AdminShell>
    )
  }

  // Master Admin Company Profile view for Enterprise Masters and SuperAdmins
  let companyData: any = null
  try {
    // 1. Try finding by matching company_name
    let { data } = await supabaseAdmin
      .from('company_profile')
      .select('*')
      .ilike('company_name', tenant.companyName)
      .limit(1)
      .maybeSingle()

    // 2. If not found and tenant is Nubira, check legacy default record
    if (!data && (!tenant.companyName || tenant.companyName.toLowerCase().includes('nubira'))) {
      const { data: defaultData } = await supabaseAdmin
        .from('company_profile')
        .select('*')
        .eq('id', 'default')
        .maybeSingle()
      data = defaultData
    }

    companyData = data
  } catch (err) {
    console.warn('company_profile fetch notice:', err)
  }

  // Fetch staff & supervisor profiles using supabaseAdmin for reliable cross-tenant scoping
  let rawProfiles: any[] = []
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, is_active, created_at, allowed_modules, is_head, designation, company_name')
      .order('created_at', { ascending: false })
    if (!error && data) {
      rawProfiles = data
    }
  } catch (err) {
    console.warn('profiles fetch notice:', err)
  }

  const isNubira = !tenant.companyName || tenant.companyName.toLowerCase().includes('nubira')

  // Scoped staff list for this tenant and active modules
  const staffList: ProfileUser[] = rawProfiles.filter((p) => {
    if (p.id === user.id) return false // exclude logged-in admin
    if (p.role === 'PLATFORM_SUPERADMIN') return false

    // Company scoping check
    if (isNubira) {
      const pComp = (p.company_name || '').toLowerCase()
      if (pComp && !pComp.includes('nubira')) return false
    } else {
      const pComp = (p.company_name || '').toLowerCase()
      if (!pComp.includes(tenant.companyName.toLowerCase())) return false
    }

    // Module scoping check: only show staff assigned to this company's purchased modules
    const userModules = Array.isArray(p.allowed_modules) && p.allowed_modules.length > 0
      ? p.allowed_modules
      : (ROLE_MODULE_MAPPING[p.role?.toUpperCase() || ''] || [])

    return userModules.some((m: string) => tenant.allowedDivisions.includes(m))
  })


  const adminDisplayName = tenant.adminDisplayName || tenant.customUsername || 'Enterprise Admin'
  const adminPhone = tenant.phone || companyData?.admin_phone || ''

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 select-none">
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <Link href="/modules" className="hover:text-[#3A3564] transition-colors">
            Workspace Hub
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900">Company Profile</span>
        </div>

        {/* 2. Page Header Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-[family-name:var(--font-heading)]">
                  {tenant.companyName}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                  Enterprise Master
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
                Manage factory identification, master admin credentials, and live supervisor operations
              </p>
            </div>
          </div>
        </div>

        {/* 3. Executive Administrator Credentials Card (Full Width) */}
        <AdminIdentityCard
          userEmail={tenant.userEmail}
          adminDisplayName={adminDisplayName}
          adminPhone={adminPhone}
          createdAt={user.created_at}
        />

        {/* 5. Supervisors & Team Floor Distribution (Dynamically filtered by active modules) */}
        <SupervisorTeamOverview
          staff={staffList}
          allowedDivisions={tenant.allowedDivisions}
        />

        {/* 6. Account Deletion Request Danger Zone */}
        <AccountDeletionDangerZone
          companyName={tenant.companyName}
          adminName={adminDisplayName}
          userEmail={tenant.userEmail}
          adminPhone={adminPhone}
        />
      </div>
    </AdminShell>
  )
}
