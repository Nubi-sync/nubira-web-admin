import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Store } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StoreProfilePage() {
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
        divisionName="Central Store & Godown"
        divisionSlug="/store"
        categoryBadge="CENTRAL GODOWN"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Godown In-Charge'}
        userRole={profile?.role || 'STORE_SUPERVISOR'}
        icon={Store}
        supervisorName="Chief Storekeeper"
        capacityInfo="50,000 Pcs Ready Garment Godown • Central Raw Fabric Storage"
        qualityStandard="100% Stock Ledger Accuracy • Barcode Verified Inwards"
      />
    </AdminShell>
  )
}
