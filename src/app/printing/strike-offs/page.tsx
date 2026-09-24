import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { StrikeOffsClient } from './components/StrikeOffsClient'
import { fetchStrikeOffsAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function PrintingStrikeOffsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const initialStrikeOffs = await fetchStrikeOffsAction(undefined, companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <StrikeOffsClient initialStrikeOffs={initialStrikeOffs} />
    </AdminShell>
  )
}
