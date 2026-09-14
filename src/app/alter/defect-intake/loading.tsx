import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from '../components/AlterSkeleton'

export default function DefectIntakeLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="defect-intake" />
    </AdminShell>
  )
}
