import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from '../components/WashingSkeleton'

export default function WashingHandoverLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="handover" />
    </AdminShell>
  )
}
