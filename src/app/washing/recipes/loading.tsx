import { AdminShell } from '@/components/layout/AdminShell'
import { WashingPageSkeleton } from '../components/WashingSkeleton'

export default function WashingRecipesLoading() {
  return (
    <AdminShell>
      <WashingPageSkeleton variant="recipes" />
    </AdminShell>
  )
}
