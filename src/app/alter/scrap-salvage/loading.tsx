import { AdminShell } from '@/components/layout/AdminShell'
import { AlterPageSkeleton } from '../components/AlterSkeleton'

export default function ScrapSalvageLoading() {
  return (
    <AdminShell>
      <AlterPageSkeleton variant="scrap-salvage" />
    </AdminShell>
  )
}
