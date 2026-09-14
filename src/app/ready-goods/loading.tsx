import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from './components/ReadyGoodsSkeleton'

export default function ReadyGoodsLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="dashboard" />
    </AdminShell>
  )
}
