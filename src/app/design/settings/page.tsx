import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PHSettingsClient } from './components/PHSettingsClient'
import { 
  fetchBodyPartCodesAction, 
  fetchBOMComponentCodesAction, 
  fetchGarmentTemplatesAction 
} from '../actions'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function PHSettingsPage() {
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

  const [initialBodyCodes, initialBOMCodes, initialTemplates] = await Promise.all([
    fetchBodyPartCodesAction(user.id, companyName),
    fetchBOMComponentCodesAction(user.id, companyName),
    fetchGarmentTemplatesAction(companyName)
  ])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <PHSettingsClient
          initialBodyCodes={initialBodyCodes}
          initialBOMCodes={initialBOMCodes}
          initialTemplates={initialTemplates}
          companyName={companyName}
          currentUserId={user.id}
          userRole={tenant.role}
        />
      </div>
    </AdminShell>
  )
}
