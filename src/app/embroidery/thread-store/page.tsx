import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThreadStoreClient } from './components/ThreadStoreClient'
import { fetchThreadInventoryAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function EmbroideryThreadStorePage() {
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

  const initialCones = await fetchThreadInventoryAction(companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ThreadStoreClient initialCones={initialCones} />
    </AdminShell>
  )
}
