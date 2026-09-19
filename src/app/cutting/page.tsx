import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingDashboardClient } from './components/CuttingDashboardClient'
import { 
  fetchLaySheetsAction, 
  fetchCutBundlesAction, 
  fetchCuttingDashboardKpisAction,
  fetchCuttingWorkersAction,
  fetchCuttingTaskAllocationsAction
} from './actions'
import { fetchActiveBuyersAction } from '@/app/merchandising/actions'
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

  const [initialLays, initialBundles, liveKpis, initialBuyers, initialWorkers, initialAllocations] = await Promise.all([
    fetchLaySheetsAction(companyFilter),
    fetchCutBundlesAction(undefined, companyFilter),
    fetchCuttingDashboardKpisAction(companyFilter),
    fetchActiveBuyersAction(companyFilter),
    fetchCuttingWorkersAction(companyFilter),
    fetchCuttingTaskAllocationsAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <CuttingDashboardClient 
        userEmail={tenant.userEmail} 
        isSuperAdmin={tenant.isSuperAdmin}
        initialLays={initialLays}
        initialBundles={initialBundles}
        liveKpis={liveKpis}
        initialBuyers={initialBuyers}
        initialWorkers={initialWorkers}
        initialAllocations={initialAllocations}
      />
    </AdminShell>
  )
}
