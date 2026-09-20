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

export default async function WashingStorePage() {
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
    fetchMaterialReceiptsByDivision('WASHING', companyFilter),
    fetchMaterialIssuesByDivision('WASHING', companyFilter),
    fetchMaterialIssuesByDivision(undefined, companyFilter),
  ])

  const initialReceipts = receiptsRes.data || []
  const initialIssues = (issuesRes.data || []).filter((i: any) => i.from_division === 'WASHING')
  const pendingIssuesForMe = (allIssuesRes.data || []).filter(
    (i: any) => i.to_division === 'WASHING' && i.status !== 'RECEIVED'
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ModuleStoreDashboard
        moduleName="Washing Operations"
        divisionCode="WASHING"
        moduleNumber="07"
        baseRoute="/washing"
        initialReceipts={initialReceipts}
        initialIssues={initialIssues}
        pendingIssuesForMe={pendingIssuesForMe}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
