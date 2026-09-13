import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EmbroideryDashboardClient } from './components/EmbroideryDashboardClient'
import {
  fetchEmbroideryDashboardKpisAction,
  fetchEmbroideryRunsAction,
  fetchEmbroideryDesignsAction,
  fetchEmbroideryQcAuditsAction,
  fetchThreadInventoryAction
} from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function EmbroideryPage() {
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

  const [liveKpis, initialRuns, initialDesigns, initialAudits, initialCones] = await Promise.all([
    fetchEmbroideryDashboardKpisAction(companyFilter),
    fetchEmbroideryRunsAction(undefined, companyFilter),
    fetchEmbroideryDesignsAction(companyFilter),
    fetchEmbroideryQcAuditsAction(companyFilter),
    fetchThreadInventoryAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <EmbroideryDashboardClient 
        userEmail={tenant.userEmail}
        liveKpis={liveKpis}
        initialRuns={initialRuns}
        initialDesigns={initialDesigns}
        initialAudits={initialAudits}
        initialCones={initialCones}
      />
    </AdminShell>
  )
}
