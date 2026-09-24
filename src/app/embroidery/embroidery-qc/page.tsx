import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EmbroideryQcClient } from './components/EmbroideryQcClient'
import { fetchEmbroideryQcAuditsAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function EmbroideryQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const initialAudits = await fetchEmbroideryQcAuditsAction(companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <EmbroideryQcClient initialAudits={initialAudits} />
    </AdminShell>
  )
}
