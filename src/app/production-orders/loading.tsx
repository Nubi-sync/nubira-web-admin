import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function ProductionOrdersLoading() {
  return (
    <AdminPageSkeleton 
      title="Digital Production & Challan Chart"
      subtitle="Loading order matrices, lineman assignments, and BOM requirements..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
