import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { DesignDashboardClient } from './components/DesignDashboardClient'
import { fetchTechPacksAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function DesignModulePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialTechPacks = await fetchTechPacksAction()

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto select-none">
        <DesignDashboardClient initialTechPacks={initialTechPacks} />
      </div>
    </AdminShell>
  )
}
