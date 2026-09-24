import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuringQcClient } from './components/CuringQcClient'
import { fetchCuringLogsAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function PrintingCuringQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const initialCuringLogs = await fetchCuringLogsAction(companyFilter)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <CuringQcClient initialCuringLogs={initialCuringLogs} />
    </AdminShell>
  )
}
