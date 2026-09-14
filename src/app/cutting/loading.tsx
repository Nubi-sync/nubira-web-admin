import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from './components/CuttingSkeleton'

export default function CuttingLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
