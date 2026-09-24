import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SourcingRequisitionsClient } from './components/SourcingRequisitionsClient'
import { fetchSourcingRequisitionsAction } from '../actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function MerchandisingSourcingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const initialRequisitions = await fetchSourcingRequisitionsAction(companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <SourcingRequisitionsClient initialRequisitions={initialRequisitions} />
    </AdminShell>
  )
}
