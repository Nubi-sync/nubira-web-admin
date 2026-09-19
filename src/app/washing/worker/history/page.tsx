import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerHistoryClient } from './components/WorkerHistoryClient'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchWashingTaskAllocationsAction, fetchWashingWorkersAction } from '../../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Completed History | Industrial Washing Workstation',
  description: 'Verified washing task archive and completed garment batches sign-offs.'
}

export default async function WashingWorkerHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  // Fetch server-side task allocations and workers
  const [initialTasks, initialWorkers] = await Promise.all([
    fetchWashingTaskAllocationsAction(companyFilter),
    fetchWashingWorkersAction(companyFilter)
  ])

  // Resolve display name if default
  let displayName = tenant.adminDisplayName
  const normPhone = (tenant.phone || user.user_metadata?.phone_number || '').replace(/\D/g, '').slice(-10)

  if (!displayName || displayName === 'Floor Operator' || displayName === 'Washing Operator' || displayName === 'Washing Floor Operator') {
    const metaName = user.user_metadata?.full_name
    if (metaName && metaName !== 'Floor Operator' && metaName !== 'Washing Operator' && metaName !== 'Washing Floor Operator') {
      displayName = metaName
    } else {
      const matchedWorker = initialWorkers.find((w: any) =>
        (normPhone && w.phone_number && w.phone_number.replace(/\D/g, '').slice(-10) === normPhone) ||
        (user.id && w.worker_user_id === user.id)
      )
      if (matchedWorker?.worker_name) {
        displayName = matchedWorker.worker_name
      } else {
        const matchedTask = initialTasks.find((t: any) =>
          (normPhone && t.worker_phone && t.worker_phone.replace(/\D/g, '').slice(-10) === normPhone) ||
          (user.id && t.worker_id === user.id)
        )
        if (matchedTask?.worker_name) {
          displayName = matchedTask.worker_name
        }
      }
    }
  }

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role || 'WASHING_WORKER'}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <WorkerHistoryClient
          userEmail={tenant.userEmail}
          userName={displayName}
          userPhone={tenant.phone}
          userId={user.id}
          userRole={tenant.role}
          initialTasks={initialTasks}
          initialWorkers={initialWorkers}
          companyName={tenant.companyName}
        />
      </div>
    </AdminShell>
  )
}
