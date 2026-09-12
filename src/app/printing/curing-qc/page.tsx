import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuringQcClient } from './components/CuringQcClient'
import { fetchCuringLogsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function PrintingCuringQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialCuringLogs = await fetchCuringLogsAction()

  return (
    <AdminShell userEmail={user.email}>
      <CuringQcClient initialCuringLogs={initialCuringLogs} />
    </AdminShell>
  )
}
