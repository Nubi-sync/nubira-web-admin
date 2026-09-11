import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Palette } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DesignProfilePage() {
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
        divisionName="Design & Tech-Pack Studio"
        divisionSlug="/design"
        categoryBadge="CREATIVE STUDIO"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Design Lead'}
        userRole={profile?.role || 'DESIGN_HEAD'}
        icon={Palette}
        supervisorName="Chief Creative Lead"
        capacityInfo="CAD Workstations • Sample Development Suite"
        qualityStandard="AAMA Pattern Spec • ISO 8559 Grading Compliance"
      />
    </AdminShell>
  )
}
