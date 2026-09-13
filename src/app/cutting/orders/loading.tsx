import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function CuttingOrdersLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="orders" />
    </AdminShell>
  )
}
