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

export const dynamic = 'force-dynamic'

export default async function MerchandisingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [initialOrders, initialBomCostings, initialMilestones, initialShipments] = await Promise.all([
    fetchMerchandisingOrdersAction(),
    fetchBomCostingsAction(),
    fetchTnaMilestonesAction(),
    fetchShipmentsAction()
  ])

  return (
    <AdminShell userEmail={user.email}>
      <MerchandisingDashboardClient 
        initialOrders={initialOrders}
        initialBomCostings={initialBomCostings}
        initialMilestones={initialMilestones}
        initialShipments={initialShipments}
      />
    </AdminShell>
  )
}
