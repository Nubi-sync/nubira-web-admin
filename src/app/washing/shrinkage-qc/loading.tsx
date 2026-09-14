import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from '../components/WashingSkeleton'

export default function WashingShrinkageQcLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="shrinkage-qc" />
    </AdminShell>
  )
}
