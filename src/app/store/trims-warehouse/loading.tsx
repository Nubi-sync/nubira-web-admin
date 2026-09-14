import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from '../components/StoreSkeleton'

export default function TrimsWarehouseLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="trims-warehouse" />
    </AdminShell>
  )
}
