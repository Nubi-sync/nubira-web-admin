import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryDashboardClient } from './components/EmbroideryDashboardClient'
import {
  fetchEmbroideryDashboardKpisAction,
  fetchEmbroideryWorkersAction,
  fetchEmbroideryTaskAllocationsAction
} from './actions'
import { fetchActiveBuyersAction } from '@/app/merchandising/actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Multi-Head Embroidery Studio | Zigza MES',
  description: 'Multi-head computerized machines, hooping stations, shift matrix tracking, and stitch sign-offs'
}

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

  const [liveKpis, initialBuyers, initialWorkers, initialAllocations] = await Promise.all([
    fetchEmbroideryDashboardKpisAction(companyFilter),
    fetchActiveBuyersAction(),
    fetchEmbroideryWorkersAction(),
    fetchEmbroideryTaskAllocationsAction()
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <EmbroideryDashboardClient 
        userEmail={tenant.userEmail}
        isSuperAdmin={tenant.isSuperAdmin}
        initialBuyers={initialBuyers}
        initialWorkers={initialWorkers}
        initialAllocations={initialAllocations}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
