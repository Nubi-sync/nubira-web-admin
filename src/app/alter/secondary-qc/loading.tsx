import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from '../components/AlterSkeleton'

export default function SecondaryQcLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="secondary-qc" />
    </AdminShell>
  )
}
