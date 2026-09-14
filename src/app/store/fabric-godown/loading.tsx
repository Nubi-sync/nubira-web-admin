import { AdminShell } from '@/components/layout/AdminShell'
import { StorePageSkeleton } from '../components/StoreSkeleton'

export default function FabricGodownLoading() {
  return (
    <AdminShell>
      <StorePageSkeleton variant="fabric-godown" />
    </AdminShell>
  )
}
