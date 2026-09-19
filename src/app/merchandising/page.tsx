import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingDashboardClient } from './components/MerchandisingDashboardClient'
import { 
  fetchMerchandisingOrdersAction, 
  fetchBomCostingsAction, 
  fetchTnaMilestonesAction, 
  fetchShipmentsAction,
  fetchActiveBuyersAction
} from './actions'
import { fetchTechPacksAction } from '@/app/design/actions'
import { fetchCuttingTaskAllocationsAction } from '@/app/cutting/actions'
import { fetchPrintingTaskAllocationsAction } from '@/app/printing/actions'
import { fetchEmbroideryTaskAllocationsAction } from '@/app/embroidery/actions'
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

  const [
    initialOrders, 
    initialBomCostings, 
    initialMilestones, 
    initialShipments,
    initialBuyers,
    initialTechPacks,
    initialCuttingAllocations,
    initialPrintingAllocations,
    initialEmbroideryAllocations
  ] = await Promise.all([
    fetchMerchandisingOrdersAction(companyFilter),
    fetchBomCostingsAction(companyFilter),
    fetchTnaMilestonesAction(companyFilter),
    fetchShipmentsAction(companyFilter),
    fetchActiveBuyersAction(companyFilter),
    fetchTechPacksAction(companyFilter),
    fetchCuttingTaskAllocationsAction(companyFilter),
    fetchPrintingTaskAllocationsAction(companyFilter),
    fetchEmbroideryTaskAllocationsAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <MerchandisingDashboardClient 
        initialOrders={initialOrders}
        initialBomCostings={initialBomCostings}
        initialMilestones={initialMilestones}
        initialShipments={initialShipments}
        initialBuyers={initialBuyers}
        initialTechPacks={initialTechPacks}
        initialCuttingAllocations={initialCuttingAllocations}
        initialPrintingAllocations={initialPrintingAllocations}
        initialEmbroideryAllocations={initialEmbroideryAllocations}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
