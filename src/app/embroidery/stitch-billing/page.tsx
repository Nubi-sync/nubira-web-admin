import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { StitchBillingClient } from './components/StitchBillingClient'
import { fetchStitchBillingLedgerAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EmbroideryStitchBillingPage() {
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

  const initialLedgers = await fetchStitchBillingLedgerAction()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <StitchBillingClient initialLedgers={initialLedgers} />
    </AdminShell>
  )
}
