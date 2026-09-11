import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { TechPackCatalogClient } from './components/TechPackCatalogClient'

export const dynamic = 'force-dynamic'

export default async function TechPacksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        <TechPackCatalogClient />
      </div>
    </AdminShell>
  )
}
