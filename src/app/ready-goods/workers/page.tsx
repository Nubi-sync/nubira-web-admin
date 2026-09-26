import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkersManagementClient } from './components/WorkersManagementClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Floor Workers & Roles | Finishing & Packing',
  description: 'Manage quality checkers, packing operators, and dual-role specialists on the finishing floor.'
}

export default async function ReadyGoodsWorkersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <WorkersManagementClient
        userEmail={user.email}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
