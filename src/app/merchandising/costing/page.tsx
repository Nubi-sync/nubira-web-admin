import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { BomCostingClient } from './components/BomCostingClient'

export const dynamic = 'force-dynamic'

export default async function MerchandisingCostingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <BomCostingClient />
    </AdminShell>
  )
}
