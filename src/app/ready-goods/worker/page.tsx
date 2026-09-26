import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { WorkerDashboardClient } from './components/WorkerDashboardClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Worker Terminal | Quality Checking & Packing Station',
  description: 'Floor terminal for Quality Checkers (testing cutting, printing, embroidery, wash, iron) and Packing Operators.'
}

export default async function ReadyGoodsWorkerPage({
  searchParams
}: {
  searchParams?: Promise<{ workerId?: string; tab?: string }>
}) {
  const params = await searchParams
  if (params?.tab === 'history') {
    redirect('/ready-goods/worker/history')
  }
  if (params?.tab === 'profile') {
    redirect('/ready-goods/worker/profile')
  }

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
      <WorkerDashboardClient
        userEmail={user.email}
        userName={tenant.adminDisplayName || user.user_metadata?.full_name}
        userPhone={tenant.phone || user.user_metadata?.phone_number}
        workerIdParam={params?.workerId}
        companyName={tenant.companyName}
      />
    </AdminShell>
  )
}
