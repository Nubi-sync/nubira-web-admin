import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from '../components/IronSkeleton'

export default function IronHandoverLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="handover" />
    </AdminShell>
  )
}
