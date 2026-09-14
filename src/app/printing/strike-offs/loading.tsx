import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from '../components/PrintingSkeleton'

export default function PrintingStrikeOffsLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="strike-offs" />
    </AdminShell>
  )
}
