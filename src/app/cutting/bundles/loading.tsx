import { AdminShell } from '@/components/layout/AdminShell'
import { CuttingPageSkeleton } from '../components/CuttingSkeleton'

export default function BundlesLoading() {
  return (
    <AdminShell>
      <CuttingPageSkeleton variant="bundles" />
    </AdminShell>
  )
}
