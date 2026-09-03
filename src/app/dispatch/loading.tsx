import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function DispatchLoading() {
  return (
    <AdminPageSkeleton 
      title="Dispatch & Challans"
      subtitle="Loading delivery challans, vehicle dispatch bays, and carton counts..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
