import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Factory } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FactoryProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <DivisionProfileView
        divisionName="Factory Control Center"
        divisionSlug="/factory"
        categoryBadge="PLANT OPERATIONS"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Factory Manager'}
        userRole={profile?.role || 'PLANT_HEAD'}
        icon={Factory}
        supervisorName="Plant Head"
        capacityInfo="Unit 1 Central Plant Floor (12 Lines)"
        qualityStandard="OEE Target: 90% • Zero Downtime Policy"
      />
    </AdminShell>
  )
}
