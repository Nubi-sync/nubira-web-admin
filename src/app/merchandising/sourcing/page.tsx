import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SourcingRequisitionsClient } from './components/SourcingRequisitionsClient'

export const dynamic = 'force-dynamic'

export default async function MerchandisingSourcingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <SourcingRequisitionsClient />
    </AdminShell>
  )
}
