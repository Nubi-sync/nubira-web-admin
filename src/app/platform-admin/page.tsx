import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PlatformAdminShell } from './components/PlatformAdminShell'
import { PlatformDashboardClient } from './components/PlatformDashboardClient'

export const dynamic = 'force-dynamic'

export default async function PlatformAdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Authorize Platform Root Admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || '').toUpperCase()
  const isRootAdmin = 
    user.email?.toLowerCase() === 'admin@zigza.in' ||
    role === 'PLATFORM_SUPERADMIN' ||
    role === 'SUPERADMIN'

  // If a regular floor user somehow navigates here, redirect to factory modules
  if (!isRootAdmin) {
    redirect('/modules')
  }

  return (
    <PlatformAdminShell userEmail={user.email || 'admin@zigza.in'}>
      <PlatformDashboardClient />
    </PlatformAdminShell>
  )
}
