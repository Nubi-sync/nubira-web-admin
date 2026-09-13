import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function PanelQcLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="qc" />
    </AdminShell>
  )
}
