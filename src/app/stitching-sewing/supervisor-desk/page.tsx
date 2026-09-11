import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/layout/AdminShell'
import { SupervisorDeskClient } from './SupervisorDeskClient'

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

  // 1. Fetch user role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .eq('id', user.id)
    .single()

  const userRole = (profile?.role || '').toUpperCase()

  // 2. Fetch all active floor allotments with relations
  const { data: allotmentsData, error: allotmentsErr } = await supabaseAdmin
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
  const { data: linemenProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .eq('role', 'LINEMAN')
    .order('username')

  // 4. Fetch all profiles for reference
  const { data: allProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, username, role')
    .order('username')

  return (
    <AdminShell userEmail={user.email} userRole={userRole}>
      <SupervisorDeskClient
        initialAllotments={(allotmentsData as any) || []}
        linemenProfiles={linemenProfiles || []}
        allProfiles={allProfiles || []}
        currentUserEmail={user.email || ''}
        currentUserName={profile?.username || user.email?.split('@')[0] || 'Admin'}
        currentUserRole={userRole || 'Plant Admin'}
      />
    </AdminShell>
  )
}
