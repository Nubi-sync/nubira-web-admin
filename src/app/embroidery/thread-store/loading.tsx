import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from '../components/EmbroiderySkeleton'

export default function EmbroideryThreadStoreLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="thread-store" />
    </AdminShell>
  )
}
