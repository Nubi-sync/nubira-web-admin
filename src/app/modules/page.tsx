import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ModuleHubClient } from './components/ModuleHubClient'
import { getUserAllowedModules, ALL_DIVISION_ROUTES } from '@/lib/access-control'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function ModulesHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve the authenticated tenant profile
  const tenant = await resolveUserTenant(user)
  const userRole = tenant.role.toUpperCase()

  // Module allotment: If the tenant organization has configured allowed divisions in platform_tenant_factories, strictly respect them
  const hasConfiguredDivisions = Array.isArray(tenant.allowedDivisions) && tenant.allowedDivisions.length > 0

  const allowedModules = hasConfiguredDivisions
    ? tenant.allowedDivisions
    : (tenant.isSuperAdmin
        ? [...ALL_DIVISION_ROUTES, '/modules']
        : getUserAllowedModules(user, { role: userRole }))

  // If user only has 1 operational division, redirect them straight to their assigned workplace
  if (allowedModules.length === 1 && !allowedModules.includes('/modules')) {
    redirect(allowedModules[0])
  }

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <ModuleHubClient
        userEmail={tenant.userEmail}
        userName={tenant.adminDisplayName || tenant.customUsername || 'Administrator'}
        userRole={tenant.isSuperAdmin ? 'Enterprise Master' : (userRole || 'Plant Administrator')}
        allowedModules={allowedModules}
      />
    </AdminShell>
  )
}
