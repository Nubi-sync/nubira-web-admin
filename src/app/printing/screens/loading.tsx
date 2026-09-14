import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from '../components/PrintingSkeleton'

export default function PrintingScreensLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="screens" />
    </AdminShell>
  )
}
