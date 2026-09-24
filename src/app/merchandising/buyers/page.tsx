import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { ActiveBuyersClient } from './components/ActiveBuyersClient'
import { fetchActiveBuyersAction } from '../actions'
import { fetchTechPacksAction } from '@/app/design/actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Active Buyers & Commercial Accounts | Merchandising Desk',
  description: 'Manage contracted buyer accounts, piece-rate pricing, order volumes, and Tech Pack allocations.'
}

export default async function ActiveBuyersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyFilter = tenant.companyName

  const [initialBuyers, techPacks] = await Promise.all([
    fetchActiveBuyersAction(companyFilter),
    fetchTechPacksAction(companyFilter).catch(() => [])
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <ActiveBuyersClient 
        initialBuyers={initialBuyers} 
        companyName={companyFilter}
        initialTechPacks={techPacks}
      />
    </AdminShell>
  )
}
