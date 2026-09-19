import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WashingDashboardClient } from './components/WashingDashboardClient'
import { 
  fetchWashingWorkersAction, 
  fetchWashingTaskAllocationsAction, 
  fetchWashingDashboardDataAction 
} from './actions'
import { fetchCuttingTaskAllocationsAction } from '@/app/cutting/actions'
import { fetchActiveBuyersAction } from '@/app/merchandising/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function WashingDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const [
    { data: profile },
    liveData,
    workers,
    allocations,
    cuttingAllocations,
    buyers
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', user.id)
      .single(),
    fetchWashingDashboardDataAction(companyFilter),
    fetchWashingWorkersAction(companyFilter),
    fetchWashingTaskAllocationsAction(companyFilter),
    fetchCuttingTaskAllocationsAction(companyFilter),
    fetchActiveBuyersAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role || tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <WashingDashboardClient
          userEmail={user.email}
          isSuperAdmin={tenant.isPlatformAdmin || tenant.isSuperAdmin}
          initialBuyers={buyers || []}
          initialWorkers={workers || []}
          initialAllocations={allocations || []}
          initialCuttingAllocations={cuttingAllocations || []}
          liveKpis={liveData}
          companyName={tenant.companyName}
        />
      </div>
    </AdminShell>
  )
}

