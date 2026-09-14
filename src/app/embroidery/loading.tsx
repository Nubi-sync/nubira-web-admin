import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from './components/EmbroiderySkeleton'

export default function EmbroideryLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
