import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function ArticlesLoading() {
  return (
    <AdminPageSkeleton 
      title="Articles & Rates"
      subtitle="Loading style catalog, stitching piece-rates, and rate audit history..."
      cardsCount={4}
      hasTable={true}
    />
  )
}
