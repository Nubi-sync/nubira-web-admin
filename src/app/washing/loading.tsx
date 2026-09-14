import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from './components/WashingSkeleton'

export default function WashingLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
