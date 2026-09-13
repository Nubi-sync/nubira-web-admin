import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsDashboardClient } from './components/ReadyGoodsDashboardClient'

import { fetchReadyGoodsDashboardDataAction } from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)
  const companyFilter = isLegacy ? undefined : tenant.companyName

  const [{ data: profile }, liveData] = await Promise.all([
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
    fetchReadyGoodsDashboardDataAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <ReadyGoodsDashboardClient
        userEmail={user.email}
        initialCartons={liveData.cartons}
        initialAqlAudits={liveData.aqlAudits}
      />
    </AdminShell>
  )
}
