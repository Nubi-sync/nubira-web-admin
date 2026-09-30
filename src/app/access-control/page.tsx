import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchSupervisorAndWorkersHubAction } from '@/app/modules/access-control/actions'
import { DepartmentHeadsClient } from '@/app/modules/access-control/components/DepartmentHeadsClient'

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

  // Restrict to Company SuperAdmin, Production Manager, Department Head, Platform Admin only
  const isAuthorizedAdmin = (
    tenant.isSuperAdmin ||
    userRole === 'SUPERADMIN' ||
    userRole === 'ADMIN' ||
    userRole === 'PLATFORM_SUPERADMIN' ||
    userRole === 'PRODUCTION_MANAGER' ||
    userRole === 'DEPARTMENT_HEAD' ||
    user.email === 'admin@zigza.in' ||
    user.email === 'team.anga9@gmail.com' ||
    user.email === 'aj@nubiracreation.com'
  )

  if (!isAuthorizedAdmin) {
    // Non-admin staff attempting direct URL access redirected to their allowed workplace
    redirect(tenant.allowedDivisions[0] || '/modules')
  }

  const hubData = await fetchSupervisorAndWorkersHubAction()

  return (
    <AdminShell 
      userEmail={user.email} 
      userRole={userRole} 
      companyName={tenant.companyName}
      allowedTabs={tenant.allowedTabs}
    >
      <DepartmentHeadsClient hubData={hubData} />
    </AdminShell>
  )
}

