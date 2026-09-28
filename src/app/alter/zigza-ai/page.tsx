import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resolveUserTenant } from '@/lib/tenant-context'
import { ZigzaAiClient } from '@/app/zigza-ai/components/ZigzaAiClient'

export const dynamic = 'force-dynamic'

export default async function AlterZigzaAiPage() {
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
      <ZigzaAiClient userEmail={user.email} portal="alter" />
    </AdminShell>
  )
}
