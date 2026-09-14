import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from '../components/AlterSkeleton'

export default function SpotCleaningLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="spot-cleaning" />
    </AdminShell>
  )
}
