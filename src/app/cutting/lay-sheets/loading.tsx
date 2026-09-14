import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function LaySheetsLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="lays" />
    </AdminShell>
  )
}
