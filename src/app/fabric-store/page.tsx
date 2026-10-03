import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchFabricStoreHubAction } from './actions'
import { FabricStoreHubClient } from './components/FabricStoreHubClient'

export const dynamic = 'force-dynamic'

export default async function FabricStorePage() {
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

  // Restrict Store Supervisors or Godown Staff to internal operational store
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  const hubData = await fetchFabricStoreHubAction(tenant.companyName)

  return (
    <AdminShell 
      userEmail={user.email} 
      userRole={userRole} 
      companyName={tenant.companyName}
      allowedTabs={tenant.allowedTabs}
    >
      <FabricStoreHubClient 
        hubData={hubData} 
        companyName={tenant.companyName} 
      />
    </AdminShell>
  )
}
