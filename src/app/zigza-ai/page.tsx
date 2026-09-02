import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ZigzaAiClient } from './components/ZigzaAiClient'

export const dynamic = 'force-dynamic'

export default async function ZigzaAiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <ZigzaAiClient userEmail={user.email} />
    </AdminShell>
  )
}
