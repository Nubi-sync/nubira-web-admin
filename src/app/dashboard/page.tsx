import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchOwnerDashboardData } from './actions'
import { OwnerDashboardClient } from './components/OwnerDashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve the authenticated tenant profile
  const tenant = await resolveUserTenant(user)
  const userRole = (tenant.role || '').toUpperCase()

  // Restrict Store Supervisors from general owner dashboard
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch all aggregated operations data across modules
  const dashboardData = await fetchOwnerDashboardData(tenant.companyName)

  return (
    <AdminShell
      userEmail={user.email}
      userRole={userRole}
      companyName={tenant.companyName}
      allowedTabs={tenant.allowedTabs}
    >
      <OwnerDashboardClient initialData={dashboardData} />
    </AdminShell>
  )
}
