import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from '../components/IronSkeleton'

export default function IronWagesLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="wages" />
    </AdminShell>
  )
}
