import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EmbroideryQcClient } from './components/EmbroideryQcClient'
import { fetchEmbroideryQcAuditsAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EmbroideryQcPage() {
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

  const initialAudits = await fetchEmbroideryQcAuditsAction()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <EmbroideryQcClient initialAudits={initialAudits} />
    </AdminShell>
  )
}
