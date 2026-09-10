import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmbroideryProfilePage() {
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
        divisionName="Multi-Head Embroidery"
        divisionSlug="/embroidery"
        categoryBadge="THREAD ART"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Embroidery Master'}
        userRole={profile?.role || 'EMBROIDERY_SUPERVISOR'}
        icon={Sparkles}
        supervisorName="Embroidery Master"
        capacityInfo="10 Multi-Head Computerized Machines (20 Heads)"
        qualityStandard="DST Digitized Precision • 1.8M Stitches/Day"
      />
    </AdminShell>
  )
}
