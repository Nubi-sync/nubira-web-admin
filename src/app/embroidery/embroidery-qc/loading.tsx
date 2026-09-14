import { AdminShell } from '@/components/layout/AdminShell'
import { EmbroideryPageSkeleton } from '../components/EmbroiderySkeleton'

export default function EmbroideryQcLoading() {
  return (
    <AdminShell>
      <EmbroideryPageSkeleton variant="embroidery-qc" />
    </AdminShell>
  )
}
