import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BrandsProfilePage() {
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
        divisionName="Brands & Buyer Portfolios"
        divisionSlug="/brands"
        categoryBadge="BUYER CRM"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Merchant Manager'}
        userRole={profile?.role || 'MERCHANDISER'}
        icon={Briefcase}
        supervisorName="Merchandising Head"
        capacityInfo="Direct Buyer Accounts & PO Contract Management"
        qualityStandard="AQL 1.5 Export Spec Standard"
      />
    </AdminShell>
  )
}
