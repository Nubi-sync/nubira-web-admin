import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { CuringQcClient } from './components/CuringQcClient'

export const dynamic = 'force-dynamic'

export default async function PrintingCuringQcPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminShell userEmail={user.email}>
      <CuringQcClient />
    </AdminShell>
  )
}
