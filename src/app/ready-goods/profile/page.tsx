import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Boxes } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReadyGoodsProfilePage() {
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
        divisionName="Ready Goods & Packing"
        divisionSlug="/ready-goods"
        categoryBadge="FINAL PACKING"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Packing In-Charge'}
        userRole={profile?.role || 'PACKING_SUPERVISOR'}
        icon={Boxes}
        supervisorName="Head of Final Packaging & Dispatch"
        capacityInfo="4 Final Packaging Lines • 200+ Cartons/Day Capacity"
        qualityStandard="AQL 2.5 Strict Pass • 100% Hangtag & Barcode Match"
      />
    </AdminShell>
  )
}
