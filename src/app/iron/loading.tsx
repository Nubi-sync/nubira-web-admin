import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from './components/IronSkeleton'

export default function IronLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
