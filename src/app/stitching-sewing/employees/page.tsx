import EmployeesPage from '@/app/employees/page'

export const dynamic = 'force-dynamic'

export default async function SewingEmployeesPage() {
  return <EmployeesPage forcedModule="/stitching-sewing" moduleName="Unit 06: Stitching Floor" />
}
