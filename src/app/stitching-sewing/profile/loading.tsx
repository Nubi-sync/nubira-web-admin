import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function StitchingSewingProfileLoading() {
  return (
    <AdminPageSkeleton
      title="Staff Profile & Security"
      subtitle="Loading employee identity, active line assignments, and session status..."
      cardsCount={2}
      hasTable={false}
    />
  )
}
