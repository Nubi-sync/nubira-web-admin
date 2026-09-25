import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ClinicDashboardClient } from './components/ClinicDashboardClient'

import { fetchAlterDashboardDataAction } from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function AlterModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const liveData = await fetchAlterDashboardDataAction(companyFilter)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <ClinicDashboardClient
        userEmail={user.email}
        initialTickets={liveData.tickets}
        initialScrapLogs={liveData.scrapLogs}
      />
    </AdminShell>
  )
}
