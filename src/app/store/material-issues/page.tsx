import { AdminShell } from '@/components/layout/AdminShell'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MaterialIssuesClient } from './components/MaterialIssuesClient'
import { resolveUserTenant, isLegacyNubiraTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

export default async function MaterialIssuesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isLegacy = isLegacyNubiraTenant(tenant)

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

  // Multi-tenant scoping: Client factories only view records tagged for their company
  const targetCompany = tenant.companyName.toUpperCase()

  const filteredTruckInwards = isLegacy
    ? (truckInwardsData || [])
    : (truckInwardsData || []).filter((t: any) =>
        (t.supplier_name || '').toUpperCase().includes(targetCompany) ||
        (t.receiver_name || '').toUpperCase().includes(targetCompany)
      )

  const filteredActiveAllotments = isLegacy
    ? (activeAllotmentsData || [])
    : (activeAllotmentsData || []).filter((al: any) =>
        ((al.challans as any)?.brand || '').toUpperCase().includes(targetCompany)
      )

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={tenant.role}>
      <MaterialIssuesClient 
        activeAllotments={filteredActiveAllotments as any || []}
        truckInwards={filteredTruckInwards as any || []}
      />
    </AdminShell>
  )
}
