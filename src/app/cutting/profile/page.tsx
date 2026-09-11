import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Scissors } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CuttingProfilePage() {
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
        divisionName="Cutting & Lay Floor"
        divisionSlug="/cutting"
        categoryBadge="CUTTING DIVISION"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Cutting Master'}
        userRole={profile?.role || 'CUTTING_MASTER'}
        icon={Scissors}
        supervisorName="Cutting In-Charge"
        capacityInfo="4 Spreading Tables (40m) • 2 Computerized Auto-Cutters"
        qualityStandard="Marker Efficiency > 88% • 100% QR Bundle Traceability"
      />
    </AdminShell>
  )
}
