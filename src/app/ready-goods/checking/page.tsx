import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { QualityCheckingClient } from './components/QualityCheckingClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Quality Checking Station | Finishing & Packing',
  description: 'Post-wash and iron quality checking hub for cutting, printing, embroidery, wash, and iron testing.'
}

export default async function ReadyGoodsCheckingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tenant = await resolveUserTenant(user)

  return (
    <AdminShell userEmail={user.email} userRole={tenant.role}>
      <QualityCheckingClient companyName={tenant.companyName} />
    </AdminShell>
  )
}
