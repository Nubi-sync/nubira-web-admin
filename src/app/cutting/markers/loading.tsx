import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function MarkersLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="markers" />
    </AdminShell>
  )
}
