import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function StoreLoading() {
  return (
    <AdminPageSkeleton
      title="Store Godown & Inward Ledger"
      subtitle="Loading truck shipments, roll inventories, and floor accessory allocations..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
