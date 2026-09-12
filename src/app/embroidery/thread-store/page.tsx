import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThreadStoreClient } from './components/ThreadStoreClient'
import { fetchThreadInventoryAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EmbroideryThreadStorePage() {
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

  const initialCones = await fetchThreadInventoryAction()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <ThreadStoreClient initialCones={initialCones} />
    </AdminShell>
  )
}
