import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingReportsClient } from './components/CuttingReportsClient'

export const dynamic = 'force-dynamic'

export default async function CuttingReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <CuttingReportsClient />
    </AdminShell>
  )
}
