import { AdminPageSkeleton } from '@/components/layout/AdminPageSkeleton'

export default function EmployeesLoading() {
  return (
    <AdminPageSkeleton 
      title="Employees & Staff Management"
      subtitle="Loading factory staff, floor roles, and operator rosters..."
      cardsCount={3}
      hasTable={true}
    />
  )
}
