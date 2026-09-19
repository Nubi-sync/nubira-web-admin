import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerProfileClient } from './components/WorkerProfileClient'
import { resolveUserTenant } from '@/lib/tenant-context'
import { fetchEmbroideryWorkersAction, fetchEmbroideryTaskAllocationsAction } from '../../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Operator Profile | Embroidery Studio Workstation',
  description: 'Embroidery floor operator credentials, badge details, and workstation roles.'
}

export default async function EmbroideryWorkerProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  // Fetch server-side workers and tasks
  const [initialWorkers, initialTasks] = await Promise.all([
    fetchEmbroideryWorkersAction(companyFilter),
    fetchEmbroideryTaskAllocationsAction(companyFilter)
  ])

  // Resolve display name if default
  let displayName = tenant.adminDisplayName
  const normPhone = (tenant.phone || '').replace(/\D/g, '').slice(-10)

  let matchedWorker = initialWorkers.find((w: any) =>
    (normPhone && w.phone_number && w.phone_number.replace(/\D/g, '').slice(-10) === normPhone) ||
    (user.id && w.worker_user_id === user.id)
  )

  if (!matchedWorker) {
    const matchedTask = initialTasks.find((t: any) =>
      (normPhone && t.worker_phone && t.worker_phone.replace(/\D/g, '').slice(-10) === normPhone) ||
      (user.id && t.worker_id === user.id)
    )
    if (matchedTask?.worker_name) {
      displayName = matchedTask.worker_name
    }
  } else if (matchedWorker.worker_name) {
    displayName = matchedWorker.worker_name
  }

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role || 'EMBROIDERY_WORKER'}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <WorkerProfileClient
          userEmail={tenant.userEmail}
          userName={displayName}
          userPhone={tenant.phone}
          userId={user.id}
          userRole={tenant.role}
          workerRecord={matchedWorker}
        />
      </div>
    </AdminShell>
  )
}
