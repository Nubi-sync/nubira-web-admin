import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignerDashboardClient } from './components/DesignerDashboardClient'
import { fetchDesignBriefsAction } from '../actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function DesignerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)
  const companyName = isLegacy ? 'Nubira Creation' : (tenant.companyName || 'Nubira Creation')

  // Fetch only briefs for this designer (filtered by email / tenant)
  const initialBriefs = await fetchDesignBriefsAction({
    companyName,
    designerEmail: user.email || undefined
  })

  return (
    <AdminShell userEmail={tenant.userEmail} userRole="DESIGNER">
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignerDashboardClient
          initialBriefs={initialBriefs}
          designerEmail={user.email || 'designer@brand.com'}
          companyName={companyName}
          currentUserId={user.id}
          userRole={tenant.role}
        />
      </div>
    </AdminShell>
  )
}
