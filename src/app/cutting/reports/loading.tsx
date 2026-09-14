import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function CuttingReportsLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="reports" />
    </AdminShell>
  )
}
