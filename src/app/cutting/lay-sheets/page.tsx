import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { LaySheetsClient } from './components/LaySheetsClient'
import { fetchLaySheetsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function LaySheetsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialLays = await fetchLaySheetsAction()

  return (
    <AdminShell userEmail={user.email}>
      <LaySheetsClient initialLays={initialLays} />
    </AdminShell>
  )
}
