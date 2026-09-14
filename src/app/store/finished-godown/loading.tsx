import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from '../components/StoreSkeleton'

export default function FinishedGodownLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="finished-godown" />
    </AdminShell>
  )
}
