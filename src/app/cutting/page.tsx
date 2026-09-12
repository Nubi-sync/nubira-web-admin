import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingDashboardClient } from './components/CuttingDashboardClient'
import { fetchLaySheetsAction, fetchCutBundlesAction, fetchCuttingDashboardKpisAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function CuttingModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [initialLays, initialBundles, liveKpis] = await Promise.all([
    fetchLaySheetsAction(),
    fetchCutBundlesAction(),
    fetchCuttingDashboardKpisAction()
  ])

  return (
    <AdminShell userEmail={user.email}>
      <CuttingDashboardClient 
        userEmail={user.email} 
        initialLays={initialLays}
        initialBundles={initialBundles}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
