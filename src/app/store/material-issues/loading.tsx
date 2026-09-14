import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from '../components/StoreSkeleton'

export default function MaterialIssuesLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="material-issues" />
    </AdminShell>
  )
}
