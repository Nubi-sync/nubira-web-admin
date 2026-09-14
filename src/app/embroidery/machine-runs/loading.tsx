import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from '../components/EmbroiderySkeleton'

export default function EmbroideryMachineRunsLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="machine-runs" />
    </AdminShell>
  )
}
