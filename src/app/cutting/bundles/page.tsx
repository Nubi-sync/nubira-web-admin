import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { BundlesClient } from './components/BundlesClient'
import { fetchCutBundlesAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function BundlesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialBundles = await fetchCutBundlesAction()

  return (
    <AdminShell userEmail={user.email}>
      <BundlesClient initialBundles={initialBundles} />
    </AdminShell>
  )
}
