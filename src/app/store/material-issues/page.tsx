import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MaterialIssuesClient } from './components/MaterialIssuesClient'

export const dynamic = 'force-dynamic'

export default async function MaterialIssuesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: profile },
    { data: truckInwardsData },
    { data: activeAllotmentsData }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, role')
      .eq('id', user.id)
      .single(),

    supabase
      .from('truck_inwards')
      .select(`
        *,
        items:truck_inward_items(
          id,
          item_name,
          size_label,
          size_color,
          quantity,
          challan_qty,
          unit,
          status,
          shortage_qty,
          remarks
        )
      `)
      .order('created_at', { ascending: false })
      .limit(60),

    supabase
      .from('allotments')
      .select(`
        id,
        target_qty,
        allotment_date,
        status,
        created_at,
        article:articles(id, art_no, description),
        lineman:profiles!allotments_lineman_id_fkey(id, username),
        challans(id, challan_no, brand, fabric_type),
        allotment_variants(id, color, size, quantity),
        allotment_materials(
          id,
          allotment_id,
          item_name,
          required_qty,
          admin_issued,
          lineman_received,
          notes,
          created_at
        )
      `)
      .eq('status', 'IN_PROGRESS')
      .order('created_at', { ascending: false })
      .limit(80),
  ])

  return (
    <AdminShell userEmail={user.email} userRole={profile?.role}>
      <MaterialIssuesClient 
        activeAllotments={activeAllotmentsData as any || []}
        truckInwards={truckInwardsData as any || []}
      />
    </AdminShell>
  )
}
