import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignDashboardClient } from './components/DesignDashboardClient'
import { 
  fetchTechPacksAction, 
  fetchDesignBriefsAction, 
  fetchDesignTeamMembersAction, 
  fetchDesignStudioMetricsAction 
} from './actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function DesignModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)
  const companyFilter = isLegacy ? undefined : tenant.companyName

  const [metrics, initialBriefs, initialTechPacks, teamMembers] = await Promise.all([
    fetchDesignStudioMetricsAction(companyFilter),
    fetchDesignBriefsAction({ companyName: companyFilter }),
    fetchTechPacksAction(companyFilter),
    fetchDesignTeamMembersAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignDashboardClient 
          metrics={metrics}
          initialBriefs={initialBriefs}
          initialTechPacks={initialTechPacks}
          teamMembers={teamMembers}
          companyName={tenant.companyName || 'Nubira Creation'}
          currentUserId={user.id}
          userRole={tenant.role}
        />
      </div>
    </AdminShell>
  )
}
