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

export default async function IronStorePage() {
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
    fetchMaterialReceiptsByDivision('IRONING', companyFilter),
    fetchMaterialIssuesByDivision('IRONING', companyFilter),
    fetchMaterialIssuesByDivision(undefined, companyFilter),
  ])

  const initialReceipts = receiptsRes.data || []
  const initialIssues = (issuesRes.data || []).filter((i: any) => i.from_division === 'IRONING')
  const pendingIssuesForMe = (allIssuesRes.data || []).filter(
    (i: any) => i.to_division === 'IRONING' && i.status !== 'RECEIVED'
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ModuleStoreDashboard
        moduleName="Ironing Operations"
        divisionCode="IRONING"
        moduleNumber="08"
        baseRoute="/iron"
        initialReceipts={initialReceipts}
        initialIssues={initialIssues}
        pendingIssuesForMe={pendingIssuesForMe}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
