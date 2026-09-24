import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ModuleNotificationPageClient } from '@/components/notifications/ModuleNotificationPageClient'

export const dynamic = 'force-dynamic'

export default async function EmbroideryNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role} companyName={tenant.companyName}>
      <ModuleNotificationPageClient
        currentModule="embroidery"
        moduleName="Embroidery Division"
        moduleHref="/embroidery"
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
