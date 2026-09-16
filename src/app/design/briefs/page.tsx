import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignBriefsClient } from './components/DesignBriefsClient'
import { fetchDesignBriefsAction, fetchDesignTeamMembersAction } from '../actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function DesignBriefsPage() {
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
  const companyName = tenant.companyName || 'Nubira Creation'

  const [initialBriefs, teamMembers] = await Promise.all([
    fetchDesignBriefsAction({ companyName: companyFilter }),
    fetchDesignTeamMembersAction(companyFilter)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignBriefsClient
          initialBriefs={initialBriefs}
          teamMembers={teamMembers}
          companyName={companyName}
          currentUserId={user.id}
          userRole={tenant.role}
        />
      </div>
    </AdminShell>
  )
}

