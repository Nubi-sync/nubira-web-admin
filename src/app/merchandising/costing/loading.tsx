import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from '../components/MerchandisingSkeleton'

export default function CostingLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="costing" />
    </AdminShell>
  )
}
