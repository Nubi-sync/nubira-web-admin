import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { CompanyProfileCard } from './components/CompanyProfileCard'
import { AdminIdentityCard } from './components/AdminIdentityCard'
import { SupervisorTeamOverview, ProfileUser } from './components/SupervisorTeamOverview'
import { AccountDeletionDangerZone } from './components/AccountDeletionDangerZone'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch company & admin settings if table exists, else fallback gracefully
  let companyData: any = null
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

  // Fetch staff & supervisor profiles
  let staffList: ProfileUser[] = []
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, role, is_active, created_at')
      .order('created_at', { ascending: false })
    staffList = (profiles as ProfileUser[]) || []
  } catch (err) {
    console.warn('profiles fetch fallback:', err)
  }

  const company = {
    company_name: companyData?.company_name || 'Nubira Creation',
    factory_address:
      companyData?.factory_address ||
      'Rafi Ahmed Kidwai Road, Kolkata 700055, West Bengal',
    gstin: companyData?.gstin || '19AADCO1064C1ZK',
    contact_phone: companyData?.contact_phone || '+91 98765 43210',
    contact_email: companyData?.contact_email || 'creationnubira@gmail.com',
  }

  const adminDisplayName = companyData?.admin_display_name || 'admin'
  const adminPhone = companyData?.admin_phone || '+91 98765 43210'

  return (
    <AdminShell userEmail={user.email}>
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
        {/* 1. Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <Link href="/dashboard" className="hover:text-[#3A3564] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span>Manage</span>
          <span>/</span>
          <span className="font-bold text-slate-900">Company & Admin Profile</span>
        </div>

        {/* 2. Page Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-black/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs bg-[#FAF7F0] text-[#3A3564] border border-black/10">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Company & Account Profile
              </h1>
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
            userEmail={user.email || 'team.anga9@gmail.com'}
            adminDisplayName={adminDisplayName}
            adminPhone={adminPhone}
            createdAt={user.created_at}
          />
        </div>

        {/* 4. Supervisors & Team Floor Distribution */}
        <SupervisorTeamOverview staff={staffList} />

        {/* 5. Account Deletion Request Danger Zone */}
        <AccountDeletionDangerZone
          companyName={company.company_name}
          adminName={adminDisplayName}
          userEmail={user.email || 'team.anga9@gmail.com'}
          adminPhone={adminPhone}
        />
      </div>
    </AdminShell>
  )
}
