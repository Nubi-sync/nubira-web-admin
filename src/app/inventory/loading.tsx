import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function InventoryLoading() {
  return (
    <AdminPageSkeleton 
      title="Godown & Inventory"
      subtitle="Loading warehouse stock levels, truck inward GRNs, and raw fabrics..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
