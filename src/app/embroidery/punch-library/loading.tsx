import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from '../components/EmbroiderySkeleton'

export default function EmbroideryPunchLibraryLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="punch-library" />
    </AdminShell>
  )
}
