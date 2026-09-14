import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from '../components/WashingSkeleton'

export default function WashingMachineRunsLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="machine-runs" />
    </AdminShell>
  )
}
