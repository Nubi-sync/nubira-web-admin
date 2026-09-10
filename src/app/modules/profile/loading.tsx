import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function ModuleProfileLoading() {
  return (
    <AdminPageSkeleton
      title="Company & User Profile"
      subtitle="Loading account credentials, factory permissions, and organization details..."
      cardsCount={2}
      hasTable={false}
    />
  )
}
