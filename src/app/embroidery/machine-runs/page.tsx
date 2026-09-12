import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MachineRunsClient } from './components/MachineRunsClient'
import { fetchEmbroideryRunsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EmbroideryMachineRunsPage() {
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

  const initialRuns = await fetchEmbroideryRunsAction()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <MachineRunsClient initialRuns={initialRuns} />
    </AdminShell>
  )
}
