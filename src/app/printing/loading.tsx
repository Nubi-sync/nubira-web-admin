import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from './components/PrintingSkeleton'

export default function PrintingLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
