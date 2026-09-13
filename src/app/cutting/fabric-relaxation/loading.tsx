import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function FabricRelaxationLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="relaxation" />
    </AdminShell>
  )
}
