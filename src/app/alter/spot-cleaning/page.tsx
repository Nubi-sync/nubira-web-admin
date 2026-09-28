import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { resolveUserTenant } from '@/lib/tenant-context'
import { SpotCleaningClient } from './components/SpotCleaningClient'

export const dynamic = 'force-dynamic'

export default async function SpotCleaningPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role} companyName={tenant.companyName}>
      <SpotCleaningClient userEmail={user.email} companyName={tenant.companyName} />
    </AdminShell>
  )
}
