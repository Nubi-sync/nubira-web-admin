import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from '../components/EmbroiderySkeleton'

export default function EmbroideryStitchBillingLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="stitch-billing" />
    </AdminShell>
  )
}
