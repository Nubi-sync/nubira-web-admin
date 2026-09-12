import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { TableRunsClient } from './components/TableRunsClient'
import { fetchPrintingRunsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function TableRunsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialRuns = await fetchPrintingRunsAction()

  return (
    <AdminShell userEmail={user.email}>
      <TableRunsClient initialRuns={initialRuns} />
    </AdminShell>
  )
}
