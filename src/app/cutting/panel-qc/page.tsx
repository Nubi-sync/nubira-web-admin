import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PanelQcClient } from './components/PanelQcClient'

export const dynamic = 'force-dynamic'

export default async function PanelQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <PanelQcClient />
    </AdminShell>
  )
}
