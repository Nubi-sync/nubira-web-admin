import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { GodownHandoverClient } from './components/GodownHandoverClient'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function GodownHandoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <GodownHandoverClient userEmail={tenant.userEmail} />
    </AdminShell>
  )
}
