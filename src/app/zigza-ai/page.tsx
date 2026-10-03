import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MasterZigzaAiHubClient } from './components/MasterZigzaAiHubClient'
import { fetchMasterZigzaAiData } from './actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function ZigzaAiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  // Restrict Store Supervisors from admin AI copilot
  const userRole = (tenant.role || '').toUpperCase()
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/store')
  }

  const initialKpis = await fetchMasterZigzaAiData(tenant.companyName)

  return (
    <AdminShell 
      userEmail={user.email} 
      userRole={userRole} 
      companyName={tenant.companyName}
      allowedTabs={tenant.allowedTabs}
    >
      <MasterZigzaAiHubClient 
        userEmail={user.email} 
        companyName={tenant.companyName}
        initialKpis={initialKpis}
      />
    </AdminShell>
  )
}

