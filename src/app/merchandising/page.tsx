import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingDashboardClient } from './components/MerchandisingDashboardClient'
import { 
  fetchMerchandisingOrdersAction, 
  fetchBomCostingsAction, 
  fetchTnaMilestonesAction, 
  fetchShipmentsAction 
} from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function MerchandisingPage() {
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

  const [initialOrders, initialBomCostings, initialMilestones, initialShipments] = await Promise.all([
    fetchMerchandisingOrdersAction(companyFilter),
    fetchBomCostingsAction(companyFilter),
    fetchTnaMilestonesAction(companyFilter),
    fetchShipmentsAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <MerchandisingDashboardClient 
        initialOrders={initialOrders}
        initialBomCostings={initialBomCostings}
        initialMilestones={initialMilestones}
        initialShipments={initialShipments}
      />
    </AdminShell>
  )
}
