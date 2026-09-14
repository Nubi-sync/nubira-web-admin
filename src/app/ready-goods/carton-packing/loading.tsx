import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from '../components/ReadyGoodsSkeleton'

export default function ReadyGoodsCartonPackingLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="carton-packing" />
    </AdminShell>
  )
}
