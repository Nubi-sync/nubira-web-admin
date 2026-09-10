import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function ModuleSlugLoading() {
  return (
    <AdminPageSkeleton
      title="Loading Factory Department..."
      subtitle="Fetching operational telemetry, machinery metrics, and shift status..."
      cardsCount={3}
      hasTable={true}
    />
  )
}
