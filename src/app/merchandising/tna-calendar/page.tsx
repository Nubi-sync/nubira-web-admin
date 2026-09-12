import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { TnaPlannerClient } from './components/TnaPlannerClient'
import { fetchTnaMilestonesAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function MerchandisingTnaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialMilestones = await fetchTnaMilestonesAction()

  return (
    <AdminShell userEmail={user.email}>
      <TnaPlannerClient initialMilestones={initialMilestones} />
    </AdminShell>
  )
}
