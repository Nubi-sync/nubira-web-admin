import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingDashboardClient } from './components/PrintingDashboardClient'
import {
  fetchPrintingDashboardKpisAction,
  fetchPrintingRunsAction,
  fetchStrikeOffsAction,
  fetchCuringLogsAction
} from './actions'

export const dynamic = 'force-dynamic'

export default async function PrintingModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [liveKpis, initialRuns, initialStrikeOffs, initialCuringLogs] = await Promise.all([
    fetchPrintingDashboardKpisAction(),
    fetchPrintingRunsAction(),
    fetchStrikeOffsAction(),
    fetchCuringLogsAction()
  ])

  return (
    <AdminShell userEmail={user.email}>
      <PrintingDashboardClient 
        userEmail={user.email}
        initialRuns={initialRuns}
        initialStrikeOffs={initialStrikeOffs}
        initialCuringLogs={initialCuringLogs}
        liveKpis={liveKpis}
      />
    </AdminShell>
  )
}
