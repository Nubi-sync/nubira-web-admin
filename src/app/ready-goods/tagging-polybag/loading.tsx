import { AdminShell } from '@/components/layout/AdminShell'
import { ReadyGoodsPageSkeleton } from '../components/ReadyGoodsSkeleton'

export default function ReadyGoodsTaggingPolybagLoading() {
  return (
    <AdminShell>
      <ReadyGoodsPageSkeleton variant="tagging-polybag" />
    </AdminShell>
  )
}
