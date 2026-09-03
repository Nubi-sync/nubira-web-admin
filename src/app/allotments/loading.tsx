import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function AllotmentsLoading() {
  return (
    <AdminPageSkeleton 
      title="Target Allotments"
      subtitle="Loading active lineman floor allotments and material handshakes..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
