import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from '../components/ReadyGoodsSkeleton'

export default function ReadyGoodsCartonWeightLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="carton-weight" />
    </AdminShell>
  )
}
