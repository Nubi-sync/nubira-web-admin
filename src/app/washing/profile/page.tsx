import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Waves } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WashingProfilePage() {
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
        divisionName="Industrial Washing"
        divisionSlug="/washing"
        categoryBadge="WET PROCESSING"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Washing Supervisor'}
        userRole={profile?.role || 'WASHING_SUPERVISOR'}
        icon={Waves}
        supervisorName="Laundry In-Charge"
        capacityInfo="6 Industrial Washers • 6 Hydro Extractors"
        qualityStandard="Zero Shrinkage & 4.5+ Colorfastness Rating"
      />
    </AdminShell>
  )
}
