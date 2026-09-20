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

export default async function CentralStoreSewingPage() {
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
    fetchMaterialReceiptsByDivision('SEWING', companyFilter),
    fetchMaterialIssuesByDivision('SEWING', companyFilter),
    fetchMaterialIssuesByDivision(undefined, companyFilter),
  ])

  const initialReceipts = receiptsRes.data || []
  const initialIssues = (issuesRes.data || []).filter((i: any) => i.from_division === 'SEWING')
  const pendingIssuesForMe = (allIssuesRes.data || []).filter(
    (i: any) => i.to_division === 'SEWING' && i.status !== 'RECEIVED'
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ModuleStoreDashboard
        moduleName="Sewing Floor"
        divisionCode="SEWING"
        moduleNumber="06"
        baseRoute="/store"
        initialReceipts={initialReceipts}
        initialIssues={initialIssues}
        pendingIssuesForMe={pendingIssuesForMe}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
