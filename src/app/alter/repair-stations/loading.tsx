import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from '../components/AlterSkeleton'

export default function RepairStationsLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="repair-stations" />
    </AdminShell>
  )
}
