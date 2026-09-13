import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingDashboardClient } from './components/PrintingDashboardClient'
import {
  fetchPrintingDashboardKpisAction,
  fetchPrintingRunsAction,
  fetchStrikeOffsAction,
  fetchCuringLogsAction
} from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

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

  const [liveKpis, initialRuns, initialStrikeOffs, initialCuringLogs] = await Promise.all([
    fetchPrintingDashboardKpisAction(companyFilter),
    fetchPrintingRunsAction(undefined, companyFilter),
    fetchStrikeOffsAction(undefined, companyFilter),
    fetchCuringLogsAction()
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <PrintingDashboardClient 
        userEmail={tenant.userEmail}
        initialRuns={initialRuns}
        initialStrikeOffs={initialStrikeOffs}
        initialCuringLogs={initialCuringLogs}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
