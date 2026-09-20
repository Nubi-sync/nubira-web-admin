import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InventoryClient } from './components/InventoryClient'
import { fetchInventoryPageDataAction } from './actions'
import Link from 'next/link'

import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isProvisionedTenant = tenant.isProvisionedTenant

  // Cached concurrent data fetching for inventory datasets & QC Handshake Approvals
  const {
    rawArticles,
    rawStoreTransactions,
    rawAccessories,
    rawTruckInwardsData,
    rawPendingQcAllotmentsData
  } = await fetchInventoryPageDataAction(tenant.companyName)

  const targetCompany = tenant.companyName.toUpperCase()

  const storeTransactions = isProvisionedTenant
    ? (rawStoreTransactions || []).filter((tx: any) =>
        (tx.party_name || '').toUpperCase().includes(targetCompany) ||
        (tx.notes || '').toUpperCase().includes(targetCompany)
      )
    : (rawStoreTransactions || [])

  const accessories = isProvisionedTenant
    ? (rawAccessories || []).filter((ac: any) =>
        (ac.party_name || '').toUpperCase().includes(targetCompany) ||
        (ac.notes || '').toUpperCase().includes(targetCompany)
      )
    : (rawAccessories || [])

  const truckInwards = isProvisionedTenant
    ? (rawTruckInwardsData || []).filter((t: any) =>
        (t.party_name || '').toUpperCase().includes(targetCompany)
      )
    : (rawTruckInwardsData || [])

  const pendingQcAllotments = isProvisionedTenant
    ? (rawPendingQcAllotmentsData || []).filter((al: any) =>
        ((al.challans as any)?.brand || '').toUpperCase().includes(targetCompany)
      )
    : (rawPendingQcAllotmentsData || [])

  const articles = rawArticles || []

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--ink-faint, #8B9AAB)' }}>
          <Link href="/stitching-sewing/dashboard" className="hover:underline hover:text-slate-900 transition-colors">
            Sewing Dashboard
          </Link>
          <span>/</span>
          <span className="font-semibold" style={{ color: 'var(--steel-dark, #1F3A63)' }}>
            Godown & Inventory
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-auto border border-slate-200">
            {tenant.companyName}
          </span>
        </div>

        <InventoryClient 
          articles={(articles as any) || []}
          storeTransactions={(storeTransactions as any) || []}
          accessories={(accessories as any) || []}
          truckInwards={truckInwards}
          pendingQcAllotments={pendingQcAllotments as any[]}
        />

      </div>
    </AdminShell>
  )
}
