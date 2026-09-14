import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from '../components/PrintingSkeleton'

export default function PrintingTableRunsLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="table-runs" />
    </AdminShell>
  )
}
