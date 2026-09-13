import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ModuleHubClient } from './components/ModuleHubClient'
import { getUserAllowedModules } from '@/lib/access-control'

export const dynamic = 'force-dynamic'

export default async function ModulesHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile for role & username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role || '').toUpperCase()
  const allowedModules = getUserAllowedModules(user, { role: userRole })

  // If user only has 1 operational division, redirect them straight to their own workplace
  if (allowedModules.length === 1 && !allowedModules.includes('/modules')) {
    redirect(allowedModules[0])
  }

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <ModuleHubClient
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Administrator'}
        userRole={userRole || 'Plant Administrator'}
        allowedModules={allowedModules}
      />
    </AdminShell>
  )
}
