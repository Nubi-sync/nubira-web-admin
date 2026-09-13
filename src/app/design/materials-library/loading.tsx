import { AdminShell } from '@/components/layout/AdminShell'
import { DesignPageSkeleton } from '../components/DesignSkeleton'

export default function MaterialsLibraryLoading() {
  return (
    <AdminShell>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignPageSkeleton variant="materials" />
      </div>
    </AdminShell>
  )
}
