import { AdminShell } from '@/components/layout/AdminShell'
import { IronPageSkeleton } from '../components/IronSkeleton'

export default function IronTablesLoading() {
  return (
    <AdminShell>
      <IronPageSkeleton variant="tables" />
    </AdminShell>
  )
}
