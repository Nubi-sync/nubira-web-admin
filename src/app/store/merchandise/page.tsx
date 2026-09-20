import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { MerchandiseStoreClient } from '@/app/merchandising/store/components/MerchandiseStoreClient'
import {
  fetchCentralFabricInventory,
  fetchMaterialIssuesByDivision
} from '@/app/store/actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function CentralStoreMerchandisePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const [fabricsRes, issuesRes] = await Promise.all([
    fetchCentralFabricInventory(companyFilter),
    fetchMaterialIssuesByDivision(undefined, companyFilter),
  ])

  const initialFabrics = fabricsRes.data || []
  const initialIssues = (issuesRes.data || []).filter(
    (i: any) => i.from_division === 'MERCHANDISE'
  )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <MerchandiseStoreClient
        companyName={tenant.companyName}
        initialFabrics={initialFabrics}
        initialIssues={initialIssues}
      />
    </AdminShell>
  )
}
