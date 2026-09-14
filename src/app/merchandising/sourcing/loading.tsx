import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from '../components/MerchandisingSkeleton'

export default function SourcingLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="sourcing" />
    </AdminShell>
  )
}
