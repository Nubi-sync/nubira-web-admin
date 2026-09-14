import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from './components/StoreSkeleton'

export default function StoreLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
