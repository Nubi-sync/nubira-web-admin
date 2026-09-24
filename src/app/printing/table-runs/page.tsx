import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { TableRunsClient } from './components/TableRunsClient'
import { fetchPrintingRunsAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function TableRunsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const initialRuns = await fetchPrintingRunsAction(undefined, companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <TableRunsClient initialRuns={initialRuns} />
    </AdminShell>
  )
}
