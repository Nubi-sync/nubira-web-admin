import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Flame } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function IronProfilePage() {
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
        divisionName="Ironing & Steam Pressing"
        divisionSlug="/iron"
        categoryBadge="FINISHING UNIT"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Finishing Master'}
        userRole={profile?.role || 'IRONING_SUPERVISOR'}
        icon={Flame}
        supervisorName="Finishing Floor In-Charge"
        capacityInfo="12 Boiler Steam Vacuum Tables • Continuous Output Line"
        qualityStandard="Zero Shine & Glaze Defect Rate • 100% Seam Alignment"
      />
    </AdminShell>
  )
}
