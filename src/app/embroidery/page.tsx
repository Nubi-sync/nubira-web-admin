import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EmbroideryDashboardClient } from './components/EmbroideryDashboardClient'
import {
  fetchEmbroideryDashboardKpisAction,
  fetchEmbroideryRunsAction,
  fetchEmbroideryDesignsAction,
  fetchEmbroideryQcAuditsAction,
  fetchThreadInventoryAction
} from './actions'

export const dynamic = 'force-dynamic'

export default async function EmbroideryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const [liveKpis, initialRuns, initialDesigns, initialAudits, initialCones] = await Promise.all([
    fetchEmbroideryDashboardKpisAction(),
    fetchEmbroideryRunsAction(),
    fetchEmbroideryDesignsAction(),
    fetchEmbroideryQcAuditsAction(),
    fetchThreadInventoryAction()
  ])

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <EmbroideryDashboardClient 
        userEmail={user.email}
        liveKpis={liveKpis}
        initialRuns={initialRuns}
        initialDesigns={initialDesigns}
        initialAudits={initialAudits}
        initialCones={initialCones}
      />
    </AdminShell>
  )
}
