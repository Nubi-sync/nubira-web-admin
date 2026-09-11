import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Wrench } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AlterProfilePage() {
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
        divisionName="Alteration & Quality Rework"
        divisionSlug="/alter"
        categoryBadge="QUALITY RECOVERY"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Mending Master'}
        userRole={profile?.role || 'ALTERATION_SUPERVISOR'}
        icon={Wrench}
        supervisorName="Head of Quality Recovery"
        capacityInfo="6 Master Mending Stations • Inline Seam Repair"
        qualityStandard="95%+ Rework Recovery Clearance • Zero Recurring Defects"
      />
    </AdminShell>
  )
}
