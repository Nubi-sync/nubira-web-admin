import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from './components/AlterSkeleton'

export default function AlterLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
