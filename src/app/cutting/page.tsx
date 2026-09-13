import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingDashboardClient } from './components/CuttingDashboardClient'
import { fetchLaySheetsAction, fetchCutBundlesAction, fetchCuttingDashboardKpisAction } from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function CuttingModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)
  const companyFilter = isLegacy ? undefined : tenant.companyName

  const [initialLays, initialBundles, liveKpis] = await Promise.all([
    fetchLaySheetsAction(companyFilter),
    fetchCutBundlesAction(undefined, companyFilter),
    fetchCuttingDashboardKpisAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <CuttingDashboardClient 
        userEmail={tenant.userEmail} 
        initialLays={initialLays}
        initialBundles={initialBundles}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
