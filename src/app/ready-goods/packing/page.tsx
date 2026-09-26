import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { PackingGoodsClient } from './components/PackingGoodsClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function PackingGoodsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role} companyName={tenant.companyName}>
      <PackingGoodsClient
        userEmail={user.email}
        isSuperAdmin={tenant.isPlatformAdmin || tenant.isSuperAdmin}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
