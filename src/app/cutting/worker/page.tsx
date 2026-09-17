import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerDashboardClient } from './components/WorkerDashboardClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Worker Portal | Cutting & Lay Floor',
  description: 'Floor operator visual portal for cutting piece quotas, lay executions, and shift sign-offs.'
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
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        <WorkerDashboardClient
          userEmail={tenant.userEmail}
          userName={tenant.adminDisplayName}
          userPhone={tenant.phone}
        />
      </div>
    </AdminShell>
  )
}
