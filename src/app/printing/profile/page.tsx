import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DivisionProfileView } from '@/components/profile/DivisionProfileView'
import { Printer } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PrintingProfilePage() {
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
        divisionName="Screen & Digital Printing"
        divisionSlug="/printing"
        categoryBadge="SURFACE ART"
        userEmail={user.email || ''}
        userName={profile?.username || user.email?.split('@')[0] || 'Print Master'}
        userRole={profile?.role || 'PRINT_SUPERVISOR'}
        icon={Printer}
        supervisorName="Printing In-Charge"
        capacityInfo="8 Screen Tables (60m) • 4 Industrial DTG Printers"
        qualityStandard="Pantone Match Approved • 160°C Curing Verified"
      />
    </AdminShell>
  )
}
