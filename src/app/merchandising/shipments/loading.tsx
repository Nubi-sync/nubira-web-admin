import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from '../components/MerchandisingSkeleton'

export default function ShipmentsLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="shipments" />
    </AdminShell>
  )
}
