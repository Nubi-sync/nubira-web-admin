import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchCompanyDepartmentHeadsAction } from './actions'
import { DepartmentHeadsClient } from './components/DepartmentHeadsClient'

export const dynamic = 'force-dynamic'

export default async function AccessControlPage() {
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

  // Restrict to Company SuperAdmin / Platform Admin only
  const isAuthorizedAdmin = (
    tenant.isSuperAdmin ||
    userRole === 'SUPERADMIN' ||
    userRole === 'ADMIN' ||
    userRole === 'PLATFORM_SUPERADMIN' ||
    user.email === 'admin@zigza.in' ||
    user.email === 'team.anga9@gmail.com' ||
    user.email === 'aj@nubiracreation.com'
  )

  if (!isAuthorizedAdmin) {
    // Non-admin staff attempting direct URL access redirected to their allowed workplace
    redirect(tenant.allowedDivisions[0] || '/modules')
  }

  const res = await fetchCompanyDepartmentHeadsAction()

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <DepartmentHeadsClient
        initialDivisions={res.divisions}
        allowedDivisions={res.allowedDivisions || tenant.allowedDivisions}
        tenantName={res.tenantName || tenant.companyName || 'Apparel Factory'}
        isSuperAdmin={tenant.isSuperAdmin}
      />
    </AdminShell>
  )
}
