import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ZigzaAiClient } from '@/app/zigza-ai/components/ZigzaAiClient'

export const dynamic = 'force-dynamic'

export default async function DesignZigzaAiPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <ZigzaAiClient userEmail={user.email} portal="design" />
    </AdminShell>
  )
}
