import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignDashboardClient } from './components/DesignDashboardClient'
import { 
  fetchTechPacksAction, 
  fetchDesignBriefsAction, 
  fetchDesignTeamMembersAction
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

  const [initialBriefs, initialTechPacks, teamMembers] = await Promise.all([
    fetchDesignBriefsAction({ companyName: companyFilter }),
    fetchTechPacksAction(companyFilter),
    fetchDesignTeamMembersAction(companyFilter)
  ])

  // Derive metrics instantly without redundant DB queries
  const active_briefs = initialBriefs.filter(b => b.status === 'ALLOCATED' || b.status === 'SUBMITTED').length
  const pending_ph_reviews = initialBriefs.filter(b => b.status === 'SUBMITTED').length
  const pending_sa_approvals = initialBriefs.filter(b => b.status === 'PH_APPROVED').length
  const sa_approved_designs = initialBriefs.filter(b => b.status === 'SA_APPROVED').length
  const saved_for_later = initialBriefs.filter(b => b.status === 'SA_SAVED_FOR_LATER').length
  const active_tech_packs = initialTechPacks.length
  const team_designers_count = teamMembers.filter(m => m.status === 'ACTIVE').length

  const metrics = {
    active_briefs,
    pending_ph_reviews,
    pending_sa_approvals,
    sa_approved_designs,
    saved_for_later,
    active_tech_packs,
    team_designers_count
  }

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

