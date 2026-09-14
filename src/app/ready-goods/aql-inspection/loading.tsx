import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from '../components/ReadyGoodsSkeleton'

export default function ReadyGoodsAqlInspectionLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="aql-inspection" />
    </AdminShell>
  )
}
