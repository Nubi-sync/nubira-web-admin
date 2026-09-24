import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerHistoryClient } from './components/WorkerHistoryClient'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchStitchingTaskAllocationsAction, fetchStitchingWorkersAction } from '../../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Completed History | Stitching & Sewing Workstation',
  description: 'Verified stitching task history and piece-rate earnings log.'
}

export default async function StitchingWorkerHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const [initialTasks, initialWorkers] = await Promise.all([
    fetchStitchingTaskAllocationsAction(companyFilter),
    fetchStitchingWorkersAction(companyFilter)
  ])

  let displayName = tenant.adminDisplayName
  const normPhone = (tenant.phone || user.user_metadata?.phone_number || '').replace(/\D/g, '').slice(-10)

  if (!displayName || displayName === 'Floor Operator' || displayName === 'Tailor') {
    const metaName = user.user_metadata?.full_name
    if (metaName && metaName !== 'Floor Operator') {
      displayName = metaName
    } else {
      const matchedWorker = initialWorkers.find((w: any) =>
        (normPhone && w.phone_number && w.phone_number.replace(/\D/g, '').slice(-10) === normPhone) ||
        (user.id && w.worker_user_id === user.id)
      )
      if (matchedWorker?.worker_name) {
        displayName = matchedWorker.worker_name
      }
    }
  }

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role || 'STITCHING_WORKER'}>
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
