import { AdminShell } from '@/components/layout/AdminShell'
import { PrintingPageSkeleton } from '../components/PrintingSkeleton'

export default function PrintingInkKitchenLoading() {
  return (
    <AdminShell>
      <PrintingPageSkeleton variant="ink-kitchen" />
    </AdminShell>
  )
}
