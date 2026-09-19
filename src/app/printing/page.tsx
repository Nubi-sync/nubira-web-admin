import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingDashboardClient } from './components/PrintingDashboardClient'
import {
  fetchPrintingDashboardKpisAction,
  fetchPrintingWorkersAction,
  fetchPrintingTaskAllocationsAction
} from './actions'
import { fetchActiveBuyersAction } from '@/app/merchandising/actions'
import { fetchCuttingTaskAllocationsAction } from '@/app/cutting/actions'
import { fetchEmbroideryTaskAllocationsAction } from '@/app/embroidery/actions'
import { fetchTechPacksAction } from '@/app/design/actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Screen & Digital Printing Studio | Zigza MES',
  description: 'Screen print tables, automatic carousels, DTG stations, shift matrix tracking, and curing sign-offs'
}

export default async function PrintingModulePage() {
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

  const [
    liveKpis, 
    initialBuyers, 
    initialWorkers, 
    initialAllocations, 
    initialCuttingAllocations,
    initialEmbroideryAllocations,
    initialTechPacks
  ] = await Promise.all([
    fetchPrintingDashboardKpisAction(companyFilter),
    fetchActiveBuyersAction(companyFilter),
    fetchPrintingWorkersAction(companyFilter),
    fetchPrintingTaskAllocationsAction(companyFilter),
    fetchCuttingTaskAllocationsAction(companyFilter),
    fetchEmbroideryTaskAllocationsAction(companyFilter),
    fetchTechPacksAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <PrintingDashboardClient 
        userEmail={tenant.userEmail}
        isSuperAdmin={tenant.isSuperAdmin}
        initialBuyers={initialBuyers}
        initialWorkers={initialWorkers}
        initialAllocations={initialAllocations}
        initialCuttingAllocations={initialCuttingAllocations}
        initialEmbroideryAllocations={initialEmbroideryAllocations}
        initialTechPacks={initialTechPacks}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
