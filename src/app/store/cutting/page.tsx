import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ModuleStoreDashboard } from '@/components/store/ModuleStoreDashboard'
import {
  fetchMaterialReceiptsByDivision,
  fetchMaterialIssuesByDivision
} from '@/app/store/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function CentralStoreCuttingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const [receiptsRes, issuesRes, allIssuesRes] = await Promise.all([
    fetchMaterialReceiptsByDivision('CUTTING', companyFilter),
    fetchMaterialIssuesByDivision('CUTTING', companyFilter),
    fetchMaterialIssuesByDivision(undefined, companyFilter),
  ])

  const initialReceipts = receiptsRes.data || []
  const initialIssues = (issuesRes.data || []).filter((i: any) => i.from_division === 'CUTTING')
  const pendingIssuesForMe = (allIssuesRes.data || []).filter(
    (i: any) => i.to_division === 'CUTTING' && i.status !== 'RECEIVED'
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ModuleStoreDashboard
        moduleName="Cutting Floor"
        divisionCode="CUTTING"
        moduleNumber="03"
        baseRoute="/store"
        initialReceipts={initialReceipts}
        initialIssues={initialIssues}
        pendingIssuesForMe={pendingIssuesForMe}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
