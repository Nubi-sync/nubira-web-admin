import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { AdminIdentityCard } from './components/AdminIdentityCard'
import { AccountDeletionDangerZone } from './components/AccountDeletionDangerZone'
import { StaffProfileView } from './components/StaffProfileView'
import { CompanySubscriptionCard } from './components/CompanySubscriptionCard'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function CompanyProfilePage(props: {
  searchParams?: Promise<{ expired?: string }>
}) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {}
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
      <AdminShell userEmail={user.email} userRole={userRole} companyName={tenant.companyName}>
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

  const adminDisplayName = tenant.adminDisplayName || tenant.customUsername || 'Enterprise Admin'
  const adminPhone = tenant.phone || companyData?.admin_phone || ''

  return (
    <AdminShell userEmail={user.email} userRole={userRole} companyName={tenant.companyName}>
      <div className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1536px] w-full mx-auto space-y-3.5 sm:space-y-6 select-none text-[#0B1220]">
        {/* 1. Page Header Banner - Matching Master Tab Header Standard */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-6 transition-all">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs bg-[#F0FDFA] text-[#0B1220] border border-black/15 mt-0.5 sm:mt-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0B1220]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#0B1220] font-[family-name:var(--font-heading)]">
                  Company Profile &amp; <span className="text-[#1D4ED8]">Settings</span>
                </h1>
                <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#0B1220] border border-black/15 shadow-xs tracking-wider">
                  {tenant.companyName}
                </span>
                <span className="text-[9px] sm:text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-xs tracking-wider">
                  {tenant.isSuperAdmin ? 'Enterprise Master' : (userRole || 'Plant Administrator')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium font-[family-name:var(--font-public-sans)] leading-relaxed">
                Factory organization identity, master admin credentials, and live multi-division subscription entitlement.
              </p>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#F0FDFA] border border-[#14C8B4]/30 shrink-0 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#0B1220] uppercase tracking-wider">
              {tenant.accessType === 'DEMO_TRIAL' ? '7-Day Trial Active' : 'Production Active'}
            </span>
          </div>
        </div>

        {/* 3. Company Subscription & Evaluation License Status Card */}
        <CompanySubscriptionCard
          companyName={tenant.companyName}
          accessType={tenant.accessType}
          subscriptionTier={tenant.subscriptionTier}
          provisionedAt={tenant.provisionedAt}
          expiresAt={tenant.expiresAt}
          isExpired={tenant.isExpired}
          tenantStatus={tenant.tenantStatus}
          monthlyBillingInr={tenant.monthlyBillingInr}
          isExpiredUrlParam={Boolean(resolvedSearchParams?.expired === 'true')}
        />

        {/* 4. Executive Administrator Credentials Card (Full Width) */}
        <AdminIdentityCard
          userEmail={tenant.userEmail}
          adminDisplayName={adminDisplayName}
          adminPhone={adminPhone}
          createdAt={user.created_at}
        />

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
