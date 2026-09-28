import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { FinishedGodownClient } from './components/FinishedGodownClient'

export const dynamic = 'force-dynamic'

export default async function FinishedGodownPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role} companyName={tenant.companyName}>
      <FinishedGodownClient />
    </AdminShell>
  )
}
