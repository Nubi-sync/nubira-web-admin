import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerDashboardClient } from './components/WorkerDashboardClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Worker Portal | Cutting & Lay Floor',
  description: 'Floor operator workstation for assigned cutting quotas, table allocations, and completion sign-offs.'
}

export default async function CuttingWorkerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role || 'CUTTING_WORKER'}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <WorkerDashboardClient
          userEmail={tenant.userEmail}
          userName={tenant.adminDisplayName}
          userPhone={tenant.phone}
          userId={user.id}
          userRole={tenant.role}
        />
      </div>
    </AdminShell>
  )
}
