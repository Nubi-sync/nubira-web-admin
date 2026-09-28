import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ClinicDashboardClient } from '@/app/alter/components/ClinicDashboardClient'
import { fetchAlterDashboardDataAction } from '@/app/alter/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alteration & Mending Clinic | Quality & Packing',
  description: 'Integrated alteration clinic for mending defects flagged during post-wash and iron quality checking.'
}

export default async function ReadyGoodsAlterationPage() {
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
    <AdminShell userEmail={user.email} userRole={tenant.role} companyName={tenant.companyName}>
      <ClinicDashboardClient
        userEmail={user.email}
        companyName={tenant.companyName}
        initialTickets={liveData.tickets}
        initialScrapLogs={liveData.scrapLogs}
      />
    </AdminShell>
  )
}
