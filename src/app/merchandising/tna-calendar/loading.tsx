import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from '../components/MerchandisingSkeleton'

export default function TnaCalendarLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="tna" />
    </AdminShell>
  )
}
