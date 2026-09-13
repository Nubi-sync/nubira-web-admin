import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Scissors } from 'lucide-react'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function StitchingSewingProfilePage() {
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
      <DivisionProfileView
        divisionName="Stitching & Sewing Floor"
        divisionSlug="/stitching-sewing/dashboard"
        categoryBadge="CORE ASSEMBLY"
        userEmail={tenant.userEmail}
        userName={tenant.adminDisplayName || tenant.customUsername || 'Sewing Supervisor'}
        userRole={tenant.role || 'STITCHING_SUPERVISOR'}
        icon={Scissors}
        supervisorName="Floor Production Supervisor"
        capacityInfo={`Dedicated Floor • ${tenant.companyName}`}
        qualityStandard="In-Line AQL 2.5 Inspection & Shift Handover Protocols"
      />
    </AdminShell>
  )
}
