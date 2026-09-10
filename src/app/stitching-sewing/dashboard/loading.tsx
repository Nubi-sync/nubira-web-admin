import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function StitchingSewingDashboardLoading() {
  return (
    <AdminPageSkeleton
      title="Stitching & Sewing Live Dashboard"
      subtitle="Connecting to floor telemetry and calculating live line metrics..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
