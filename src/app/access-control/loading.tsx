import { AdminShell } from '@/components/layout/AdminShell'
import { AccessControlPageSkeleton } from '@/app/modules/access-control/components/AccessControlSkeleton'

export default function DirectAccessControlLoading() {
  return (
    <AdminShell>
      <AccessControlPageSkeleton />
    </AdminShell>
  )
}
