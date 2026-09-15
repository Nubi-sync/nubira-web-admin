import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { OrdersCatalogClient } from './components/OrdersCatalogClient'
import { fetchMerchandisingOrdersAction } from '../actions'
import { fetchTechPacksAction, fetchBrandsAction } from '@/app/design/actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function MerchandisingOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)
  const companyFilter = isLegacy ? undefined : tenant.companyName

  const [initialOrders, initialTechPacks, initialBrands] = await Promise.all([
    fetchMerchandisingOrdersAction(companyFilter),
    fetchTechPacksAction(companyFilter),
    fetchBrandsAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <OrdersCatalogClient 
        initialOrders={initialOrders} 
        availableTechPacks={initialTechPacks}
        availableBrands={initialBrands}
      />
    </AdminShell>
  )
}
