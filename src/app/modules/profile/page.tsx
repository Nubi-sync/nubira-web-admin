import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { CompanyProfileCard } from '@/app/profile/components/CompanyProfileCard'
import { AdminIdentityCard } from '@/app/profile/components/AdminIdentityCard'
import { SupervisorTeamOverview, ProfileUser } from '@/app/profile/components/SupervisorTeamOverview'
import { AccountDeletionDangerZone } from '@/app/profile/components/AccountDeletionDangerZone'
import { StaffProfileView } from '@/app/profile/components/StaffProfileView'
import { resolveUserTenant } from '@/lib/tenant-context'

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
  if (!tenant.isProvisionedTenant) {
    try {
      const { data } = await supabase
        .from('company_profile')
        .select('*')
        .eq('id', 'default')
        .maybeSingle()
      companyData = data
    } catch (err) {
      console.warn('company_profile fetch fallback:', err)
    }
  }

  // Fetch staff & supervisor profiles
  let staffList: ProfileUser[] = []
  if (!tenant.isProvisionedTenant) {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, role, is_active, created_at')
        .order('created_at', { ascending: false })
      staffList = (profiles as ProfileUser[]) || []
    } catch (err) {
      console.warn('profiles fetch fallback:', err)
    }
  }

  const company = {
    company_name: tenant.companyName,
    factory_address: tenant.isProvisionedTenant
      ? (tenant.cityState || 'Industrial Sector, India')
      : (companyData?.factory_address || 'Rafi Ahmed Kidwai Road, Kolkata 700055, West Bengal'),
    gstin: tenant.isProvisionedTenant
      ? 'Pending Tenant GST Registration'
      : (companyData?.gstin || '19AADCO1064C1ZK'),
    contact_phone: tenant.phone || companyData?.contact_phone || '+91 98765 43210',
    contact_email: tenant.userEmail || companyData?.contact_email || user.email || 'contact@factory.in',
  }

  const adminDisplayName = tenant.adminDisplayName || tenant.customUsername || 'Enterprise Admin'
  const adminPhone = tenant.phone || companyData?.admin_phone || '+91 98765 43210'

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

        {/* 2. Page Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  {tenant.companyName}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#3A3564] border border-black/15 shadow-2xs tracking-wider">
                  Enterprise Master
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {tenant.subscriptionTier}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">
                Manage factory identification, master admin credentials, and live supervisor operations
              </p>
            </div>
          </div>
        </div>

        {/* 3. Identity Cards Grid (Company & Admin Cards side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <CompanyProfileCard company={company} />
          <AdminIdentityCard
            userEmail={tenant.userEmail}
            adminDisplayName={adminDisplayName}
            adminPhone={adminPhone}
            createdAt={user.created_at}
          />
        </div>

        {/* 4. Supervisors & Team Floor Distribution (Scoped to tenant) */}
        <SupervisorTeamOverview staff={staffList} />

        {/* 5. Account Deletion Request Danger Zone */}
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
