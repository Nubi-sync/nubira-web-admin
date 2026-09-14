import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from '../components/IronSkeleton'

export default function IronFinishQcLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="finish-qc" />
    </AdminShell>
  )
}
