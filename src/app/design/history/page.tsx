import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignerHistoryClient } from './components/DesignerHistoryClient'
import { fetchDesignBriefsAction } from '../actions'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function DesignerHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)
  const companyName = tenant.companyName || 'Nubira Creation'

  // Fetch only briefs for this designer
  const initialBriefs = await fetchDesignBriefsAction({
    companyName,
    designerEmail: user.email || undefined,
    designerUserId: user.id
  })

  return (
    <AdminShell userEmail={tenant.userEmail} userRole="DESIGNER">
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignerHistoryClient
          initialBriefs={initialBriefs}
          designerName={tenant.adminDisplayName}
          designerPhone={tenant.phone}
          designerEmail={user.email || 'designer@brand.com'}
          companyName={companyName}
        />
      </div>
    </AdminShell>
  )
}
