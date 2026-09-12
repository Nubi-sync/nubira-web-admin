import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { OrdersCatalogClient } from './components/OrdersCatalogClient'
import { fetchMerchandisingOrdersAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function MerchandisingOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialOrders = await fetchMerchandisingOrdersAction()

  return (
    <AdminShell userEmail={user.email}>
      <OrdersCatalogClient initialOrders={initialOrders} />
    </AdminShell>
  )
}
