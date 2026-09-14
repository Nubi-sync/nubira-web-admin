import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandisingPageSkeleton } from './components/MerchandisingSkeleton'

export default function MerchandisingLoading() {
  return (
    <AdminShell>
      <MerchandisingPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
