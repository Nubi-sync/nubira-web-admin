import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function SupervisorDeskLoading() {
  return (
    <AdminPageSkeleton
      title="Supervisor Operations & Absentee Override Hub"
      subtitle="Connecting to floor telemetry and synchronizing supervisor station gates..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
