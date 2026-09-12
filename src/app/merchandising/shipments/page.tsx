import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ShipmentPipelineClient } from './components/ShipmentPipelineClient'
import { fetchShipmentsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function MerchandisingShipmentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialShipments = await fetchShipmentsAction()

  return (
    <AdminShell userEmail={user.email}>
      <ShipmentPipelineClient initialShipments={initialShipments} />
    </AdminShell>
  )
}
