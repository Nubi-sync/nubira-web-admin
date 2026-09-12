import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { BomCostingClient } from './components/BomCostingClient'
import { fetchBomCostingsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function MerchandisingCostingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialCostings = await fetchBomCostingsAction()

  return (
    <AdminShell userEmail={user.email}>
      <BomCostingClient initialCostings={initialCostings} />
    </AdminShell>
  )
}
