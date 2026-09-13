import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SampleApprovalsClient } from './components/SampleApprovalsClient'
import { fetchSampleApprovalsAction, fetchTechPacksAction } from '../actions'

import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function SampleApprovalsPage() {
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

  const [initialApprovals, techPacks] = await Promise.all([
    fetchSampleApprovalsAction(companyFilter),
    fetchTechPacksAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        <SampleApprovalsClient initialApprovals={initialApprovals} initialTechPacks={techPacks} />
      </div>
    </AdminShell>
  )
}
