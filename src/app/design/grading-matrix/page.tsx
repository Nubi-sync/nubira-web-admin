import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { GradingMatrixClient } from './components/GradingMatrixClient'
import { fetchGradingSchemesAction } from '../actions'

export const dynamic = 'force-dynamic'

export default async function GradingMatrixPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const initialSchemes = await fetchGradingSchemesAction()

  return (
    <AdminShell userEmail={user.email}>
      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto select-none">
        <GradingMatrixClient initialSchemes={initialSchemes} />
      </div>
    </AdminShell>
  )
}
