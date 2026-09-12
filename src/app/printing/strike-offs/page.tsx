import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { StrikeOffsClient } from './components/StrikeOffsClient'
import { fetchStrikeOffsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function PrintingStrikeOffsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialStrikeOffs = await fetchStrikeOffsAction()

  return (
    <AdminShell userEmail={user.email}>
      <StrikeOffsClient initialStrikeOffs={initialStrikeOffs} />
    </AdminShell>
  )
}
