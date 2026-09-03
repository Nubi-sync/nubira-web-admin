import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function ReportsLoading() {
  return (
    <AdminPageSkeleton 
      title="Reports & Analytics"
      subtitle="Loading floor analytics, daily production totals, and QC pass rates..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
