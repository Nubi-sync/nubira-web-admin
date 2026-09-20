import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CentralStoreHubClient } from './components/CentralStoreHubClient'
import { fetchCentralStoreKpis } from './actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function StoreDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  // Fetch Central Store KPIs, fabric inventory, material issues, and receipts
  const [kpisData, truckInwardsRes] = await Promise.all([
    fetchCentralStoreKpis(companyFilter),
    supabase
      .from('truck_inwards')
      .select('id, party_name, challan_no, truck_no, garment_type, article_no, status, inward_date')
      .order('inward_date', { ascending: false })
      .limit(30)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <CentralStoreHubClient
        userEmail={tenant.userEmail}
        isSuperAdmin={tenant.isSuperAdmin}
        companyName={tenant.companyName}
        initialFabrics={kpisData.fabrics || []}
        initialIssues={kpisData.issues || []}
        initialReceipts={kpisData.receipts || []}
        initialTruckInwards={truckInwardsRes.data || []}
        kpis={kpisData.kpis}
      />
    </AdminShell>
  )
}
