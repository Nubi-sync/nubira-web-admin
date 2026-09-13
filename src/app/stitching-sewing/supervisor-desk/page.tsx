import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SupervisorDeskClient } from './SupervisorDeskClient'
import { resolveUserTenant } from '@/lib/tenant-context'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function SupervisorDeskPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Centrally resolve tenant identity
  const tenant = await resolveUserTenant(user)
  const isProvisionedTenant = tenant.isProvisionedTenant && tenant.companyName !== 'Nubira Creation'
  const userRole = tenant.role.toUpperCase()

  // 2. Fetch all active floor allotments with relations
  const { data: rawAllotmentsData, error: allotmentsErr } = await supabaseAdmin
    .from('allotments')
    .select(`
      id,
      challan_id,
      lineman_id,
      article_id,
      target_qty,
      status,
      priority,
      allotment_date,
      mending_status,
      mending_total_counted,
      mending_supervisor_name,
      handed_to_mending_by,
      handed_to_mending_at,
      mending_handover_notes,
      qc_status,
      qc_total_passed,
      qc_total_alter,
      qc_supervisor_name,
      handed_to_qc_by,
      handed_to_qc_at,
      qc_handover_notes,
      store_inward_status,
      total_bags_packed,
      created_at,
      profiles:lineman_id ( id, username, role ),
      articles:article_id ( id, art_no, description ),
      challans:challan_id ( id, challan_no, brand, fabric_type ),
      allotment_variants ( id, allotment_id, color, size, quantity, completed_qty ),
      allotment_materials ( id, allotment_id, item_name, required_qty, admin_issued, notes )
    `)
    .order('created_at', { ascending: false })

  if (allotmentsErr) {
    console.error('Error fetching allotments in supervisor-desk:', allotmentsErr)
  }

  // 3. Fetch all linemen profiles
  const { data: rawLinemenProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .eq('role', 'LINEMAN')
    .order('username')

  // 4. Fetch all profiles for reference
  const { data: rawAllProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .order('username')

  // Multi-tenant scoping: Client factories only view allotments matching their company
  const allotmentsData = isProvisionedTenant
    ? (rawAllotmentsData || []).filter(a => (a.challans as any)?.brand?.toUpperCase().includes(tenant.companyName.toUpperCase()))
    : (rawAllotmentsData || [])

  const linemenProfiles = isProvisionedTenant ? [] : (rawLinemenProfiles || [])
  const allProfiles = isProvisionedTenant ? [] : (rawAllProfiles || [])

  return (
    <AdminShell userEmail={tenant.userEmail} userRole={userRole}>
      <SupervisorDeskClient
        initialAllotments={(allotmentsData as any) || []}
        linemenProfiles={linemenProfiles || []}
        allProfiles={allProfiles || []}
        currentUserEmail={tenant.userEmail}
        currentUserName={tenant.adminDisplayName || tenant.customUsername || user.email?.split('@')[0] || 'Enterprise Admin'}
        currentUserRole={tenant.isSuperAdmin ? 'Enterprise Master' : (userRole || 'Plant Admin')}
      />
    </AdminShell>
  )
}
