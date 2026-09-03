import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function DashboardLoading() {
  return (
    <AdminPageSkeleton 
      title="Plant Operations Control Center"
      subtitle="Loading real-time 6-stage manufacturing throughput..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
