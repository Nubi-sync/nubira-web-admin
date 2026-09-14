import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from '../components/StoreSkeleton'

export default function TruckInwardsLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="truck-inwards" />
    </AdminShell>
  )
}
