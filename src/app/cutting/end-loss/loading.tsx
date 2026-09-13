import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function EndLossLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="endloss" />
    </AdminShell>
  )
}
