import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from '../components/ReadyGoodsSkeleton'

export default function ReadyGoodsHandoverLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="handover" />
    </AdminShell>
  )
}
