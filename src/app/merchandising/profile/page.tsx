import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MerchandisingProfilePage() {
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
        divisionName="Merchandising & Sourcing"
        divisionSlug="/merchandising"
        categoryBadge="COMMERCIAL OPS"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Senior Merchandiser'}
        userRole={profile?.role || 'MERCHANDISING_LEAD'}
        icon={Briefcase}
        supervisorName="Head of Merchandising"
        capacityInfo="14 Global Buyer Accounts • 185k Pcs Running POs"
        qualityStandard="BOM Cost Realization 98%+ • 100% OTD Delivery Compliance"
      />
    </AdminShell>
  )
}
