import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from '../components/MerchandisingSkeleton'

export default function OrdersLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="orders" />
    </AdminShell>
  )
}
