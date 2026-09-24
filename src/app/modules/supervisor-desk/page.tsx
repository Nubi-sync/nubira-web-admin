import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SupervisorDeskClient } from './SupervisorDeskClient'
import { resolveUserTenant } from '@/lib/tenant-context'

import { fetchSupervisorDeskDataAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function SupervisorDeskPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Centrally resolve tenant organization & identity
  const tenant = await resolveUserTenant(user)
  const isLegacyNubira =
    tenant.companyName.toLowerCase() === 'nubira creation' ||
    tenant.userEmail === 'team.anga9@gmail.com' ||
    tenant.userEmail === 'aj@nubiracreation.com' ||
    tenant.userEmail.endsWith('@nubira.local')
  const userRole = tenant.role.toUpperCase()

  // 2. Fetch cached supervisor desk datasets
  const { rawAllotmentsData, rawLinemenProfiles, rawAllProfiles } =
    await fetchSupervisorDeskDataAction(tenant.companyName)

  // Multi-tenant scoping: Client factories only view allotments matching their company
  const allotmentsData = !isLegacyNubira
    ? (rawAllotmentsData || []).filter(a => {
        const brand = ((a.challans as any)?.brand || '').toUpperCase()
        const target = tenant.companyName.toUpperCase()
        return brand.length > 0 && brand.includes(target)
      })
    : (rawAllotmentsData || [])

  const linemenProfiles = !isLegacyNubira ? [] : (rawLinemenProfiles || [])
  const allProfiles = !isLegacyNubira ? [] : (rawAllProfiles || [])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <SupervisorDeskClient
        initialAllotments={(allotmentsData as any) || []}
        linemenProfiles={linemenProfiles || []}
        allProfiles={allProfiles || []}
        currentUserEmail={tenant.userEmail}
        currentUserName={tenant.adminDisplayName || tenant.customUsername || user.email?.split('@')[0] || 'Enterprise Admin'}
        currentUserRole={tenant.isSuperAdmin ? 'Enterprise Master' : (userRole || 'Plant Admin')}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
