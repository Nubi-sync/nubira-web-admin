import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'
import { ModuleHubClient } from './components/ModuleHubClient'

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

  // Store supervisors go directly to store godown if needed
  if (userRole === 'STORE' || userRole === 'STORE_SUPERVISOR' || userRole === 'GODOWN' || user.email?.startsWith('store@')) {
    redirect('/stitching-sewing/store')
  }

  return (
    <ModuleHubClient
      userEmail={user.email || ''}
      userName={profile?.username || user.email?.split('@')[0] || 'Administrator'}
      userRole={userRole || 'Plant Administrator'}
    />
  )
}
