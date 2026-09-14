import { AdminShell } from '@/components/layout/AdminShell'
import { AccessControlPageSkeleton } from './components/AccessControlSkeleton'

export default function AccessControlLoading() {
  return (
    <AdminShell>
      <AccessControlPageSkeleton />
    </AdminShell>
  )
}
