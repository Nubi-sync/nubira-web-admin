import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from '../components/PrintingSkeleton'

export default function PrintingCuringQcLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="curing-qc" />
    </AdminShell>
  )
}
