import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchReportsData } from './actions'
import { OwnerReportsClient } from './components/OwnerReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
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

  // Restrict Store Supervisors from admin factory reports
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  // Fetch verified executive reports dataset
  const reportsData = await fetchReportsData(tenant.companyName)

  return (
    <AdminShell
      userEmail={user.email}
      userRole={userRole}
      companyName={tenant.companyName}
      allowedTabs={tenant.allowedTabs}
    >
      <OwnerReportsClient initialData={reportsData} />
    </AdminShell>
  )
}
