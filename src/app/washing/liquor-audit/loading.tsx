import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from '../components/WashingSkeleton'

export default function WashingLiquorAuditLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="liquor-audit" />
    </AdminShell>
  )
}
