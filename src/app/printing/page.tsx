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

  const [liveKpis, initialBuyers, initialWorkers, initialAllocations, initialCuttingAllocations] = await Promise.all([
    fetchPrintingDashboardKpisAction(companyFilter),
    fetchActiveBuyersAction(),
    fetchPrintingWorkersAction(),
    fetchPrintingTaskAllocationsAction(),
    fetchCuttingTaskAllocationsAction()
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
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
